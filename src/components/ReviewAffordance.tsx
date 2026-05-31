import type { ReviewMetadata } from '../types';

interface ReviewAffordanceProps {
  metadata?: ReviewMetadata;
  isActive: boolean;
  isExtracting: boolean;
  hasExtractionError: boolean;
  onOpen: () => void;
}

export default function ReviewAffordance({
  metadata,
  isActive,
  isExtracting,
  hasExtractionError,
  onOpen,
}: ReviewAffordanceProps) {
  let countsBadge: React.ReactNode = null;
  if (metadata) {
    const claimCount = metadata.claims.filter((c) => c.is_load_bearing).length;
    const assumptionCount = metadata.assumptions.length;
    const missingCount = metadata.missing_items.length;
    countsBadge = (
      <span className="text-[#444] group-hover:text-[#555]">
        · {claimCount} claim{claimCount !== 1 ? 's' : ''}
        · {assumptionCount} assumption{assumptionCount !== 1 ? 's' : ''}
        · {missingCount} thing{missingCount !== 1 ? 's' : ''} missing
      </span>
    );
  } else if (isExtracting) {
    countsBadge = (
      <span className="flex items-center gap-1 text-[#444]">
        ·
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1 h-1 rounded-full bg-[#444] animate-bounce"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </span>
      </span>
    );
  } else if (hasExtractionError) {
    countsBadge = (
      <span className="text-[#7a3a2a]">· extraction failed — click to retry</span>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={onOpen}
        className={`inline-flex items-center gap-2 text-xs transition-colors group w-fit ${
          isActive ? 'text-[#c96442]' : 'text-[#555] hover:text-[#999]'
        }`}
      >
        <span className="text-sm leading-none">⤴</span>
        <span className={isActive ? 'text-[#c96442]' : 'text-[#666] group-hover:text-[#999]'}>
          Review this response
        </span>
        {countsBadge}
      </button>
    </div>
  );
}
