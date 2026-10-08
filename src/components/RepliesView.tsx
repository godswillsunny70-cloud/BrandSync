import React, { useState } from 'react';
import { Brand, AnalyzedReplyItem, DirectorAlert } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { draftReplies } from '../lib/api.ts';
import {
  MessageSquareText,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Loader2,
  ShieldAlert,
  Send,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';

interface RepliesViewProps {
  brand: Brand | null;
  onNavigateTab: (tab: string) => void;
  onAddAlerts?: (alerts: Omit<DirectorAlert, 'id' | 'timestamp'>[]) => void;
  activeAlerts?: DirectorAlert[];
}

const SAMPLE_COMMENTS = `Is international shipping supported for this service??\n\nTerrible experience. Waited 45 minutes for my order, staff was dismissive, and my inquiry was ignored.\n\nLove the new product launch! When is the next release date?`;

const TONES = [
  'Warm & Helpful',
  'Friendly & Conversational',
  'Witty & Playful',
  'Polished & Professional',
  'Calm, Empathetic & De-escalating',
];

export const RepliesView: React.FC<RepliesViewProps> = ({
  brand,
  onNavigateTab,
  onAddAlerts,
  activeAlerts = [],
}) => {
  const [messagesInput, setMessagesInput] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [context, setContext] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [analyzedList, setAnalyzedList] = useState<AnalyzedReplyItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [alertsDispatchedNotice, setAlertsDispatchedNotice] = useState<number | null>(null);

  if (!brand) {
    return (
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-[#14273A] font-heading mb-2">
          Select a Client First
        </h2>
        <p className="text-sm text-[#5A6B7A] mb-4">
          The Reply Assistant needs an active client vault to preserve brand voice in customer responses.
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

  async function handleDraftReplies(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!brand) return;
    if (!messagesInput.trim()) {
      alert('Please paste at least one message or comment.');
      return;
    }

    const separated = messagesInput
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (separated.length === 0) {
      alert('Please enter valid text.');
      return;
    }

    setIsDrafting(true);
    setAlertsDispatchedNotice(null);
    try {
      const data = await draftReplies({
        brand,
        messages: separated,
        tone,
        context: context.trim() || undefined,
      });
      setAnalyzedList(data.analyzed || []);

      if (onAddAlerts && data.analyzed && data.analyzed.length > 0) {
        const newAlerts: Omit<DirectorAlert, 'id' | 'timestamp'>[] = [];
        data.analyzed.forEach((item, idx) => {
          const isSens = item.isSensitive;
          const bestOption = item.options?.[0]?.text || '';
          newAlerts.push({
            brandId: brand.id,
            type: 'reply',
            title: isSens
              ? `⚠️ Urgent Sensitive Comment: ${item.flagReason || 'PR Escalation'}`
              : `Review Suggested Reply for: "${item.original.slice(0, 32)}..."`,
            description: `Incoming Comment: "${item.original}"\n\nSuggested Response: "${bestOption}"\n\n${item.moderatorTip ? `Moderator Tip: ${item.moderatorTip}` : 'Review and approve suggested reply angle.'}`,
            severity: isSens ? 'urgent' : 'action_needed',
            targetTab: 'replies',
            data: { replyItem: item, index: idx },
          });
        });
        if (newAlerts.length > 0) {
          onAddAlerts(newAlerts);
          setAlertsDispatchedNotice(newAlerts.length);
        }
      }
    } catch (err: any) {
      alert('Failed to draft replies: ' + err.message);
    } finally {
      setIsDrafting(false);
    }
  }

  function handleAddSingleReplyAlert(item: AnalyzedReplyItem) {
    if (!onAddAlerts) return;
    const isSens = item.isSensitive;
    const bestOption = item.options?.[0]?.text || '';
    onAddAlerts([
      {
        brandId: brand?.id,
        type: 'reply',
        title: isSens
          ? `⚠️ Sensitive Comment Escalation: ${item.flagReason || 'Review Required'}`
          : `Suggested Reply: "${item.original.slice(0, 32)}..."`,
        description: `Comment: "${item.original}"\n\nSuggested Response: "${bestOption}"\n\n${item.moderatorTip || ''}`,
        severity: isSens ? 'urgent' : 'action_needed',
        targetTab: 'replies',
        data: { replyItem: item },
      },
    ]);
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlagBadge flag={brand.flag} size="md" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6F78]">
                {brand.name}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
              Community & Crisis Reply Assistant
            </h1>
            <p className="text-[#5A6B7A] text-sm mt-1">
              Draft answers in seconds. Incoming complaints, legal threats, and PR vulnerabilities get flagged with moderator handling guidance.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#CBD4CD] text-xs max-w-xs shrink-0">
            <span className="font-bold text-[#5A6B7A] uppercase text-[10px] block mb-1">
              Voice Guardrail:
            </span>
            <p className="text-[#14273A] line-clamp-2 italic">
              "{brand.donts || 'No corporate jargon or fake promises'}"
            </p>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <form
        onSubmit={handleDraftReplies}
        className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#14273A]">
            Incoming Comments, Reviews, or DMs <span className="text-xs font-normal text-[#5A6B7A] lowercase">(separate multiple comments with blank lines)</span>
          </label>
          <button
            type="button"
            onClick={() => setMessagesInput(SAMPLE_COMMENTS)}
            className="text-xs text-[#1E6F78] hover:underline font-bold"
          >
            Insert Sample Comments
          </button>
        </div>

        <textarea
          rows={5}
          required
          value={messagesInput}
          onChange={(e) => setMessagesInput(e.target.value)}
          placeholder={`is this available for shipping to Canada??\n\nTerrible experience, waited 40 mins and nobody cared.`}
          className="w-full px-3.5 py-3 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
              Desired Reply Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
              Operational Context <span className="text-xs font-normal text-[#5A6B7A] lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. On the post about our holiday shipping deadline"
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={isDrafting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs disabled:opacity-60"
          >
            {isDrafting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Drafting Contextual Replies...
              </>
            ) : (
              <>
                <MessageSquareText className="w-4 h-4" />
                Draft Replies & Screen Risks
              </>
            )}
          </button>

          <span className="text-xs text-[#5A6B7A]">
            Auto-detects escalation triggers & sensitive PR topics
          </span>
        </div>
      </form>

      {/* Output Results */}
      {analyzedList.length > 0 && (
        <div className="space-y-4">
          {/* SMM Director Alerts Dispatched Banner */}
          {alertsDispatchedNotice !== null && (
            <div className="p-4 rounded-xl bg-teal-50 border-2 border-teal-300 text-teal-950 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1E6F78] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm font-heading flex items-center gap-2">
                    <span>{alertsDispatchedNotice} Suggested Replies Synced to SMM Director Drawer</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1E6F78] text-white text-[10px] font-bold animate-pulse">
                      Alerts Active
                    </span>
                  </div>
                  <p className="text-xs text-teal-900 mt-0.5">
                    Click the SMM Director button in the header or sidebar to open the drawer and review or batch-solve all community responses.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
              <span>Drafted Responses</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#14273A] text-white">
                {analyzedList.length}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {analyzedList.map((item, idx) => {
              const isTracked = activeAlerts.some(
                (a) =>
                  a.title.includes(item.original.slice(0, 24)) ||
                  a.description.includes(item.original.slice(0, 24))
              );

              return (
                <div
                  key={idx}
                  className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl overflow-hidden shadow-xs flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  {/* Brand Strip */}
                  <div
                    className="w-full md:w-3.5 h-2 md:h-auto shrink-0"
                    style={{ backgroundColor: brand.flag.a || '#14273A' }}
                  />

                  <div className="p-5 sm:p-6 flex-1 space-y-4">
                    {/* Original Comment */}
                    <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD] text-xs sm:text-sm text-[#14273A] border-l-4 border-l-[#5A6B7A]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A]">
                          Incoming Message / Comment:
                        </div>
                        {isTracked ? (
                          <span className="text-teal-800 font-extrabold bg-teal-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            ⚡ Alert in Drawer
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddSingleReplyAlert(item)}
                            className="text-[#1E6F78] hover:text-[#14273A] font-bold text-[10px] hover:underline"
                          >
                            + Alert SMM Director
                          </button>
                        )}
                      </div>
                      <p className="whitespace-pre-line leading-relaxed italic">
                        "{item.original}"
                      </p>
                    </div>

                  {/* Sensitive Risk Alert Banner */}
                  {item.isSensitive && (
                    <div className="bg-red-50 border-2 border-[#D9432B] rounded-lg p-3 text-xs text-red-950 space-y-1.5 animate-in zoom-in-95">
                      <div className="font-extrabold flex items-center gap-1.5 text-[#D9432B] uppercase tracking-wider text-[11px]">
                        <ShieldAlert className="w-4 h-4" />
                        Handle with Care — Escalation / Sensitive Trigger
                      </div>
                      <p className="leading-relaxed">
                        {item.flagReason || 'Requires careful human oversight before responding.'}
                      </p>
                      {item.moderatorTip && (
                        <div className="font-medium text-red-900 bg-white/70 p-2 rounded border border-red-200">
                          <strong>Moderator Guidance: </strong>
                          {item.moderatorTip}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply Options */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] block">
                      Recommended Reply Angles:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(item.options || []).map((opt, oIdx) => {
                        const copyKey = `reply-${idx}-${oIdx}`;
                        const isCopied = copiedKey === copyKey;
                        return (
                          <div
                            key={oIdx}
                            className="bg-white p-4 rounded-xl border border-[#CBD4CD] hover:border-[#14273A] transition flex flex-col justify-between space-y-3 shadow-2xs"
                          >
                            <div>
                              <span className="text-xs font-bold text-[#1E6F78] block mb-1">
                                {opt.label}
                              </span>
                              <p className="text-xs sm:text-sm text-[#14273A] leading-relaxed whitespace-pre-line">
                                {opt.text}
                              </p>
                            </div>

                            <button
                              onClick={() => handleCopy(opt.text, copyKey)}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14273A] bg-[#FBFBF8] hover:bg-[#EAEFEA] text-xs font-bold text-[#14273A] transition"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Reply
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
};
