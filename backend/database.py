"""
SQLite database layer for the Todo application.
Uses Python's built-in sqlite3 module.
"""
import sqlite3
import os
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), "todos.db")


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Allows accessing columns by name
    return conn


def init_db():
    """Initializes the database schema and seeds initial data if table is empty."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                completed INTEGER NOT NULL DEFAULT 0,
                order_index INTEGER NOT NULL DEFAULT 0,
                priority TEXT NOT NULL DEFAULT 'medium',
                due_date TEXT DEFAULT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()

        # Check if table is empty, if so seed friendly starter todos
        cursor.execute("SELECT COUNT(*) as count FROM todos")
        row = cursor.fetchone()
        if row and row["count"] == 0:
            starter_todos = [
                ("👋 Welcome to your FastAPI & React Todo app!", "This app is backed by a real SQLite database running on Python FastAPI.", 0, 0, "high", None),
                ("✅ Check off completed items", "Click the circular checkbox on the left to mark a task as completed.", 1, 1, "medium", None),
                ("↕️ Move items around to reorder", "Use the drag handle or the up/down arrows to change priority order.", 0, 2, "high", None),
                ("🏷️ Set priorities and add details", "Click 'Edit' or the note icon to add extra details and due dates.", 0, 3, "low", None),
                ("⚡ Explore FastAPI Swagger UI", "Click the API Docs button in the top navigation to test backend endpoints directly.", 0, 4, "medium", None),
            ]
            now = datetime.utcnow().isoformat()
            cursor.executemany("""
                INSERT INTO todos (title, description, completed, order_index, priority, due_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, [(t[0], t[1], t[2], t[3], t[4], t[5], now, now) for t in starter_todos])
            conn.commit()


def get_all_todos():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, description, completed, order_index, priority, due_date, created_at, updated_at
            FROM todos
            ORDER BY order_index ASC, id ASC
        """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_todo(todo_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def create_todo(title: str, description: str = "", priority: str = "medium", due_date: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COALESCE(MAX(order_index), -1) as max_idx FROM todos")
        max_idx = cursor.fetchone()["max_idx"]
        new_order = max_idx + 1

        now = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO todos (title, description, completed, order_index, priority, due_date, created_at, updated_at)
            VALUES (?, ?, 0, ?, ?, ?, ?, ?)
        """, (title.strip(), description.strip(), new_order, priority, due_date, now, now))
        conn.commit()
        new_id = cursor.lastrowid
        return get_todo(new_id)


def update_todo(todo_id: int, title: str = None, description: str = None, completed: bool = None, priority: str = None, due_date: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        existing = cursor.fetchone()
        if not existing:
            return None

        new_title = title.strip() if title is not None else existing["title"]
        new_desc = description.strip() if description is not None else existing["description"]
        new_completed = int(completed) if completed is not None else existing["completed"]
        new_priority = priority if priority is not None else existing["priority"]
        new_due_date = due_date if due_date is not None else existing["due_date"]
        now = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE todos
            SET title = ?, description = ?, completed = ?, priority = ?, due_date = ?, updated_at = ?
            WHERE id = ?
        """, (new_title, new_desc, new_completed, new_priority, new_due_date, now, todo_id))
        conn.commit()
        return get_todo(todo_id)


def toggle_todo(todo_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT completed FROM todos WHERE id = ?", (todo_id,))
        existing = cursor.fetchone()
        if not existing:
            return None
        new_status = 0 if existing["completed"] else 1
        now = datetime.utcnow().isoformat()
        cursor.execute("""
            UPDATE todos
            SET completed = ?, updated_at = ?
            WHERE id = ?
        """, (new_status, now, todo_id))
        conn.commit()
        return get_todo(todo_id)


def delete_todo(todo_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
        conn.commit()
        return cursor.rowcount > 0


def reorder_todos(ordered_ids: list[int]):
    """Update order_index for a list of todo IDs in their new order."""
    with get_db() as conn:
        cursor = conn.cursor()
        for idx, todo_id in enumerate(ordered_ids):
            cursor.execute("UPDATE todos SET order_index = ? WHERE id = ?", (idx, todo_id))
        conn.commit()
    return get_all_todos()


def clear_completed():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM todos WHERE completed = 1")
        conn.commit()
        return cursor.rowcount
