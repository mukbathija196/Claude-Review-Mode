import InputBox from './InputBox';

const quickActions = [
  { label: 'Learn', icon: '📖' },
  { label: 'Strategize', icon: '♟' },
  { label: 'Create', icon: '✦' },
  { label: 'Write', icon: '✍' },
  { label: 'Code', icon: '</>' },
];

const ClaudeLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" fill="currentColor">
    <rect x="45" y="8" width="10" height="84" rx="5" />
    <rect x="45" y="8" width="10" height="84" rx="5" transform="rotate(60 50 50)" />
    <rect x="45" y="8" width="10" height="84" rx="5" transform="rotate(120 50 50)" />
  </svg>
);

interface WelcomeScreenProps {
  inputValue: string;
  onInputChange: (v: string) => void;
  onSubmit: (v: string) => void;
  isLoading?: boolean;
}

export default function WelcomeScreen({ inputValue, onInputChange, onSubmit, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 pb-6 md:pb-8 min-h-0">
      {/* Logo + heading */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[#c96442]">
          <ClaudeLogo />
        </span>
        <h1 className="text-[1.6rem] md:text-[2.2rem] font-light text-[#c4a882] tracking-tight">
          Hello There!
        </h1>
      </div>

      {/* Input */}
      <InputBox
        value={inputValue}
        onChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        className="w-full max-w-[680px]"
      />

      {/* Quick action pills */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-sm text-[#888] hover:text-[#ccc] hover:border-[#404040] transition-colors"
          >
            <span className="text-xs">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
