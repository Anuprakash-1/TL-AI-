import pytest
from services.ai_engine import (
    extract_claims_heuristic,
    evaluate_evidence_and_verdict,
    classify_knowledge_domain,
    check_corroboration,
    check_targeted_refutation
)
from services.pipeline import run_verification_pipeline
from models import VerifyRequest

def test_classify_knowledge_domains():
    assert classify_knowledge_domain("Speed of light in vacuum is 299,792,458 m/s") == "science_tech"
    assert classify_knowledge_domain("Python programming language was created by Guido van Rossum") == "ai_computing"
    assert classify_knowledge_domain("India gained independence from British rule in 1947") == "history_geography"
    assert classify_knowledge_domain("Paracetamol dosage reduces fever in pediatric patients") == "health_medical"
    assert classify_knowledge_domain("Ministry of Rural Development launched a new welfare subsidy scheme") == "government_policy"
    assert classify_knowledge_domain("Supreme Court constitution bench ruled on fundamental rights under Article 21") == "legal"
    assert classify_knowledge_domain("Reserve Bank of India increased repo rate to manage inflation and tax yields") == "economics_business"
    assert classify_knowledge_domain("Global carbon dioxide emissions reached record levels in the atmosphere") == "environmental"

def test_well_established_true_scientific_claim():
    claim = {
        "claim_text": "Water boils at 100 degrees Celsius under standard atmospheric pressure",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "science_tech",
        "entities": ["Water", "Celsius"]
    }
    raw_sources = [
        {
            "title": "Boiling point - Wikipedia",
            "publisher": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Boiling_point",
            "excerpt": "Under standard atmospheric pressure (1 atm), the boiling point of pure water is 100 degrees Celsius (212 degrees Fahrenheit).",
            "authority_type": "PRIMARY_REFERENCE",
            "published_at": "2026-01-01"
        },
        {
            "title": "Properties of Water - Nature Journal",
            "publisher": "Nature",
            "url": "https://www.nature.com/articles/water-boiling",
            "excerpt": "Water boils at 100 degrees Celsius at 1 atm, transitioning rapidly from liquid to gas.",
            "authority_type": "PRIMARY_REFERENCE",
            "published_at": "2025-05-12"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "TRUE"
    assert conf == "HIGH"
    assert what_establishes is not None
    assert any(w in what_establishes.lower() for w in ["substantiate", "corroborate", "verif", "100", "authoritative"])
    assert conclusion is not None

def test_well_established_true_historical_claim():
    claim = {
        "claim_text": "India gained independence from British rule on August 15, 1947",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "history_geography",
        "entities": ["India", "British rule"]
    }
    raw_sources = [
        {
            "title": "Indian Independence Act 1947 - National Archives",
            "publisher": "National Archives",
            "url": "https://www.nationalarchives.gov.uk/india-1947",
            "excerpt": "The Indian Independence Act 1947 partitioned British India into two independent dominions of India and Pakistan on 15 August 1947.",
            "authority_type": "CONSTITUTIONAL_PRIMARY",
            "published_at": "1947-08-15"
        },
        {
            "title": "Independence Day (India) - Wikipedia",
            "publisher": "Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Independence_Day_(India)",
            "excerpt": "Independence Day is celebrated annually on 15 August as a national holiday in India commemorating the nation's independence from the United Kingdom on 15 August 1947.",
            "authority_type": "PRIMARY_REFERENCE",
            "published_at": "2026-01-01"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "TRUE"
    assert conf == "HIGH"
    assert "corroborate" in explanation.lower() or "1947" in explanation or "independence" in explanation.lower()

def test_well_established_true_technology_claim():
    claim = {
        "claim_text": "Python programming language was created by Guido van Rossum",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "ai_computing",
        "entities": ["Python", "Guido van Rossum"]
    }
    raw_sources = [
        {
            "title": "History of Python - Python Software Foundation",
            "publisher": "Python.org",
            "url": "https://www.python.org/doc/essays/history/",
            "excerpt": "Python was conceived in the late 1980s by Guido van Rossum at Centrum Wiskunde & Informatica (CWI) in the Netherlands.",
            "authority_type": "PRIMARY_REFERENCE",
            "published_at": "2024-01-01"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "TRUE"
    assert what_establishes is not None

def test_clearly_false_viral_hoax_classified_false():
    claim = {
        "claim_text": "UNESCO declared Jana Gana Mana as the best national anthem in the world",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "current_events",
        "entities": ["UNESCO", "Jana Gana Mana"]
    }
    raw_sources = [
        {
            "title": "Fact Check: Did UNESCO declare Jana Gana Mana the best national anthem?",
            "publisher": "Times of India Fact Check",
            "url": "https://timesofindia.indiatimes.com/fact-check/unesco-best-anthem",
            "excerpt": "UNESCO has repeatedly clarified that no such declaration was ever made. The viral social media message is completely fake and baseless.",
            "authority_type": "CERTIFIED_FACT_CHECKER",
            "published_at": "2023-08-15"
        },
        {
            "title": "UNESCO has not declared Jana Gana Mana best anthem: Fact Check",
            "publisher": "India Today Fact Check",
            "url": "https://www.indiatoday.in/fact-check/story/unesco-national-anthem-fake",
            "excerpt": "The claim that UNESCO selected the Indian national anthem as the world's best is a recurring viral hoax debunked multiple times.",
            "authority_type": "CERTIFIED_FACT_CHECKER",
            "published_at": "2022-01-26"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "FALSE"
    assert conf == "HIGH"
    assert corrected_info is not None
    assert any(w in corrected_info.lower() for w in ["disproving", "false", "hoax", "verified", "official", "declaration"])

def test_misleading_claim_with_distorted_context():
    claim = {
        "claim_text": "NASA confirmed a massive solar superstorm will permanently shut down all global internet next week",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "science_tech",
        "entities": ["NASA", "internet"]
    }
    raw_sources = [
        {
            "title": "Fact Check: NASA did not warn of impending internet apocalypse",
            "publisher": "Reuters Fact Check",
            "url": "https://www.reuters.com/fact-check/nasa-internet-apocalypse",
            "excerpt": "While scientists study coronal mass ejections, NASA has issued no warning of an imminent global internet blackout next week.",
            "authority_type": "CERTIFIED_FACT_CHECKER",
            "published_at": "2024-03-10"
        },
        {
            "title": "Understanding Space Weather and Solar Flares",
            "publisher": "NASA Science",
            "url": "https://science.nasa.gov/heliophysics/space-weather",
            "excerpt": "Solar cycles bring regular flare events, but modern infrastructure incorporates space weather mitigation protocols.",
            "authority_type": "GOVERNMENT_PRIMARY",
            "published_at": "2024-01-15"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict in ("FALSE", "MISLEADING")
    assert what_establishes is not None
    assert corrected_info is not None

def test_outdated_claim_recognized():
    claim = {
        "claim_text": "Pluto is the ninth planet in the solar system",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "science_tech",
        "entities": ["Pluto", "solar system"]
    }
    raw_sources = [
        {
            "title": "Why Pluto Is No Longer Considered a Planet",
            "publisher": "NASA Solar System Exploration",
            "url": "https://science.nasa.gov/dwarf-planets/pluto/",
            "excerpt": "In 2006, the International Astronomical Union (IAU) formally reclassified Pluto from the ninth major planet to a dwarf planet.",
            "authority_type": "GOVERNMENT_PRIMARY",
            "published_at": "2023-09-01"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "OUTDATED"
    assert corrected_info is not None
    assert "dwarf planet" in corrected_info.lower() or "updated" in corrected_info.lower()

def test_no_evidence_available_returns_unverified():
    claim = {
        "claim_text": "Xylophonium blorf had 49 green subatomic particles in 1842",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "general_factual",
        "entities": ["Xylophonium blorf"]
    }
    raw_sources = []
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "UNVERIFIED"
    assert conf == "LOW"
    assert "insufficient" in explanation.lower() or "unverified" in explanation.lower()

def test_subjective_opinion_not_forced_true_or_false():
    claim = {
        "claim_text": "In my opinion, Python is the best programming language ever created",
        "verifiability": "SUBJECTIVE_OPINION",
        "category": "ai_computing",
        "entities": ["Python"]
    }
    raw_sources = [
        {
            "title": "Python Developer Survey",
            "publisher": "JetBrains",
            "url": "https://www.jetbrains.com/survey",
            "excerpt": "Python remains one of the most popular programming languages among developers.",
            "authority_type": "SECONDARY_SOURCE",
            "published_at": "2024-01-01"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "OPINION / NOT FACT-CHECKABLE"
    assert "subjective" in explanation.lower() or "opinion" in explanation.lower()

def test_multiple_claims_in_paragraph():
    text = (
        "India gained independence on August 15 1947. "
        "The Reserve Bank of India was established on April 1 1935 under the Reserve Bank of India Act."
    )
    claims = extract_claims_heuristic(text)
    assert len(claims) >= 2
    assert any("independence" in c["claim_text"].lower() for c in claims)
    assert any("reserve bank" in c["claim_text"].lower() for c in claims)

def test_medical_claim_cautionary_handling():
    claim = {
        "claim_text": "Drinking boiled garlic water completely cures acute viral pneumonia in two hours",
        "verifiability": "SPECIFIC_FACTUAL",
        "category": "health_medical",
        "entities": ["garlic water", "viral pneumonia"]
    }
    raw_sources = [
        {
            "title": "Fact Check: Garlic water does not cure viral pneumonia",
            "publisher": "WHO Fact Checks",
            "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
            "excerpt": "There is no scientific evidence that garlic water or herbal teas cure acute pneumonia. False medical claims delay lifesaving treatment.",
            "authority_type": "INTERNATIONAL_HEALTH_AUTHORITY",
            "published_at": "2023-01-01"
        }
    ]
    res = evaluate_evidence_and_verdict(claim, raw_sources)
    verdict, explanation, enriched, limitations, conf, cov, what_establishes, corrected_info, conclusion = res
    
    assert verdict == "FALSE"
    assert conf == "HIGH"
    assert "medical" in explanation.lower() or "cure" in explanation.lower() or "evidence" in explanation.lower()
