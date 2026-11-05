import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileSearch,
  FlaskConical,
  Layers,
  TrendingUp,
  ClipboardCheck,
  Sparkles,
  BookOpen,
  BotMessageSquare,
  FileDown,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export type NavTab =
  | "dashboard"
  | "projects"
  | "tor"
  | "mixdesign"
  | "laboratory"
  | "predictor"
  | "testing"
  | "innovation"
  | "research"
  | "assistant"
  | "reports";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { activeProject } = useProjects();

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navGroups = [
    {
      group: "WORKSPACE",
      items: [
        { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard },
        { id: "projects" as NavTab, label: "My Projects", icon: FolderKanban },
        { id: "tor" as NavTab, label: "TOR Competition Advisor", icon: FileSearch, badge: "AI" },
      ],
    },
    {
      group: "ENGINEERING TOOLS",
      items: [
        { id: "mixdesign" as NavTab, label: "Concrete Mix Design", icon: Layers },
        { id: "laboratory" as NavTab, label: "Material Laboratory", icon: FlaskConical },
        { id: "predictor" as NavTab, label: "Strength Predictor", icon: TrendingUp, badge: "ML" },
        { id: "testing" as NavTab, label: "Testing & Evaluation", icon: ClipboardCheck },
        { id: "innovation" as NavTab, label: "Innovation Lab", icon: Sparkles },
      ],
    },
    {
      group: "KNOWLEDGE & OUTPUT",
      items: [
        { id: "research" as NavTab, label: "Research & Standards", icon: BookOpen },
        { id: "assistant" as NavTab, label: "MIXLAB AI Assistant", icon: BotMessageSquare, badge: "AI" },
        { id: "reports" as NavTab, label: "Reports & Export", icon: FileDown },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#142D45] text-slate-100 flex flex-col transition-transform duration-200 border-r border-[#1D3E5E] ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1D3E5E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#286B9B] flex items-center justify-center text-white shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">MIXLAB</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">Concrete Engineering Suite</p>
            </div>
          </div>
        </div>

        {/* Active Project Callout */}
        <div className="px-4 py-3 mx-3 my-3 bg-[#102437] rounded-lg border border-[#1D3E5E]/80">
          <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
            Proyek Aktif
          </div>
          <div className="text-xs font-medium text-white truncate" title={activeProject.name}>
            {activeProject.name}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>f'c {activeProject.parameters.targetStrengthFc} MPa</span>
            <span className="text-[#64B5F6] font-mono">{activeProject.parameters.method.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-sm">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs transition-colors ${
                        isActive
                          ? "bg-[#286B9B] text-white shadow-xs"
                          : "text-slate-300 hover:text-white hover:bg-[#1C3B5A]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[#286B9B]/40 text-blue-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-[#1D3E5E] text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>Smart Concrete Workspace</span>
            <span className="font-mono text-[10px]">SNI Certified</span>
          </div>
        </div>
      </aside>
    </>
  );
};
