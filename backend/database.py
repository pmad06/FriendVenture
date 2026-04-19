import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'friendventure.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
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
    conn.commit()
    conn.close()
    print("Database initialized.")
