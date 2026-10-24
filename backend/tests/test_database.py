import pytest
import uuid
from database import save_report, get_report, get_recent_reports, clear_all_history, save_feedback

def test_save_and_get_report():
    test_id = f"TL-TEST-{uuid.uuid4().hex[:8]}"
    dummy_report = {
        "report_id": test_id,
        "submitted_content": "चंद्रयान-3 मिशन सफल रहा (ISRO Chandrayaan-3 successful)",
        "submitted_url": None,
        "headline": "Chandrayaan-3 Mission",
        "language": "hi",
        "country": "IN",
        "verdict": "VERIFIED / SUPPORTED",
        "confidence_level": "HIGH",
        "research_coverage": "HIGH",
        "checked_at": "2026-10-24T06:00:00",
        "extra_info": "Special unicode: ₹2000, 🚀"
    }

    save_report(dummy_report)
    retrieved = get_report(test_id)
    assert retrieved is not None
    assert retrieved["report_id"] == test_id
    assert "चंद्रयान" in retrieved["submitted_content"]
    assert "₹2000" in retrieved["extra_info"]
    assert retrieved["verdict"] == "VERIFIED / SUPPORTED"

def test_save_and_retrieve_feedback():
    fb_data = {
        "report_id": "TL-TEST-123",
        "claim_id": "claim-1",
        "feedback_type": "new_evidence",
        "comments": "Found supporting official PIB press release",
        "user_email": "tester@example.com"
    }
    fb_id = save_feedback(fb_data)
    assert fb_id.startswith("fb-")

def test_recent_reports():
    recent = get_recent_reports(limit=5)
    assert isinstance(recent, list)
    if recent:
        assert "report_id" in recent[0]
        assert "verdict" in recent[0]
