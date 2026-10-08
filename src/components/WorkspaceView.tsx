import React from 'react';
import { Brand, Post } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import {
  Layers,
  Sparkles,
  PenTool,
  CalendarDays,
  SearchCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  BookOpen
} from 'lucide-react';

interface WorkspaceViewProps {
  brands: Brand[];
  posts: Post[];
  activeBrand: Brand | null;
  onSelectBrand: (brandId: string) => void;
  onNavigateTab: (tab: string) => void;
  onNewBrand: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  brands,
  posts,
  activeBrand,
  onSelectBrand,
  onNavigateTab,
  onNewBrand,
}) => {
  const totalPosts = posts.length;
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length;
  const postedPosts = posts.filter((p) => p.status === 'posted').length;
  const auditedCount = brands.filter((b) => b.auditScore !== undefined).length;
  const avgAuditScore = auditedCount > 0 
    ? Math.round(brands.reduce((acc, b) => acc + (b.auditScore || 0), 0) / auditedCount)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEFEA] text-[#1E6F78] border border-[#CBD4CD] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Agency Command Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
              Client Workspaces
            </h1>
            <p className="text-[#5A6B7A] max-w-2xl text-sm sm:text-base leading-relaxed">
              Every tool in Halyard orbits your client's Brand Voice Vault. Switch workspaces below to automatically align the Content Studio, Calendar, Repurposer, and Reply Assistant to their voice.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNewBrand}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Client Workspace
            </button>
          </div>
        </div>

        {/* Agency Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#CBD4CD]">
          <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD]">
            <div className="text-xs text-[#5A6B7A] font-semibold uppercase tracking-wider">
              Active Clients
            </div>
            <div className="text-2xl font-extrabold text-[#14273A] font-heading mt-1">
              {brands.length}
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD]">
            <div className="text-xs text-[#5A6B7A] font-semibold uppercase tracking-wider">
              Scheduled Posts
            </div>
            <div className="text-2xl font-extrabold text-[#1E6F78] font-heading mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {scheduledPosts}
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD]">
            <div className="text-xs text-[#5A6B7A] font-semibold uppercase tracking-wider">
              Published Queue
            </div>
            <div className="text-2xl font-extrabold text-[#14273A] font-heading mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {postedPosts}
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD]">
            <div className="text-xs text-[#5A6B7A] font-semibold uppercase tracking-wider">
              Avg Audit Health
            </div>
            <div className="text-2xl font-extrabold text-[#E8B422] font-heading mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E8B422]" />
              {avgAuditScore ? `${avgAuditScore}/100` : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Client Workspaces Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
            <span>Client Workspaces</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#14273A] text-white">
              {brands.length}
            </span>
          </h2>
          <span className="text-xs text-[#5A6B7A]">Click any client to switch workspace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.length === 0 && (
            <div className="col-span-full bg-white border-2 border-dashed border-[#14273A] rounded-xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EAEFEA] border-2 border-[#14273A] flex items-center justify-center text-[#14273A] mx-auto shadow-xs">
                <Sparkles className="w-8 h-8 text-[#E8B422]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-xl font-extrabold text-[#14273A] font-heading">
                  No Client Brands Yet
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6B7A] leading-relaxed">
                  Start fresh by adding your first brand client. Once their Brand Voice Vault is set up, every other tool (Content Studio, Calendar, Repurposer, Replies, and Audits) will write in their exact tone.
                </p>
              </div>
              <button
                onClick={onNewBrand}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Create Your First Client Vault
              </button>
            </div>
          )}

          {brands.map((b) => {
            const isSelected = b.id === activeBrand?.id;
            const bPosts = posts.filter((p) => p.brandId === b.id);
            const bScheduled = bPosts.filter((p) => p.status === 'scheduled').length;
            const bDrafts = bPosts.filter((p) => p.status === 'draft' || p.status === 'idea').length;

            return (
              <div
                key={b.id}
                className={`bg-[#FBFBF8] border-2 rounded-xl p-5 transition flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'border-[#14273A] ring-2 ring-[#E8B422]'
                    : 'border-[#CBD4CD] hover:border-[#14273A]'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <FlagBadge flag={b.flag} size="lg" />
                      <div>
                        <h3 className="font-extrabold text-lg text-[#14273A] leading-tight font-heading">
                          {b.name}
                        </h3>
                        <p className="text-xs text-[#5A6B7A] line-clamp-1 mt-0.5">
                          {b.industry || 'No industry defined'}
                        </p>
                        {b.location && (
                          <div className="flex items-center gap-1 text-[11px] text-[#1E6F78] font-semibold mt-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{b.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-[#14273A] text-[#E8B422] text-[10px] font-bold uppercase tracking-wider shrink-0">
                          Active
                        </span>
                      )}
                      {b.assets && b.assets.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#1E6F78] bg-[#EAEFEA] px-1.5 py-0.5 rounded border border-[#CBD4CD]">
                          <BookOpen className="w-2.5 h-2.5" />
                          {b.assets.length} {b.assets.length === 1 ? 'asset' : 'assets'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Voice Snippet */}
                  <div className="bg-white p-3 rounded-lg border border-[#CBD4CD] text-xs text-[#14273A] mb-3.5 space-y-1">
                    <div className="font-semibold text-[#5A6B7A] uppercase tracking-wider text-[10px]">
                      Voice Persona:
                    </div>
                    <p className="line-clamp-2 italic text-[#14273A]/90">
                      "{b.voice || 'Conversational and engaging'}"
                    </p>
                  </div>

                  {/* Platforms & Health */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <div className="flex flex-wrap gap-1">
                      {b.platforms.slice(0, 3).map((plat) => (
                        <span
                          key={plat}
                          className="px-2 py-0.5 rounded-full bg-[#EAEFEA] text-[#1E6F78] font-medium text-[10px] border border-[#CBD4CD]"
                        >
                          {plat}
                        </span>
                      ))}
                      {b.platforms.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white text-[#5A6B7A] text-[10px] border border-[#CBD4CD]">
                          +{b.platforms.length - 3}
                        </span>
                      )}
                    </div>
                    {b.auditScore && (
                      <span className="flex items-center gap-1 font-bold text-xs text-[#1E6F78] bg-[#EAEFEA] px-2 py-0.5 rounded border border-[#CBD4CD]">
                        <ShieldCheck className="w-3 h-3 text-[#1E6F78]" />
                        {b.auditScore}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer / Actions */}
                <div className="pt-3 border-t border-[#CBD4CD] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5A6B7A]">
                    <span>
                      <strong>{bScheduled}</strong> scheduled
                    </span>
                    <span>{bDrafts} drafts in queue</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        onSelectBrand(b.id);
                        onNavigateTab('studio');
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#14273A] text-white hover:bg-[#1E364E] text-xs font-semibold transition"
                    >
                      <PenTool className="w-3 h-3 text-[#E8B422]" />
                      Open Studio
                    </button>
                    <button
                      onClick={() => {
                        onSelectBrand(b.id);
                        onNavigateTab('calendar');
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#14273A] text-[#14273A] hover:bg-[#EAEFEA] text-xs font-semibold transition"
                    >
                      <CalendarDays className="w-3 h-3 text-[#1E6F78]" />
                      Calendar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Client Card */}
          <button
            onClick={onNewBrand}
            className="border-2 border-dashed border-[#14273A]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#14273A] hover:bg-white/60 transition group min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-[#CBD4CD] flex items-center justify-center text-[#14273A] group-hover:scale-110 group-hover:bg-[#E8B422] transition shadow-xs mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#14273A] font-heading">
              Add New Client Vault
            </h3>
            <p className="text-xs text-[#5A6B7A] max-w-[200px] mt-1">
              Set up their voice, rules, platforms, and heraldic flag colors.
            </p>
          </button>
        </div>
      </div>

      {/* Quick Launchpad to Suite Tools */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#14273A] font-heading mb-3">
          Quick Launchpad ({activeBrand?.name || 'Selected Client'})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('audits')}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#CBD4CD] hover:border-[#14273A] hover:shadow-xs transition text-left group"
          >
            <SearchCheck className="w-5 h-5 text-[#1E6F78] group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-[#14273A]">Account Audit</div>
              <div className="text-[11px] text-[#5A6B7A]">Analyze profile link</div>
            </div>
          </button>
          <button
            onClick={() => onNavigateTab('trends')}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#CBD4CD] hover:border-[#14273A] hover:shadow-xs transition text-left group"
          >
            <TrendingUp className="w-5 h-5 text-[#D9432B] group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-[#14273A]">Live Trend Radar</div>
              <div className="text-[11px] text-[#5A6B7A]">Viral audio & memes</div>
            </div>
          </button>
          <button
            onClick={() => onNavigateTab('repurpose')}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#CBD4CD] hover:border-[#14273A] hover:shadow-xs transition text-left group"
          >
            <Layers className="w-5 h-5 text-[#E8B422] group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-[#14273A]">Repurposer</div>
              <div className="text-[11px] text-[#5A6B7A]">Blog to 4 formats</div>
            </div>
          </button>
          <button
            onClick={() => onNavigateTab('replies')}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#CBD4CD] hover:border-[#14273A] hover:shadow-xs transition text-left group"
          >
            <Sparkles className="w-5 h-5 text-[#14273A] group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-[#14273A]">Reply Assistant</div>
              <div className="text-[11px] text-[#5A6B7A]">Community & crisis</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
