from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
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

# Targeted in-memory rate limiter strictly for resource-intensive /api/verify requests
VERIFY_RATE_LIMIT_BUCKETS: Dict[str, list] = {}
RATE_LIMIT_MAX = 30  # verification requests per minute per IP
RATE_LIMIT_WINDOW = 60 # seconds

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Only enforce rate limiting on verification endpoint to avoid penalizing health checks or static assets
    if request.url.path.startswith("/api/verify") and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        timestamps = VERIFY_RATE_LIMIT_BUCKETS.get(client_ip, [])
        timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        
        if len(timestamps) >= RATE_LIMIT_MAX:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. TruthLens allows up to 30 verification queries per minute per client."}
            )
        
        timestamps.append(now)
        VERIFY_RATE_LIMIT_BUCKETS[client_ip] = timestamps
    
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
    extracts factual claims, searches independent sources concurrently,
    and returns a structured evidence-based verification report.
    """
    text_provided = bool(req.text and req.text.strip())
    url_provided = bool(req.url and req.url.strip())

    if not text_provided and not url_provided:
        raise HTTPException(
            status_code=400,
            detail="Either 'text' or 'url' must be provided to verify."
        )

    try:
        response = run_verification_pipeline(req)
        
        # Persist report to SQLite database
        try:
            report_data = response.model_dump() if hasattr(response, "model_dump") else response.dict()
            save_report(report_data)
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

# Demo ID alias mapping for convenience
DEMO_ALIASES = {
    "demo-1": "DEMO-TL-RBI2000",
    "demo-2": "DEMO-TL-ISRO3",
    "demo-3": "DEMO-TL-KANYASUMANGALA",
    "demo-4": "DEMO-TL-SOLARSTORM",
    "1": "DEMO-TL-RBI2000",
    "2": "DEMO-TL-ISRO3",
    "3": "DEMO-TL-KANYASUMANGALA",
    "4": "DEMO-TL-SOLARSTORM",
}

@app.get("/api/reports/{report_id}")
def get_report_by_id(report_id: str):
    """Retrieves a previously generated or demonstration verification report."""
    resolved_id = DEMO_ALIASES.get(report_id.lower().strip(), report_id.strip())

    # Check demos first
    for demo in DEMO_REPORTS:
        if demo["report_id"].lower() == resolved_id.lower():
            return demo
            
    report = get_report(resolved_id)
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
    fb_data = fb.model_dump() if hasattr(fb, "model_dump") else fb.dict()
    feedback_id = save_feedback(fb_data)
    return FeedbackResponse(
        status="recorded",
        message="Thank you for your feedback. TruthLens monitors user corrections to refine evidence retrieval.",
        feedback_id=feedback_id
    )

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
