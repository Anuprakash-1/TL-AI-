import sqlite3
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        report_id TEXT PRIMARY KEY,
        submitted_content TEXT NOT NULL,
        submitted_url TEXT,
        headline TEXT,
        language TEXT,
        country TEXT,
        verdict TEXT NOT NULL,
        confidence_level TEXT NOT NULL,
        research_coverage TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # Feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        feedback_id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        claim_id TEXT,
        feedback_type TEXT NOT NULL,
        comments TEXT NOT NULL,
        user_email TEXT,
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

def save_report(report: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO reports (
        report_id, submitted_content, submitted_url, headline,
        language, country, verdict, confidence_level, research_coverage,
        data_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report["report_id"],
        report.get("submitted_content", ""),
        report.get("submitted_url"),
        report.get("headline"),
        report.get("language", "en"),
        report.get("country", "IN"),
        report["verdict"],
        report["confidence_level"],
        report["research_coverage"],
        json.dumps(report, ensure_ascii=False),
        report.get("checked_at", datetime.now().isoformat())
    ))
    conn.commit()
    conn.close()

def get_report(report_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM reports WHERE report_id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["data_json"])
    return None

def get_recent_reports(limit: int = 15) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT report_id, submitted_content, submitted_url, headline, verdict, 
           confidence_level, research_coverage, created_at 
    FROM reports 
    ORDER BY created_at DESC 
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def clear_all_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reports")
    conn.commit()
    conn.close()

def save_feedback(feedback_data: Dict[str, Any]) -> str:
    import uuid
    feedback_id = f"fb-{uuid.uuid4().hex[:8]}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO feedback (feedback_id, report_id, claim_id, feedback_type, comments, user_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        feedback_id,
        feedback_data["report_id"],
        feedback_data.get("claim_id"),
        feedback_data["feedback_type"],
        feedback_data["comments"],
        feedback_data.get("user_email"),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return feedback_id

# Initialize database on module load
init_db()
