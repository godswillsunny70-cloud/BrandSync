import React, { useState } from 'react';
import { Brand, Post, PostStatus, Platform } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { draftCalendar } from '../lib/api.ts';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Loader2,
  Check,
  Copy,
  Trash2,
  Clock,
  Send,
  FileEdit,
  X,
  Download,
  FileSpreadsheet,
  Table
} from 'lucide-react';

interface CalendarViewProps {
  brand: Brand | null;
  posts: Post[];
  onSavePost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onAddPosts: (newPosts: Omit<Post, 'id'>[]) => void;
  onNavigateTab: (tab: string) => void;
}

const ALL_PLATFORMS: Platform[] = [
  'Instagram',
  'TikTok',
  'LinkedIn',
  'X',
  'Facebook',
  'YouTube Shorts',
];

const STATUSES: { id: PostStatus; label: string; color: string }[] = [
  { id: 'idea', label: 'Idea', color: 'border-l-amber-500 bg-amber-50/70 text-amber-950' },
  { id: 'draft', label: 'Draft', color: 'border-l-slate-400 bg-slate-50 text-slate-800' },
  { id: 'scheduled', label: 'Scheduled', color: 'border-l-[#1E6F78] bg-[#EAEFEA] text-[#14273A]' },
  { id: 'posted', label: 'Posted', color: 'border-l-[#14273A] bg-zinc-100 text-zinc-900 opacity-80' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  brand,
  posts,
  onSavePost,
  onDeletePost,
  onAddPosts,
  onNavigateTab,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [draftGoalPrompt, setDraftGoalPrompt] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  function escapeCsvValue(val: any): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  function handleExport(format: 'csv' | 'xlsx' = 'csv') {
    if (!brand || clientPosts.length === 0) {
      alert('No posts found in the calendar to export for this client.');
      return;
    }

    const headers = [
      'Date',
      'Day of Week',
      'Posting Time',
      'Client',
      'Platform',
      'Status',
      'Content Pillar',
      'Hook / Title',
      'Caption / Full Copy',
      'Visual Direction',
    ];

    const sortedPosts = [...clientPosts].sort((a, b) => a.date.localeCompare(b.date));

    const rows = sortedPosts.map((post) => {
      const d = new Date(post.date + 'T00:00:00');
      const dayName = isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { weekday: 'long' });
      return [
        escapeCsvValue(post.date),
        escapeCsvValue(dayName),
        escapeCsvValue(post.bestPostingTime || ''),
        escapeCsvValue(brand.name),
        escapeCsvValue(post.platform),
        escapeCsvValue(post.status),
        escapeCsvValue(post.pillar || ''),
        escapeCsvValue(post.hook || ''),
        escapeCsvValue(post.text),
        escapeCsvValue(post.visual || ''),
      ].join(',');
    });

    // \uFEFF BOM ensures Microsoft Excel and Google Sheets render UTF-8 characters cleanly
    const csvContent = '\uFEFF' + [headers.map(escapeCsvValue).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: format === 'xlsx' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const clientSlug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `${clientSlug}_content_calendar_${todayStr}.${format}`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportMenu(false);
    setExportToast(`Exported ${sortedPosts.length} posts as ${format.toUpperCase()}!`);
    setTimeout(() => setExportToast(null), 3000);
  }

  if (!brand) {
    return (
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-[#14273A] font-heading mb-2">
          Select a Client Workspace
        </h2>
        <p className="text-sm text-[#5A6B7A] mb-4">
          The calendar displays and schedules posts for the currently active brand.
        </p>
        <button
          onClick={() => onNavigateTab('brands')}
          className="px-4 py-2 rounded-lg bg-[#D9432B] text-white font-bold text-xs"
        >
          Open Brand Voices
        </button>
      </div>
    );
  }

  // Calculate 14 days range
  const startDate = addDays(getMonday(new Date()), weekOffset * 14);
  const daysArray = Array.from({ length: 14 }, (_, i) => addDays(startDate, i));
  const todayIso = toIsoDate(new Date());

  // Filter client's posts
  const clientPosts = posts.filter((p) => p.brandId === brand.id);
  const filteredPosts = clientPosts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  function handleOpenNewPost(dateIso: string) {
    setEditingPost({
      id: '',
      brandId: brand!.id,
      date: dateIso,
      platform: brand!.platforms[0] || 'Instagram',
      text: '',
      status: 'draft',
    });
  }

  function handleSaveModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPost) return;
    if (!editingPost.text.trim()) {
      alert('Post content cannot be empty.');
      return;
    }
    const finalPost: Post = {
      ...editingPost,
      id: editingPost.id || 'p-' + Math.random().toString(36).slice(2, 9),
    };
    onSavePost(finalPost);
    setEditingPost(null);
  }

  function handleCopyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleExecuteAiDraftCalendar() {
    if (!brand) return;
    setIsDraftingAi(true);
    try {
      // Find empty upcoming days in range
      const emptyDays = daysArray
        .map((d) => toIsoDate(d))
        .filter((iso) => iso >= todayIso && !clientPosts.some((p) => p.date === iso))
        .slice(0, 7);

      if (emptyDays.length === 0) {
        alert('No empty upcoming days found in this 2-week view to fill.');
        setIsDraftingAi(false);
        return;
      }

      const res = await draftCalendar({
        brand,
        dates: emptyDays,
        existingPosts: clientPosts.map((p) => ({ date: p.date, text: p.text.slice(0, 60) })),
        themeOrGoal: draftGoalPrompt.trim() || undefined,
      });

      if (res.calendar && Array.isArray(res.calendar)) {
        const newPosts: Omit<Post, 'id'>[] = res.calendar.map((item) => ({
          brandId: brand.id,
          date: item.date,
          platform: item.platform || brand.platforms[0] || 'Instagram',
          text: `${item.title ? item.title + '\n\n' : ''}${item.text}`,
          status: 'idea',
          pillar: item.pillar,
          hook: item.title,
          visual: item.visualIdea,
          bestPostingTime: item.bestPostingTime,
        }));
        onAddPosts(newPosts);
        setShowDraftModal(false);
        setDraftGoalPrompt('');
      }
    } catch (err: any) {
      alert('Failed to draft calendar: ' + err.message);
    } finally {
      setIsDraftingAi(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FlagBadge flag={brand.flag} size="md" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E6F78]">
              {brand.name}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
            Content Calendar
          </h1>
          <p className="text-[#5A6B7A] text-sm mt-1">
            Visual 14-day schedule. Review drafts, drag out campaigns, and use AI to fill empty days.
          </p>
        </div>

        {/* Actions: Export & AI Drafter */}
        <div className="flex items-center gap-2.5 relative">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border-2 border-[#14273A] bg-white hover:bg-[#EAEFEA] text-[#14273A] font-bold text-xs sm:text-sm transition shadow-xs"
              title="Export calendar to CSV or Excel"
            >
              <Download className="w-4 h-4 text-[#1E6F78]" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-[#14273A] rounded-lg shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] border-b border-[#CBD4CD]/60">
                  Export Schedule ({clientPosts.length} posts)
                </div>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#14273A] hover:bg-[#EAEFEA] transition text-left"
                >
                  <Table className="w-4 h-4 text-[#1E6F78]" />
                  <div>
                    <div>Export as CSV (.csv)</div>
                    <div className="text-[10px] text-[#5A6B7A] font-normal">For Google Sheets, Notion, Buffer</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#14273A] hover:bg-[#EAEFEA] transition text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div>Export as Excel (.xlsx)</div>
                    <div className="text-[10px] text-[#5A6B7A] font-normal">Excel-compatible format</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* AI Drafter Button */}
          <button
            onClick={() => setShowDraftModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-xs sm:text-sm transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#E8B422]" />
            Draft Calendar (AI)
          </button>
        </div>
      </div>

      {/* Export Toast Feedback */}
      {exportToast && (
        <div className="bg-[#14273A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{exportToast}</span>
          </div>
          <button onClick={() => setExportToast(null)} className="text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation & Filters Bar */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Date Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-1.5 rounded-md border border-[#14273A] bg-white hover:bg-[#EAEFEA] transition"
            title="Previous 2 Weeks"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-md border border-[#14273A] bg-white hover:bg-[#EAEFEA] text-xs font-bold text-[#14273A] transition"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1.5 rounded-md border border-[#14273A] bg-white hover:bg-[#EAEFEA] transition"
            title="Next 2 Weeks"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-[#14273A] ml-2 font-heading">
            {daysArray[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {daysArray[13].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#5A6B7A] font-medium mr-1 hidden sm:inline">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
              statusFilter === 'all'
                ? 'bg-[#14273A] text-white border-[#14273A]'
                : 'bg-white text-[#5A6B7A] border-[#CBD4CD] hover:border-[#14273A]'
            }`}
          >
            All ({clientPosts.length})
          </button>
          {STATUSES.map((st) => {
            const count = clientPosts.filter((p) => p.status === st.id).length;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                  statusFilter === st.id
                    ? 'bg-[#14273A] text-white border-[#14273A]'
                    : 'bg-white text-[#5A6B7A] border-[#CBD4CD] hover:border-[#14273A]'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 14-Day Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
        {daysArray.map((day) => {
          const iso = toIsoDate(day);
          const isToday = iso === todayIso;
          const isPast = iso < todayIso;
          const dayPosts = filteredPosts.filter((p) => p.date === iso);

          return (
            <div
              key={iso}
              className={`bg-[#FBFBF8] border-2 rounded-xl p-3 min-h-[170px] flex flex-col justify-between transition shadow-xs ${
                isToday
                  ? 'border-[#14273A] ring-2 ring-[#E8B422]'
                  : isPast
                  ? 'border-[#CBD4CD] opacity-85'
                  : 'border-[#CBD4CD] hover:border-[#14273A]'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]/60 mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#5A6B7A]">
                      {day.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className={`text-sm font-extrabold font-heading ${isToday ? 'text-[#D9432B]' : 'text-[#14273A]'}`}>
                      {day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenNewPost(iso)}
                    className="w-6 h-6 rounded-md bg-white border border-[#CBD4CD] hover:border-[#14273A] hover:bg-[#EAEFEA] flex items-center justify-center text-[#14273A] transition text-xs"
                    title={`Add post on ${iso}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Posts List */}
                <div className="space-y-2">
                  {dayPosts.map((post) => {
                    const statusConfig = STATUSES.find((s) => s.id === post.status) || STATUSES[1];
                    return (
                      <div
                        key={post.id}
                        onClick={() => setEditingPost(post)}
                        className={`p-2 rounded-md border-l-4 text-xs cursor-pointer hover:shadow-xs transition space-y-1 ${statusConfig.color}`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10px] uppercase tracking-wider">
                          <span>{post.platform}</span>
                          <span className="capitalize">{post.status}</span>
                        </div>
                        <p className="line-clamp-2 text-[#14273A] leading-snug">
                          {post.hook || post.text}
                        </p>
                        {post.visualAsset && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-[#855B00] bg-[#FFF9E6] px-1.5 py-0.5 rounded border border-[#E8B422]/60 w-fit">
                            <span>🎨</span>
                            <span>{post.visualAsset.engine === 'nano-banana-2' ? 'Nano Banana 2' : 'Omni 1.1'}</span>
                            <span className="uppercase text-[8px] opacity-75">({post.visualAsset.format})</span>
                          </div>
                        )}
                        {post.bestPostingTime && (
                          <div className="text-[10px] text-[#5A6B7A] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {post.bestPostingTime}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {dayPosts.length === 0 && (
                <div className="py-4 text-center">
                  <span className="text-[11px] text-[#5A6B7A]/70 italic">No posts</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Help bar */}
      <div className="p-3 bg-[#FBFBF8] border border-[#CBD4CD] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-[#5A6B7A]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#14273A]">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border-l-4 border-amber-500 bg-amber-100" />
            <span>Idea</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border-l-4 border-slate-400 bg-slate-100" />
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border-l-4 border-[#1E6F78] bg-[#EAEFEA]" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border-l-4 border-[#14273A] bg-zinc-200" />
            <span>Posted</span>
          </div>
        </div>

        <span>Click any post card to edit copy, change status, or copy text.</span>
      </div>

      {/* Post Edit / Create Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#CBD4CD]">
              <h3 className="font-extrabold text-lg text-[#14273A] font-heading">
                {editingPost.id ? 'Edit Scheduled Post' : 'Create New Calendar Post'}
              </h3>
              <button
                onClick={() => setEditingPost(null)}
                className="p-1 rounded hover:bg-[#EAEFEA] text-[#5A6B7A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingPost.date}
                    onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#14273A] bg-white text-xs text-[#14273A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                    Platform
                  </label>
                  <select
                    value={editingPost.platform}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, platform: e.target.value as Platform })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#14273A] bg-white text-xs text-[#14273A]"
                  >
                    {ALL_PLATFORMS.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                  Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUSES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditingPost({ ...editingPost, status: st.id })}
                      className={`py-1.5 px-2 rounded text-xs font-bold border text-center transition capitalize ${
                        editingPost.status === st.id
                          ? 'bg-[#14273A] text-white border-[#14273A]'
                          : 'bg-white text-[#5A6B7A] border-[#CBD4CD]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                  Post Caption & Copy
                </label>
                <textarea
                  rows={6}
                  required
                  value={editingPost.text}
                  onChange={(e) => setEditingPost({ ...editingPost, text: e.target.value })}
                  placeholder="Post copy..."
                  className="w-full px-3 py-2 rounded-lg border border-[#14273A] bg-white text-xs sm:text-sm text-[#14273A]"
                />
              </div>

              {editingPost.visual && (
                <div className="p-2.5 rounded bg-[#EAEFEA] text-xs text-[#14273A] border border-[#CBD4CD]">
                  <strong className="text-[#1E6F78]">Visual / Footage Direction: </strong>
                  {editingPost.visual}
                </div>
              )}

              {editingPost.visualAsset && (
                <div className="p-3.5 rounded-xl bg-[#0B131E] text-white border border-black/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="font-extrabold text-[#E8B422]">
                      {editingPost.visualAsset.engineBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-white">
                      {editingPost.visualAsset.format}
                    </span>
                  </div>
                  {editingPost.visualAsset.format === 'image' && editingPost.visualAsset.svgGraphic && (
                    <div className="flex gap-3 items-center">
                      <div
                        className="w-24 h-24 rounded overflow-hidden bg-black shrink-0 border border-white/20"
                        dangerouslySetInnerHTML={{ __html: editingPost.visualAsset.svgGraphic }}
                      />
                      <div className="space-y-1">
                        <p className="text-[11px] text-gray-300 line-clamp-2">
                          {editingPost.visualAsset.visualDirection}
                        </p>
                        <span className="text-[10px] text-gray-400 block">
                          Aspect: {editingPost.visualAsset.aspectRatio}
                        </span>
                      </div>
                    </div>
                  )}
                  {editingPost.visualAsset.format === 'carousel' && editingPost.visualAsset.carouselSlides && (
                    <div className="text-[11px] text-gray-300">
                      <strong>5-Slide Carousel Deck Attached:</strong> {editingPost.visualAsset.carouselSlides[0]?.headline}
                    </div>
                  )}
                  {(editingPost.visualAsset.format === 'motion' || editingPost.visualAsset.format === 'animation') && (
                    <div className="text-[11px] text-[#E8B422] font-semibold">
                      🎬 Kinetic Motion Graphic Script Attached ({editingPost.visualAsset.motionConfig?.durationSeconds || 7}s)
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-[#CBD4CD] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-xs shadow-xs"
                  >
                    Save Post
                  </button>
                  {editingPost.id && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(editingPost.text, editingPost.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#CBD4CD] bg-white text-xs font-semibold text-[#14273A]"
                    >
                      {copiedId === editingPost.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Text
                        </>
                      )}
                    </button>
                  )}
                </div>

                {editingPost.id && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeletePost(editingPost.id);
                      setEditingPost(null);
                    }}
                    className="text-xs text-[#D9432B] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Draft Calendar Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CBD4CD]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E8B422]" />
                <h3 className="font-extrabold text-lg text-[#14273A] font-heading">
                  AI Editorial Calendar Drafter
                </h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="p-1 rounded hover:bg-[#EAEFEA] text-[#5A6B7A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5A6B7A] leading-relaxed">
              Halyard will analyze {brand.name}'s Brand Voice Vault, examine empty upcoming days in your 2-week view, and automatically generate balanced content concepts across educational, authority, and engagement pillars.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Campaign Focus or Seasonal Theme (Optional)
              </label>
              <input
                type="text"
                value={draftGoalPrompt}
                onChange={(e) => setDraftGoalPrompt(e.target.value)}
                placeholder="e.g. Spring menu launch, highlight cold brew origin stories & barista tips"
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-xs sm:text-sm text-[#14273A] focus:outline-none"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              Generated posts are saved as <strong>Ideas</strong> so you can review and refine each caption before scheduling.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="px-3 py-2 rounded-lg border border-[#CBD4CD] text-xs font-semibold text-[#5A6B7A]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDraftingAi}
                onClick={handleExecuteAiDraftCalendar}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-xs transition disabled:opacity-60"
              >
                {isDraftingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Drafting Calendar...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E8B422]" />
                    Generate 7-Day Content Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
