from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# 9 Standard Verdicts
VerdictType = Literal[
    "VERIFIED / SUPPORTED",
    "FALSE",
    "MISLEADING",
    "PARTLY TRUE",
    "UNVERIFIED",
    "OUTDATED",
    "SATIRE / NOT INTENDED AS FACT",
    "OPINION / NOT FACT-CHECKABLE",
    "DISPUTED"
]

ConfidenceLevel = Literal["LOW", "MEDIUM", "HIGH"]
CoverageLevel = Literal["LOW", "MEDIUM", "HIGH"]
EvidenceRelation = Literal["SUPPORTS", "CONTRADICTS", "CONTEXT"]
AccessibilityStatus = Literal["ACCESSIBLE", "PARTIAL", "INACCESSIBLE"]

class VerifyRequest(BaseModel):
    text: Optional[str] = Field(default=None, description="User-submitted news or factual claim")
    url: Optional[str] = Field(default=None, description="URL of the news article to verify")
    language: Optional[str] = Field(default="auto", description="Claim language ('en', 'hi', or 'auto')")
    country: Optional[str] = Field(default="IN", description="Country context (e.g. 'IN', 'US', 'GLOBAL')")
    as_of_date: Optional[str] = Field(default=None, description="Historical reference date (YYYY-MM-DD)")
    api_key: Optional[str] = Field(default=None, description="Optional user-provided Gemini/OpenAI API key")

class EvidenceSource(BaseModel):
    title: str = Field(description="Title of the source article or report")
    publisher: str = Field(description="Name of the publisher or organization")
    url: str = Field(description="Direct URL to the original source")
    published_at: Optional[str] = Field(default=None, description="Publication date of the source")
    retrieved_at: str = Field(description="ISO timestamp when source was accessed")
    relevant_excerpt: str = Field(description="Verbatim excerpt or faithful quote from the source")
    evidence_relation: EvidenceRelation = Field(description="How evidence relates to the claim")
    relevance_explanation: str = Field(description="Transparent explanation of why this evidence matters")
    accessibility_status: AccessibilityStatus = Field(default="ACCESSIBLE", description="Source accessibility status")
    domain_authority_notes: Optional[str] = Field(default=None, description="Official/primary/wire/fact-checker status")

class ExtractedClaim(BaseModel):
    claim_id: str = Field(description="Unique identifier for the claim (e.g. claim-1)")
    claim_text: str = Field(description="Exact factual claim being checked")
    entities: List[str] = Field(default_factory=list, description="People, organizations, locations, events")
    time_period: Optional[str] = Field(default=None, description="Relevant dates or time periods")
    category: str = Field(default="general", description="Category: political, scientific, historical, financial, health, legal")
    verifiability: str = Field(default="SPECIFIC_FACTUAL", description="SPECIFIC_FACTUAL, BROAD_FACTUAL, SUBJECTIVE_OPINION, SATIRE")
    verdict: VerdictType = Field(description="Assigned verdict for this specific claim")
    verdict_definition: str = Field(description="Precise formal definition of this verdict")
    explanation: str = Field(description="Evidence-based explanation of the verdict")
    supporting_evidence_indices: List[int] = Field(default_factory=list)
    contradicting_evidence_indices: List[int] = Field(default_factory=list)
    context_evidence_indices: List[int] = Field(default_factory=list)
    remaining_uncertainties: List[str] = Field(default_factory=list, description="What remains unverified or unclear")

class SourceComparison(BaseModel):
    source_a: str = Field(description="Key finding or stance from primary Source A")
    source_b: str = Field(description="Key finding or stance from independent Source B")
    additional_sources: Optional[str] = Field(default=None, description="Corroboration from other sources")
    areas_of_agreement: List[str] = Field(default_factory=list, description="Points where sources align")
    areas_of_disagreement: List[str] = Field(default_factory=list, description="Points of conflict or nuance")
    common_origin_suspected: bool = Field(default=False, description="Whether sources echo a single wire report")
    comparison_summary: str = Field(description="Synthesis of source corroboration")

class VerificationMethod(BaseModel):
    search_queries: List[str] = Field(default_factory=list, description="Exact search queries executed")
    source_types: List[str] = Field(default_factory=list, description="Types of sources consulted (PIB, court, news, etc.)")
    date_ranges: str = Field(description="Time window covered by the research")
    evaluation_criteria: List[str] = Field(default_factory=list, description="Factors used to evaluate evidence")
    important_limitations: List[str] = Field(default_factory=list, description="Methodological limitations of this check")

class VerifyResponse(BaseModel):
    report_id: str
    submitted_content: str
    submitted_url: Optional[str] = None
    headline: Optional[str] = None
    language: str = "en"
    country: str = "IN"
    extracted_claims: List[ExtractedClaim]
    verdict: VerdictType
    verdict_definition: str
    explanation: str
    evidence_sources: List[EvidenceSource]
    source_comparison: Optional[SourceComparison] = None
    verification_method: VerificationMethod
    confidence_level: ConfidenceLevel
    confidence_reason: str
    research_coverage: CoverageLevel
    coverage_reason: str
    checked_at: str
    limitations: List[str]
    live_search_available: bool = True
    warning_notice: Optional[str] = None

class FeedbackRequest(BaseModel):
    report_id: str
    claim_id: Optional[str] = None
    feedback_type: str = Field(description="'incorrect_verdict' | 'broken_link' | 'new_evidence' | 'other'")
    comments: str
    user_email: Optional[str] = None

class FeedbackResponse(BaseModel):
    status: str
    message: str
    feedback_id: str
