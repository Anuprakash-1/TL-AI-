# TruthLens AI — News Verification & Evidence Platform

> **"Claims checked. Evidence revealed."**

TruthLens AI is an open, evidence-driven fact-checking platform and verification pipeline. Unlike conversational AI models that guess veracity based on statistical weights, TruthLens systematically extracts discrete factual assertions, queries independent web indices and official registries (PIB, ECI, Courts, Reuters, WHO, IFCN fact-checkers), evaluates source authority, compares corroborating and contradicting evidence, and produces transparent audit reports with traceable citations.

---

## 🌟 Key Architecture & Capabilities

### 1. 6-Step Verification Engine
1. **Claim Extraction:** Breaks submitted text or article into discrete, empirical claims. Classifies entities, dates, categories (political, scientific, historical, financial, legal), and distinguishes opinions/satire from verifiable facts.
2. **Multi-Angle Web Research:** Live search query generation across Google News RSS, DuckDuckGo (DDGS), Wikipedia, and primary government archives (PIB `pib.gov.in`, ECI `eci.gov.in`, SCI `sci.gov.in`, WHO `who.int`, Reuters, Alt News, BOOM Live). Zero fabricated citations.
3. **Source Authority Evaluation:** Identifies publisher domain authority, evaluates publication dates, and detects syndication echo chambers (wires repeated across multiple secondary blogs).
4. **Evidence Comparison:** Classifies each retrieved passage into `SUPPORTS`, `CONTRADICTS`, or `CONTEXT` with verbatim excerpts and relevance notes.
5. **9-Verdict Standard:**
   - `VERIFIED / SUPPORTED`
   - `FALSE`
   - `MISLEADING`
   - `PARTLY TRUE`
   - `UNVERIFIED`
   - `OUTDATED`
   - `SATIRE / NOT INTENDED AS FACT`
   - `OPINION / NOT FACT-CHECKABLE`
   - `DISPUTED`
6. **Transparent Explanation & Honest Uncertainty:** Outlines exactly what was claimed, what evidence was found, what context is missing, and what remains uncertain. Qualitative Assessment Confidence (`LOW`, `MEDIUM`, `HIGH`) and Research Coverage (`LOW`, `MEDIUM`, `HIGH`).

### 2. Dual Language & Investigative Aesthetic
- **Languages:** Full interface and claim support in English and Hindi (हिंदी).
- **Themes:** Dark investigative navy (`#070b14` / `#0f172a`) and Light mode.
- **Reports:** Markdown copy, JSON/HTML download, shareable URLs, and browser print format.

### 3. Server-Side SSRF & Security Defense
- **Strict SSRF Protection:** Pre-flight DNS resolution blocks loopbacks (`127.0.0.1`, `::1`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
- **Prompt Injection Defense:** Submitted articles and text are treated as untrusted data wrapped in execution boundaries, neutralizing system prompt override attempts.
- **Paywall Respect:** Polite headers and size caps (2MB); blocked or paywalled sites return clean notices asking user to paste text.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### 1. Clone & Directory
```bash
cd C:\Users\dell\.gemini\antigravity\scratch\truthlens-ai
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment (if not already created)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn httpx beautifulsoup4 pydantic python-dotenv ddgs

# Run FastAPI backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Backend API will be accessible at `http://127.0.0.1:8000`. Swagger API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
# Install npm dependencies
npm install

# Run Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend interface will be available at `http://127.0.0.1:5173`.

---

## 🔑 Environment Variables & API Keys

TruthLens operates **fully out of the box** without mandatory paid API keys by using live Google News RSS, DDGS, and Wikipedia integrations coupled with its built-in factual heuristic engine.

If you wish to enable advanced semantic reasoning via Google Gemini, set:
```bash
# In backend/.env or system environment:
GEMINI_API_KEY=AIzaSy...
# Or:
GOOGLE_API_KEY=AIzaSy...
```
Users can also input their Gemini API key directly in the web UI under **Settings**.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/verify` | Verify text or article URL; returns claims, verdicts, sources, and comparison |
| `GET` | `/api/reports/{id}` | Retrieve previously generated or demo report by ID |
| `GET` | `/api/history` | List recent verification history |
| `DELETE` | `/api/history` | Clear verification history |
| `POST` | `/api/feedback` | Submit correction, report broken link, or submit new evidence |
| `GET` | `/api/examples` | Curated demonstration case studies |
| `GET` | `/api/health` | Subsystem status and live search connectivity check |

---

## 🧪 Testing & Verification Checklist

- [x] **Well-documented factual claim:** e.g. "Chandrayaan-3 Moon Landing" -> Corroborated with primary ISRO and Reuters sources.
- [x] **Demonstrably false claim:** e.g. "₹2000 Note GPS Chip" -> Debunked by direct RBI clarification and engineering data.
- [x] **Misleading claim:** e.g. "NASA Solar Storm Internet Apocalypse" -> Evaluated as Misleading; clarifies ACM SIGCOMM 2021 theoretical paper vs NASA alert.
- [x] **Hindi viral forward:** e.g. "कन्या सुमंगला योजना ₹50,000" -> Debunked via PIB Fact Check as phishing scam.
- [x] **SSRF Attack Block:** `http://127.0.0.1:8000` / `http://169.254.169.254` blocked with `400 URL Security Block`.
- [x] **Zero Fabricated Citations:** All sources provide real URLs, real publisher names, and retrieval timestamps.
- [x] **Export Formats:** Markdown clipboard copy, JSON download, and Print view supported.
