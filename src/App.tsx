import { useState } from 'react';
import type { Message, AssumptionStatus, AssumptionCorrection, StakesLevel } from './types';
import { chat } from './lib/groq';
import { SYSTEM_PROMPT } from './lib/prompts';
import { extractReviewMetadata } from './lib/extractor';
import { detectStakesHeuristic } from './lib/stakes';
import { useLocalStorageSet } from './lib/useLocalStorage';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatView from './components/ChatView';
import ReviewPanel from './components/ReviewPanel';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMessageId, setPanelMessageId] = useState<string | null>(null);
  const [expandedClaimIds, setExpandedClaimIds] = useLocalStorageSet('rm.expandedClaims', new Set());
  const [collapsedSections, setCollapsedSections] = useLocalStorageSet('rm.collapsedSections', new Set());
  const [extractingMessageIds, setExtractingMessageIds] = useState<Set<string>>(new Set());
  const [extractionErrorIds, setExtractionErrorIds] = useState<Set<string>>(new Set());
  const [activeCorrections, setActiveCorrections] = useState<AssumptionCorrection[]>([]);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  const [stakesOverride, setStakesOverride] = useState<StakesLevel | null>(null);
  const [correctionRetry, setCorrectionRetry] = useState<{
    messageId: string;
    assumptionId: string;
    correctionText: string;
  } | null>(null);

  const activeMessage = messages.find((m) => m.id === panelMessageId) ?? null;

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value.trim(),
    };

    // Add user message immediately so it appears before the load indicator
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Inject active corrections into system prompt for context continuity
      let systemContent = SYSTEM_PROMPT;
      if (activeCorrections.length > 0) {
        const correctionLines = activeCorrections.map((c) =>
          c.user_correction
            ? `- "${c.original_text}" → user has corrected this to: "${c.user_correction}"`
            : `- "${c.original_text}" has been marked as incorrect by the user`
        );
        systemContent +=
          `\n\n[Corrections established in this session — apply these to all responses:\n${correctionLines.join('\n')}]`;
      }

      // Build conversation history for Groq — only role + content, no internal fields
      const history = [
        { role: 'system' as const, content: systemContent },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: value.trim() },
      ];

      const responseText = await chat(history);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        // Stamp the heuristic stakes at creation time; extraction will override later
        pre_extraction_stakes: stakesOverride ?? detectStakesHeuristic(value.trim()),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${err instanceof Error ? err.message : 'Something went wrong. Check the console for details.'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const runExtraction = async (messageId: string, currentMessages: Message[]) => {
    const msgIndex = currentMessages.findIndex((m) => m.id === messageId);
    const msg = currentMessages[msgIndex];
    if (!msg) return;

    const userMsg = [...currentMessages.slice(0, msgIndex)].reverse().find((m) => m.role === 'user');

    setExtractingMessageIds((prev) => { const s = new Set(prev); s.add(messageId); return s; });
    setExtractionErrorIds((prev) => { const s = new Set(prev); s.delete(messageId); return s; });

    try {
      const metadata = await extractReviewMetadata(userMsg?.content ?? '', msg.content);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, review_metadata: metadata } : m))
      );
    } catch (err) {
      console.error('Extraction failed:', err);
      setExtractionErrorIds((prev) => { const s = new Set(prev); s.add(messageId); return s; });
    } finally {
      setExtractingMessageIds((prev) => { const s = new Set(prev); s.delete(messageId); return s; });
    }
  };

  const openPanel = (messageId: string) => {
    setPanelMessageId(messageId);
    setIsPanelOpen(true);

    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.review_metadata || extractingMessageIds.has(messageId)) return;

    runExtraction(messageId, messages);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setPanelMessageId(null);
  };

  const retryExtraction = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.review_metadata || extractingMessageIds.has(messageId)) return;
    runExtraction(messageId, messages);
  };

  const toggleClaim = (claimId: string) => {
    const next = new Set(expandedClaimIds);
    next.has(claimId) ? next.delete(claimId) : next.add(claimId);
    setExpandedClaimIds(next);
  };

  const toggleSection = (sectionId: string) => {
    const next = new Set(collapsedSections);
    next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
    setCollapsedSections(next);
  };

  const updateAssumptionStatus = (
    messageId: string,
    assumptionId: string,
    status: AssumptionStatus
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.review_metadata) return msg;
        return {
          ...msg,
          review_metadata: {
            ...msg.review_metadata,
            assumptions: msg.review_metadata.assumptions.map((a) =>
              a.id === assumptionId ? { ...a, user_status: status } : a
            ),
          },
        };
      })
    );
  };

  const handleCorrection = async (
    messageId: string,
    assumptionId: string,
    correctionText: string
  ) => {
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    const msg = messages[msgIndex];
    if (!msg) return;

    const assumption = msg.review_metadata?.assumptions.find((a) => a.id === assumptionId);
    if (!assumption) return;

    const newCorrection: AssumptionCorrection = {
      assumption_id: assumptionId,
      message_id: messageId,
      original_text: assumption.text,
      user_correction: correctionText || null,
      applied_at: Date.now(),
    };

    // De-duplicate: if this assumption was already corrected, replace the old entry
    const updatedCorrections = [
      ...activeCorrections.filter((c) => c.assumption_id !== assumptionId),
      newCorrection,
    ];
    setActiveCorrections(updatedCorrections);

    // Preserve original content before overwriting
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, originalContent: m.originalContent ?? m.content } : m
      )
    );

    setRegeneratingMessageId(messageId);
    // Clear any stale extraction state
    setExtractingMessageIds((prev) => { const s = new Set(prev); s.delete(messageId); return s; });
    setExtractionErrorIds((prev) => { const s = new Set(prev); s.delete(messageId); return s; });

    try {
      // Build correction note from ALL active corrections
      const correctionLines = updatedCorrections.map((c) =>
        c.user_correction
          ? `- Assume "${c.user_correction}" instead of "${c.original_text}"`
          : `- The assumption "${c.original_text}" is incorrect`
      );
      const correctionNote =
        `\n\nNote: Please regenerate your response with the following corrections:\n${correctionLines.join('\n')}`;

      // Build history up to (not including) the message being regenerated
      const historyMessages = messages.slice(0, msgIndex);

      // Append correction note to the last user message in history
      const historyWithCorrection = historyMessages.map((m, i) => {
        const isLastUser =
          m.role === 'user' &&
          !historyMessages.slice(i + 1).some((hm) => hm.role === 'user');
        return isLastUser ? { ...m, content: m.content + correctionNote } : m;
      });

      const history = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...historyWithCorrection.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const responseText = await chat(history);

      // Swap in the regenerated content; preserve originalContent from before
      let finalMessages: Message[] = [];
      setMessages((prev) => {
        finalMessages = prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: responseText,
                was_regenerated: true,
                correction_source: assumptionId,
                review_metadata: undefined,
              }
            : m
        );
        return finalMessages;
      });

      // Auto-extract review metadata for the new response
      runExtraction(messageId, finalMessages);
      // Clear any lingering retry banner on success
      setCorrectionRetry(null);
    } catch (err) {
      console.error('Regeneration failed:', err);
      // Preserve params so the user can retry without re-entering the correction
      setCorrectionRetry({ messageId, assumptionId, correctionText });
      // Revert originalContent marker so the message renders normally while retrying
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, originalContent: undefined } : m
        )
      );
    } finally {
      setRegeneratingMessageId(null);
    }
  };

  const removeCorrection = (assumptionId: string) => {
    setActiveCorrections((prev) => prev.filter((c) => c.assumption_id !== assumptionId));
  };

  const retryCorrection = () => {
    if (!correctionRetry) return;
    const { messageId, assumptionId, correctionText } = correctionRetry;
    // Remove the stale correction entry first so handleCorrection can re-add cleanly
    setActiveCorrections((prev) => prev.filter((c) => c.assumption_id !== assumptionId));
    setCorrectionRetry(null);
    handleCorrection(messageId, assumptionId, correctionText);
  };

  const dismissCorrectionRetry = () => setCorrectionRetry(null);

  const toggleStakesOverride = () => {
    setStakesOverride((prev) => (prev === null ? 'high' : null));
  };

  const handleFollowUp = (promptTemplate: string) => {
    setInputValue(promptTemplate);
    closePanel();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d0d] text-[#ececec]">
      <Sidebar />

      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {messages.length === 0 && !isLoading ? (
            <WelcomeScreen
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          ) : (
            <ChatView
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={handleSubmit}
              onOpenPanel={openPanel}
              activePanelMessageId={panelMessageId}
              isLoading={isLoading}
              extractingMessageIds={extractingMessageIds}
              extractionErrorIds={extractionErrorIds}
              activeCorrections={activeCorrections}
              onRemoveCorrection={removeCorrection}
              regeneratingMessageId={regeneratingMessageId}
              stakesOverride={stakesOverride}
              onToggleStakesOverride={toggleStakesOverride}
              correctionRetry={correctionRetry}
              onRetryCorrection={retryCorrection}
              onDismissCorrectionRetry={dismissCorrectionRetry}
            />
          )}
        </div>

        {/* Review Panel — mobile: full-screen slide-up overlay */}
        <div
          className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-out ${
            isPanelOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {activeMessage && (
            <ReviewPanel
              message={activeMessage}
              isExtracting={panelMessageId ? extractingMessageIds.has(panelMessageId) : false}
              hasExtractionError={panelMessageId ? extractionErrorIds.has(panelMessageId) : false}
              onRetryExtraction={() => panelMessageId && retryExtraction(panelMessageId)}
              onClose={closePanel}
              expandedClaimIds={expandedClaimIds}
              onToggleClaim={toggleClaim}
              collapsedSections={collapsedSections}
              onToggleSection={toggleSection}
              onUpdateAssumptionStatus={(assumptionId, status) =>
                updateAssumptionStatus(activeMessage.id, assumptionId, status)
              }
              onFollowUp={handleFollowUp}
              onCorrect={(assumptionId, correctionText) =>
                handleCorrection(activeMessage.id, assumptionId, correctionText)
              }
            />
          )}
        </div>

        {/* Review Panel — desktop: slides in from right */}
        <div
          className="hidden md:block shrink-0 overflow-hidden border-l border-[#2a2a2a] transition-[width] duration-300 ease-out"
          style={{ width: isPanelOpen ? '600px' : '0px' }}
        >
          <div style={{ width: '600px' }} className="h-full">
            {activeMessage && (
              <ReviewPanel
                message={activeMessage}
                isExtracting={panelMessageId ? extractingMessageIds.has(panelMessageId) : false}
                hasExtractionError={panelMessageId ? extractionErrorIds.has(panelMessageId) : false}
                onRetryExtraction={() => panelMessageId && retryExtraction(panelMessageId)}
                onClose={closePanel}
                expandedClaimIds={expandedClaimIds}
                onToggleClaim={toggleClaim}
                collapsedSections={collapsedSections}
                onToggleSection={toggleSection}
                onUpdateAssumptionStatus={(assumptionId, status) =>
                  updateAssumptionStatus(activeMessage.id, assumptionId, status)
                }
                onFollowUp={handleFollowUp}
                onCorrect={(assumptionId, correctionText) =>
                  handleCorrection(activeMessage.id, assumptionId, correctionText)
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
