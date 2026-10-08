import React, { useState, useRef, useEffect } from 'react';
import { Brand, Post } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { 
  ChevronDown, 
  Plus, 
  Sparkles, 
  Bot, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface HeaderProps {
  brands: Brand[];
  activeBrand: Brand | null;
  onSelectBrand: (brandId: string) => void;
  onNewBrand: () => void;
  onOpenAssistant: () => void;
  onNavigateTab: (tab: string) => void;
  currentTab: string;
  posts: Post[];
  alertCount?: number;
  replyCount?: number;
  auditCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  brands,
  activeBrand,
  onSelectBrand,
  onNewBrand,
  onOpenAssistant,
  onNavigateTab,
  currentTab,
  posts,
  alertCount = 0,
  replyCount = 0,
  auditCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientPosts = posts.filter((p) => p.brandId === activeBrand?.id);
  const scheduledCount = clientPosts.filter((p) => p.status === 'scheduled').length;
  const draftCount = clientPosts.filter((p) => p.status === 'draft' || p.status === 'idea').length;

  return (
    <header className="sticky top-0 z-30 bg-[#FBFBF8] border-b border-[#CBD4CD] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#14273A] bg-white hover:bg-[#F2F6F2] transition shadow-xs text-left group"
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
            >
              {activeBrand ? (
                <>
                  <FlagBadge flag={activeBrand.flag} size="md" />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-[#5A6B7A] font-semibold flex items-center gap-1.5">
                      Active Brand Voice
                    </span>
                    <span className="font-bold text-sm sm:text-base text-[#14273A] leading-tight flex items-center gap-1">
                      {activeBrand.name}
                      <ChevronDown className="w-3.5 h-3.5 text-[#5A6B7A] transition-transform group-hover:translate-y-0.5" />
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 py-0.5">
                  <Plus className="w-3.5 h-3.5 text-[#D9432B]" />
                  <span className="text-xs sm:text-sm font-bold text-[#14273A]">Add Client Voice</span>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white border-2 border-[#14273A] rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-[#CBD4CD]/60 text-xs font-semibold uppercase tracking-wider text-[#5A6B7A]">
                  Switch Client Workspace
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBrand(b.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#EAEFEA] transition ${
                        b.id === activeBrand?.id ? 'bg-[#EAEFEA]/70 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FlagBadge flag={b.flag} size="sm" />
                        <div className="truncate">
                          <div className="text-sm text-[#14273A] font-medium truncate">{b.name}</div>
                          <div className="text-xs text-[#5A6B7A] truncate">{b.industry || 'No industry set'}</div>
                        </div>
                      </div>
                      {b.id === activeBrand?.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#1E6F78] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#CBD4CD]/60 pt-1 px-2 mt-1">
                  <button
                    onClick={() => {
                      onNewBrand();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1E6F78] hover:bg-[#EAEFEA] rounded transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Client Vault
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('workspace');
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#5A6B7A] hover:bg-[#EAEFEA] rounded transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      View All in Workspace Dashboard
                    </span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Pill showing platform list */}
          {activeBrand && (
            <div className="hidden lg:flex items-center gap-1 text-xs text-[#5A6B7A] bg-[#EAEFEA] px-2.5 py-1 rounded-full border border-[#CBD4CD]">
              <span className="font-semibold text-[#14273A]">{activeBrand.platforms.length}</span>
              <span>platforms active</span>
            </div>
          )}
        </div>

        {/* Right: Actions, Stats & SMM Assistant Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Calendar Summary */}
          {activeBrand && (
            <button
              onClick={() => onNavigateTab('calendar')}
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#CBD4CD] hover:border-[#14273A] bg-white text-xs text-[#14273A] transition"
              title="Open Content Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#1E6F78]" />
              <span>
                <strong>{scheduledCount}</strong> scheduled
              </span>
              <span className="text-[#5A6B7A]">({draftCount} drafts)</span>
            </button>
          )}

          {/* Quick Brand Voices Link */}
          <button
            onClick={() => onNavigateTab('brands')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              currentTab === 'brands'
                ? 'bg-[#14273A] text-white border-[#14273A]'
                : 'bg-white text-[#14273A] border-[#CBD4CD] hover:border-[#14273A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8B422]" />
            <span>Voice Vault</span>
          </button>

          {/* AI Social Media Director Assistant Trigger with Notification Badge */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364E] transition border border-[#14273A] text-xs font-semibold shadow-xs group relative"
            title={
              alertCount > 0
                ? `${alertCount} pending alert${alertCount > 1 ? 's' : ''} (${replyCount} replies, ${auditCount} audit tasks)`
                : 'Consult SMM Director'
            }
          >
            <div className="relative">
              <Bot className="w-4 h-4 text-[#E8B422] transition-transform group-hover:scale-110" />
              {alertCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D9432B] rounded-full animate-ping" />
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#E8B422] rounded-full" />
              )}
            </div>
            <span className="hidden xs:inline">SMM Director</span>
            <span className="xs:hidden">Director</span>
            {alertCount > 0 && (
              <span className="bg-[#D9432B] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse shadow-xs flex items-center gap-0.5">
                <span>{alertCount}</span>
                {replyCount > 0 && auditCount > 0 && (
                  <span className="text-[9px] opacity-80 hidden lg:inline">({replyCount}r·{auditCount}a)</span>
                )}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
