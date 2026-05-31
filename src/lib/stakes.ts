import type { StakesLevel } from '../types';

// Patterns that indicate high-stakes content. Each pattern match increments
// the score; threshold determines the returned level.
const HIGH_STAKES_PATTERNS = [
  /\b(legal|contract|sign|lawsuit|liability|sue|attorney|court)\b/i,
  /\b(invest|portfolio|savings|retirement|financial|lakh|crore|equity|debt|loan)\b/i,
  /\b(medical|diagnosis|medication|treatment|doctor|surgery|symptom|prescription|dosage)\b/i,
  /\b(should I|help me decide|recommend|choose between|which is better|what should)\b/i,
  /\b(career|job offer|resign|quit|join|accept|salary negotiat)\b/i,
  /\b(visa|immigration|citizenship|permit)\b/i,
  /\b(tax|audit|compliance|regulation)\b/i,
];

/**
 * Runs synchronously on the user's raw prompt text — zero latency.
 * Used to set an initial stakes level before extraction fires.
 * The extraction model's `detected_stakes` will override this once available.
 */
export function detectStakesHeuristic(prompt: string): StakesLevel {
  try {
    const matches = HIGH_STAKES_PATTERNS.filter((p) => p.test(prompt)).length;
    if (matches >= 3) return 'very_high';
    if (matches >= 2) return 'high';
    if (matches >= 1) return 'medium';
    return 'low';
  } catch {
    // Classifier failed (e.g. malformed regex on unusual input) — safe default
    return 'medium';
  }
}

/**
 * Returns true when the review affordance should be suppressed entirely.
 * A non-null stakesOverride always shows the affordance regardless.
 */
export function shouldHideAffordance(
  response: string,
  stakesOverride: StakesLevel | null
): boolean {
  // Session-level override: always show
  if (stakesOverride !== null) return false;

  const trimmed = response.trim();

  // Too short to be substantive
  if (trimmed.length < 50) return true;

  // Single-word or greeting
  if (/^(hi|hello|hey|sure|okay|ok|yes|no|thanks|thank you)[.!?]?\s*$/i.test(trimmed)) {
    return true;
  }

  // Ends with a question and contains no recommendations
  if (
    trimmed.endsWith('?') &&
    !/\b(recommend|suggest|should|advise|consider|prefer|better|worth)\b/i.test(trimmed)
  ) {
    return true;
  }

  return false;
}
