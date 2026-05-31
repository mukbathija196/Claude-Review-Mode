import { X } from 'lucide-react';
import type { Message, AssumptionStatus } from '../types';
import ClaimInspector from './ClaimInspector';
import AssumptionMap from './AssumptionMap';
import WhatsMissing from './WhatsMissing';
import HumanJudgmentPrompt from './HumanJudgmentPrompt';

interface ReviewPanelProps {
  message: Message;
  isExtracting: boolean;
  hasExtractionError: boolean;
  onRetryExtraction: () => void;
  onClose: () => void;
  expandedClaimIds: Set<string>;
  onToggleClaim: (id: string) => void;
  collapsedSections: Set<string>;
  onToggleSection: (id: string) => void;
  onUpdateAssumptionStatus: (assumptionId: string, status: AssumptionStatus) => void;
  onFollowUp: (promptTemplate: string) => void;
  onCorrect: (assumptionId: string, correctionText: string) => void;
}

const stakesColors: Record<string, string> = {
  low: 'text-[#555]',
  medium: 'text-[#6b8cba]',
  high: 'text-[#c49b6b]',
  very_high: 'text-[#f87171]',
};

const stakesLabels: Record<string, string> = {
  low: 'Low stakes',
  medium: 'Medium stakes',
  high: 'High stakes',
  very_high: 'Very high stakes',
};

const SKELETON_WIDTHS = [88, 65, 78, 52, 70, 60, 83, 45, 72, 55];

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {[0, 1, 2].map((section) => (
        <div key={section} className="flex flex-col gap-2.5">
          <div className="h-2.5 w-24 rounded bg-[#222] animate-pulse" />
          {SKELETON_WIDTHS.slice(section * 3, section * 3 + 3).map((w, i) => (
            <div
              key={i}
              className="h-2 rounded bg-[#1a1a1a] animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${(section * 3 + i) * 80}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ReviewPanel({
  message,
  isExtracting,
  hasExtractionError,
  onRetryExtraction,
  onClose,
  expandedClaimIds,
  onToggleClaim,
  collapsedSections,
  onToggleSection,
  onUpdateAssumptionStatus,
  onFollowUp,
  onCorrect,
}: ReviewPanelProps) {
  const metadata = message.review_metadata;
  const stakes = metadata?.detected_stakes ?? 'medium';

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#222] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-[#888] truncate">Review</span>
          <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-[#1e1e1e] ${stakesColors[stakes]}`}>
            {stakesLabels[stakes]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#444] hover:text-[#888] hover:bg-[#1e1e1e] transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isExtracting && <PanelSkeleton />}

        {hasExtractionError && !isExtracting && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 px-4">
            <p className="text-sm text-[#666] text-center">Could not extract review data.</p>
            <button
              onClick={onRetryExtraction}
              className="text-xs text-[#c96442] hover:text-[#b5593a] transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {metadata && (
          <>
            <ClaimInspector
              claims={metadata.claims}
              isCollapsed={collapsedSections.has('claims')}
              onToggleCollapse={() => onToggleSection('claims')}
              expandedClaimIds={expandedClaimIds}
              onToggleClaim={onToggleClaim}
            />

            <AssumptionMap
              assumptions={metadata.assumptions}
              isCollapsed={collapsedSections.has('assumptions')}
              onToggleCollapse={() => onToggleSection('assumptions')}
              onUpdateStatus={onUpdateAssumptionStatus}
              onCorrect={onCorrect}
            />

            <WhatsMissing
              items={metadata.missing_items}
              isCollapsed={collapsedSections.has('missing')}
              onToggleCollapse={() => onToggleSection('missing')}
              onFollowUp={onFollowUp}
            />

            <div className="h-4" />
          </>
        )}
      </div>

      {/* Footer — always visible */}
      <div className="shrink-0 border-t border-[#222] pt-3">
        {metadata ? (
          <HumanJudgmentPrompt prompt={metadata.human_judgment_prompt} />
        ) : isExtracting ? (
          <div className="px-4 pb-4">
            <div className="h-2.5 w-3/4 rounded bg-[#1a1a1a] animate-pulse" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
