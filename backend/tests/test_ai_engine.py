import pytest
from services.ai_engine import (
    check_targeted_refutation,
    analyze_office_claim,
    check_corroboration,
    extract_claims_heuristic,
    evaluate_evidence_and_verdict
)

def test_check_targeted_refutation_genuine_debunks():
    # Debunking a claim
    assert check_targeted_refutation(
        "2000 note has nano chip",
        "Fact Check: Does Rs 2000 note have GPS nano chip?",
        "No such chip exists. RBI has clarified that the claim is completely false and baseless."
    ) is True

    # Debunking a viral rumor
    assert check_targeted_refutation(
        "Kanya Sumangala cash reward",
        "PIB Fact Check on Viral WhatsApp Scheme",
        "PIB debunked this viral message: Government has issued no such order or cash gift."
    ) is True

def test_check_targeted_refutation_descriptive_news_not_debunk():
    # Reporting on police busting a fraud is NOT a debunk of the news report itself
    assert check_targeted_refutation(
        "Police arrested cyber fraud gang",
        "Police arrested 5 members of cyber fraud gang in Noida",
        "The gang tricked victims using fake accounts and false promises of high returns."
    ) is False

    # Medical diagnosis false positive
    assert check_targeted_refutation(
        "Hospital expands diagnostic testing",
        "City Hospital upgrades lab equipment",
        "New high-precision PCR machines reduce false positive and false negative test results."
    ) is False

def test_analyze_office_claim_incumbent():
    # Narendra Modi is affirmed as PM
    res = analyze_office_claim(
        "Narendra Modi is the Prime Minister of India",
        "The Hindu - National News",
        "Prime Minister Narendra Modi addressed the nation on economic reforms."
    )
    assert res is not None
    rel, explanation = res
    assert rel == "SUPPORTS"

def test_analyze_office_claim_opposition_not_incumbent():
    # Rahul Gandhi asserted as PM contradicted by news identifying him as opposition or Modi as PM
    res = analyze_office_claim(
        "Rahul Gandhi is the Prime Minister of India",
        "NDTV National News",
        "Prime Minister Narendra Modi slammed opposition leader Rahul Gandhi in parliament today."
    )
    assert res is not None
    rel, explanation = res
    assert rel == "CONTRADICTS"
    assert "Narendra Modi" in explanation or "opposition" in explanation

def test_analyze_office_claim_hindi():
    # Hindi affirmation
    res_nm = analyze_office_claim(
        "नरेंद्र मोदी भारत के प्रधानमंत्री हैं",
        "BBC Hindi",
        "प्रधानमंत्री नरेंद्र मोदी ने आज नई परियोजना का उद्घाटन किया।"
    )
    assert res_nm is not None
    assert res_nm[0] == "SUPPORTS"

    # Hindi contradiction
    res_rg = analyze_office_claim(
        "राहुल गांधी भारत के प्रधानमंत्री हैं",
        "Dainik Jagran",
        "प्रधानमंत्री नरेंद्र मोदी ने विपक्ष के नेता राहुल गांधी पर तीखा प्रहार किया।"
    )
    assert res_rg is not None
    assert res_rg[0] == "CONTRADICTS"

def test_extract_claims_heuristic_lowercase():
    # Handles all-lowercase news text properly
    claims = extract_claims_heuristic("narendra modi is prime minister of india")
    assert len(claims) >= 1
    assert "Narendra Modi" in claims[0]["entities"]
    assert claims[0]["verifiability"] == "SPECIFIC_FACTUAL"

def test_extract_claims_heuristic_interrogative():
    # Interrogative queries recognized
    claims = extract_claims_heuristic("who said about making gold from potato? haikya?")
    assert len(claims) >= 1
    assert claims[0]["verifiability"] == "INTERROGATIVE_QUERY"

def test_extract_claims_heuristic_opinion():
    # Subjective statements recognized
    claims = extract_claims_heuristic("in my opinion cricket is the best sport in the world")
    assert len(claims) >= 1
    assert claims[0]["verifiability"] == "SUBJECTIVE_OPINION"

def test_evaluate_evidence_unverified_not_partly_true_when_zero_supports():
    # When sources provide background but neither support nor contradict, verdict must be UNVERIFIED, not PARTLY TRUE
    claim = {
        "claim_text": "Aliens secretly landed in the Thar Desert",
        "entities": ["Aliens", "Thar Desert"],
        "verifiability": "SPECIFIC_FACTUAL"
    }
    raw_sources = [
        {"title": "Thar Desert Geography and Wildlife", "excerpt": "The Great Indian Desert covers 200000 sq km.", "publisher": "Nature", "authority_type": "SECONDARY_SOURCE", "url": "http://example.com/1"},
        {"title": "Tourism in Rajasthan", "excerpt": "Visitors flock to Jaisalmer desert camps.", "publisher": "Travel", "authority_type": "SECONDARY_SOURCE", "url": "http://example.com/2"},
        {"title": "Astronomy Observatory in Rajasthan", "excerpt": "Stargazing events in rural areas.", "publisher": "Space", "authority_type": "SECONDARY_SOURCE", "url": "http://example.com/3"},
    ]

    verdict, explanation, enriched, uncertainties, conf, cov = evaluate_evidence_and_verdict(claim, raw_sources)
    assert verdict == "UNVERIFIED"
    assert "insufficient" in explanation.lower()

def test_evaluate_evidence_decisive_false_on_overwhelming_contradictions():
    # Multiple authoritative contradictions should not be downgraded to DISPUTED because of 1 secondary token overlap
    claim = {
        "claim_text": "Government of India giving 50000 cash under Kanya Sumangala to everyone",
        "entities": ["Government of India", "50000", "Kanya Sumangala"],
        "verifiability": "SPECIFIC_FACTUAL"
    }
    raw_sources = [
        {"title": "PIB Fact Check: Viral Kanya Sumangala message is FALSE", "excerpt": "Government has announced no such Rs 50000 cash gift. The viral forward is completely fake.", "publisher": "PIB Fact Check", "authority_type": "CERTIFIED_FACT_CHECKER", "url": "https://pib.gov.in/1"},
        {"title": "BOOM Live: Debunked Kanya Sumangala fake scheme", "excerpt": "The claim of Rs 50,000 direct bank transfer is bogus and fraudulent.", "publisher": "BOOM Live", "authority_type": "CERTIFIED_FACT_CHECKER", "url": "https://boomlive.in/1"},
    ]

    verdict, explanation, enriched, uncertainties, conf, cov = evaluate_evidence_and_verdict(claim, raw_sources)
    assert verdict == "FALSE"
    assert "contradicts" in explanation.lower() or "debunked" in explanation.lower()
