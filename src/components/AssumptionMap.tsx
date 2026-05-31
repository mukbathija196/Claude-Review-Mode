import { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import type { Assumption, AssumptionStatus } from '../types';

const statusStyles: Record<AssumptionStatus, string> = {
  unverified: '',
  verified_true: 'bg-[#0d1f14] border-l-2 border-l-[#4ade80]',
  marked_wrong: 'bg-[#1f0d0d] border-l-2 border-l-[#f87171]',
  flagged_uncertain: 'bg-[#1a1508] border-l-2 border-l-[#fbbf24]',
};

interface AssumptionRowProps {
  assumption: Assumption;
  onUpdateStatus: (status: AssumptionStatus) => void;
  onCorrect: (correctionText: string) => void;
}

function AssumptionRow({ assumption, onUpdateStatus, onCorrect }: AssumptionRowProps) {
  const rowClass = statusStyles[assumption.user_status];
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [correctionText, setCorrectionText] = useState('');

  const handleWrongClick = () => {
    if (assumption.user_status === 'marked_wrong') {
      // Toggle back to unverified
      onUpdateStatus('unverified');
      setShowCorrectionInput(false);
      setCorrectionText('');
    } else {
      setShowCorrectionInput((v) => !v);
    }
  };

  const handleConfirm = () => {
    onUpdateStatus('marked_wrong');
    onCorrect(correctionText.trim());
    setShowCorrectionInput(false);
    setCorrectionText('');
  };

  const handleCancel = () => {
    setShowCorrectionInput(false);
    setCorrectionText('');
  };

  return (
    <>
      <tr className={`align-top ${rowClass} ${showCorrectionInput ? '' : 'border-b border-[#1e1e1e]'}`}>
        <td className="px-3 py-3 text-xs text-[#ccc] leading-relaxed w-[160px]">
          {assumption.text}
        </td>
        <td className="px-3 py-3 text-xs text-[#999] leading-relaxed w-[160px]">
          {assumption.why_made}
        </td>
        <td className="px-3 py-3 text-xs text-[#999] leading-relaxed w-[160px]">
          {assumption.what_changes_if_wrong}
        </td>
        <td className="px-3 py-3 text-xs text-[#999] leading-relaxed w-[140px]">
          {assumption.how_to_verify}
        </td>
        <td className="px-3 py-3 w-[56px]">
          <div className="flex gap-2 items-center">
            <button
              title="Confirm — this assumption is correct"
              onClick={() =>
                onUpdateStatus(assumption.user_status === 'verified_true' ? 'unverified' : 'verified_true')
              }
              className={`p-1 rounded transition-colors ${
                assumption.user_status === 'verified_true'
                  ? 'text-[#4ade80] bg-[#0d1f14]'
                  : 'text-[#888] hover:text-[#4ade80] hover:bg-[#0d1f14]'
              }`}
            >
              <Check size={13} />
            </button>
            <button
              title={
                assumption.user_status === 'marked_wrong'
                  ? 'Undo — mark as unverified'
                  : 'Flag as wrong — regenerate with a correction'
              }
              onClick={handleWrongClick}
              className={`p-1 rounded transition-colors ${
                assumption.user_status === 'marked_wrong' || showCorrectionInput
                  ? 'text-[#f87171] bg-[#1f0d0d]'
                  : 'text-[#888] hover:text-[#f87171] hover:bg-[#1f0d0d]'
              }`}
            >
              <X size={13} />
            </button>
          </div>
        </td>
      </tr>

      {/* Inline correction input — always rendered, animated via max-height */}
      <tr className={showCorrectionInput ? 'border-b border-[#1e1e1e]' : ''}>
        <td colSpan={5} style={{ padding: 0 }}>
          <div
            style={{
              maxHeight: showCorrectionInput ? '200px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.2s ease-out',
            }}
          >
            <div className="px-3 pb-3 pt-2 bg-[#180d0d] space-y-2">
              <p className="text-[10px] text-[#888]">
                What's true instead?{' '}
                <span className="text-[#555]">(optional — leave blank to just flag it as wrong)</span>
              </p>
              <textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleConfirm();
                  if (e.key === 'Escape') handleCancel();
                }}
                placeholder="Describe the correct assumption…"
                rows={2}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-2 text-xs text-[#ccc] placeholder-[#3a3a3a] outline-none resize-none leading-relaxed focus:border-[#3a3a3a]"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-[#c96442] hover:bg-[#b5593a] text-white transition-colors"
                >
                  <RefreshCw size={9} />
                  Regenerate with correction
                </button>
                <button
                  onClick={handleCancel}
                  className="text-[10px] text-[#444] hover:text-[#666] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

interface AssumptionMapProps {
  assumptions: Assumption[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateStatus: (assumptionId: string, status: AssumptionStatus) => void;
  onCorrect: (assumptionId: string, correctionText: string) => void;
}

export default function AssumptionMap({
  assumptions,
  isCollapsed,
  onToggleCollapse,
  onUpdateStatus,
  onCorrect,
}: AssumptionMapProps) {
  return (
    <div className="border-b border-[#222]">
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#555] font-semibold">
            Assumption Map
          </span>
          <span className="text-[10px] text-[#3a3a3a] bg-[#1e1e1e] px-1.5 py-0.5 rounded-full">
            {assumptions.length}
          </span>
        </div>
        <span className="text-[#3a3a3a] group-hover:text-[#555] transition-colors">
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {!isCollapsed && (
        <div>
          {assumptions.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-[#555] italic">
              This response didn't require strong assumptions about your situation.
            </p>
          ) : (
            <>
              {/* Explanatory hint */}
              <p className="px-4 pb-2 text-[11px] text-[#666] leading-relaxed">
                These are what the response assumed about your situation. Confirm each one ✓ or flag it as wrong ✗ — flagging lets you correct it and regenerate a better answer.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#222]">
                      {['Assumption', 'Why I made it', 'What changes if wrong', "How you'd know", ''].map(
                        (h, i) => (
                          <th
                            key={i}
                            className="px-3 py-2 text-[9px] uppercase tracking-widest text-[#444] font-semibold"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {assumptions.map((a) => (
                      <AssumptionRow
                        key={a.id}
                        assumption={a}
                        onUpdateStatus={(status) => onUpdateStatus(a.id, status)}
                        onCorrect={(correctionText) => onCorrect(a.id, correctionText)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
