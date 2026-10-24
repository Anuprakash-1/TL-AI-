import pytest
import time
from fastapi.testclient import TestClient
from main import app, VERIFY_RATE_LIMIT_BUCKETS

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["live_search_ready"] is True

def test_get_examples():
    response = client.get("/api/examples")
    assert response.status_code == 200
    demos = response.json()
    assert isinstance(demos, list)
    assert len(demos) == 4
    for demo in demos:
        assert "report_id" in demo
        assert "verdict" in demo
        assert "evidence_sources" in demo

def test_get_report_by_id_demo():
    response = client.get("/api/reports/DEMO-TL-RBI2000")
    assert response.status_code == 200
    report = response.json()
    assert report["report_id"] == "DEMO-TL-RBI2000"
    assert report["verdict"] == "FALSE"

def test_get_report_by_alias():
    # Test demo-1 alias
    res1 = client.get("/api/reports/demo-1")
    assert res1.status_code == 200
    assert res1.json()["report_id"] == "DEMO-TL-RBI2000"

    # Test numeric alias 2
    res2 = client.get("/api/reports/2")
    assert res2.status_code == 200
    assert res2.json()["report_id"] == "DEMO-TL-ISRO3"

def test_get_report_404():
    response = client.get("/api/reports/TL-UNKNOWN-999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_verification_history_and_clear():
    # History get
    res = client.get("/api/history")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Clear history
    clear_res = client.delete("/api/history")
    assert clear_res.status_code == 200
    assert clear_res.json()["status"] == "success"

    # Verify empty
    res_after = client.get("/api/history")
    assert res_after.status_code == 200
    assert len(res_after.json()) == 0

def test_submit_feedback():
    payload = {
        "report_id": "DEMO-TL-ISRO3",
        "claim_id": "claim-1",
        "feedback_type": "new_evidence",
        "comments": "Corroborated by NASA deep space network tracking data."
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "recorded"
    assert data["feedback_id"].startswith("fb-")

def test_verify_validation_errors():
    # Missing text and url
    res_empty = client.post("/api/verify", json={})
    assert res_empty.status_code == 400
    assert "either 'text' or 'url'" in res_empty.json()["detail"].lower()

    # Whitespace only
    res_space = client.post("/api/verify", json={"text": "   ", "url": ""})
    assert res_space.status_code == 400

    # SSRF URL attempt
    res_ssrf = client.post("/api/verify", json={"url": "http://127.0.0.1:8000/api/health"})
    assert res_ssrf.status_code == 400
    assert "security block" in res_ssrf.json()["detail"].lower() or "localhost" in res_ssrf.json()["detail"].lower()

def test_rate_limiter_protects_verify():
    # Rate limit test specifically for /api/verify
    client_ip = "testclient"
    # Artificially populate bucket
    now = time.time()
    VERIFY_RATE_LIMIT_BUCKETS[client_ip] = [now] * 35

    # Request to /api/verify with testclient IP
    res = client.post("/api/verify", json={"text": "test claim"})
    assert res.status_code == 429
    assert "rate limit exceeded" in res.json()["detail"].lower()

    # Non-verify endpoints should NOT be rate-limited
    res_health = client.get("/api/health")
    assert res_health.status_code == 200

    # Clean up test client bucket
    VERIFY_RATE_LIMIT_BUCKETS.clear()
