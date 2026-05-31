export type ConfidenceBand =
  | 'high_confidence_well_established'
  | 'confident_with_interpretation'
  | 'best_guess_alternatives_exist';

export type EvidenceType =
  | 'user_provided_context'
  | 'general_knowledge'
  | 'recent_information'
  | 'inference_from_pattern'
  | 'cited_source';

export type AssumptionStatus =
  | 'unverified'
  | 'verified_true'
  | 'marked_wrong'
  | 'flagged_uncertain';

export type MissingCategory =
  | 'deferred'
  | 'not_considered'
  | 'reasonable_disagreement';

export type StakesLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface FollowUpAction {
  type: 'invoke_followup' | 'provide_context' | 'explore_disagreement';
  prompt_template: string;
}

export interface Claim {
  id: string;
  text: string;
  is_load_bearing: boolean;
  confidence_band: ConfidenceBand;
  reasoning: string;
  evidence_type: EvidenceType[];
  what_would_change_my_view: string;
  response_span?: { start: number; end: number };
}

export interface Assumption {
  id: string;
  text: string;
  why_made: string;
  what_changes_if_wrong: string;
  how_to_verify: string;
  user_status: AssumptionStatus;
}

export interface AssumptionCorrection {
  assumption_id: string;
  message_id: string;
  original_text: string;
  user_correction: string | null;
  applied_at: number;
}

export interface MissingItem {
  id: string;
  category: MissingCategory;
  text: string;
  follow_up_action: FollowUpAction;
}

export interface ReviewMetadata {
  response_id: string;
  detected_stakes: StakesLevel;
  claims: Claim[];
  assumptions: Assumption[];
  missing_items: MissingItem[];
  human_judgment_prompt: string;
  extraction_timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  review_metadata?: ReviewMetadata;
  was_regenerated?: boolean;
  correction_source?: string;
  originalContent?: string;
  /** Stakes level detected from the user prompt before extraction fires */
  pre_extraction_stakes?: StakesLevel;
}

export interface ConversationContext {
  thread_id: string;
  messages: Message[];
  active_corrections: AssumptionCorrection[];
  stakes_override: StakesLevel | null;
}
