import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from config import GEMINI_API_KEY
from models import (
    VerifyRequest, VerifyResponse, ExtractedClaim, EvidenceSource,
    SourceComparison, VerificationMethod
)
from services.security import sanitize_untrusted_text
from services.scraper import extract_article_from_url, ScraperException
from services.search import search_web_multi_angle
from services.ai_engine import (
    VERDICT_DEFINITIONS,
    extract_claims_heuristic,
    evaluate_evidence_and_verdict,
    synthesize_source_comparison,
    call_gemini_api
)

def run_verification_pipeline(req: VerifyRequest) -> VerifyResponse:
    """
    Executes the end-to-end TruthLens AI Evidence-Based Truth Analysis Engine:
    1. Content acquisition (URL scraping or direct text).
    2. Input sanitization & security checks.
    3. Claim extraction (isolating individual empirical propositions).
    4. Multi-angle search query generation & concurrent execution.
    5. Evidence extraction, credibility weighting & stance classification.
    6. Verdict determination across 7 core categories with confidence & coverage.
    7. Transparent audit report with what evidence establishes, corrections, and citations.
    """
    report_id = f"TL-{uuid.uuid4().hex[:10].upper()}"
    checked_at = datetime.now().isoformat()
    submitted_text = req.text or ""
    submitted_url = req.url
    headline = None
    language = req.language or "auto"
    country = req.country or "IN"

    # Step 0: If URL provided, securely scrape content
    if submitted_url and not submitted_text:
        scrape_result = extract_article_from_url(submitted_url)
        submitted_text = scrape_result["text"]
        headline = scrape_result.get("headline")
    elif submitted_url and submitted_text:
        headline = submitted_text.split("\n")[0][:120]
    else:
        first_line = submitted_text.strip().split("\n")[0]
        if len(first_line) < 120:
            headline = first_line

    # Sanitize untrusted input text
    submitted_text = sanitize_untrusted_text(submitted_text, max_chars=15000)

    if not submitted_text.strip():
        raise ValueError("Please provide either text or a valid URL to analyze.")

    # Auto-detect language if requested
    if language == "auto":
        has_devanagari = any("\u0900" <= char <= "\u097F" for char in submitted_text)
        language = "hi" if has_devanagari else "en"

    # Step 1: Claim Extraction
    raw_claims = extract_claims_heuristic(submitted_text, language=language)
    if not raw_claims:
        raw_claims = [{
            "claim_id": "claim-1",
            "claim_text": submitted_text[:300],
            "entities": [],
            "time_period": None,
            "category": "general_factual",
            "verifiability": "SPECIFIC_FACTUAL"
        }]

    all_evidence_sources: List[EvidenceSource] = []
    processed_claims: List[ExtractedClaim] = []
    total_queries: List[str] = []
    all_source_types: List[str] = []
    live_search_success_overall = False

    # Process each extracted claim individually
    for c_idx, claim_dict in enumerate(raw_claims):
        claim_text = claim_dict["claim_text"]
        entities = claim_dict.get("entities", [])

        # Step 2: Web Research via multi-angle concurrent search
        search_res = search_web_multi_angle(
            claim_text=claim_text,
            entities=entities,
            language=language,
            country=country
        )

        raw_sources = search_res["sources"]
        queries = search_res["queries_executed"]
        total_queries.extend(queries)
        all_source_types.extend(search_res["source_types_found"])

        if search_res["live_search_available"]:
            live_search_success_overall = True

        # Step 3, 4, 5: Evidence Evaluation & Verdict
        eval_res = evaluate_evidence_and_verdict(
            claim=claim_dict,
            raw_sources=raw_sources,
            as_of_date=req.as_of_date,
            api_key=req.api_key
        )
        verdict, explanation, enriched_sources, uncertainties, conf, cov, what_establishes, corrected_info, conclusion = eval_res

        supp_indices = []
        contra_indices = []
        ctx_indices = []

        start_src_index = len(all_evidence_sources)
        for s_i, s in enumerate(enriched_sources):
            global_index = start_src_index + s_i
            if s["evidence_relation"] == "SUPPORTS":
                supp_indices.append(global_index)
            elif s["evidence_relation"] == "CONTRADICTS":
                contra_indices.append(global_index)
            else:
                ctx_indices.append(global_index)

            all_evidence_sources.append(EvidenceSource(**s))

        processed_claims.append(ExtractedClaim(
            claim_id=claim_dict.get("claim_id", f"claim-{c_idx+1}"),
            claim_text=claim_text,
            entities=entities,
            time_period=claim_dict.get("time_period"),
            category=claim_dict.get("category", "general_factual"),
            verifiability=claim_dict.get("verifiability", "SPECIFIC_FACTUAL"),
            verdict=verdict,
            verdict_definition=VERDICT_DEFINITIONS.get(verdict, ""),
            explanation=explanation,
            what_evidence_establishes=what_establishes,
            corrected_information=corrected_info,
            supporting_evidence_indices=supp_indices,
            contradicting_evidence_indices=contra_indices,
            context_evidence_indices=ctx_indices,
            remaining_uncertainties=uncertainties
        ))

    # Determine overall document verdict across standard categories
    claim_verdicts = [c.verdict for c in processed_claims]
    if all(v in ("TRUE", "VERIFIED / SUPPORTED") for v in claim_verdicts):
        overall_verdict = "TRUE"
    elif all(v == "FALSE" for v in claim_verdicts):
        overall_verdict = "FALSE"
    elif any(v in ("TRUE", "VERIFIED / SUPPORTED") for v in claim_verdicts) and any(v in ("FALSE", "MOSTLY FALSE") for v in claim_verdicts):
        overall_verdict = "MOSTLY TRUE" if claim_verdicts.count("TRUE") >= claim_verdicts.count("FALSE") else "MOSTLY FALSE"
    elif any(v == "MISLEADING" for v in claim_verdicts):
        overall_verdict = "MISLEADING"
    elif any(v == "MOSTLY FALSE" for v in claim_verdicts):
        overall_verdict = "MOSTLY FALSE"
    elif any(v == "FALSE" for v in claim_verdicts):
        overall_verdict = "FALSE"
    elif any(v == "MOSTLY TRUE" for v in claim_verdicts) or any(v == "PARTLY TRUE" for v in claim_verdicts):
        overall_verdict = "MOSTLY TRUE"
    elif any(v in ("TRUE", "VERIFIED / SUPPORTED") for v in claim_verdicts):
        overall_verdict = "TRUE"
    elif any(v == "OUTDATED" for v in claim_verdicts):
        overall_verdict = "OUTDATED"
    elif any(v == "DISPUTED" for v in claim_verdicts):
        overall_verdict = "DISPUTED"
    elif any(v == "OPINION / NOT FACT-CHECKABLE" for v in claim_verdicts):
        overall_verdict = "OPINION / NOT FACT-CHECKABLE"
    elif any(v == "SATIRE / NOT INTENDED AS FACT" for v in claim_verdicts):
        overall_verdict = "SATIRE / NOT INTENDED AS FACT"
    else:
        overall_verdict = "UNVERIFIED"

    # Overall explanation and synthesis
    if len(processed_claims) > 1:
        overall_explanation = (
            f"The submitted text contains {len(processed_claims)} distinct claims evaluated independently. "
            f"Overall verdict: {overall_verdict}. Review individual claim breakdowns below for specific evidence."
        )
        doc_what_establishes = "; ".join(filter(None, [c.what_evidence_establishes for c in processed_claims])) or "Multiple claims cross-referenced against public archives."
        corrections = [c.corrected_information for c in processed_claims if c.corrected_information]
        doc_corrected_info = " | ".join(corrections) if corrections else None
        doc_conclusion = f"Analysis of {len(processed_claims)} distinct assertions concludes with an overall finding of {overall_verdict}."
    else:
        primary = processed_claims[0]
        overall_explanation = primary.explanation
        doc_what_establishes = primary.what_evidence_establishes
        doc_corrected_info = primary.corrected_information
        doc_conclusion = primary.explanation[:160]

    # Confidence and Coverage (Overall)
    if not live_search_success_overall:
        overall_confidence = "LOW"
        conf_reason = "Live search was unable to reach authoritative search indices. No definitive conclusions can be drawn."
        overall_coverage = "LOW"
        cov_reason = "Zero external search indexes returned query results."
        warning_notice = "Live verification is unavailable. This result is not a completed fact-check."
    else:
        if len(all_evidence_sources) >= 4:
            overall_coverage = "HIGH"
            cov_reason = f"Examined {len(all_evidence_sources)} relevant sources across multiple news and authoritative repositories."
        elif len(all_evidence_sources) >= 2:
            overall_coverage = "MEDIUM"
            cov_reason = f"Examined {len(all_evidence_sources)} relevant source(s)."
        else:
            overall_coverage = "LOW"
            cov_reason = "Fewer than 2 relevant sources identified in public indices."

        has_authoritative = any(s.domain_authority_notes in ("GOVERNMENT_PRIMARY", "CONSTITUTIONAL_PRIMARY", "CERTIFIED_FACT_CHECKER", "GLOBAL_NEWS_WIRE", "ESTABLISHED_NEWS_ORGANIZATION", "PRIMARY_REFERENCE") for s in all_evidence_sources)
        if has_authoritative and overall_verdict in ("TRUE", "FALSE", "VERIFIED / SUPPORTED"):
            overall_confidence = "HIGH"
            conf_reason = "Strong corroboration from recognized primary authorities, encyclopedic references, or certified fact-checkers."
        elif len(all_evidence_sources) >= 2:
            overall_confidence = "MEDIUM"
            conf_reason = "Moderate consensus from credible secondary reporting; direct primary records may be limited."
        else:
            overall_confidence = "LOW"
            conf_reason = "Available evidence is sparse or ambiguous."
        warning_notice = None

    # Step 6: Source Comparison
    dumped_sources = [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in all_evidence_sources]
    source_comparison_dict = synthesize_source_comparison(dumped_sources)
    source_comparison_obj = SourceComparison(**source_comparison_dict) if source_comparison_dict else None

    # Verification Method Summary
    clean_types = list(set(t.replace("_", " ").title() for t in all_source_types)) or ["Open Web & News Indexes"]
    method = VerificationMethod(
        search_queries=list(dict.fromkeys(total_queries))[:5],
        source_types=clean_types,
        date_ranges="Current & Historical Archives (2016-2026)",
        evaluation_criteria=[
            "Direct alignment with people, locations, dates, and empirical facts",
            "Publisher reputation and official/constitutional/academic mandate",
            "Differentiation between primary reporting vs syndicated wires",
            "Transparency of corrections, peer review, and public records access"
        ],
        important_limitations=[
            "Search results are limited to publicly indexable web sources.",
            "Private messages, closed groups, and paywalled journals cannot be indexed.",
            "Absence of evidence does not constitute definitive proof of falsehood."
        ]
    )

    limitations = [
        "Dynamic breaking news situations may have fluid or evolving facts.",
        "Unindexed regional or physical archives were not consulted.",
        "Automated cross-referencing does not replace judicial, clinical, or forensic investigation."
    ]

    return VerifyResponse(
        report_id=report_id,
        submitted_content=submitted_text,
        submitted_url=submitted_url,
        headline=headline,
        language=language,
        country=country,
        extracted_claims=processed_claims,
        verdict=overall_verdict,
        verdict_definition=VERDICT_DEFINITIONS.get(overall_verdict, ""),
        explanation=overall_explanation,
        what_evidence_establishes=doc_what_establishes,
        corrected_information=doc_corrected_info,
        final_conclusion=doc_conclusion,
        evidence_sources=all_evidence_sources,
        source_comparison=source_comparison_obj,
        verification_method=method,
        confidence_level=overall_confidence,
        confidence_reason=conf_reason,
        research_coverage=overall_coverage,
        coverage_reason=cov_reason,
        checked_at=checked_at,
        limitations=limitations,
        live_search_available=live_search_success_overall,
        warning_notice=warning_notice
    )
