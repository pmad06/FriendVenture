import sqlite3
import os

# build the path relative to this file so it works from any directory
DB_PATH = os.path.join(os.path.dirname(__file__), 'friendventure.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    # row_factory lets us access columns by name instead of index
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    # users table - core account info, email and username both need to be unique
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'member',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # one pet per user - user_id is the primary key so duplicates are impossible
    conn.execute('''
        CREATE TABLE IF NOT EXISTS pet_state (
            user_id   INTEGER PRIMARY KEY,
            health    INTEGER NOT NULL DEFAULT 85,
            hunger    INTEGER NOT NULL DEFAULT 60,
            happiness INTEGER NOT NULL DEFAULT 72,
            color     TEXT NOT NULL DEFAULT 'classic',
            accessory TEXT NOT NULL DEFAULT 'none',
            shirt     TEXT NOT NULL DEFAULT 'none',
            name      TEXT NOT NULL DEFAULT 'Pandy',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # friendships are stored as two rows so both users can query by their own id
    # UNIQUE(user_id, friend_id) prevents duplicate entries
    conn.execute('''
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (friend_id) REFERENCES users(id),
            UNIQUE(user_id, friend_id)
        )
    ''')

    # keeping settings separate from users so we can add more later without altering the main table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_settings (
            user_id INTEGER PRIMARY KEY,
            push_notifications INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # deadline is optional so it's nullable
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            deadline TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized.")
