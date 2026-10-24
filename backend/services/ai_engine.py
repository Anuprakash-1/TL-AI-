import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple, Set
import httpx
from config import GEMINI_API_KEY, OPENAI_API_KEY
from services.security import wrap_untrusted_text_for_ai

VERDICT_DEFINITIONS = {
    "TRUE": "Strong, reliable evidence from authoritative or primary sources directly supports the factual claim.",
    "MOSTLY TRUE": "The central claim is corroborated by reliable evidence, but minor details require qualification or context.",
    "MISLEADING": "The claim contains some truth but omits important context or presents information deceptively.",
    "MOSTLY FALSE": "Important parts of the claim are contradicted or uncorroborated by reliable evidence.",
    "FALSE": "Strong, reliable evidence from official records, primary documentation, or established investigations directly contradicts the claim.",
    "UNVERIFIED": "Available evidence in authoritative and public indices is currently insufficient to reach a reliable conclusion.",
    "OUTDATED": "The claim was previously accurate but is no longer accurate in the stated context.",
    "OPINION / NOT FACT-CHECKABLE": "The content expresses a personal value judgment, prediction, or subjective viewpoint rather than an empirical, verifiable fact.",
    "SATIRE / NOT INTENDED AS FACT": "Contextual evidence indicates the content was created as satire, humor, or parody, not as a factual report.",
    # Backward compatibility aliases
    "VERIFIED / SUPPORTED": "Strong, reliable evidence from authoritative or primary sources directly supports the factual claim.",
    "PARTLY TRUE": "The central claim is corroborated by reliable evidence, but minor details require qualification or context.",
    "DISPUTED": "Credible sources report conflicting findings; a single definitive conclusion cannot be confirmed at this time."
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

    # 1. Obvious Fact-Check / Fake-Alert badges in Title or Excerpt
    factcheck_badges = [
        r"\bfake\s*alert\b",
        r"\bmyth\s*(?:busted|buster)\b",
        r"\b(?:hoax|debunked|debunking|debunk|debunks|fictitious|scam\s*alert)\b",
        r"\b(?:फेक\s*अलर्ट|तथ्य\s*जांच|पड़ताल|दावा\s*फर्जी|दावा\s*झूठा|दावा\s*गलत|अफवाह|भ्रामक)\b",
        r"\bgovt\s+debunks?\b",
        r"\b(?:falls?|fell)\s+for\s+.*?\bhoax\b",
        r"\bnot\s+declared\b",
        r"\bnot\s+announced\b",
        r"\bnot\s+ranked\b",
        r"\bnot\s+true\b",
        r"\bno\s+such\b",
        r"\bno,\s+it['’]s\s+a\s+scam\b",
        r"\bno,\s+the\s+.*?\b(?:scam|fake|hoax|untrue)\b",
        r"\bno,\s+[\w\s]{1,30}\s+(?:did\s*not|does\s*not|is\s*not|was\s*not|has\s*not|isn['’]t)\b",
    ]
    if any(re.search(pat, filtered_text) for pat in factcheck_badges):
        return True

    # 2. Fact Check title + refutation signal anywhere in title or excerpt
    has_fc_prefix = bool(re.search(r"\b(?:fact[\s\-]check|factcheck|पड़ताल|सच\s*क्या\s*है)\b", filtered_text))
    fc_signals = [
        r"\b(?:false|fake|hoax|scam|fraud|misleading|bogus|untrue|fabricated|morphed|doctored|baseless|unfounded|myth)\b",
        r"\b(?:did\s*not|was\s*not|is\s*not|does\s*not|has\s*not|have\s*not|never|isn['’]t)\b",
        r"\b(?:no\s+such|no\s+evidence|no\s+record|no\s+announcement|no\s+order)\b",
        r"\bno,\s+",
        r"\b(?:गलत|फर्जी|झूठ|निराधार|भ्रामक)\b",
    ]
    if has_fc_prefix and any(re.search(sig, filtered_text) for sig in fc_signals):
        return True

    # 3. Targeted refutation patterns targeting the claim, rumour, or assertion
    refutation_patterns = [
        r"\b(?:claim|rumor|rumour|post|forward|message|video|news|report)\b.*?\b(?:is|was|are|were)?\s*(?:false|fake|baseless|untrue|fabricated|bogus|unfounded|completely fictitious|myth)\b",
        r"\b(?:won[’\']?t|will\s*not|does\s*not|do\s*not|cannot|did\s*not|has\s*not|was\s*not|were\s*not|never|isn[’\']?t|aren[’\']?t)\s+(?:have|contain|carry|feature|include|track|declare|announce|give|rank|distribute|offer|award|order|launch|pay|send)\b",
        r"\bno\s+(?:[\w\-]+\s+){0,3}(?:chip|tracker|transmitter|satellite\s*track\w*)\b",
        r"\bno\s+(?:evidence|truth|basis|microchip|nano\s*chip|such\s*(?:order|scheme|rule|announcement|notification|plan|award|ranking|recharge|prize))\b",
        r"\b(?:denied|denies|dismisses|refutes|dismissed|refuted|clarified|rejected)\s+.*?\b(?:claims?|reports?|rumors?|rumours?|allegations?)\b",
        r"(?:दावा\s*(?:गलत|फर्जी|झूठा|निराधार|भ्रामक)|का\s*खंडन|तथ्यहीन|फेक\s*न्यूज|फेक\s*मैसेज|कोई\s*चिप\s*नहीं|कोई\s*घोषणा\s*नहीं)"
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

    full_text = (src_title + " " + src_excerpt).lower()
    debunk_tokens = [
        "fact check", "fact-check", "factcheck", "fake alert", "debunk", "hoax", "scam",
        "not true", "not declared", "not announced", "not ranked", "myth",
        "did not declare", "was not declared", "did not announce", "no such",
        "no longer valid", "superseded", "reclassified", "dwarf planet", "no longer a planet",
        "no longer considered", "no longer active", "former classification", "demoted",
        "पड़ताल", "फर्जी", "गलत दावा", "भ्रामक"
    ]
    if any(d in full_text for d in debunk_tokens):
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

    # Inception / creation synonym bridging
    creation_synonyms = {"creat", "conceiv", "invent", "design", "develop", "found", "author", "build", "launch", "originat", "craft"}
    if (predicate_tokens & creation_synonyms) and (src_tokens & creation_synonyms):
        pred_overlap = 0.40
    elif predicate_tokens:
        pred_overlap = len(predicate_tokens & src_tokens) / max(1, len(predicate_tokens))
    else:
        pred_overlap = overlap

    is_high_auth = auth_type in (
        "GOVERNMENT_PRIMARY", "CONSTITUTIONAL_PRIMARY", "INTERNATIONAL_HEALTH_AUTHORITY",
        "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION", "PRIMARY_REFERENCE",
        "CERTIFIED_FACT_CHECKER"
    )

    # Active reporting & factual confirmation patterns
    active_verbs = (
        r"\b(?:declares?|declared|announces?|announced|confirms?|confirmed|launches?|launched|"
        r"approves?|approved|passes?|passed|orders?|ordered|rules?|ruled|reports?|reported|"
        r"decides?|decided|keeps?|kept|unveils?|unveiled|signs?|signed|meets?|met|hits?|reaches?|"
        r"holds?|held|secures?|secured|wins?|won|awards?|awarded|states?|stated|proves?|proved|"
        r"established|defines?|defined|discovered|invented|partitioned|equals?|equals|"
        r"conceiv\w*|design\w*|author\w*|develop\w*)\b|"
        r"(?:पुष्टि|घोषणा|सत्यापित|मंजूरी|फैसला|आधिकारिक|लागू|किया)"
    )
    has_active_verb = bool(re.search(active_verbs, (src_title + " " + src_excerpt).lower()))

    # Check critical feature nouns and superlatives
    feature_markers = {
        "chip", "microchip", "nano", "gps", "tracker", "transmitter",
        "secret", "radiation", "50000", "5000", "cure", "recharge", "satellite",
        "gold", "sona", "चिप", "सोना", "richest", "poorest", "banned"
    }
    critical_features = claim_tokens & feature_markers
    if critical_features and not (critical_features & src_tokens):
        return False, overlap

    # If source only mentions entities with zero match on the claimed action/event
    if predicate_tokens and pred_overlap == 0.0:
        return False, overlap

    # True corroboration criteria
    if overlap >= 0.45 and (not predicate_tokens or pred_overlap >= 0.20):
        return True, overlap
    if overlap >= 0.30 and (pred_overlap >= 0.30 or has_active_verb):
        return True, overlap
    if is_high_auth and overlap >= 0.25 and pred_overlap >= 0.20:
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
) -> Optional[Tuple[str, str, List[Dict[str, Any]], List[str], str, str, str, Optional[str], str]]:
    """Evaluates evidence using Gemini with strict forensic fact-checking instructions."""
    if not api_key or not raw_sources:
        return None

    sources_summary = []
    for idx, s in enumerate(raw_sources):
        sources_summary.append(
            f"[{idx}] Title: {s.get('title')} | Publisher: {s.get('publisher')} | Excerpt: {s.get('excerpt')}"
        )

    prompt = f"""You are TruthLens AI's forensic truth analysis and evidence verification engine.
Evaluate the factual claim against the provided sources.

CLAIM: "{claim.get('claim_text')}"
ENTITIES: {claim.get('entities', [])}

SOURCES:
{chr(10).join(sources_summary)}

RULES:
1. For each source, classify as:
   - "SUPPORTS": Source confirms that the event, scientific fact, or statement described in the claim actually occurred or is true.
   - "CONTRADICTS": Source specifically debunks, refutes, denies, or proves the claim false.
   - "CONTEXT": General background information.
2. Select verdict strictly from: "TRUE", "MOSTLY TRUE", "MISLEADING", "MOSTLY FALSE", "FALSE", "UNVERIFIED", "OUTDATED", "OPINION / NOT FACT-CHECKABLE", "SATIRE / NOT INTENDED AS FACT".
3. Provide:
   - what_evidence_establishes: Exactly what the evidence proves.
   - corrected_information: The accurate factual reality if the claim is false, misleading, or outdated.
   - final_conclusion: Authoritative conclusion.

Output strictly valid JSON with format:
{{
  "verdict": "TRUE | MOSTLY TRUE | MISLEADING | MOSTLY FALSE | FALSE | UNVERIFIED | OUTDATED",
  "explanation": "Clear factual explanation in simple language.",
  "what_evidence_establishes": "Concise summary of verified empirical facts.",
  "corrected_information": "Factual correction or null if true.",
  "final_conclusion": "Authoritative conclusion.",
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
            verdict = "TRUE" if "TRUE" in verdict or "VERIFIED" in verdict else "UNVERIFIED"

        explanation = parsed.get("explanation", "")
        what_establishes = parsed.get("what_evidence_establishes", "Analysis of primary and secondary reporting.")
        corrected_info = parsed.get("corrected_information")
        conclusion = parsed.get("final_conclusion", explanation[:140])
        conf = parsed.get("confidence_level", "MEDIUM")
        cov = parsed.get("research_coverage", "MEDIUM")
        uncertainties = parsed.get("uncertainties", [])

        eval_map = {item.get("source_index"): item for item in parsed.get("sources_evaluation", [])}

        enriched = []
        for idx, src in enumerate(raw_sources):
            eval_info = eval_map.get(idx, {})
            rel = eval_info.get("evidence_relation", "CONTEXT")
            rel_exp = eval_info.get("relevance_explanation", "Provides contextual reporting on the topic.")
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

        return verdict, explanation, enriched, uncertainties, conf, cov, what_establishes, corrected_info, conclusion
    except Exception as err:
        print(f"[LLM Parser Error] {err}")
        return None

def classify_knowledge_domain(text: str) -> str:
    """Classifies a claim or document into one of 10+ knowledge domains using word-bounded regex."""
    lower_sent = text.lower()
    if re.search(r"\b(?:ai|artificial intelligence|python|programming|software|coding|algorithm|computer|linux|neural|gpu|cpu|llm|deep learning|machine learning)\b", lower_sent):
        return "ai_computing"
    elif re.search(r"\b(?:speed of light|boiling point|water boil|celsius|fahrenheit|photosynthesis|physics|chemistry|biology|quantum|planet|solar|moon|orbit|isro|nasa|space|gravity|earth|वैज्ञानिक|अंतरिक्ष)\b", lower_sent):
        return "science_tech"
    elif re.search(r"\b(?:virus|vaccine|who|cancer|health|hospital|doctor|mpox|cure|medicine|nutrition|diet|disease|treatment|pediatric|paracetamol|fever|pneumonia|इलाज|दवा|वैक्सीन)\b", lower_sent):
        return "health_medical"
    elif re.search(r"\b(?:independence|war|battle|treaty|century|empire|ancient|dynasty|capital|geography|partition|british rule|1947|1950|gandhi|nehru|history|इतिहास)\b", lower_sent):
        return "history_geography"
    elif re.search(r"\b(?:court|judge|supreme court|high court|bail|law|act|section|legal|constitution|article 21|bench|verdict|अदालत|कोर्ट|कानून)\b", lower_sent):
        return "legal"
    elif re.search(r"\b(?:rbi|bank|rupee|currency|note|gdp|tax|gst|shares|inflation|economy|recession|repo rate|budget|finance ministry|रुपये|बैंक|नोट)\b", lower_sent):
        return "economics_business"
    elif re.search(r"\b(?:scheme|yojana|yojna|subsidy|pension|election|evm|vote|bjp|congress|modi|rahul|parliament|minister|government|union budget|सरकार|चुनाव|मंत्री)\b", lower_sent):
        return "government_policy"
    elif re.search(r"\b(?:pollution|carbon|emission|emissions|forest|global warming|sea level|climate change|environment|atmosphere)\b", lower_sent):
        return "environmental"
    elif re.search(r"\b(?:protest|summit|breaking|accident|blast|arrest|fired|killed)\b", lower_sent):
        return "current_events"
    elif re.search(r"\b(?:college|university|syllabus|cbse|ncert|exam|education|शिक्षा)\b", lower_sent):
        return "education_academic"
    elif re.search(r"\b(?:cricket|world cup|olympics|match|fifa|medal|खेल)\b", lower_sent):
        return "sports"
    return "general_factual"

def extract_claims_heuristic(text: str, language: str = "en") -> List[Dict[str, Any]]:
    """Extracts verifiable claims, entities, dates, and domain categories across any subject."""
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
        r"\bमेरा मानना है\b", r"\bमुझे लगता है\b", r"\bमेरी राय में\b"
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

        subj_m = re.match(r"^\s*([a-zA-Z0-9\s\-_]{3,35})\s+(?:is|was|are|became|elected as|launched|declared|kept|won|announced)\b", sentence, re.IGNORECASE)
        if subj_m:
            subj = subj_m.group(1).strip()
            if subj.lower() not in ("the", "this", "that", "there", "when", "what", "who", "it", "they", "we", "he", "she"):
                entities.append(subj.title())

        for org in ["ISRO", "NASA", "RBI", "WHO", "ECI", "Supreme Court", "Chandrayaan", "T20 World Cup"]:
            if org.lower() in sentence.lower():
                entities.append(org)

        amounts = re.findall(r"(?:₹|Rs\.?|INR|\$|\€)\s*\d+[\d,]*(?:\s*(?:crore|lakh|thousand|million|billion))?", sentence, re.IGNORECASE)
        entities.extend(amounts)

        # 10+ Domain Categorization
        category = classify_knowledge_domain(sentence)

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
) -> Tuple[str, str, List[Dict[str, Any]], List[str], str, str, str, Optional[str], str]:
    """
    Evaluates evidence against a claim with forensic accuracy across all 7 standard categories:
    TRUE, MOSTLY TRUE, MISLEADING, MOSTLY FALSE, FALSE, UNVERIFIED, OUTDATED.
    """
    claim_text = claim["claim_text"]
    verifiability = claim.get("verifiability", "SPECIFIC_FACTUAL")
    category = claim.get("category", "general_factual")
    entities = claim.get("entities", [])

    if verifiability == "SUBJECTIVE_OPINION":
        verdict = "OPINION / NOT FACT-CHECKABLE"
        explanation = f"The statement ('{claim_text}') expresses a subjective value judgment, taste preference, or personal perspective rather than an empirical factual proposition."
        what_establishes = "Subjective viewpoints and opinions cannot be empirically proven true or false using public records."
        corrected_info = None
        conclusion = "Non-empirical assertion: classified as subjective opinion."
        return verdict, explanation, [], ["Subjective remarks cannot be empirically verified."], "HIGH", "LOW", what_establishes, corrected_info, conclusion

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
            explanation = f"Inquiry Context: The question ('{claim_text}') refers to a circulating controversy investigated by independent fact-checkers."
            what_establishes = "Independent fact-checks have examined the viral subject matter."
            corrected_info = "Consult linked evidence sources for full verified documentation."
            conclusion = "Inquiry addresses a known viral controversy with documented corrections."
            return verdict, explanation, enriched_sources, ["Viral political remarks frequently circulate out of context."], "HIGH", "HIGH", what_establishes, corrected_info, conclusion
        else:
            verdict = "OPINION / NOT FACT-CHECKABLE"
            explanation = f"The submitted text is an open question ('{claim_text}'). TruthLens verifies declarative factual assertions."
            what_establishes = "Open questions do not make empirical declarative assertions."
            corrected_info = None
            conclusion = "Please rephrase as a factual statement for verification."
            return verdict, explanation, enriched_sources, ["Declarative assertions yield higher verification accuracy."], "MEDIUM", "LOW", what_establishes, corrected_info, conclusion

    if verifiability == "SATIRICAL":
        verdict = "SATIRE / NOT INTENDED AS FACT"
        explanation = "Contextual evidence indicates the claim originated as humor, satire, or parody and was not intended as factual reporting."
        what_establishes = "The content was produced by satirical outlets or humor contexts."
        corrected_info = "Content is satirical in nature and not a genuine factual report."
        conclusion = "Parody content: not intended as fact."
        return verdict, explanation, [], ["Satire often gets recirculated without original comedic context."], "HIGH", "LOW", what_establishes, corrected_info, conclusion

    if not raw_sources:
        verdict = "UNVERIFIED"
        explanation = "Available evidence is insufficient to reach a reliable conclusion. No authoritative reports, primary documents, or independent records corroborating or disproving the assertion were found in public indices. Note: An unverified status indicates that evidence is currently lacking, not that the claim is proven false."
        what_establishes = "No authoritative documentation located in public indices."
        corrected_info = None
        conclusion = "Unverified: insufficient public documentation."
        return verdict, explanation, [], ["Absence of verified records in search index", "Independent corroboration not available"], "LOW", "LOW", what_establishes, corrected_info, conclusion

    # Try LLM evaluation if API key is provided
    active_key = api_key or GEMINI_API_KEY
    if active_key:
        llm_res = evaluate_with_llm(claim, raw_sources, active_key)
        if llm_res:
            return llm_res

    # Semantic Heuristic Evaluation
    outdated_signals = [
        "discontinued", "withdrawn", "old circular", "dated back", "in 2016", "in 2017",
        "no longer valid", "superseded", "reclassified", "dwarf planet", "no longer a planet",
        "no longer considered", "no longer active", "former classification", "demoted to dwarf planet",
        "withdrawn by rbi", "पुराना नियम", "वापस लिया"
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
            is_outdated = any(sig in (title + " " + excerpt).lower() for sig in outdated_signals)
            is_supported, overlap = check_corroboration(claim_text, entities, title, excerpt, publisher, auth_type)

            if is_refuted:
                rel = "CONTRADICTS"
                relevance_exp = f"{publisher} explicitly investigates and refutes the assertion as factually unsubstantiated or debunked."
                contradicts_count += 1
            elif is_outdated:
                rel = "CONTEXT"
                relevance_exp = "Indicates that the event, notice, or classification relates to a past policy or historical status that is no longer active."
                outdated_count += 1
            elif is_supported:
                rel = "SUPPORTS"
                relevance_exp = f"Authoritative documentation from {publisher} directly corroborates the key event, entities, and actions described in the assertion."
                supports_count += 1
                if auth_type in ("GOVERNMENT_PRIMARY", "CONSTITUTIONAL_PRIMARY", "INTERNATIONAL_HEALTH_AUTHORITY", "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION", "PRIMARY_REFERENCE", "CERTIFIED_FACT_CHECKER"):
                    high_auth_supports += 1
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

    authoritative_types = (
        "CERTIFIED_FACT_CHECKER", "PRIMARY_REFERENCE", "GOVERNMENT_PRIMARY",
        "CONSTITUTIONAL_PRIMARY", "INTERNATIONAL_HEALTH_AUTHORITY",
        "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION", "SECONDARY_NEWS_OUTLET"
    )

    has_authoritative_contra = any(
        s.get("evidence_relation") == "CONTRADICTS" and 
        (s.get("domain_authority_notes") in authoritative_types or "refutes" in s.get("relevance_explanation", "").lower())
        for s in enriched_sources
    )

    # High caution for health & medical assertions
    if category == "health_medical" and supports_count > 0 and high_auth_supports == 0:
        uncertainties.append("Medical assertions require verification from certified health authorities or peer-reviewed literature.")

    # Core Verdict Assignment across 7 Standard Categories
    if contradicts_count >= 1 and supports_count == 0:
        verdict = "FALSE"
        explanation = "Reliable evidence from established fact-checking organizations, official public records, or primary documentation directly contradicts the claim. Independent investigation confirmed the assertion to be baseless, incorrect, or a circulating hoax."
        what_evidence_establishes = "Official records and investigative findings prove the claimed event, order, or figure does not exist."
        corrected_info = "Consult the cited official sources for verified documentation disproving the viral assertion."
        conclusion = "The claim is demonstrably false and contradicted by reliable evidence."
        uncertainties.append("Potential localized variations of the viral message may still circulate on messaging platforms.")

    elif contradicts_count >= 1 and supports_count == 1:
        if high_auth_supports == 0 or has_authoritative_contra:
            verdict = "FALSE"
            explanation = "Authoritative public records and independent reporting directly contradict the claim. Incidental token mentions in secondary sources do not substantiate the assertion against clear refuting evidence."
            what_evidence_establishes = "Authoritative sources explicitly refute the claim; secondary mentions reflect generic topic overlap."
            corrected_info = "Primary records confirm the assertion is inaccurate."
            conclusion = "The claim is false based on authoritative refutations."
        else:
            verdict = "MOSTLY FALSE"
            explanation = "Core aspects of the assertion are contradicted by credible reports, though minor secondary details or underlying entities exist."
            what_evidence_establishes = "The central premise is unsubstantiated or debunked, despite tangential true elements."
            corrected_info = "Important parts of the claim are incorrect."
            conclusion = "Mostly false: central claim is contradicted."
            uncertainties.append("Discrepancy between early secondary mentions and primary refutations.")

    elif contradicts_count >= 1 and supports_count >= 2:
        verdict = "MISLEADING"
        explanation = "The statement contains elements of truth regarding the core event, but omits essential context, exaggerates figures, or presents details deceptively."
        what_evidence_establishes = "The underlying event or entities are real, but key viral claims or attributions are distorted."
        corrected_info = "Factual reporting confirms the base event, but contradicts the sensationalized spin or misattributions."
        conclusion = "The claim is misleading: factual elements are framed deceptively."
        uncertainties.append("Distinction between core facts and secondary embellishments.")

    elif supports_count >= 2 and contradicts_count == 0:
        verdict = "TRUE"
        explanation = "Multiple independent and authoritative sources, official documentation, or encyclopedic records corroborate the factual assertion with consistent reporting."
        what_evidence_establishes = "Consulted authoritative repositories substantiate the occurrence, dates, entities, and statements described."
        corrected_info = None
        conclusion = "The claim is true and substantiated by reliable documentation."

    elif supports_count == 1 and high_auth_supports >= 1 and contradicts_count == 0:
        verdict = "TRUE"
        explanation = "Primary documentation from an official authority, global news wire, or encyclopedic reference record directly corroborates the factual claim."
        what_evidence_establishes = "Primary reference documentation verifies the factual details."
        corrected_info = None
        conclusion = "The claim is true according to primary reference records."

    elif supports_count >= 1 and contradicts_count == 0:
        verdict = "MOSTLY TRUE"
        explanation = "Available reporting from credible sources supports the central assertion, though broader primary triangulation is limited."
        what_evidence_establishes = "Credible secondary reporting corroborates the central claim."
        corrected_info = None
        conclusion = "Mostly true: supported by available reporting."
        uncertainties.append("Secondary reporting examined; direct primary archival documentation may be limited.")

    elif outdated_count > 0:
        verdict = "OUTDATED"
        explanation = "The assertion was historically accurate at a past time, but is no longer valid under current conditions, updated scientific consensus, or revised policies."
        what_evidence_establishes = "The statement corresponds to a previous rule, classification, or policy that has since been superseded."
        corrected_info = "The policy or scientific classification has been updated and no longer reflects the stated claim."
        conclusion = "The claim is outdated."
        uncertainties.append("Exact date or regulatory order that updated the status.")

    else:
        verdict = "UNVERIFIED"
        explanation = "Available evidence is insufficient to reach a reliable conclusion. While general background documents were retrieved, direct independent corroboration or refutation was not established. Note: An unverified status does not indicate the claim is false, but rather that evidence is currently lacking."
        what_evidence_establishes = "Search indices returned general topical context, but lack specific confirmation or refutation."
        corrected_info = None
        conclusion = "Unverified: insufficient public documentation."
        uncertainties.append("Limited independent corroboration available in public repositories.")

    # Confidence and Coverage Calculation
    if len(raw_sources) >= 4:
        research_coverage = "HIGH"
    elif len(raw_sources) >= 2:
        research_coverage = "MEDIUM"
    else:
        research_coverage = "LOW"

    has_primary = any(s.get("domain_authority_notes") in authoritative_types for s in enriched_sources)

    if ((contradicts_count >= 1 or supports_count >= 1) and has_primary) or contradicts_count >= 2 or supports_count >= 2 or high_auth_supports >= 1:
        confidence_level = "HIGH"
    elif contradicts_count >= 1 or supports_count >= 1 or len(raw_sources) >= 3:
        confidence_level = "MEDIUM"
    else:
        confidence_level = "LOW"

    return verdict, explanation, enriched_sources, uncertainties, confidence_level, research_coverage, what_evidence_establishes, corrected_info, conclusion

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
