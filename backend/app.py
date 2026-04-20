import datetime
import os
from functools import wraps
import bcrypt
import jwt
from database import get_db, init_db
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

SECRET_KEY = os.environ.get("JWT_SECRET", "friendventure-secret-change-in-prod")
RESET_SECRET = os.environ.get("RESET_SECRET", "friendventure-reset-secret-change-in-prod")


def generate_auth_token(user_id: int, username: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

## will return current user info if a valid token is provided, otherwise None. used by the @require_admin decorator and route handlers to get the logged-in user's id and role.
def get_current_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"id": payload["user_id"], "role": payload.get("role", "member")}
    except jwt.InvalidTokenError:
        return None

## helper to get just the user ID of the logged-in user, since that's needed in many places
def get_current_user_id():
    user = get_current_user()
    return user["id"] if user else None

## ensures members can't access admin-only routes
def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        if user["role"] != "admin":
            return jsonify({"error": "Forbidden"}), 403
        return f(*args, **kwargs)
    return decorated


# returns the logged-in user's profile + role + notification setting
@app.route("/api/user/profile", methods=["GET"])
def get_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    try:
        user = db.execute("SELECT first_name, last_name, username, role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        settings = db.execute("SELECT push_notifications FROM user_settings WHERE user_id = ?", (user_id,)).fetchone()

        push_notifications = bool(settings["push_notifications"]) if settings else True
        return jsonify({"firstName": user["first_name"], "lastName": user["last_name"], "username": user["username"], "role": user["role"], "pushNotifications": push_notifications}), 200
    finally:
        db.close()

# updates first name, last name, and username for the logged-in user
@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    first_name = data.get("firstName", "").strip()
    last_name = data.get("lastName", "").strip()
    # force lowercase so usernames are case-insensitive
    username = data.get("username", "").strip().lower()

    # all three fields are required
    if not first_name or not last_name or not username:
        return jsonify({"error": "First name, last name, and username are required"}), 400

    db = get_db()
    try:
        db.execute(
            "UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE id = ?",
            (first_name, last_name, username, user_id)
        )
        db.commit()
        return jsonify({"message": "Profile updated!"}), 200
    except Exception as e:
        # username has a unique constraint 
        if "users.username" in str(e):
            return jsonify({"error": "Username is already taken"}), 409
        return jsonify({"error": "Could not update profile"}), 500
    finally:
        db.close()

# changes password - requires the current password to prevent unauthorized changes
@app.route("/api/user/password", methods=["PUT"])
def change_password():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    current_password = data.get("currentPassword", "")
    new_password = data.get("newPassword", "")

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    db = get_db()
    try:
        user = db.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,)).fetchone()
        # verify current password before allowing the change
        if not user or not bcrypt.checkpw(current_password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Current password is incorrect"}), 401

        # NEVER store plain text, always hash before saving
        new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
        db.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    finally:
        db.close()

# saves push notification preference for the logged-in user
@app.route("/api/user/notifications", methods=["PUT"])
def update_notifications():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    enabled = 1 if data.get("pushNotifications") else 0

    db = get_db()
    try:
        # insert if no row exists, otherwise update avoids duplicate key errors
        db.execute("INSERT INTO user_settings (user_id, push_notifications) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET push_notifications = ?", (user_id, enabled, enabled))
        db.commit()
        return jsonify({"message": "Settings saved"}), 200
    finally:
        db.close()

# ── Users: search ────────────────────────────────────────────────────────────

@app.route("/api/users/search", methods=["GET"])
def search_users():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([]), 200

    db = get_db()
    try:
        rows = db.execute(
            """
            SELECT id, username, first_name || ' ' || last_name AS name
            FROM users
            WHERE id != ?
              AND (username LIKE ? OR first_name || ' ' || last_name LIKE ?)
            LIMIT 20
            """,
            (user_id, f"%{q}%", f"%{q}%"),
        ).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        db.close()


# ── Friends: add ─────────────────────────────────────────────────────────────

@app.route("/api/friends/add", methods=["POST"])
def add_friend():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    friend_id = data.get("friend_id") if data else None
    if not friend_id:
        return jsonify({"error": "friend_id is required"}), 400

    db = get_db()
    try:
        db.execute(
            "INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)",
            (user_id, friend_id),
        )
        db.execute(
            "INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)",
            (friend_id, user_id),
        )
        db.commit()
        return jsonify({"ok": True}), 200
    finally:
        db.close()


# ── Friends: list ─────────────────────────────────────────────────────────────

@app.route("/api/friends", methods=["GET"])
def get_friends():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    try:
        rows = db.execute(
            """
            SELECT u.id, u.username, u.first_name || ' ' || u.last_name AS name,
                   COALESCE(p.health, 85) AS health
            FROM friendships f
            JOIN users u ON u.id = f.friend_id
            LEFT JOIN pet_state p ON p.user_id = f.friend_id
            WHERE f.user_id = ?
            """,
            (user_id,),
        ).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        db.close()


# ── Friends: remove ──────────────────────────────────────────────────────────

@app.route("/api/friends/remove", methods=["POST"])
def remove_friend():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    friend_id = data.get("friend_id") if data else None
    if not friend_id:
        return jsonify({"error": "friend_id is required"}), 400

    db = get_db()
    try:
        db.execute(
            "DELETE FROM friendships WHERE user_id = ? AND friend_id = ?",
            (user_id, friend_id),
        )
        db.execute(
            "DELETE FROM friendships WHERE user_id = ? AND friend_id = ?",
            (friend_id, user_id),
        )
        db.commit()
        return jsonify({"ok": True}), 200
    finally:
        db.close()


# ── Pet: get ─────────────────────────────────────────────────────────────────

@app.route("/api/pet", methods=["GET"])
def get_pet():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    try:
        db.execute("INSERT OR IGNORE INTO pet_state (user_id) VALUES (?)", (user_id,))
        db.commit()
        row = db.execute("SELECT * FROM pet_state WHERE user_id = ?", (user_id,)).fetchone()
        return jsonify(dict(row)), 200
    finally:
        db.close()


# ── Pet: save ─────────────────────────────────────────────────────────────────

@app.route("/api/pet", methods=["POST"])
def save_pet():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    db = get_db()
    try:
        db.execute(
            """
            INSERT INTO pet_state (user_id, health, hunger, happiness, color, accessory, shirt, name)
            VALUES (:user_id, :health, :hunger, :happiness, :color, :accessory, :shirt, :name)
            ON CONFLICT(user_id) DO UPDATE SET
                health    = excluded.health,
                hunger    = excluded.hunger,
                happiness = excluded.happiness,
                color     = excluded.color,
                accessory = excluded.accessory,
                shirt     = excluded.shirt,
                name      = excluded.name
            """,
            {
                "user_id":   user_id,
                "health":    data.get("health", 85),
                "hunger":    data.get("hunger", 60),
                "happiness": data.get("happiness", 72),
                "color":     data.get("color", "classic"),
                "accessory": data.get("accessory", "none"),
                "shirt":     data.get("shirt", "none"),
                "name":      data.get("name", "Pandy"),
            },
        )
        db.commit()
        return jsonify({"ok": True}), 200
    finally:
        db.close()


# ── Signup ──────────────────────────────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    required = ["firstName", "lastName", "email", "username", "password"]
    if not data or not all(k in data for k in required):
        return jsonify({"error": "All fields are required"}), 400

    first_name = data["firstName"].strip()
    last_name = data["lastName"].strip()
    email = data["email"].strip().lower()
    username = data["username"].strip().lower()
    password = data["password"]

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (first_name, last_name, email, username, password_hash) VALUES (?, ?, ?, ?, ?)",
            (first_name, last_name, email, username, password_hash),
        )
        db.commit()
        user = db.execute("SELECT id, role FROM users WHERE username = ?", (username,)).fetchone()
        token = generate_auth_token(user["id"], username, user["role"])
        return jsonify({"token": token, "username": username, "firstName": first_name, "role": user["role"]}), 201
    except Exception as e:
        err = str(e)
        if "users.email" in err:
            return jsonify({"error": "Email is already in use"}), 409
        if "users.username" in err:
            return jsonify({"error": "Username is already taken"}), 409
        return jsonify({"error": "Could not create account"}), 500
    finally:
        db.close()


# ── Login ────────────────────────────────────────────────────────────────────

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "identifier" not in data or "password" not in data:
        return jsonify({"error": "Identifier and password are required"}), 400

    identifier = data["identifier"].strip().lower()
    password = data["password"]

    db = get_db()
    try:
        user = db.execute(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            (identifier, identifier),
        ).fetchone()

        if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Invalid username/email or password"}), 401

        token = generate_auth_token(user["id"], user["username"], user["role"])
        return jsonify({"token": token, "username": user["username"], "firstName": user["first_name"], "role": user["role"]}), 200
    finally:
        db.close()


# ── Forgot Password – step 1: verify identity ────────────────────────────────

@app.route("/api/auth/verify-reset", methods=["POST"])
def verify_reset():
    data = request.get_json()
    if not data or "username" not in data or "email" not in data:
        return jsonify({"error": "Both username and email are required"}), 400

    username = data["username"].strip().lower()
    email = data["email"].strip().lower()

    db = get_db()
    try:
        user = db.execute(
            "SELECT id FROM users WHERE username = ? AND email = ?",
            (username, email),
        ).fetchone()

        if not user:
            return jsonify({"error": "No account found with that username and email"}), 404

        reset_payload = {
            "user_id": user["id"],
            "type": "reset",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
        }
        reset_token = jwt.encode(reset_payload, RESET_SECRET, algorithm="HS256")
        return jsonify({"reset_token": reset_token}), 200
    finally:
        db.close()


# ── Forgot Password – step 2: set new password ───────────────────────────────

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    if not data or "reset_token" not in data or "new_password" not in data:
        return jsonify({"error": "Reset token and new password are required"}), 400

    try:
        payload = jwt.decode(data["reset_token"], RESET_SECRET, algorithms=["HS256"])
        if payload.get("type") != "reset":
            return jsonify({"error": "Invalid reset token"}), 400
        user_id = payload["user_id"]
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Reset link expired (10 min). Please try again."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid reset token"}), 400

    new_password = data["new_password"]
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    db = get_db()
    try:
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
        db.commit()
        return jsonify({"message": "Password reset successfully"}), 200
    finally:
        db.close()

# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    db = get_db()
    try:
        rows = db.execute(
            "SELECT id, title, type, deadline FROM tasks WHERE user_id = ? ORDER BY deadline ASC",
            (user_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        db.close()


@app.route("/api/tasks", methods=["POST"])
def add_task():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    title = data.get("title", "").strip()
    type_ = data.get("type")
    deadline = data.get("deadline")
    if not title or type_ not in ("challenge", "assignment", "exam", "hobby"):
        return jsonify({"error": "Invalid data"}), 400
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO tasks (user_id, title, type, deadline) VALUES (?, ?, ?, ?)",
            (user_id, title, type_, deadline)
        )
        db.commit()
        return jsonify({"id": cursor.lastrowid, "title": title, "type": type_, "deadline": deadline}), 201
    finally:
        db.close()


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    db = get_db()
    try:
        db.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        db.commit()
        return jsonify({"ok": True}), 200
    finally:
        db.close()

# ── Admin ─────────────────────────────────────────────────────────────────────
# will list users info, including name, username, email, role, and registration date. 
@app.route("/api/admin/users", methods=["GET"])
@require_admin
def admin_list_users():
    db = get_db()
    try:
        rows = db.execute(
            "SELECT id, first_name, last_name, username, email, role, created_at FROM users ORDER BY created_at ASC"
        ).fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        db.close()

# admin can delete an user
@app.route("/api/admin/users/<int:target_id>", methods=["DELETE"])
@require_admin
def admin_delete_user(target_id):
    current = get_current_user()
    if current["id"] == target_id:
        return jsonify({"error": "You cannot delete your own account"}), 400
    db = get_db()
    try:
        db.execute("DELETE FROM friendships WHERE user_id = ? OR friend_id = ?", (target_id, target_id))
        db.execute("DELETE FROM tasks WHERE user_id = ?", (target_id,))
        db.execute("DELETE FROM pet_state WHERE user_id = ?", (target_id,))
        db.execute("DELETE FROM user_settings WHERE user_id = ?", (target_id,))
        db.execute("DELETE FROM users WHERE id = ?", (target_id,))
        db.commit()
        return jsonify({"ok": True}), 200
    finally:
        db.close()

# admin can change an user's role between "admin" and "member"
@app.route("/api/admin/users/<int:target_id>/role", methods=["PUT"])
@require_admin
def admin_change_role(target_id):
    current = get_current_user()
    if current["id"] == target_id:
        return jsonify({"error": "You cannot change your own role"}), 400
    data = request.get_json()
    new_role = data.get("role") if data else None
    if new_role not in ("admin", "member"):
        return jsonify({"error": "Role must be 'admin' or 'member'"}), 400
    db = get_db()
    try:
        db.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, target_id))
        db.commit()
        return jsonify({"ok": True, "role": new_role}), 200
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
