import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Dict, Any, Optional
from config import USER_AGENT, REQUEST_TIMEOUT_SECONDS
from services.security import validate_safe_url, sanitize_untrusted_text

class ScraperException(Exception):
    pass

def extract_article_from_url(url: str) -> Dict[str, Any]:
    """
    Safely retrieves and parses an article from a user-provided URL.
    Enforces SSRF prevention, response size caps, and polite headers.
    """
    is_safe, error_msg = validate_safe_url(url)
    if not is_safe:
        raise ScraperException(f"URL Security Block: {error_msg}")

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    }

    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT_SECONDS, follow_redirects=True, max_redirects=3) as client:
            # Stream response to avoid unbounded memory usage
            with client.stream("GET", url, headers=headers) as response:
                if response.status_code in (401, 403):
                    raise ScraperException(
                        f"Access restricted by publisher (HTTP {response.status_code}). "
                        "The website requires authentication or blocks automated requests. "
                        "Please copy and paste the article text directly into TruthLens."
                    )
                if response.status_code == 429:
                    raise ScraperException(
                        "Rate limit reached on publisher website. Please paste the article text directly."
                    )
                if response.status_code != 200:
                    raise ScraperException(
                        f"Unable to retrieve article (HTTP {response.status_code}). "
                        "Please check the URL or paste the article text directly."
                    )

                # Cap read at 2 MB
                content_bytes = bytearray()
                for chunk in response.iter_bytes(chunk_size=8192):
                    content_bytes.extend(chunk)
                    if len(content_bytes) > 2 * 1024 * 1024:
                        break

        html_text = content_bytes.decode("utf-8", errors="replace")
    except httpx.TimeoutException:
        raise ScraperException(
            "Connection timed out while retrieving the URL. The remote server is responding too slowly. "
            "Please paste the article text directly."
        )
    except httpx.RequestError as e:
        raise ScraperException(f"Network error while fetching URL: {str(e)}. Please paste the article text directly.")

    # Parse with BeautifulSoup
    soup = BeautifulSoup(html_text, "html.parser")

    # Remove non-content tags
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "iframe"]):
        tag.decompose()

    # 1. Headline
    headline = ""
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        headline = og_title["content"].strip()
    elif soup.find("h1"):
        headline = soup.find("h1").get_text().strip()
    elif soup.title and soup.title.string:
        headline = soup.title.string.strip()

    # 2. Publisher
    publisher = ""
    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        publisher = og_site["content"].strip()
    else:
        domain = urlparse(url).netloc
        publisher = domain.replace("www.", "")

    # 3. Publication Date
    published_at = None
    pub_meta = (
        soup.find("meta", property="article:published_time")
        or soup.find("meta", attrs={"name": "publication_date"})
        or soup.find("meta", attrs={"name": "pubdate"})
        or soup.find("meta", property="og:article:published_time")
    )
    if pub_meta and pub_meta.get("content"):
        published_at = pub_meta["content"].strip()
    else:
        time_tag = soup.find("time")
        if time_tag:
            published_at = time_tag.get("datetime") or time_tag.get_text().strip()

    # 4. Body Content
    paragraphs = []
    # Try finding main article container
    article_tag = soup.find("article") or soup.find("main") or soup.find("div", class_=lambda c: c and "article" in c.lower())
    target_container = article_tag if article_tag else soup.body or soup

    for p in target_container.find_all("p"):
        p_text = p.get_text().strip()
        # Filter out short boilerplates
        if len(p_text) > 40:
            paragraphs.append(p_text)

    full_text = "\n\n".join(paragraphs)
    if not full_text:
        # Fallback to general text
        full_text = target_container.get_text(separator="\n", strip=True)

    sanitized_text = sanitize_untrusted_text(full_text, max_chars=12000)

    if len(sanitized_text) < 60:
        raise ScraperException(
            "Could not extract meaningful article text from this page. "
            "It may be behind a dynamic JavaScript wall or paywall. "
            "Please copy and paste the article text directly."
        )

    return {
        "headline": headline,
        "publisher": publisher,
        "published_at": published_at,
        "text": sanitized_text,
        "url": url,
    }
