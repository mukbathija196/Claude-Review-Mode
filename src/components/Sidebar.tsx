import {
  MessageSquare,
  Users,
  Code2,
  Plus,
  FolderOpen,
  Layers,
  Settings,
  ChevronDown,
  Download,
} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="hidden md:flex w-64 shrink-0 flex-col bg-[#171717] border-r border-[#2a2a2a] h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-2 pt-3 pb-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-[#ececec] text-sm font-medium">
          <MessageSquare size={14} />
          Chat
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#666] hover:text-[#a3a3a3] hover:bg-[#242424] text-sm transition-colors">
          <Users size={14} />
          Cowork
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#666] hover:text-[#a3a3a3] hover:bg-[#242424] text-sm transition-colors">
          <Code2 size={14} />
          Code
        </button>
      </div>

      {/* New chat */}
      <div className="px-2 py-1">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#a3a3a3] hover:bg-[#242424] hover:text-[#ececec] text-sm transition-colors">
          <Plus size={15} />
          New chat
        </button>
      </div>

      {/* Nav items */}
      <div className="px-2 pb-1 flex flex-col gap-0.5">
        <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#a3a3a3] hover:bg-[#242424] hover:text-[#ececec] text-sm transition-colors">
          <FolderOpen size={15} />
          Projects
        </button>
        <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#a3a3a3] hover:bg-[#242424] hover:text-[#ececec] text-sm transition-colors">
          <Layers size={15} />
          Artifacts
        </button>
        <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#a3a3a3] hover:bg-[#242424] hover:text-[#ececec] text-sm transition-colors">
          <Settings size={15} />
          Customize
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info */}
      <div className="px-2 py-3 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#242424] transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#3a3a3a] flex items-center justify-center text-xs font-semibold text-[#ccc] shrink-0">
            M
          </div>
          <span className="flex-1 text-sm text-[#a3a3a3] truncate">Mukul · Pro</span>
          <ChevronDown size={14} className="text-[#555] shrink-0" />
          <Download size={14} className="text-[#555] shrink-0" />
        </div>
      </div>
    </div>
  );
}
