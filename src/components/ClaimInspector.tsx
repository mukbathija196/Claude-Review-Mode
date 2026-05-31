import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Claim, ConfidenceBand } from '../types';

const confidenceConfig: Record<ConfidenceBand, { symbol: string; color: string; label: string }> = {
  high_confidence_well_established: {
    symbol: '○',
    color: 'text-[#4ade80]',
    label: 'Well established',
  },
  confident_with_interpretation: {
    symbol: '◐',
    color: 'text-[#fbbf24]',
    label: 'With interpretation',
  },
  best_guess_alternatives_exist: {
    symbol: '◔',
    color: 'text-[#f87171]',
    label: 'Best guess',
  },
};

interface ClaimRowProps {
  claim: Claim;
  isExpanded: boolean;
  onToggle: () => void;
}

function ClaimRow({ claim, isExpanded, onToggle }: ClaimRowProps) {
  const conf = confidenceConfig[claim.confidence_band];

  return (
    <div className="border-b border-[#222] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#1a1a1a] transition-colors group"
      >
        <span className={`text-base shrink-0 mt-0.5 ${conf.color}`} title={conf.label}>
          {conf.symbol}
        </span>
        <span className="flex-1 text-sm text-[#d4d4d4] leading-snug">{claim.text}</span>
        <span className="text-[#444] group-hover:text-[#666] shrink-0 transition-colors mt-0.5">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {/* Smooth expand via max-height */}
      <div
        style={{
          maxHeight: isExpanded ? '400px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.2s ease-out',
        }}
      >
        <div className="px-4 pb-4 space-y-3 bg-[#0f0f0f]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-semibold mb-1">
              Why I made this claim
            </p>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">{claim.reasoning}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-semibold mb-1">
              What would change my view
            </p>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">{claim.what_would_change_my_view}</p>
          </div>

        </div>
      </div>
    </div>
  );
}

const MAX_VISIBLE = 7;

interface ClaimInspectorProps {
  claims: Claim[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  expandedClaimIds: Set<string>;
  onToggleClaim: (id: string) => void;
}

export default function ClaimInspector({
  claims,
  isCollapsed,
  onToggleCollapse,
  expandedClaimIds,
  onToggleClaim,
}: ClaimInspectorProps) {
  const [showAll, setShowAll] = useState(false);
  const loadBearing = claims.filter((c) => c.is_load_bearing);
  const hasMore = loadBearing.length > MAX_VISIBLE;
  const visible = showAll ? loadBearing : loadBearing.slice(0, MAX_VISIBLE);

  return (
    <div className="border-b border-[#222]">
      {/* Section header */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#555] font-semibold">
            Claim Inspector
          </span>
          <span className="text-[10px] text-[#3a3a3a] bg-[#1e1e1e] px-1.5 py-0.5 rounded-full">
            {loadBearing.length}
          </span>
        </div>
        <span className="text-[#3a3a3a] group-hover:text-[#555] transition-colors">
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {!isCollapsed && (
        <div>
          {/* Legend */}
          <div className="flex items-center gap-4 px-4 pb-3 pt-0.5">
            {Object.values(confidenceConfig).map(({ symbol, color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`text-sm leading-none ${color}`}>{symbol}</span>
                <span className="text-[10px] text-[#555]">{label}</span>
              </span>
            ))}
          </div>

          {loadBearing.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-[#555] italic">
              This response is mostly contextual — no specific claims to interrogate.
            </p>
          ) : (
            <>
              {visible.map((claim) => (
                <ClaimRow
                  key={claim.id}
                  claim={claim}
                  isExpanded={expandedClaimIds.has(claim.id)}
                  onToggle={() => onToggleClaim(claim.id)}
                />
              ))}

              {hasMore && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full px-4 py-2 text-[10px] text-[#555] hover:text-[#888] transition-colors text-left"
                >
                  {showAll
                    ? '↑ Show fewer claims'
                    : `↓ Show all ${loadBearing.length} claims`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
