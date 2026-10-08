import React from 'react';
import { Brand } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import {
  LayoutDashboard,
  Sparkles,
  PenTool,
  CalendarDays,
  SearchCheck,
  TrendingUp,
  Repeat,
  MessageSquareText,
  BarChart3,
  Plus,
  Compass,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  brands: Brand[];
  activeBrand: Brand | null;
  onSelectBrand: (brandId: string) => void;
  onNewBrand: () => void;
  onOpenAssistant: () => void;
  alertCount?: number;
  replyCount?: number;
  auditCount?: number;
}

export const NAV_ITEMS = [
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard, badge: null, desc: 'Clients & project overview' },
  { id: 'brands', label: 'Brand Voices', icon: Sparkles, badge: 'Vault', desc: 'Core voice & rules center' },
  { id: 'studio', label: 'Studio', icon: PenTool, badge: null, desc: 'Multi-platform post creation' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, badge: null, desc: 'Visual schedule & AI drafter' },
  { id: 'audits', label: 'Audits', icon: SearchCheck, badge: 'New', desc: 'Account link audit & roadmap' },
  { id: 'trends', label: 'Trends', icon: TrendingUp, badge: 'Live', desc: 'Viral formats & algorithms' },
  { id: 'repurpose', label: 'Repurposer', icon: Repeat, badge: null, desc: '1 piece into 4 formats' },
  { id: 'replies', label: 'Replies', icon: MessageSquareText, badge: null, desc: 'Smart reply & risk filter' },
  { id: 'insights', label: 'Insights', icon: BarChart3, badge: null, desc: 'Data in, next moves out' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  brands,
  activeBrand,
  onSelectBrand,
  onNewBrand,
  onOpenAssistant,
  alertCount = 0,
  replyCount = 0,
  auditCount = 0,
}) => {
  return (
    <aside className="w-64 bg-[#14273A] text-[#FBFBF8] flex flex-col shrink-0 h-screen sticky top-0 z-40 select-none border-r border-black/30">
      {/* Top Branding */}
      <div className="p-5 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#E8B422] flex items-center justify-center text-[#14273A] font-extrabold text-lg shadow-sm font-heading">
              H
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight leading-none block font-heading">
                Halyard
              </span>
              <span className="text-[11px] text-[#A6B8A9] font-medium tracking-wide block">
                Brand Voice Social Suite
              </span>
            </div>
          </div>
        </div>

        {/* Nautical signal pennant string */}
        <div className="flex gap-1 mt-3.5 pt-2 border-t border-white/15">
          {['#D9432B', '#E8B422', '#1E6F78', '#FBFBF8', '#7A3E8E', '#D9432B', '#E8B422', '#1E6F78'].map((c, i) => (
            <span
              key={i}
              className="flex-1 h-2"
              style={{
                backgroundColor: c,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Client Quick Switcher List in Sidebar */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Clients ({brands.length})
          </span>
          <button
            onClick={onNewBrand}
            className="text-[11px] text-[#E8B422] hover:text-white transition flex items-center gap-1 font-semibold"
            title="Add New Client"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
          {brands.length === 0 && (
            <button
              onClick={onNewBrand}
              className="w-full py-2 px-2 text-center text-xs text-[#E8B422] hover:text-white border border-dashed border-white/20 rounded-md transition"
            >
              + Add First Client
            </button>
          )}
          {brands.map((b) => {
            const isActive = b.id === activeBrand?.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBrand(b.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition text-left ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold ring-1 ring-[#E8B422]/50'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FlagBadge flag={b.flag} size="sm" />
                <span className="truncate flex-1">{b.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B422] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Tools & Workspaces
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          // Check for live alert badges on specific tools
          const isRepliesTabWithAlerts = item.id === 'replies' && replyCount > 0;
          const isAuditsTabWithAlerts = item.id === 'audits' && auditCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition text-left group ${
                isActive
                  ? 'bg-white/15 text-white font-semibold border-l-3 border-[#E8B422]'
                  : 'text-white/75 hover:bg-white/10 hover:text-white border-l-3 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#E8B422]' : 'text-white/60 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              
              {/* Dynamic notification alert badge or static tag */}
              {isRepliesTabWithAlerts ? (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#1E6F78] text-white animate-pulse flex items-center gap-1 shadow-xs">
                  <span>{replyCount}</span>
                  <span className="text-[9px] uppercase">reply</span>
                </span>
              ) : isAuditsTabWithAlerts ? (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#D9432B] text-white animate-pulse flex items-center gap-1 shadow-xs">
                  <span>{auditCount}</span>
                  <span className="text-[9px] uppercase">task</span>
                </span>
              ) : item.badge ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.badge === 'Live'
                      ? 'bg-[#D9432B] text-white animate-pulse'
                      : item.badge === 'Vault'
                      ? 'bg-[#E8B422] text-[#14273A]'
                      : 'bg-[#1E6F78] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom AI Assistant Card with Notification Alert Badge */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <button
          onClick={onOpenAssistant}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition text-left border border-white/10 group relative"
        >
          <div className="w-8 h-8 rounded-md bg-[#E8B422]/20 flex items-center justify-center text-[#E8B422] shrink-0 border border-[#E8B422]/30 relative">
            <Bot className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D9432B] rounded-full animate-ping" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white flex items-center justify-between gap-1">
              <span className="truncate">SMM Director</span>
              {alertCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-[#D9432B] text-white font-extrabold text-[10px] animate-pulse">
                  {alertCount} alert{alertCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-[#A6B8A9] truncate">
              {alertCount > 0
                ? replyCount > 0 && auditCount > 0
                  ? `${replyCount} replies · ${auditCount} audit tasks`
                  : replyCount > 0
                  ? `${replyCount} suggested reply item${replyCount > 1 ? 's' : ''}`
                  : `${auditCount} pending audit task${auditCount > 1 ? 's' : ''}`
                : '15+ yr veteran co-pilot'}
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
