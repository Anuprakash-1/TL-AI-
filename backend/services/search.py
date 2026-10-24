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
    # Official Government & Constitutional
    "pib.gov.in": ("Press Information Bureau (Government of India)", "GOVERNMENT_PRIMARY"),
    "eci.gov.in": ("Election Commission of India", "CONSTITUTIONAL_PRIMARY"),
    "sci.gov.in": ("Supreme Court of India", "JUDICIAL_PRIMARY"),
    "who.int": ("World Health Organization", "INTERNATIONAL_HEALTH_AUTHORITY"),
    "un.org": ("United Nations", "INTERNATIONAL_HEALTH_AUTHORITY"),
    "unesco.org": ("UNESCO Official", "GOVERNMENT_PRIMARY"),
    "worldbank.org": ("World Bank Official", "GOVERNMENT_PRIMARY"),
    "isro.gov.in": ("ISRO Official", "GOVERNMENT_PRIMARY"),
    "nasa.gov": ("NASA Official", "GOVERNMENT_PRIMARY"),
    "rbi.org.in": ("Reserve Bank of India", "GOVERNMENT_PRIMARY"),
    "newsonair.gov.in": ("Prasar Bharati / All India Radio", "GOVERNMENT_PRIMARY"),

    # Global News Wires
    "reuters.com": ("Reuters International News Agency", "GLOBAL_NEWS_WIRE"),
    "apnews.com": ("Associated Press", "GLOBAL_NEWS_WIRE"),
    "afp.com": ("AFP News Agency", "GLOBAL_NEWS_WIRE"),
    "aninews.in": ("Asian News International (ANI)", "GLOBAL_NEWS_WIRE"),
    "ptinews.com": ("Press Trust of India (PTI)", "GLOBAL_NEWS_WIRE"),

    # Certified & Independent Fact Checkers (IFCN signatories & recognized)
    "factcheck.afp.com": ("AFP Fact Check (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "boomlive.in": ("BOOM Live (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "altnews.in": ("Alt News (Independent Fact Check)", "CERTIFIED_FACT_CHECKER"),
    "snopes.com": ("Snopes Fact Checking", "CERTIFIED_FACT_CHECKER"),
    "factly.in": ("FACTLY (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "vishvasnews.com": ("Vishvas News (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "newsmeter.in": ("NewsMeter Fact Check (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "thequint.com": ("The Quint Fact Check", "CERTIFIED_FACT_CHECKER"),
    "newschecker.in": ("Newschecker (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "thip.media": ("The Healthy Indian Project (IFCN)", "CERTIFIED_FACT_CHECKER"),
    "factcrescendo.com": ("Fact Crescendo (IFCN Signatory)", "CERTIFIED_FACT_CHECKER"),
    "thelogicalindian.com": ("The Logical Indian Fact Check", "CERTIFIED_FACT_CHECKER"),

    # Established News Organizations
    "thehindu.com": ("The Hindu", "ESTABLISHED_NEWS_ORGANIZATION"),
    "indianexpress.com": ("The Indian Express", "ESTABLISHED_NEWS_ORGANIZATION"),
    "timesofindia.indiatimes.com": ("The Times of India", "ESTABLISHED_NEWS_ORGANIZATION"),
    "indiatimes.com": ("The Times of India", "ESTABLISHED_NEWS_ORGANIZATION"),
    "indiatoday.in": ("India Today", "ESTABLISHED_NEWS_ORGANIZATION"),
    "hindustantimes.com": ("Hindustan Times", "ESTABLISHED_NEWS_ORGANIZATION"),
    "ndtv.com": ("NDTV", "ESTABLISHED_NEWS_ORGANIZATION"),
    "bbc.com": ("BBC News", "ESTABLISHED_NEWS_ORGANIZATION"),
    "bbc.co.uk": ("BBC News", "ESTABLISHED_NEWS_ORGANIZATION"),
    "amarujala.com": ("Amar Ujala", "ESTABLISHED_NEWS_ORGANIZATION"),
    "dainikbhaskar.com": ("Dainik Bhaskar", "ESTABLISHED_NEWS_ORGANIZATION"),
    "jagran.com": ("Dainik Jagran", "ESTABLISHED_NEWS_ORGANIZATION"),
    "livemint.com": ("Mint", "ESTABLISHED_NEWS_ORGANIZATION"),
    "economictimes.indiatimes.com": ("The Economic Times", "ESTABLISHED_NEWS_ORGANIZATION"),
    "deccanherald.com": ("Deccan Herald", "ESTABLISHED_NEWS_ORGANIZATION"),
    "theprint.in": ("ThePrint", "ESTABLISHED_NEWS_ORGANIZATION"),
    "thewire.in": ("The Wire", "ESTABLISHED_NEWS_ORGANIZATION"),
    "scroll.in": ("Scroll.in", "ESTABLISHED_NEWS_ORGANIZATION"),
}

STOP_WORDS = {
    'has', 'have', 'had', 'is', 'was', 'are', 'were', 'been', 'being',
    'the', 'a', 'an', 'in', 'on', 'at', 'by', 'for', 'with', 'about',
    'against', 'between', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'of', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
    'officially', 'recently', 'this', 'that', 'these', 'those', 'as',
    'their', 'its', 'our', 'my', 'your', 'his', 'her'
}

def identify_publisher_and_authority(url: str, title: str, source_name: str = "") -> tuple[str, str]:
    """Identifies publisher name and authority classification based on domain, source name, and title."""
    try:
        domain = urllib.parse.urlparse(url).netloc.lower()
        domain = domain.replace("www.", "")

        pub_lower = (source_name or "").lower()
        title_lower = (title or "").lower()

        # 1. Fact-checking signals in publisher name or title
        fact_check_keywords = [
            "fact check", "fact-check", "factcheck", "fake alert", "boom live", "boom",
            "alt news", "snopes", "factly", "vishvas news", "newsmeter", "newschecker",
            "fact crescendo", "पड़ताल", "तथ्य जांच", "सच क्या है", "fake check"
        ]
        if any(fc in pub_lower or fc in title_lower for fc in fact_check_keywords):
            pub_title = source_name or "Fact-Checking Organization"
            return pub_title, "CERTIFIED_FACT_CHECKER"

        # 2. Known domains lookup
        for known_domain, (pub_name, auth_type) in KNOWN_PRIMARY_DOMAINS.items():
            if known_domain in domain:
                return source_name or pub_name, auth_type

        # 3. Check for government domains
        if domain.endswith(".gov.in") or domain.endswith(".nic.in") or domain.endswith(".gov") or domain.endswith(".mil"):
            return source_name or domain.upper(), "GOVERNMENT_PRIMARY"

        # 4. Institutional & official agencies
        gov_inst_keywords = [
            "pib", "press information bureau", "news on air", "prasar bharati",
            "who", "isro", "nasa", "rbi", "supreme court", "election commission",
            "unesco", "world bank"
        ]
        if any(g in pub_lower for g in gov_inst_keywords):
            return source_name or "Official Institutional Body", "GOVERNMENT_PRIMARY"

        # 5. Major established news organizations
        established_news_keywords = [
            "times of india", "india today", "hindu", "indian express", "hindustan times",
            "bbc", "ndtv", "reuters", "associated press", "ani", "pti", "jagran",
            "bhaskar", "amar ujala", "mint", "economic times", "deccan herald"
        ]
        if any(nw in pub_lower for nw in established_news_keywords):
            return source_name, "ESTABLISHED_NEWS_ORGANIZATION"

        # 6. Check title endings (e.g. "... - Reuters" or "... | The Hindu")
        for sep in [" - ", " | ", " — "]:
            if sep in title:
                parts = title.split(sep)
                candidate_publisher = parts[-1].strip()
                if 2 < len(candidate_publisher) < 35:
                    cand_lower = candidate_publisher.lower()
                    if any(fc in cand_lower for fc in fact_check_keywords):
                        return candidate_publisher, "CERTIFIED_FACT_CHECKER"
                    if any(nw in cand_lower for nw in established_news_keywords):
                        return candidate_publisher, "ESTABLISHED_NEWS_ORGANIZATION"
                    return candidate_publisher, "SECONDARY_NEWS_OUTLET"

        return source_name or domain or "Web Source", "SECONDARY_SOURCE"
    except Exception:
        return source_name or "Web Source", "SECONDARY_SOURCE"

def search_ddgs(query: str, max_results: int = 4) -> List[Dict[str, Any]]:
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

                    snippet = re.sub(r"<[^>]+>", " ", desc_html).strip() if desc_html else ""
                    raw_source = source_elem.text if source_elem is not None else ""
                    publisher, auth_type = identify_publisher_and_authority(link, title, raw_source)

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
    1. Fact-check specific query ("claim keywords + fact check / फैक्ट चेक") to detect debunks.
    2. Direct core keywords query to gather affirmative reporting.
    3. Official authority / entity query.
    """
    entities = entities or []
    queries = []

    # Clean words and extract meaningful terms
    claim_clean = re.sub(r"[^\w\s\u0900-\u097F]", " ", claim_text).strip()
    words = claim_clean.split()

    # Question stopwords to exclude
    question_words = {
        "kaun", "kisne", "kya", "kab", "kaha", "kahan", "kyun", "kaise",
        "who", "what", "where", "when", "why", "how", "is", "are", "kon",
        "कौन", "किसने", "क्या", "कब", "कहाँ", "क्यों", "कैसे"
    }

    meaningful_words = [w for w in words if w.lower() not in STOP_WORDS and w.lower() not in question_words]
    key_phrase = " ".join(meaningful_words[:5]) if meaningful_words else " ".join(words[:5])

    # Angle 1: Always include Fact-Check query to detect hoaxes, scams, and debunks
    if language == "hi":
        queries.append(f"{key_phrase} फैक्ट चेक")
    else:
        queries.append(f"{key_phrase} fact check")

    # Angle 2: Direct core keywords query
    queries.append(key_phrase)

    # Angle 3: Entity or institutional verification query
    lower_claim = claim_clean.lower()
    if any(w in lower_claim for w in ["who", "health organization", "mpox", "covid", "vaccine"]):
        queries.append(f"{key_phrase} WHO official")
    elif any(w in lower_claim for w in ["isro", "chandrayaan", "space", "satellite", "gaganyaan"]):
        queries.append(f"{key_phrase} ISRO official")
    elif any(w in lower_claim for w in ["unesco"]):
        queries.append(f"{key_phrase} UNESCO official")
    elif any(w in lower_claim for w in ["world bank", "gdp"]):
        queries.append(f"{key_phrase} World Bank report")
    elif any(w in lower_claim for w in ["rbi", "repo rate", "currency", "bank", "2000 note", "reserve bank"]):
        queries.append(f"{key_phrase} RBI official notification")
    elif any(w in lower_claim for w in ["scheme", "yojana", "yojna", "subsidy", "pension", "recharge", "free"]):
        queries.append(f"{key_phrase} PIB official")
    elif any(w in lower_claim for w in ["supreme court", "high court", "bail", "verdict", "judge", "cji"]):
        queries.append(f"{key_phrase} Supreme Court of India verdict")
    elif any(w in lower_claim for w in ["election", "evm", "vote", "voter"]):
        queries.append(f"{key_phrase} Election Commission of India official")
    elif len(meaningful_words) > 2:
        queries.append(" ".join(meaningful_words[:3]))

    # Deduplicate queries (max 3)
    unique_queries = list(dict.fromkeys(queries))[:3]

    # Target entities for encyclopedic Wikipedia reference
    wiki_targets = []
    if entities:
        for ent in entities:
            if not re.search(r"^(?:₹|\$|\d|in\b|the\b)", ent, re.IGNORECASE) and len(ent) >= 3:
                wiki_targets.append(ent)

    lower_c = claim_clean.lower()
    if "prime minister" in lower_c or "pm of india" in lower_c:
        wiki_targets.append("Prime Minister of India")
    if "chief minister" in lower_c or "cm of uttar pradesh" in lower_c or "cm of up" in lower_c:
        wiki_targets.append("Chief Minister of Uttar Pradesh")
    if "supreme court" in lower_c or "cji" in lower_c or "chief justice" in lower_c:
        wiki_targets.append("Supreme Court of India")
    if "isro" in lower_c or "chandrayaan" in lower_c:
        wiki_targets.append("ISRO")
    if "rbi" in lower_c or "reserve bank" in lower_c:
        wiki_targets.append("Reserve Bank of India")

    deduped_wiki_targets = list(dict.fromkeys(wiki_targets))[:2]

    all_collected_sources = []
    queries_run = []
    search_success = False

    total_workers = len(unique_queries) * 2 + len(deduped_wiki_targets) + 1
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(10, max(2, total_workers))) as executor:
        futures = []

        for q in unique_queries:
            queries_run.append(q)
            futures.append(executor.submit(search_google_news_rss, q, language, country, 4))
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

    # Prioritize CERTIFIED_FACT_CHECKER and GOVERNMENT_PRIMARY sources first
    priority_order = {
        "CERTIFIED_FACT_CHECKER": 0,
        "GOVERNMENT_PRIMARY": 1,
        "CONSTITUTIONAL_PRIMARY": 2,
        "INTERNATIONAL_HEALTH_AUTHORITY": 3,
        "GLOBAL_NEWS_WIRE": 4,
        "ESTABLISHED_NEWS_ORGANIZATION": 5,
        "PRIMARY_REFERENCE": 6,
        "SECONDARY_NEWS_OUTLET": 7,
        "SECONDARY_SOURCE": 8
    }

    # Deduplicate sources by URL
    seen_urls = set()
    deduped_sources = []
    for item in sorted(all_collected_sources, key=lambda s: priority_order.get(s.get("authority_type"), 9)):
        raw_url = item.get("url", "")
        norm_url = raw_url.split("?")[0] if "?" in raw_url and "google.com/rss" not in raw_url else raw_url
        if norm_url and norm_url not in seen_urls:
            seen_urls.add(norm_url)
            deduped_sources.append(item)

    source_types = list(set(s.get("authority_type", "SECONDARY_SOURCE") for s in deduped_sources))

    return {
        "sources": deduped_sources[:8],
        "queries_executed": queries_run,
        "live_search_available": search_success,
        "source_types_found": source_types
    }
