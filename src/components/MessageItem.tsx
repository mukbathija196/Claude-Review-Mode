import { useState } from 'react';
import type { Message, StakesLevel } from '../types';
import { shouldHideAffordance } from '../lib/stakes';
import ReviewAffordance from './ReviewAffordance';

interface MessageItemProps {
  message: Message;
  onOpenPanel: (messageId: string) => void;
  activePanelMessageId: string | null;
  isExtracting: boolean;
  hasExtractionError: boolean;
  isRegenerating: boolean;
  stakesOverride: StakesLevel | null;
}

function renderContent(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    return (
      <p key={i} className={i > 0 ? 'mt-3' : ''}>
        {lines.map((line, j) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <span key={j}>
              {j > 0 && <br />}
              {parts.map((part, k) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={k} className="font-semibold text-[#ececec]">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </span>
          );
        })}
      </p>
    );
  });
}

function OriginalContentToggle({ originalContent }: { originalContent: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-[10px] text-[#3a3a3a] hover:text-[#555] transition-colors"
      >
        {expanded ? '↑ Hide original response' : '↓ See original response'}
      </button>

      <div
        style={{
          maxHeight: expanded ? '600px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease-out',
        }}
      >
        <div className="mt-2 pl-3 border-l border-[#222]">
          <p className="text-[9px] uppercase tracking-widest text-[#3a3a3a] font-semibold mb-2">
            Original response
          </p>
          <div className="text-xs text-[#555] leading-relaxed">
            {renderContent(originalContent)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageItem({
  message,
  onOpenPanel,
  activePanelMessageId,
  isExtracting,
  hasExtractionError,
  isRegenerating,
  stakesOverride,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const isPanelActive = activePanelMessageId === message.id;
  const isErrorMessage = message.content.startsWith('⚠️');

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[75%] bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl px-4 py-3 text-sm text-[#ececec] leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  // Effective stakes: override → extracted → heuristic → default low
  const effectiveStakes: StakesLevel =
    stakesOverride ??
    message.review_metadata?.detected_stakes ??
    message.pre_extraction_stakes ??
    'low';

  // Affordance hiding: suppress trivial/short/greeting responses (override bypasses this)
  const hideAffordance =
    isErrorMessage ||
    isRegenerating ||
    shouldHideAffordance(message.content, stakesOverride);

  return (
    <div className="mb-8">
      {/* Correction badge — shown after regeneration completes */}
      {message.was_regenerated && !isRegenerating && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] uppercase tracking-widest text-[#4a4a4a] font-semibold">
            ↺ Regenerated with your correction
          </span>
        </div>
      )}

      {/* Message content — dimmed while regenerating */}
      <div
        className={`text-sm text-[#d4d4d4] leading-relaxed transition-opacity duration-200 ${
          isRegenerating ? 'opacity-30' : ''
        }`}
      >
        {renderContent(message.content)}
      </div>

      {/* Regenerating indicator */}
      {isRegenerating && (
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-1.5 h-1.5 rounded-full bg-[#c96442] animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <span className="text-xs text-[#666]">Regenerating with your correction…</span>
        </div>
      )}

      {/* See original toggle — only after regeneration, not while loading */}
      {message.was_regenerated && message.originalContent && !isRegenerating && (
        <OriginalContentToggle originalContent={message.originalContent} />
      )}

      {/* Review affordance */}
      {!hideAffordance && (
        <ReviewAffordance
          metadata={message.review_metadata}
          isActive={isPanelActive}
          isExtracting={isExtracting}
          hasExtractionError={hasExtractionError}
          onOpen={() => onOpenPanel(message.id)}
        />
      )}
    </div>
  );
}
