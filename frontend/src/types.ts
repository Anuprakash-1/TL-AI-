export type VerdictType =
  | 'TRUE'
  | 'MOSTLY TRUE'
  | 'MISLEADING'
  | 'MOSTLY FALSE'
  | 'FALSE'
  | 'UNVERIFIED'
  | 'OUTDATED'
  | 'OPINION / NOT FACT-CHECKABLE'
  | 'SATIRE / NOT INTENDED AS FACT'
  | 'VERIFIED / SUPPORTED'
  | 'PARTLY TRUE'
  | 'DISPUTED';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type CoverageLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EvidenceRelation = 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXT';
export type AccessibilityStatus = 'ACCESSIBLE' | 'PARTIAL' | 'INACCESSIBLE';

export interface EvidenceSource {
  title: string;
  publisher: string;
  url: string;
  published_at?: string | null;
  retrieved_at: string;
  relevant_excerpt: string;
  evidence_relation: EvidenceRelation;
  relevance_explanation: string;
  accessibility_status: AccessibilityStatus;
  domain_authority_notes?: string | null;
}

export interface ExtractedClaim {
  claim_id: string;
  claim_text: string;
  entities: string[];
  time_period?: string | null;
  category: string;
  verifiability: string;
  verdict: VerdictType;
  verdict_definition: string;
  explanation: string;
  what_evidence_establishes?: string | null;
  corrected_information?: string | null;
  supporting_evidence_indices: number[];
  contradicting_evidence_indices: number[];
  context_evidence_indices: number[];
  remaining_uncertainties: string[];
}

export interface SourceComparison {
  source_a: string;
  source_b: string;
  additional_sources?: string | null;
  areas_of_agreement: string[];
  areas_of_disagreement: string[];
  common_origin_suspected: boolean;
  comparison_summary: string;
}

export interface VerificationMethod {
  search_queries: string[];
  source_types: string[];
  date_ranges: string;
  evaluation_criteria: string[];
  important_limitations: string[];
}

export interface VerifyResponse {
  report_id: string;
  is_demo?: boolean;
  demo_label?: string;
  submitted_content: string;
  submitted_url?: string | null;
  headline?: string | null;
  language: string;
  country: string;
  extracted_claims: ExtractedClaim[];
  verdict: VerdictType;
  verdict_definition: string;
  explanation: string;
  what_evidence_establishes?: string | null;
  corrected_information?: string | null;
  final_conclusion?: string | null;
  evidence_sources: EvidenceSource[];
  source_comparison?: SourceComparison | null;
  verification_method: VerificationMethod;
  confidence_level: ConfidenceLevel;
  confidence_reason: string;
  research_coverage: CoverageLevel;
  coverage_reason: string;
  checked_at: string;
  limitations: string[];
  live_search_available: boolean;
  warning_notice?: string | null;
}

export interface HistoryItem {
  report_id: string;
  submitted_content: string;
  submitted_url?: string | null;
  headline?: string | null;
  verdict: VerdictType;
  confidence_level: ConfidenceLevel;
  research_coverage: CoverageLevel;
  created_at: string;
}

export interface FeedbackPayload {
  report_id: string;
  claim_id?: string | null;
  feedback_type: string;
  comments: string;
  user_email?: string | null;
}

export type FeedbackData = FeedbackPayload;
