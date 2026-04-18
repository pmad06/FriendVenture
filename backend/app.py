import datetime
import os

import bcrypt
import jwt
from database import get_db, init_db
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

SECRET_KEY = os.environ.get("JWT_SECRET", "friendventure-secret-change-in-prod")
RESET_SECRET = os.environ.get("RESET_SECRET", "friendventure-reset-secret-change-in-prod")


def generate_auth_token(user_id: int, username: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def get_current_user_id():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.InvalidTokenError:
        return None

@app.route("/api/user/profile", methods=["GET"])
def get_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    try:
        user = db.execute("SELECT first_name, last_name, username FROM users WHERE id = ?", (user_id,)).fetchone()
        settings = db.execute("SELECT push_notifications FROM user_settings WHERE user_id = ?", (user_id,)).fetchone()
        push_notifications = bool(settings["push_notifications"]) if settings else True
        return jsonify({"firstName": user["first_name"], "lastName": user["last_name"], "username": user["username"], "pushNotifications": push_notifications}), 200
    finally:
        db.close()

@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    first_name = data.get("firstName", "").strip()
    last_name = data.get("lastName", "").strip()
    username = data.get("username", "").strip().lower()

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
        if "users.username" in str(e):
            return jsonify({"error": "Username is already taken"}), 409
        return jsonify({"error": "Could not update profile"}), 500
    finally:
        db.close()

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
        if not user or not bcrypt.checkpw(current_password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Current password is incorrect"}), 401

        new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
        db.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    finally:
        db.close()

@app.route("/api/user/notifications", methods=["PUT"])
def update_notifications():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    enabled = 1 if data.get("pushNotifications") else 0

    db = get_db()
    try:
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
            SELECT u.id, u.username, u.first_name || ' ' || u.last_name AS name
            FROM friendships f
            JOIN users u ON u.id = f.friend_id
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
        user = db.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        token = generate_auth_token(user["id"], username)
        return jsonify({"token": token, "username": username, "firstName": first_name}), 201
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

        token = generate_auth_token(user["id"], user["username"])
        return jsonify({"token": token, "username": user["username"], "firstName": user["first_name"]}), 200
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


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
