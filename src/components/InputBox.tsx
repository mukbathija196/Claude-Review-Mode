import { useRef } from 'react';
import { Plus, Mic, ArrowUp, ChevronDown } from 'lucide-react';

interface InputBoxProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export default function InputBox({
  value,
  onChange,
  onSubmit,
  placeholder = 'How can I help you today?',
  className = '',
  isLoading = false,
}: InputBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit(value.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSubmitClick = () => {
    if (value.trim() && !isLoading) onSubmit(value.trim());
  };

  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <div
      className={`bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl px-4 pt-3.5 pb-3 flex flex-col gap-2.5 focus-within:border-[#404040] transition-colors ${className}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent text-[#ececec] placeholder-[#555] text-sm leading-relaxed outline-none resize-none min-h-[22px] max-h-[200px] overflow-y-auto"
        style={{ fieldSizing: 'content' } as React.CSSProperties}
      />

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between">
        <button className="p-1 rounded-lg text-[#555] hover:text-[#888] hover:bg-[#2a2a2a] transition-colors">
          <Plus size={16} />
        </button>

        <div className="flex items-center gap-2">
          {/* Model badge */}
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-[#666] hover:text-[#999] hover:bg-[#2a2a2a] transition-colors border border-[#2e2e2e]">
            llama-3.3-70b
            <ChevronDown size={11} />
          </button>

          {/* Mic */}
          <button className="p-1.5 rounded-lg text-[#555] hover:text-[#888] hover:bg-[#2a2a2a] transition-colors">
            <Mic size={15} />
          </button>

          {/* Send */}
          <button
            onClick={handleSubmitClick}
            disabled={!canSubmit}
            className={`p-1.5 rounded-lg transition-colors ${
              canSubmit
                ? 'bg-[#c96442] hover:bg-[#b5593a] text-white'
                : 'bg-[#2a2a2a] text-[#555] cursor-not-allowed'
            }`}
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
