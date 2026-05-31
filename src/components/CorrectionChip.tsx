import { X } from 'lucide-react';
import type { AssumptionCorrection } from '../types';

interface CorrectionChipProps {
  correction: AssumptionCorrection;
  onRemove: () => void;
}

export default function CorrectionChip({ correction, onRemove }: CorrectionChipProps) {
  return (
    <span className="chip-in inline-flex items-center gap-1.5 bg-[#1f0d0d] border border-[#3d1515] rounded-full px-2.5 py-1 text-[10px] text-[#f87171] max-w-[260px]">
      <span className="shrink-0">✗</span>
      <span className="truncate">{correction.original_text}</span>
      {correction.user_correction && (
        <>
          <span className="text-[#3a3a3a] shrink-0">→</span>
          <span className="truncate text-[#a3a3a3]">{correction.user_correction}</span>
        </>
      )}
      <button
        onClick={onRemove}
        title="Remove this correction"
        className="shrink-0 ml-0.5 text-[#555] hover:text-[#888] transition-colors"
      >
        <X size={9} />
      </button>
    </span>
  );
}
