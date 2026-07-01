import { useEffect, useRef } from 'react';
import type { Message, AssumptionCorrection, StakesLevel } from '../types';
import MessageItem from './MessageItem';
import CorrectionChip from './CorrectionChip';
import InputBox from './InputBox';

interface ChatViewProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onSubmit: (v: string) => void;
  onOpenPanel: (messageId: string) => void;
  activePanelMessageId: string | null;
  isLoading: boolean;
  extractingMessageIds: Set<string>;
  extractionErrorIds: Set<string>;
  activeCorrections: AssumptionCorrection[];
  onRemoveCorrection: (assumptionId: string) => void;
  regeneratingMessageId: string | null;
  stakesOverride: StakesLevel | null;
  onToggleStakesOverride: () => void;
  correctionRetry: { messageId: string; assumptionId: string; correctionText: string } | null;
  onRetryCorrection: () => void;
  onDismissCorrectionRetry: () => void;
}

export default function ChatView({
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  onOpenPanel,
  activePanelMessageId,
  isLoading,
  extractingMessageIds,
  extractionErrorIds,
  activeCorrections,
  onRemoveCorrection,
  regeneratingMessageId,
  stakesOverride,
  onToggleStakesOverride,
  correctionRetry,
  onRetryCorrection,
  onDismissCorrectionRetry,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isOverrideOn = stakesOverride !== null;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Active corrections banner */}
      {activeCorrections.length > 0 && (
        <div className="shrink-0 border-b border-[#1a1a1a] bg-[#0d0d0d] px-6 py-2">
          <div className="max-w-[700px] mx-auto flex items-start gap-2 flex-wrap px-1 md:px-0">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-semibold shrink-0 pt-[3px]">
              Active corrections:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeCorrections.map((c) => (
                <CorrectionChip
                  key={c.assumption_id}
                  correction={c}
                  onRemove={() => onRemoveCorrection(c.assumption_id)}
                />
              ))}
            </div>
            {activeCorrections.length > 3 && (
              <span className="text-[10px] text-[#f87171] shrink-0 pt-[3px]">
                ⚠ These corrections may conflict
              </span>
            )}
          </div>
        </div>
      )}

      {/* Correction retry banner — shown when a regeneration fails */}
      {correctionRetry && (
        <div className="shrink-0 border-b border-[#3d1515] bg-[#180d0d] px-6 py-2">
          <div className="max-w-[700px] mx-auto flex items-center justify-between gap-4">
            <span className="text-[11px] text-[#f87171]">
              ⚠ Regeneration failed — connection lost or request timed out.
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onRetryCorrection}
                className="text-[11px] text-[#f87171] hover:text-[#ff9999] underline transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onDismissCorrectionRetry}
                className="text-[11px] text-[#555] hover:text-[#888] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-[700px] mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onOpenPanel={onOpenPanel}
              activePanelMessageId={activePanelMessageId}
              isExtracting={extractingMessageIds.has(msg.id)}
              hasExtractionError={extractionErrorIds.has(msg.id)}
              isRegenerating={regeneratingMessageId === msg.id}
              stakesOverride={stakesOverride}
            />
          ))}

          {/* Loading indicator while Groq is generating a new message */}
          {isLoading && (
            <div className="mb-8">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#555]">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-3 md:px-6 pb-4 md:pb-5 pt-2 md:pt-3">
        <div className="max-w-[700px] mx-auto">
          <InputBox
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
          <p className="text-center text-[10px] text-[#404040] mt-2">
            Review Mode · Chat: gpt-oss-120b · Review: gpt-oss-120b
          </p>
        </div>
      </div>
    </div>
  );
}
