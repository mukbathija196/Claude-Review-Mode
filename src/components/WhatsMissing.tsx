import { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, X } from 'lucide-react';
import type { MissingItem, MissingCategory } from '../types';

const categoryConfig: Record<MissingCategory, { label: string; color: string; actionLabel: string }> = {
  deferred: {
    label: 'Deferred',
    color: 'text-[#6b8cba]',
    actionLabel: 'Tell me more',
  },
  not_considered: {
    label: 'Not Considered',
    color: 'text-[#a37fc4]',
    actionLabel: 'Add context',
  },
  reasonable_disagreement: {
    label: 'Where People Disagree',
    color: 'text-[#c49b6b]',
    actionLabel: 'Show both sides',
  },
};

interface MissingItemRowProps {
  item: MissingItem;
  onAction: (promptTemplate: string) => void;
}

function MissingItemRow({ item, onAction }: MissingItemRowProps) {
  const config = categoryConfig[item.category];
  const [showContextInput, setShowContextInput] = useState(false);
  const [contextText, setContextText] = useState('');

  const handleActionClick = () => {
    if (item.category === 'not_considered') {
      setShowContextInput((v) => !v);
    } else {
      onAction(item.follow_up_action.prompt_template);
    }
  };

  const handleContextSubmit = () => {
    const combined = contextText.trim()
      ? `${item.follow_up_action.prompt_template}${contextText.trim()}`
      : item.follow_up_action.prompt_template;
    onAction(combined);
    setShowContextInput(false);
    setContextText('');
  };

  return (
    <div className="px-4 py-3 border-b border-[#1e1e1e] last:border-0">
      <p className={`text-[9px] uppercase tracking-widest font-semibold mb-1 ${config.color}`}>
        {config.label}
      </p>
      <p className="text-xs text-[#888] leading-relaxed mb-2">→ {item.text}</p>

      <button
        onClick={handleActionClick}
        className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#888] transition-colors"
      >
        <ArrowRight size={10} />
        {config.actionLabel}
      </button>

      {/* Inline context input — only for not_considered */}
      {item.category === 'not_considered' && (
        <div
          style={{
            maxHeight: showContextInput ? '160px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.2s ease-out',
          }}
        >
          <div className="mt-2 bg-[#161616] rounded-lg border border-[#2a2a2a] p-3 space-y-2">
            <p className="text-[10px] text-[#555]">
              {item.follow_up_action.prompt_template}
            </p>
            <textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Describe your situation…"
              rows={2}
              className="w-full bg-transparent text-xs text-[#ccc] placeholder-[#444] outline-none resize-none leading-relaxed"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleContextSubmit}
                className="text-[10px] px-2.5 py-1 rounded-full bg-[#c96442] hover:bg-[#b5593a] text-white transition-colors"
              >
                Add to my question
              </button>
              <button
                onClick={() => { setShowContextInput(false); setContextText(''); }}
                className="text-[#444] hover:text-[#666] transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface WhatsMissingProps {
  items: MissingItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFollowUp: (promptTemplate: string) => void;
}

export default function WhatsMissing({
  items,
  isCollapsed,
  onToggleCollapse,
  onFollowUp,
}: WhatsMissingProps) {
  return (
    <div className="border-b border-[#222]">
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#555] font-semibold">
            What's Missing
          </span>
          <span className="text-[10px] text-[#3a3a3a] bg-[#1e1e1e] px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <span className="text-[#3a3a3a] group-hover:text-[#555] transition-colors">
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {!isCollapsed && (
        <div>
          {items.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-[#555] italic">
              Nothing significant deferred or unaddressed.
            </p>
          ) : (
            items.map((item) => (
              <MissingItemRow key={item.id} item={item} onAction={onFollowUp} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
