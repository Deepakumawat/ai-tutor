"""
Database module for AI Tutor
- Chat history tracking
- Daily usage limits
"""

import os
import sqlite3
import json
from datetime import datetime
from pathlib import Path

_render_data = Path("/var/data")
_DATA_DIR = _render_data if os.getenv("RENDER") and _render_data.exists() else Path(__file__).parent
DB_PATH = _DATA_DIR / "aitutor.db"

class TutorDatabase:
    """Manage chat history and usage limits"""

    def __init__(self):
        self.db_path = str(DB_PATH)
        self.init_db()

    def init_db(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Chat history table
        c.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                topic TEXT,
                grade_level TEXT,
                subject TEXT,
                request_data TEXT,
                response_preview TEXT,
                response_content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Usage tracking table
        c.execute('''
            CREATE TABLE IF NOT EXISTS usage_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                lesson_type TEXT NOT NULL,
                usage_count INTEGER DEFAULT 0,
                reset_date DATE NOT NULL,
                UNIQUE(student_id, lesson_type, reset_date)
            )
        ''')

        # Topic embeddings table for Voyage AI semantic search
        c.execute('''
            CREATE TABLE IF NOT EXISTS topic_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                grade TEXT NOT NULL,
                topic TEXT NOT NULL,
                embedding TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(subject, grade, topic)
            )
        ''')

        conn.commit()
        conn.close()
        print("[DB] Database initialized")

    def save_chat(self, student_id: str, topic: str, grade_level: str, subject: str,
                  request_data: dict, response_preview: str, response_content: str) -> int:
        """Save chat to history"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        full_content = response_content or response_preview

        c.execute('''
            INSERT INTO chat_history
            (student_id, topic, grade_level, subject, request_data, response_preview, response_content)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (student_id, topic, grade_level, subject,
              json.dumps(request_data), response_preview[:200], full_content))

        conn.commit()
        chat_id = c.lastrowid
        conn.close()

        # Cleanup old chats - keep only last 7
        deleted = self.cleanup_old_chats(student_id, keep_count=7)
        if deleted > 0:
            print(f"[DB] Cleaned up {deleted} old chats for student {student_id}")

        return chat_id

    def get_last_7_chats(self, student_id: str) -> list:
        """Get last 7 chats for a student"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        c.execute('''
            SELECT id, topic, grade_level, subject, response_preview, response_content, created_at
            FROM chat_history
            WHERE student_id = ?
            ORDER BY created_at DESC
            LIMIT 7
        ''', (student_id,))

        rows = c.fetchall()
        conn.close()

        chats = []
        for row in rows:
            chats.append({
                'id': row[0],
                'topic': row[1],
                'grade_level': row[2],
                'subject': row[3],
                'preview': row[4],
                'content': row[5],
                'created_at': row[6]
            })

        return chats

    def check_usage(self, student_id: str, lesson_type: str) -> dict:
        """Check daily usage for a lesson type"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        today = datetime.now().date().isoformat()

        c.execute('''
            SELECT usage_count FROM usage_tracking
            WHERE student_id = ? AND lesson_type = ? AND reset_date = ?
        ''', (student_id, lesson_type, today))

        result = c.fetchone()
        conn.close()

        usage_count = result[0] if result else 0

        return {
            'usage_count': usage_count,
            'limit': 50,
            'remaining': max(0, 50 - usage_count),
            'exceeded': usage_count > 50
        }

    def increment_usage(self, student_id: str, lesson_type: str) -> dict:
        """Increment usage count for today"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        today = datetime.now().date().isoformat()

        # Check if record exists
        c.execute('''
            SELECT usage_count FROM usage_tracking
            WHERE student_id = ? AND lesson_type = ? AND reset_date = ?
        ''', (student_id, lesson_type, today))

        result = c.fetchone()

        if result:
            new_count = result[0] + 1
            c.execute('''
                UPDATE usage_tracking
                SET usage_count = ?
                WHERE student_id = ? AND lesson_type = ? AND reset_date = ?
            ''', (new_count, student_id, lesson_type, today))
        else:
            new_count = 1
            c.execute('''
                INSERT INTO usage_tracking (student_id, lesson_type, usage_count, reset_date)
                VALUES (?, ?, ?, ?)
            ''', (student_id, lesson_type, 1, today))

        conn.commit()
        conn.close()

        return {
            'usage_count': new_count,
            'limit': 50,
            'remaining': max(0, 50 - new_count),
            'exceeded': new_count > 50
        }

    def cleanup_old_chats(self, student_id: str, keep_count: int = 7) -> int:
        """Delete old chats, keeping only the last N chats per student"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Find chats to delete (all except the last N by created_at)
        c.execute('''
            SELECT id FROM chat_history
            WHERE student_id = ?
            ORDER BY created_at DESC
            LIMIT -1 OFFSET ?
        ''', (student_id, keep_count))

        rows_to_delete = c.fetchall()
        deleted_count = len(rows_to_delete)

        if deleted_count > 0:
            ids_to_delete = [row[0] for row in rows_to_delete]
            placeholders = ','.join('?' * len(ids_to_delete))
            c.execute(f'''
                DELETE FROM chat_history
                WHERE id IN ({placeholders})
            ''', ids_to_delete)

        conn.commit()
        conn.close()

        return deleted_count

    def save_topic_embedding(self, subject: str, grade: str, topic: str, embedding: list) -> None:
        """Save or update a topic's embedding vector."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
            INSERT INTO topic_embeddings (subject, grade, topic, embedding)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(subject, grade, topic) DO UPDATE SET
                embedding = excluded.embedding,
                created_at = CURRENT_TIMESTAMP
        ''', (subject.lower(), grade.lower(), topic, json.dumps(embedding)))
        conn.commit()
        conn.close()

    def get_topic_embeddings(self, subject: str, grade: str) -> list:
        """Return all stored embeddings for a subject+grade combo."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
            SELECT topic, embedding FROM topic_embeddings
            WHERE subject = ? AND grade = ?
        ''', (subject.lower(), grade.lower()))
        rows = c.fetchall()
        conn.close()
        return [{"topic": row[0], "embedding": json.loads(row[1])} for row in rows]

    def get_all_embeddings(self) -> list:
        """Return every stored embedding (used for cross-subject recommendations)."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('SELECT subject, grade, topic, embedding FROM topic_embeddings')
        rows = c.fetchall()
        conn.close()
        return [
            {"subject": r[0], "grade": r[1], "topic": r[2], "embedding": json.loads(r[3])}
            for r in rows
        ]


# Create global database instance
db = TutorDatabase()
