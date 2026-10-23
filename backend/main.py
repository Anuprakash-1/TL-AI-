from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
from typing import Dict, Any

from models import VerifyRequest, VerifyResponse, FeedbackRequest, FeedbackResponse
from services.pipeline import run_verification_pipeline
from services.scraper import ScraperException
from database import save_report, get_report, get_recent_reports, clear_all_history, save_feedback
from demo_data import DEMO_REPORTS

app = FastAPI(
    title="TruthLens AI Backend",
    description="Evidence-based news verification & fact-checking API engine",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory rate limiter
RATE_LIMIT_BUCKETS: Dict[str, list] = {}
RATE_LIMIT_MAX = 30  # requests per minute
RATE_LIMIT_WINDOW = 60 # seconds

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Clean old requests
    timestamps = RATE_LIMIT_BUCKETS.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    
    if len(timestamps) >= RATE_LIMIT_MAX and request.url.path.startswith("/api/verify"):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. TruthLens allows up to 30 verification queries per minute per client."}
        )
    
    timestamps.append(now)
    RATE_LIMIT_BUCKETS[client_ip] = timestamps
    
    response = await call_next(request)
    return response

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TruthLens AI Verification Engine",
        "timestamp": time.time(),
        "live_search_ready": True
    }

@app.get("/api/examples")
def get_example_reports():
    """Returns curated demonstration fact-check case studies clearly labeled."""
    return DEMO_REPORTS

@app.post("/api/verify", response_model=VerifyResponse)
def verify_content(req: VerifyRequest):
    """
    Primary verification endpoint:
    Processes user-submitted text or news article URL,
    extracts factual claims, searches independent sources,
    and returns a structured evidence-based verification report.
    """
    if not req.text and not req.url:
        raise HTTPException(
            status_code=400,
            detail="Either 'text' or 'url' must be provided to verify."
        )

    try:
        response = run_verification_pipeline(req)
        
        # Persist report to SQLite database
        try:
            save_report(response.dict())
        except Exception as db_err:
            print(f"[DB Error] Failed to persist report: {db_err}")

        return response
    except ScraperException as se:
        raise HTTPException(status_code=400, detail=str(se))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"[Pipeline Error] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Verification engine encountered an internal processing error: {str(e)}"
        )

@app.get("/api/reports/{report_id}")
def get_report_by_id(report_id: str):
    """Retrieves a previously generated or demonstration verification report."""
    # Check demos first
    for demo in DEMO_REPORTS:
        if demo["report_id"].lower() == report_id.lower():
            return demo
            
    report = get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Verification report '{report_id}' was not found.")
    return report

@app.get("/api/history")
def get_verification_history():
    """Retrieves recent verification history for the client session."""
    return get_recent_reports(limit=20)

@app.delete("/api/history")
def clear_history():
    """Clears all stored verification reports from history."""
    clear_all_history()
    return {"status": "success", "message": "Verification history cleared."}

@app.post("/api/feedback", response_model=FeedbackResponse)
def submit_feedback(fb: FeedbackRequest):
    """Allows users to submit corrections, flag broken citations, or provide new evidence."""
    feedback_id = save_feedback(fb.dict())
    return FeedbackResponse(
        status="recorded",
        message="Thank you for your feedback. TruthLens monitors user corrections to refine evidence retrieval.",
        feedback_id=feedback_id
    )

from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

# Static build path
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")
    
    @app.get("/")
    def serve_frontend_root():
        from fastapi.responses import FileResponse
        return FileResponse(str(FRONTEND_DIST / "index.html"))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
