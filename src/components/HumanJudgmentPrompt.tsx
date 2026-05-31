interface HumanJudgmentPromptProps {
  prompt: string;
}

export default function HumanJudgmentPrompt({ prompt }: HumanJudgmentPromptProps) {
  return (
    <div className="mx-4 mb-4 rounded-xl bg-[#1a1510] border border-[#3d2e1a] p-4">
      <p className="text-[10px] uppercase tracking-widest text-[#7a6030] font-semibold mb-2">
        Before you decide
      </p>
      <p className="text-sm text-[#c4a882] leading-relaxed">{prompt}</p>
    </div>
  );
}
