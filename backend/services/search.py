import re
import urllib.parse
import xml.etree.ElementTree as ET
import concurrent.futures
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx
from ddgs import DDGS
from config import USER_AGENT, REQUEST_TIMEOUT_SECONDS

KNOWN_PRIMARY_DOMAINS = {
    "pib.gov.in": ("Press Information Bureau (Government of India)", "GOVERNMENT_PRIMARY"),
    "eci.gov.in": ("Election Commission of India", "CONSTITUTIONAL_PRIMARY"),
    "sci.gov.in": ("Supreme Court of India", "JUDICIAL_PRIMARY"),
    "who.int": ("World Health Organization", "INTERNATIONAL_HEALTH_AUTHORITY"),
    "reuters.com": ("Reuters International News Agency", "GLOBAL_NEWS_WIRE"),
    "apnews.com": ("Associated Press", "GLOBAL_NEWS_WIRE"),
    "factcheck.afp.com": ("AFP Fact Check (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "boomlive.in": ("BOOM Live (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "altnews.in": ("Alt News (Independent Fact Check)", "CERTIFIED_FACT_CHECKER"),
    "snopes.com": ("Snopes Fact Checking", "CERTIFIED_FACT_CHECKER"),
    "thehindu.com": ("The Hindu", "ESTABLISHED_NEWS_ORGANIZATION"),
    "indianexpress.com": ("The Indian Express", "ESTABLISHED_NEWS_ORGANIZATION"),
    "bbc.com": ("BBC News", "ESTABLISHED_NEWS_ORGANIZATION"),
    "ndtv.com": ("NDTV", "ESTABLISHED_NEWS_ORGANIZATION"),
}

def identify_publisher_and_authority(url: str, title: str) -> tuple[str, str]:
    """Identifies publisher name and authority classification based on domain."""
    try:
        domain = urllib.parse.urlparse(url).netloc.lower()
        domain = domain.replace("www.", "")
        
        for known_domain, (pub_name, auth_type) in KNOWN_PRIMARY_DOMAINS.items():
            if known_domain in domain:
                return pub_name, auth_type

        # Check for government domains
        if domain.endswith(".gov.in") or domain.endswith(".nic.in") or domain.endswith(".gov"):
            return domain.upper(), "GOVERNMENT_PRIMARY"
        
        # Check title endings (e.g. "... - Reuters" or "... | The Hindu")
        for sep in [" - ", " | ", " — "]:
            if sep in title:
                parts = title.split(sep)
                candidate_publisher = parts[-1].strip()
                if 2 < len(candidate_publisher) < 35:
                    return candidate_publisher, "SECONDARY_NEWS_OUTLET"
                    
        return domain, "SECONDARY_SOURCE"
    except Exception:
        return "Web Source", "SECONDARY_SOURCE"

def search_ddgs(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Executes live web search using DDGS with strict timeout."""
    results = []
    try:
        with DDGS(timeout=REQUEST_TIMEOUT_SECONDS) as ddgs:
            raw_results = list(ddgs.text(query, max_results=max_results))
            for item in raw_results:
                url = item.get("href") or item.get("url", "")
                title = item.get("title", "")
                snippet = item.get("body") or item.get("snippet", "")
                if url and title:
                    publisher, auth_type = identify_publisher_and_authority(url, title)
                    results.append({
                        "title": title,
                        "url": url,
                        "publisher": publisher,
                        "authority_type": auth_type,
                        "excerpt": snippet,
                        "published_at": None,
                        "source_provider": "DuckDuckGo Web Search"
                    })
    except Exception as e:
        print(f"[Search-DDGS] Notice for query '{query}': {e}")
    return results

def search_google_news_rss(query: str, language: str = "en", country: str = "IN", max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches real news articles from Google News RSS feed for the query.
    Supports English ('en') and Hindi ('hi').
    """
    results = []
    try:
        encoded_query = urllib.parse.quote(query)
        if language == "hi":
            feed_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=hi&gl=IN&ceid=IN:hi"
        else:
            hl = "en-IN" if country == "IN" else "en-US"
            gl = country if country in ("IN", "US", "GB") else "IN"
            feed_url = f"https://news.google.com/rss/search?q={encoded_query}&hl={hl}&gl={gl}&ceid={gl}:{hl[:2]}"

        headers = {"User-Agent": USER_AGENT}
        with httpx.Client(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            resp = client.get(feed_url, headers=headers)
            if resp.status_code == 200:
                root = ET.fromstring(resp.content)
                for item in root.findall(".//item")[:max_results]:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pub_date_elem = item.find("pubDate")
                    desc_elem = item.find("description")
                    source_elem = item.find("source")

                    title = title_elem.text if title_elem is not None else ""
                    link = link_elem.text if link_elem is not None else ""
                    pub_date = pub_date_elem.text if pub_date_elem is not None else None
                    desc_html = desc_elem.text if desc_elem is not None else ""
                    
                    # Clean html tags from description snippet
                    snippet = re.sub(r"<[^>]+>", " ", desc_html).strip() if desc_html else ""
                    
                    publisher = source_elem.text if source_elem is not None else ""
                    if not publisher:
                        publisher, auth_type = identify_publisher_and_authority(link, title)
                    else:
                        _, auth_type = identify_publisher_and_authority(link, title)

                    if title and link:
                        results.append({
                            "title": title,
                            "url": link,
                            "publisher": publisher,
                            "authority_type": auth_type,
                            "excerpt": snippet or title,
                            "published_at": pub_date,
                            "source_provider": "Google News Live RSS"
                        })
    except Exception as e:
        print(f"[Search-NewsRSS] Notice for query '{query}': {e}")
    return results

def search_wikipedia(query: str, language: str = "en") -> List[Dict[str, Any]]:
    """Queries Wikipedia API for encyclopedic reference checks with full extract summaries."""
    results = []
    try:
        lang_code = "hi" if language == "hi" else "en"
        clean_q = query.strip()
        encoded = urllib.parse.quote(clean_q)
        headers = {"User-Agent": "TruthLensBot/1.0 (https://truthlens.ai; contact@truthlens.ai)"}

        # 1. Opensearch to find top matching Wikipedia article title
        opensearch_url = f"https://{lang_code}.wikipedia.org/w/api.php?action=opensearch&search={encoded}&limit=2&namespace=0&format=json"
        with httpx.Client(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            resp = client.get(opensearch_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if len(data) >= 2 and data[1]:
                    for title_match in data[1][:2]:
                        # 2. Query REST summary API to get full verified lead paragraph
                        summary_url = f"https://{lang_code}.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title_match)}"
                        s_resp = client.get(summary_url, headers=headers)
                        excerpt = ""
                        page_url = f"https://{lang_code}.wikipedia.org/wiki/{urllib.parse.quote(title_match)}"
                        if s_resp.status_code == 200:
                            s_data = s_resp.json()
                            excerpt = s_data.get("extract", "")
                            page_url = s_data.get("content_urls", {}).get("desktop", {}).get("page", page_url)
                        
                        if not excerpt and len(data) >= 3 and data[2]:
                            excerpt = data[2][0]

                        results.append({
                            "title": f"{title_match} - Wikipedia Reference",
                            "url": page_url,
                            "publisher": "Wikipedia Encyclopedic Record",
                            "authority_type": "PRIMARY_REFERENCE",
                            "excerpt": excerpt or f"Encyclopedic factual documentation regarding {title_match}",
                            "published_at": None,
                            "source_provider": f"Wikipedia ({lang_code.upper()})"
                        })
    except Exception as e:
        print(f"[Search-Wiki] Notice for query '{query}': {e}")
    return results

def search_web_multi_angle(
    claim_text: str,
    entities: List[str] = None,
    language: str = "en",
    country: str = "IN"
) -> Dict[str, Any]:
    """
    Executes a comprehensive multi-angle real web search concurrently for a factual claim.
    Formulates queries for:
    1. Exact / direct claim phrasing.
    2. Fact-check specific query ("claim + fact check / debunked / official").
    3. Official agency query (e.g. PIB / WHO / Court / Commission).
    4. Regional / Hindi query when applicable.
    
    Returns:
    {
      "sources": List[Dict],
      "queries_executed": List[str],
      "live_search_available": bool,
      "source_types_found": List[str]
    }
    """
    entities = entities or []
    queries = []
    
    # 1. Direct keywords
    claim_clean = re.sub(r"[^\w\s\u0900-\u097F]", "", claim_text).strip()
    words = claim_clean.split()
    short_claim = " ".join(words[:10])
    
    # Check if the claim contains explicit viral/hoax indicators or question words
    viral_markers = [
        "whatsapp", "forward", "viral", "miracle", "secret", "banned", "50000",
        "free recharge", "gps chip", "nano chip", "apocalypse", "daawa", "दावा", "वायरल", "फर्जी",
        "hoax", "rumor", "rumour", "exposed", "scam alert", "shocking"
    ]
    question_words = {
        "kaun", "kisne", "kya", "kab", "kaha", "kahan", "kyun", "kaise",
        "who", "what", "where", "when", "why", "how", "is", "are", "kon",
        "कौन", "किसने", "क्या", "कब", "कहाँ", "क्यों", "कैसे"
    }
    
    is_viral_claim = any(m in claim_clean.lower() for m in viral_markers)
    has_question_word = any(w.lower() in question_words for w in words)

    # Clean content terms (stripping question stopwords for search accuracy)
    content_words = [w for w in words if w.lower() not in question_words]
    content_query = " ".join(content_words[:8]) if content_words else short_claim

    # Query 1: Direct claim or content keywords
    queries.append(short_claim)
    if content_query and content_query != short_claim:
        queries.append(content_query)
    
    # Query 2: Contextual query (News wire vs Fact-check)
    if is_viral_claim or has_question_word:
        if language == "hi":
            queries.append(f"{content_query} फैक्ट चेक")
        else:
            queries.append(f"{content_query} fact check")
    else:
        # For standard news, search for authoritative reporting rather than skewing toward debunks
        if language == "hi":
            queries.append(f"{content_query} समाचार")
        else:
            queries.append(f"{content_query} news")

    # Query 3: Entity + official verification (targeted)
    lower_claim = claim_clean.lower()
    if any(w in lower_claim for w in ["who", "health organization", "mpox", "covid", "vaccine"]):
        queries.append(f"{content_query} WHO official statement")
    elif any(w in lower_claim for w in ["isro", "chandrayaan", "space", "satellite", "gaganyaan"]):
        queries.append(f"{content_query} ISRO official")
    elif any(w in lower_claim for w in ["nasa", "solar", "eclipse", "space weather"]):
        queries.append(f"{content_query} NASA official")
    elif country == "IN":
        if any(w in lower_claim for w in ["rbi", "repo rate", "currency", "bank", "2000 note", "reserve bank"]):
            queries.append(f"{content_query} RBI official notification")
        elif any(w in lower_claim for w in ["scheme", "yojana", "yojna", "subsidy", "pension"]):
            queries.append(f"{content_query} PIB official")
        elif any(w in lower_claim for w in ["supreme court", "high court", "bail", "verdict", "judge", "cji"]):
            queries.append(f"{content_query} Supreme Court of India verdict")
        elif any(w in lower_claim for w in ["election", "evm", "vote", "voter"]):
            queries.append(f"{content_query} Election Commission of India official")

    # Deduplicate queries
    unique_queries = list(dict.fromkeys(queries))[:3]
    
    # Target entities for encyclopedic Wikipedia reference
    wiki_targets = []
    if entities:
        # Filter out numbers, currency amounts, and generic short words
        for ent in entities:
            if not re.search(r"^(?:₹|\$|\d|in\b|the\b)", ent, re.IGNORECASE) and len(ent) >= 3:
                wiki_targets.append(ent)
    
    # Check for constitutional or government office in claim
    lower_c = claim_clean.lower()
    if "prime minister" in lower_c or "pm of india" in lower_c:
        wiki_targets.append("Prime Minister of India")
    if "chief minister" in lower_c or "cm of uttar pradesh" in lower_c or "cm of up" in lower_c:
        wiki_targets.append("Chief Minister of Uttar Pradesh")
    if "supreme court" in lower_c or "cji" in lower_c or "chief justice" in lower_c:
        wiki_targets.append("Supreme Court of India")
    if "isro" in lower_c or "chandrayaan" in lower_c:
        wiki_targets.append("ISRO")
    if "rbi" in lower_c or "reserve bank" in lower_c or "repo rate" in lower_c:
        wiki_targets.append("Reserve Bank of India")

    deduped_wiki_targets = list(dict.fromkeys(wiki_targets))[:2]

    all_collected_sources = []
    queries_run = []
    search_success = False

    # Execute all searches concurrently using ThreadPoolExecutor for 4x-5x speedup
    total_workers = len(unique_queries) * 2 + len(deduped_wiki_targets) + 1
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(10, max(2, total_workers))) as executor:
        futures = []

        for q in unique_queries:
            queries_run.append(q)
            futures.append(executor.submit(search_google_news_rss, q, language, country, 3))
            futures.append(executor.submit(search_ddgs, q, 3))

        for target in deduped_wiki_targets:
            futures.append(executor.submit(search_wikipedia, target, language))

        for future in concurrent.futures.as_completed(futures):
            try:
                items = future.result()
                if items:
                    search_success = True
                    all_collected_sources.extend(items)
            except Exception as e:
                print(f"[Search-Worker] Handled exception: {e}")

    # Deduplicate sources by URL
    seen_urls = set()
    deduped_sources = []
    for item in all_collected_sources:
        raw_url = item.get("url", "")
        # Normalize URL to prevent minor query param duplicates
        norm_url = raw_url.split("?")[0] if "?" in raw_url and "google.com/rss" not in raw_url else raw_url
        if norm_url and norm_url not in seen_urls:
            seen_urls.add(norm_url)
            deduped_sources.append(item)

    # Identify source types consulted
    source_types = list(set(s.get("authority_type", "SECONDARY_SOURCE") for s in deduped_sources))

    return {
        "sources": deduped_sources[:8],
        "queries_executed": queries_run,
        "live_search_available": search_success,
        "source_types_found": source_types
    }
