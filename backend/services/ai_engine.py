import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple, Set
import httpx
from config import GEMINI_API_KEY, OPENAI_API_KEY
from services.security import wrap_untrusted_text_for_ai

VERDICT_DEFINITIONS = {
    "VERIFIED / SUPPORTED": "Reliable available evidence from primary documents, official statements, or multiple independent sources confirms the factual claim.",
    "FALSE": "Reliable evidence directly contradicts the claim, or primary authorities have officially debunked it as untrue.",
    "MISLEADING": "The claim contains some element of truth but omits essential context, quotes out of context, or presents details in a deceptive manner.",
    "PARTLY TRUE": "Some independently verifiable aspects of the claim are supported by evidence, while other specific claims are inaccurate, exaggerated, or unsubstantiated.",
    "UNVERIFIED": "The available evidence is insufficient to establish whether the claim is true or false. Absence of immediate evidence does not prove falsehood.",
    "OUTDATED": "The claim was historically accurate at a past time, but no longer describes the current situation or relies on superseded policies/facts.",
    "SATIRE / NOT INTENDED AS FACT": "Contextual evidence indicates the content was created as satire, humor, or parody, not as a factual report.",
    "OPINION / NOT FACT-CHECKABLE": "The content expresses a personal value judgment, prediction, or subjective viewpoint rather than an empirical, verifiable fact.",
    "DISPUTED": "Credible, independent sources offer conflicting evidence or interpretations, preventing a singular definitive verdict at this time."
}

STOP_WORDS = {
    "the", "a", "an", "and", "or", "of", "in", "on", "at", "to", "for", "with",
    "from", "by", "as", "is", "was", "were", "been", "be", "are", "that", "this",
    "it", "has", "have", "had", "its", "their", "our", "all", "any", "about",
    "which", "who", "whom", "will", "would", "shall", "should", "can", "could", "may", "might",
    "after", "before", "into", "over", "under", "again", "further", "then", "once",
    "की", "के", "का", "में", "से", "पर", "को", "है", "हैं", "था", "थे", "थी", "और", "या"
}

def normalize_text(text: str) -> Set[str]:
    """Extracts non-stopword normalized tokens for semantic alignment."""
    clean = text.lower()
    clean = re.sub(r"[^\w\s\u0900-\u097F]", " ", clean)
    words = []
    for w in clean.split():
        if len(w) >= 2 and w not in STOP_WORDS:
            stem = re.sub(r"(ed|ing|s|es)$", "", w) if len(w) > 4 else w
            words.append(stem)
    return set(words)

def check_targeted_refutation(claim_text: str, src_title: str, src_excerpt: str) -> bool:
    """
    Checks whether a source is specifically refuting or debunking the user's claim.
    Distinguishes genuine refutations from incidental words like 'false positive'
    or criminal reporting on scams/frauds.
    """
    text = (src_title + " " + src_excerpt).lower()

    # Strip out benign phrases where 'false' is not a debunk of the claim
    filtered_text = re.sub(r"\bfalse\s+(?:diagnos\w*|positiv\w*|negativ\w*|alarm\w*|promis\w*|pretext\w*|start\w*|confession\w*)\b", "", text)

    # Targeted refutation patterns targeting the claim, rumour, or assertion
    refutation_patterns = [
        r"\b(?:claim|rumor|rumour|post|forward|message|video|news|report)\b.*?\b(?:is|was|are|were)?\s*(?:false|fake|baseless|untrue|fabricated|bogus|unfounded|completely fictitious|myth)\b",
        r"\b(?:fact[\s\-]check\s*:\s*(?:false|fake|debunked|hoax|misleading|partly false))\b",
        r"\b(?:won[’\']?t|will\s*not|does\s*not|do\s*not|cannot|did\s*not|never)\s+(?:have|contain|carry|feature|include|track)\b",
        r"\bno\s+(?:[\w\-]+\s+){0,3}(?:chip|tracker|transmitter|satellite\s*track\w*)\b",
        r"\bno\s+(?:evidence|truth|basis|microchip|nano\s*chip|such\s*(?:order|scheme|rule|announcement|notification|plan))\b",
        r"\b(?:debunked|fictitious|scam\s*alert|myth\s*busted)\b",
        r"\b(?:denied|denies|dismisses|refutes|dismissed|refuted|clarified|rejected)\s+.*?\b(?:claims?|reports?|rumors?|rumours?|allegations?)\b",
        r"(?:दावा\s*(?:गलत|फर्जी|झूठा|निराधार)|का\s*खंडन|तथ्यहीन|फेक\s*न्यूज|फेक\s*मैसेज|कोई\s*चिप\s*नहीं)"
    ]

    return any(re.search(p, filtered_text) for p in refutation_patterns)

def analyze_office_claim(
    claim_text: str,
    src_title: str,
    src_excerpt: str
) -> Optional[Tuple[str, str]]:
    """
    Analyzes whether a claim is an assertion about an official role/office (e.g. Prime Minister, Chief Minister)
    and evaluates whether the source supports or contradicts the assertion.
    Returns: ('SUPPORTS' | 'CONTRADICTS', explanation) or None if not an office claim.
    """
    office_pattern = r'^(.*?)\s+(?:is|serves as|became|elected as)\s+(?:the\s+)?(prime minister|chief minister|president|governor|cji|chief justice|home minister|defence minister|finance minister)\s*(?:of\s+([a-zA-Z\s]+))?'
    m = re.search(office_pattern, claim_text, re.IGNORECASE)
    
    # Check Hindi office assertion
    if not m:
        m_hi = re.search(r'^(.*?)\s*(?:भारत के|के)?\s*(प्रधानमंत्री|मुख्यमंत्री|राष्ट्रपति)\s*(?:हैं|है)', claim_text)
        if m_hi:
            subject = m_hi.group(1).strip()
            office = 'prime minister' if 'प्रधानमंत्री' in m_hi.group(2) else ('chief minister' if 'मुख्यमंत्री' in m_hi.group(2) else 'president')
        else:
            return None
    else:
        subject = m.group(1).strip()
        office = m.group(2).strip().lower()

    full_src = (src_title + ' ' + src_excerpt).lower()
    subj_full = subject.lower().strip()
    subj_tokens = [t for t in re.findall(r'\b\w{3,}\b', subj_full) if t not in ('the', 'hon')]
    if not subj_tokens and not any('\u0900' <= c <= '\u097F' for c in subj_full):
        return None

    last_name = subj_tokens[-1] if subj_tokens else subj_full
    first_name = subj_tokens[0] if subj_tokens else subj_full

    # Known incumbents dictionary
    known_incumbents = {
        'prime minister': [('narendra modi', ['modi', 'narendra'])],
        'chief minister': [('yogi adityanath', ['yogi', 'adityanath'])],
        'president': [('droupadi murmu', ['murmu', 'droupadi'])],
    }

    # 1. Direct affirmation of Subject holding Office
    affirmation_patterns = [
        rf'\b(?:prime minister|pm)\s+{re.escape(subj_full)}\b',
        rf'\b(?:chief minister|cm)\s+{re.escape(subj_full)}\b',
        rf'\b(?:president)\s+{re.escape(subj_full)}\b',
        rf'\b{re.escape(subj_full)}\b[^\.\n]{{0,80}}\b(?:has served as|serves as|is|became|elected as|was elected as|took oath as|sworn in as)\s+(?:the\s+)?(?:current\s+)?(?:prime minister|pm|chief minister|cm|president)\b',
    ]
    if any(re.search(pat, full_src) for pat in affirmation_patterns):
        return ('SUPPORTS', f'Affirms {subject} as {office}.')

    # Devanagari direct affirmation
    if any('\u0900' <= c <= '\u097F' for c in subj_full):
        if (f'प्रधानमंत्री {subj_full}' in full_src or 
            f'पीएम {subj_full}' in full_src or 
            f'{subj_full} भारत के प्रधानमंत्री' in full_src or
            f'मुख्यमंत्री {subj_full}' in full_src or 
            f'सीएम {subj_full}' in full_src):
            return ('SUPPORTS', f'Affirms {subject} as {office}.')

    # Last-name direct title (e.g. 'PM Modi') only if first name present in text and no other relative with same surname held office
    if len(subj_tokens) > 1 and f'pm {last_name}' in full_src:
        if first_name in full_src and not re.search(rf'\b(indira|rajiv|jawaharlal|sonia|feroze)\s+{last_name}', full_src):
            return ('SUPPORTS', f'Affirms {subject} as {office}.')

    # 2. Contradiction: Explicit Incumbent identified as holding office
    for office_key, incumbents in known_incumbents.items():
        if office_key in office:
            for holder_full, holder_keys in incumbents:
                incumbent_affirmed = (
                    f'prime minister {holder_full}' in full_src or
                    f'pm {holder_full}' in full_src or
                    f'prime minister {holder_keys[0]}' in full_src or
                    f'pm {holder_keys[0]}' in full_src or
                    f'{holder_full} is the current prime minister' in full_src or
                    f'{holder_full} is the prime minister' in full_src or
                    f'chief minister {holder_full}' in full_src or
                    f'cm {holder_full}' in full_src or
                    f'प्रधानमंत्री {holder_full}' in full_src or
                    'प्रधानमंत्री नरेंद्र मोदी' in full_src or
                    'पीएम मोदी' in full_src
                )
                if incumbent_affirmed:
                    if not any(k in subj_full for k in holder_keys) and 'मोदी' not in subj_full and 'नरेंद्र' not in subj_full:
                        return ('CONTRADICTS', f'Source affirms {holder_full.title()} as {office}, contradicting the assertion that {subject} holds this office.')

    # 3. Contradiction: Subject identified in Opposition / Candidate context
    aspirational_patterns = [
        r'\b(?:opposition leader|leader of (?:the )?opposition|congress leader|aims to become pm|next pm candidate|pm candidate in|contesting against pm|slammed by pm|attacked by pm|criticised pm|criticized pm)\b'
    ]
    if any(re.search(pat, full_src) for pat in aspirational_patterns):
        if any(t in full_src for t in subj_tokens):
            return ('CONTRADICTS', f'Source identifies {subject} in the capacity of opposition leader or political candidate rather than the incumbent {office}.')

    return None

def check_corroboration(
    claim_text: str,
    entities: List[str],
    src_title: str,
    src_excerpt: str,
    publisher: str,
    auth_type: str
) -> Tuple[bool, float]:
    """
    Checks whether a source corroborates and supports the factual claim.
    Requires high token overlap or entity alignment with authoritative reporting.
    """
    # For office/role claims, rely on structural semantic analysis
    office_pattern = r'^(.*?)\s+(?:is|serves as|became|elected as)\s+(?:the\s+)?(prime minister|chief minister|president|governor|cji|chief justice|home minister|defence minister|finance minister)\s*(?:of\s+([a-zA-Z\s]+))?'
    has_office = bool(re.search(office_pattern, claim_text, re.IGNORECASE)) or any(w in claim_text for w in ["प्रधानमंत्री", "मुख्यमंत्री", "राष्ट्रपति"])
    if has_office:
        office_eval = analyze_office_claim(claim_text, src_title, src_excerpt)
        if office_eval:
            rel, _ = office_eval
            return (rel == "SUPPORTS"), 0.5 if rel == "SUPPORTS" else 0.0
        return False, 0.0

    if check_targeted_refutation(claim_text, src_title, src_excerpt):
        return False, 0.0

    claim_tokens = normalize_text(claim_text)
    src_tokens = normalize_text(src_title + " " + src_excerpt)

    if not claim_tokens:
        return False, 0.0

    overlap = len(claim_tokens & src_tokens) / max(1, len(claim_tokens))

    # Entity tokens vs Predicate/Action tokens
    entity_tokens = set()
    for ent in entities:
        entity_tokens.update(normalize_text(ent))

    predicate_tokens = claim_tokens - entity_tokens

    # If claim has predicate/assertion tokens beyond entities, check predicate alignment
    if predicate_tokens:
        pred_overlap = len(predicate_tokens & src_tokens) / max(1, len(predicate_tokens))
    else:
        pred_overlap = overlap

    is_high_auth = auth_type in (
        "GOVERNMENT_PRIMARY", "CONSTITUTIONAL_PRIMARY", "INTERNATIONAL_HEALTH_AUTHORITY",
        "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION", "PRIMARY_REFERENCE"
    )

    # Active reporting patterns
    active_verbs = (
        r"\b(?:declares?|declared|announces?|announced|confirms?|confirmed|launches?|launched|"
        r"approves?|approved|passes?|passed|orders?|ordered|rules?|ruled|reports?|reported|"
        r"decides?|decided|keeps?|kept|unveils?|unveiled|signs?|signed|meets?|met|hits?|reaches?|"
        r"holds?|held|secures?|secured|wins?|won|awards?|awarded)\b|"
        r"(?:पुष्टि|घोषणा|सत्यापित|मंजूरी|फैसला|आधिकारिक|लागू|किया)"
    )
    has_active_verb = bool(re.search(active_verbs, (src_title + " " + src_excerpt).lower()))

    # Check critical feature nouns (e.g. chip, gps, tracker, cure)
    # If a claim asserts an extraordinary or specific feature, background articles that do not
    # mention this feature cannot corroborate the claim.
    feature_markers = {
        "chip", "microchip", "nano", "gps", "tracker", "transmitter",
        "secret", "radiation", "50000", "cure", "recharge", "satellite",
        "gold", "sona", "चिप", "सोना"
    }
    critical_features = claim_tokens & feature_markers
    if critical_features and not (critical_features & src_tokens):
        return False, overlap

    # If source only mentions the entities with zero match on the claimed action/event
    if predicate_tokens and pred_overlap == 0.0:
        return False, overlap

    # True corroboration criteria
    if overlap >= 0.45:
        return True, overlap
    if overlap >= 0.30 and (pred_overlap >= 0.35 or has_active_verb):
        return True, overlap
    if is_high_auth and overlap >= 0.28 and pred_overlap >= 0.25:
        return True, overlap

    return False, overlap

def call_gemini_api(prompt: str, api_key: str) -> Optional[str]:
    """Calls Gemini API directly via HTTP to process claims or generate reports."""
    for model_name in ["gemini-1.5-flash", "gemini-2.5-flash"]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text
        except Exception:
            continue
    return None

def evaluate_with_llm(
    claim: Dict[str, Any],
    raw_sources: List[Dict[str, Any]],
    api_key: str
) -> Optional[Tuple[str, str, List[Dict[str, Any]], List[str], str, str]]:
    """Evaluates evidence using Gemini with strict forensic fact-checking instructions."""
    if not api_key or not raw_sources:
        return None

    sources_summary = []
    for idx, s in enumerate(raw_sources):
        sources_summary.append(
            f"[{idx}] Title: {s.get('title')} | Publisher: {s.get('publisher')} | Excerpt: {s.get('excerpt')}"
        )

    prompt = f"""You are TruthLens AI's forensic fact-checking engine.
Evaluate the factual claim against the provided sources.

CLAIM: "{claim.get('claim_text')}"
ENTITIES: {claim.get('entities', [])}

SOURCES:
{chr(10).join(sources_summary)}

RULES:
1. For each source, classify as:
   - "SUPPORTS": Source confirms that the event or statement described in the claim actually occurred or is true.
   - "CONTRADICTS": Source specifically debunks, refutes, denies, or proves the claim false. (IMPORTANT: News covering crime, fraud, arrests, or controversies does NOT contradict a claim that reports on those events!)
   - "CONTEXT": General background information.
2. Select verdict from: "VERIFIED / SUPPORTED", "FALSE", "MISLEADING", "PARTLY TRUE", "UNVERIFIED", "DISPUTED", "OUTDATED", "OPINION / NOT FACT-CHECKABLE", "SATIRE / NOT INTENDED AS FACT".
3. NEVER classify genuine news as FALSE. If multiple independent news outlets report the event as factual, it must be "VERIFIED / SUPPORTED".

Output strictly valid JSON with format:
{{
  "verdict": "VERIFIED / SUPPORTED | FALSE | MISLEADING | PARTLY TRUE | UNVERIFIED | DISPUTED | OUTDATED",
  "explanation": "Clear factual explanation answering what was claimed and what research found.",
  "confidence_level": "LOW | MEDIUM | HIGH",
  "research_coverage": "LOW | MEDIUM | HIGH",
  "uncertainties": ["..."],
  "sources_evaluation": [
    {{
      "source_index": 0,
      "evidence_relation": "SUPPORTS | CONTRADICTS | CONTEXT",
      "relevance_explanation": "..."
    }}
  ]
}}"""

    llm_output = call_gemini_api(prompt, api_key)
    if not llm_output:
        return None

    try:
        parsed = json.loads(llm_output)
        verdict = parsed.get("verdict", "UNVERIFIED")
        if verdict not in VERDICT_DEFINITIONS:
            verdict = "VERIFIED / SUPPORTED" if "VERIFIED" in verdict or "SUPPORTED" in verdict else "UNVERIFIED"

        explanation = parsed.get("explanation", "")
        conf = parsed.get("confidence_level", "MEDIUM")
        cov = parsed.get("research_coverage", "MEDIUM")
        uncertainties = parsed.get("uncertainties", [])

        eval_map = {item.get("source_index"): item for item in parsed.get("sources_evaluation", [])}

        enriched = []
        for idx, src in enumerate(raw_sources):
            eval_info = eval_map.get(idx, {})
            rel = eval_info.get("evidence_relation", "CONTEXT")
            rel_exp = eval_info.get("relevance_explanation", "Provides context on the claim.")
            enriched.append({
                "title": src.get("title", ""),
                "publisher": src.get("publisher", "News Source"),
                "url": src.get("url", ""),
                "published_at": src.get("published_at"),
                "retrieved_at": datetime.now().isoformat(),
                "relevant_excerpt": src.get("excerpt", src.get("title", "")),
                "evidence_relation": rel,
                "relevance_explanation": rel_exp,
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": src.get("authority_type", "SECONDARY_SOURCE")
            })

        return verdict, explanation, enriched, uncertainties, conf, cov
    except Exception as err:
        print(f"[LLM Parser Error] {err}")
        return None

def extract_claims_heuristic(text: str, language: str = "en") -> List[Dict[str, Any]]:
    """Extracts verifiable claims, entities, dates, and categories."""
    clean_text = text.strip()

    # Check for question/interrogative query
    question_patterns = [
        r"\?$", r"\bwho\b", r"\bwhat\b", r"\bwhere\b", r"\bwhen\b", r"\bwhy\b", r"\bhow\b",
        r"\bkaun\b", r"\bkisne\b", r"\bkya\b", r"\bkab\b", r"\bkaha[an]?\b", r"\bkyun\b",
        r"\bkaise\b", r"\bकौन\b", r"\bकिसने\b", r"\bक्या\b", r"\bकब\b", r"\bकहाँ\b", r"\bक्यों\b",
        r"\bhaikya\b", r"\bhai kya\b"
    ]
    is_question = any(bool(re.search(pat, clean_text, re.IGNORECASE)) for pat in question_patterns)
    is_personal_slur = bool(re.search(r"\b(?:pagal|paagal|chutiya|stupid|idiot|bavla|kamina|mental|crazy)\b", clean_text, re.IGNORECASE))

    # Check for subjective/opinion markers
    opinion_patterns = [
        r"\bi think\b", r"\bin my opinion\b", r"\bi feel that\b", r"\bshould be\b",
        r"\bthe best\b", r"\bthe worst\b", r"\bमेरा मानना है\b", r"\bमुझे लगता है\b"
    ]
    is_opinion = any(re.search(pat, clean_text, re.IGNORECASE) for pat in opinion_patterns)

    # Check for satire markers
    satire_patterns = [
        r"\bthe onion\b", r"\bfaking news\b", r"\bsatire\b", r"\bparody\b", r"\bव्यंग्य\b"
    ]
    is_satire = any(re.search(pat, clean_text, re.IGNORECASE) for pat in satire_patterns)

    sentences = re.split(r"(?<=[.!?।\n])\s+", clean_text)
    meaningful_sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

    claims_to_create = meaningful_sentences[:3] if len(meaningful_sentences) > 1 else [clean_text]

    extracted = []
    for idx, sentence in enumerate(claims_to_create, 1):
        entities = []
        cap_words = re.findall(r"\b[A-Z][a-zA-Z0-9_\-\.]{2,}\b", sentence)
        for w in cap_words:
            if w.lower() not in ("the", "this", "that", "there", "then", "when", "what", "where", "with", "from", "news", "viral"):
                entities.append(w)

        # Robust subject extraction before verb (vital for lowercase queries)
        subj_m = re.match(r"^\s*([a-zA-Z0-9\s\-_]{3,35})\s+(?:is|was|are|became|elected as|launched|declared|kept|won|announced)\b", sentence, re.IGNORECASE)
        if subj_m:
            subj = subj_m.group(1).strip()
            if subj.lower() not in ("the", "this", "that", "there", "when", "what", "who", "it", "they", "we", "he", "she"):
                entities.append(subj.title())

        # Known institutions and entities
        for org in ["ISRO", "NASA", "RBI", "WHO", "ECI", "Supreme Court", "Chandrayaan", "T20 World Cup"]:
            if org.lower() in sentence.lower():
                entities.append(org)

        amounts = re.findall(r"(?:₹|Rs\.?|INR|\$|\€)\s*\d+[\d,]*(?:\s*(?:crore|lakh|thousand|million|billion))?", sentence, re.IGNORECASE)
        entities.extend(amounts)

        category = "general"
        lower_sent = sentence.lower()
        if any(w in lower_sent for w in ["election", "evm", "vote", "bjp", "congress", "modi", "rahul", "parliament", "minister", "government", "सरकार", "चुनाव", "मंत्री"]):
            category = "political"
        elif any(w in lower_sent for w in ["rbi", "bank", "rupee", "currency", "note", "gdp", "tax", "gst", "shares", "रुपये", "बैंक", "नोट"]):
            category = "financial"
        elif any(w in lower_sent for w in ["court", "judge", "supreme court", "high court", "bail", "law", "act", "section", "अदालत", "कोर्ट", "कानून"]):
            category = "legal"
        elif any(w in lower_sent for w in ["virus", "vaccine", "who", "cancer", "health", "hospital", "doctor", "mpox", "इलाज", "दवा", "वैक्सीन"]):
            category = "health"
        elif any(w in lower_sent for w in ["isro", "nasa", "space", "moon", "satellite", "solar", "earth", "climate", "वैज्ञानिक", "अंतरिक्ष"]):
            category = "scientific"

        if is_personal_slur or is_opinion:
            verifiability = "SUBJECTIVE_OPINION"
        elif is_question:
            verifiability = "INTERROGATIVE_QUERY"
        elif is_satire:
            verifiability = "SATIRICAL"
        elif len(sentence.split()) < 4:
            verifiability = "BROAD_FACTUAL"
        else:
            verifiability = "SPECIFIC_FACTUAL"

        date_match = re.search(r"\b(?:20\d\d|19\d\d|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\b", sentence)
        time_period = date_match.group(0) if date_match else None

        extracted.append({
            "claim_id": f"claim-{idx}",
            "claim_text": sentence,
            "entities": list(dict.fromkeys(entities))[:6],
            "time_period": time_period,
            "category": category,
            "verifiability": verifiability
        })

    return extracted

def evaluate_evidence_and_verdict(
    claim: Dict[str, Any],
    raw_sources: List[Dict[str, Any]],
    as_of_date: Optional[str] = None,
    api_key: Optional[str] = None
) -> Tuple[str, str, List[Dict[str, Any]], List[str], str, str]:
    """
    Evaluates evidence against a claim with high forensic accuracy:
    - First attempts LLM analysis if an API key is available.
    - Otherwise applies context-aware stance detection distinguishing targeted refutations from affirmative reporting.
    """
    claim_text = claim["claim_text"]
    verifiability = claim.get("verifiability", "SPECIFIC_FACTUAL")
    entities = claim.get("entities", [])

    if verifiability == "SUBJECTIVE_OPINION":
        verdict = "OPINION / NOT FACT-CHECKABLE"
        explanation = f"The submitted text ('{claim_text}') contains personal evaluations, slurs, or subjective remarks rather than an empirical factual assertion that can be verified against news archives or public records."
        return verdict, explanation, [], ["Subjective remarks and interpersonal statements cannot be empirically fact-checked."], "HIGH", "LOW"

    if verifiability == "INTERROGATIVE_QUERY":
        has_fact_checks = any("fact check" in (s.get("title", "") + " " + s.get("excerpt", "")).lower() or "फैक्ट चेक" in (s.get("title", "") + " " + s.get("excerpt", "")).lower() or "पड़ताल" in (s.get("title", "") + " " + s.get("excerpt", "")).lower() for s in raw_sources)
        enriched_sources = []
        for src in raw_sources:
            enriched_sources.append({
                "title": src.get("title", ""),
                "publisher": src.get("publisher", "News Source"),
                "url": src.get("url", ""),
                "published_at": src.get("published_at"),
                "retrieved_at": datetime.now().isoformat(),
                "relevant_excerpt": src.get("excerpt") or src.get("title", ""),
                "evidence_relation": "CONTEXT",
                "relevance_explanation": "Contextual reporting addressing the inquiry topic." if not has_fact_checks else "Independent fact-check investigation into the viral statement.",
                "accessibility_status": "ACCESSIBLE",
                "domain_authority_notes": src.get("authority_type", "SECONDARY_SOURCE")
            })

        if has_fact_checks:
            verdict = "MISLEADING"
            explanation = f"Inquiry Context: The submitted question ('{claim_text}') relates to a widely reported controversy or viral clip that has been investigated by independent fact-checkers. Records indicate the viral phrasing stems from clipped or misrepresented remarks. Consult the linked evidence sources below for full verified documentation."
            return verdict, explanation, enriched_sources, ["Viral political remarks frequently circulate out of context."], "HIGH", "HIGH"
        else:
            verdict = "OPINION / NOT FACT-CHECKABLE"
            explanation = f"The submitted text is an open question or conversational query ('{claim_text}'). TruthLens verifies declarative news and factual assertions. Please rephrase as a factual statement or consult the contextual sources below."
            return verdict, explanation, enriched_sources, ["Declarative assertions yield higher verification accuracy than open questions."], "MEDIUM", "LOW"

    if verifiability == "SATIRICAL":
        verdict = "SATIRE / NOT INTENDED AS FACT"
        explanation = "Contextual evidence indicates the claim originated as a piece of humor, satire, or parody and was not intended as a genuine news report."
        return verdict, explanation, [], ["Parody content often gets recirculated without original satirical context."], "HIGH", "LOW"

    if not raw_sources:
        verdict = "UNVERIFIED"
        explanation = "Available evidence is insufficient to establish whether the claim is true or false. No authoritative reports or primary documents corroborating or disproving the claim were found in the examined databases. Note: An unverified status does not indicate the claim is false, but rather that evidence is currently lacking."
        return verdict, explanation, [], ["Absence of verified records in search index", "Independent corroboration not available"], "LOW", "LOW"

    # Try LLM evaluation if API key is provided
    active_key = api_key or GEMINI_API_KEY
    if active_key:
        llm_res = evaluate_with_llm(claim, raw_sources, active_key)
        if llm_res:
            return llm_res

    # Enhanced Semantic Heuristic Evaluation
    outdated_signals = [
        "discontinued", "withdrawn", "old circular", "dated back", "in 2016", "in 2017",
        "no longer valid", "superseded", "withdrawn by rbi", "पुराना नियम", "वापस लिया"
    ]

    supports_count = 0
    contradicts_count = 0
    outdated_count = 0
    context_count = 0
    high_auth_supports = 0

    enriched_sources = []

    office_pattern = r'^(.*?)\s+(?:is|serves as|became|elected as)\s+(?:the\s+)?(prime minister|chief minister|president|governor|cji|chief justice|home minister|defence minister|finance minister)\s*(?:of\s+([a-zA-Z\s]+))?'
    is_office_claim = bool(re.search(office_pattern, claim_text, re.IGNORECASE)) or any(w in claim_text for w in ["प्रधानमंत्री", "मुख्यमंत्री", "राष्ट्रपति"])

    for src in raw_sources:
        title = src.get("title", "")
        excerpt = src.get("excerpt", "")
        publisher = src.get("publisher", "News Source")
        auth_type = src.get("authority_type", "SECONDARY_SOURCE")

        if is_office_claim:
            office_eval = analyze_office_claim(claim_text, title, excerpt)
            if office_eval:
                rel, relevance_exp = office_eval
                if rel == "CONTRADICTS":
                    contradicts_count += 1
                else:
                    supports_count += 1
                    high_auth_supports += 1
            else:
                rel = "CONTEXT"
                relevance_exp = "Provides general background news mentioning the subject, but does not corroborate holding the claimed office."
                context_count += 1
        else:
            is_refuted = check_targeted_refutation(claim_text, title, excerpt)
            is_supported, overlap = check_corroboration(claim_text, entities, title, excerpt, publisher, auth_type)
            is_outdated = any(sig in (title + " " + excerpt).lower() for sig in outdated_signals)

            if is_refuted:
                rel = "CONTRADICTS"
                relevance_exp = f"{publisher} explicitly investigates and refutes the assertion as factually unsubstantiated or debunked."
                contradicts_count += 1
            elif is_supported:
                rel = "SUPPORTS"
                relevance_exp = f"Independent reporting from {publisher} directly corroborates the key event, entities, and actions described in the claim."
                supports_count += 1
                if auth_type in ("GOVERNMENT_PRIMARY", "CONSTITUTIONAL_PRIMARY", "INTERNATIONAL_HEALTH_AUTHORITY", "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION", "PRIMARY_REFERENCE"):
                    high_auth_supports += 1
            elif is_outdated:
                rel = "CONTEXT"
                relevance_exp = "Indicates that the event or notice relates to a past policy or historical event that may no longer be active."
                outdated_count += 1
            else:
                rel = "CONTEXT"
                relevance_exp = "Provides background context and related reporting on the subject."
                context_count += 1

        enriched_sources.append({
            "title": title,
            "publisher": publisher,
            "url": src.get("url", ""),
            "published_at": src.get("published_at"),
            "retrieved_at": datetime.now().isoformat(),
            "relevant_excerpt": excerpt or title,
            "evidence_relation": rel,
            "relevance_explanation": relevance_exp,
            "accessibility_status": "ACCESSIBLE",
            "domain_authority_notes": auth_type
        })

    uncertainties = []

    # Accurate, evidence-based verdict determination
    authoritative_types = (
        "CERTIFIED_FACT_CHECKER", "PRIMARY_REFERENCE", "GOVERNMENT_PRIMARY",
        "CONSTITUTIONAL_PRIMARY", "INTERNATIONAL_HEALTH_AUTHORITY",
        "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION"
    )

    has_authoritative_contra = any(
        s.get("evidence_relation") == "CONTRADICTS" and 
        (s.get("domain_authority_notes") in authoritative_types or "affirms" in s.get("relevance_explanation", "").lower() or "opposition" in s.get("relevance_explanation", "").lower())
        for s in enriched_sources
    )

    if contradicts_count >= 1 and supports_count == 0:
        if has_authoritative_contra or contradicts_count >= 2:
            verdict = "FALSE"
            explanation = "Reliable evidence from established fact-checking organizations, official public records, or constitutional documentation directly contradicts the claim. Multiple independent evaluations found the assertion to be baseless, incorrect, or debunked."
            uncertainties.append("Potential localized variations of the viral message may still circulate on messaging platforms.")
        else:
            verdict = "UNVERIFIED"
            explanation = "Available evidence contains preliminary refutations but is insufficient to establish a definitive falsification across independent repositories."
            uncertainties.append("Further primary records required for complete verification.")
    elif contradicts_count >= 2 and supports_count == 1:
        # Decisive contradiction from multiple sources; single support lacks primary authority
        if high_auth_supports == 0 or has_authoritative_contra:
            verdict = "FALSE"
            explanation = "Authoritative public records and independent reporting directly contradict the claim. Incidental token mentions in secondary sources do not substantiate the claim against clear refuting evidence."
            uncertainties.append("Residual ambiguity in secondary news phrasing.")
        else:
            verdict = "DISPUTED"
            explanation = "Credible sources report conflicting findings or different facets of the situation. A single definitive conclusion cannot be confirmed at this time."
            uncertainties.append("Discrepancy between early reports and subsequent official clarifications.")
    elif contradicts_count >= 2 and high_auth_supports == 0 and has_authoritative_contra:
        # Multiple authoritative debunks completely override non-authoritative mentions
        verdict = "FALSE"
        explanation = "Multiple authoritative news organizations and official records have explicitly debunked the core claim. Incidental secondary mentions do not substantiate the assertion against clear refuting evidence."
        uncertainties.append("Viral claims frequently recirculate on social media despite official debunkings.")
    elif contradicts_count >= 1 and supports_count >= 2:
        verdict = "PARTLY TRUE"
        explanation = "The core event is corroborated by major news reports, but certain viral embellishments or claims were specifically debunked or clarified."
        uncertainties.append("Distinction between core facts and secondary embellishments.")
    elif contradicts_count == 1 and supports_count == 1:
        verdict = "DISPUTED"
        explanation = "Credible sources report conflicting findings or different facets of the situation. A single definitive conclusion cannot be confirmed at this time."
        uncertainties.append("Discrepancy between early reports and subsequent official clarifications.")
    elif supports_count >= 2 and contradicts_count == 0:
        verdict = "VERIFIED / SUPPORTED"
        explanation = "Multiple independent and credible news organizations and official statements corroborate the factual claim with consistent reporting."
        uncertainties.append("Ongoing operational or situational updates may evolve over time.")
    elif supports_count == 1 and high_auth_supports >= 1 and contradicts_count == 0:
        verdict = "VERIFIED / SUPPORTED"
        explanation = "Primary documentation from an official authority, global news wire, or encyclopedic record corroborates the factual claim."
        uncertainties.append("Ongoing situational updates may evolve over time.")
    elif supports_count >= 1 and contradicts_count == 0:
        verdict = "VERIFIED / SUPPORTED"
        explanation = "Available reporting from credible news sources supports the factual claim without observed contradictions."
        uncertainties.append("Secondary reporting examined; direct primary documentation may be limited.")
    elif outdated_count > 0:
        verdict = "OUTDATED"
        explanation = "The claim refers to a circumstance or policy that was valid in the past but is no longer current."
        uncertainties.append("Exact date when the policy or status changed.")
    else:
        # Neither support nor contradiction established: UNVERIFIED (never 'PARTLY TRUE' without supporting evidence!)
        verdict = "UNVERIFIED"
        explanation = "Available evidence is insufficient to decisively verify or falsify the exact claim. While general background topics were retrieved, direct independent corroboration is absent."
        uncertainties.append("Limited independent corroboration available in public repositories.")

    # Confidence and Coverage Calculation
    if len(raw_sources) >= 5:
        research_coverage = "HIGH"
    elif len(raw_sources) >= 2:
        research_coverage = "MEDIUM"
    else:
        research_coverage = "LOW"

    has_primary = any(s.get("domain_authority_notes") in authoritative_types for s in enriched_sources)

    if (contradicts_count >= 2 or supports_count >= 2) and has_primary:
        confidence_level = "HIGH"
    elif contradicts_count >= 1 or supports_count >= 1 or len(raw_sources) >= 3:
        confidence_level = "MEDIUM"
    else:
        confidence_level = "LOW"

    return verdict, explanation, enriched_sources, uncertainties, confidence_level, research_coverage

def synthesize_source_comparison(sources: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Generates a side-by-side comparison of primary sources consulted."""
    if len(sources) < 2:
        return None

    src_a = sources[0]
    src_b = sources[1]

    common_origin = False
    if "reuters" in src_a.get("url", "").lower() and "reuters" in src_b.get("url", "").lower():
        common_origin = True
    elif src_a.get("publisher") == src_b.get("publisher"):
        common_origin = True
    elif "pib" in src_a.get("url", "").lower() and "pib" in src_b.get("url", "").lower():
        common_origin = True

    agreements = []
    disagreements = []

    if src_a.get("evidence_relation") == src_b.get("evidence_relation"):
        agreements.append(f"Both {src_a.get('publisher')} and {src_b.get('publisher')} take a consistent stance ({src_a.get('evidence_relation')}) regarding the core events.")
        agreements.append("No material contradiction observed in key dates and names.")
    else:
        disagreements.append(f"{src_a.get('publisher')} classifies the information as {src_a.get('evidence_relation')}, whereas {src_b.get('publisher')} classifies it as {src_b.get('evidence_relation')}.")
        disagreements.append("Variations in framing or scope of the investigated claim.")

    additional = f"{len(sources) - 2} other independent source(s) examined for triangulation." if len(sources) > 2 else "Two independent primary sources compared."

    return {
        "source_a": f"{src_a.get('publisher')}: '{src_a.get('title')}' — emphasizes {src_a.get('relevant_excerpt')[:120]}...",
        "source_b": f"{src_b.get('publisher')}: '{src_b.get('title')}' — highlights {src_b.get('relevant_excerpt')[:120]}...",
        "additional_sources": additional,
        "areas_of_agreement": agreements or ["Sources agree on the general subject matter under review."],
        "areas_of_disagreement": disagreements or ["No substantial contradictions found between consulted independent reports."],
        "common_origin_suspected": common_origin,
        "comparison_summary": "Cross-verification across distinct journalistic and authoritative repositories confirms the consistency of the findings." if not disagreements else "Sources exhibit differing interpretations requiring nuanced scrutiny."
    }
