import React, { useState, useRef, useEffect } from 'react';
import { Brand, ChatMessage, DirectorAlert } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { askSmmAssistant } from '../lib/api.ts';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  Bell,
  MessageSquareText,
  SearchCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Trash2,
  Layers
} from 'lucide-react';

interface SmmAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  alerts: DirectorAlert[];
  onDismissAlert: (alertId: string) => void;
  onNavigateTab: (tab: string) => void;
  onResolveAlert: (alertId: string) => void;
  onClearAllAlerts?: () => void;
  onMarkAllRead?: () => void;
  onAddAlert?: (alert: Omit<DirectorAlert, 'id' | 'timestamp'>) => void;
}

const PRESET_QUESTIONS = [
  'Critique our hook formula and suggest 3 scroll-stopping variations',
  'How do we leverage our local presence to beat generic national competitors?',
  'Review our brand knowledge vault assets and suggest 3 campaign angles',
  'How do I fix low reach on Instagram Reels without running ads?',
  'Draft a PR response for an angry public comment',
];

export const SmmAssistantDrawer: React.FC<SmmAssistantDrawerProps> = ({
  isOpen,
  onClose,
  brand,
  alerts,
  onDismissAlert,
  onNavigateTab,
  onResolveAlert,
  onClearAllAlerts,
  onMarkAllRead,
  onAddAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts'>('chat');
  const [alertFilter, setAlertFilter] = useState<'all' | 'reply' | 'audit_task'>('all');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      role: 'assistant',
      content: `I'm your **Senior Social Media Director** with 15+ years running high-growth campaigns and community rosters. ${
        brand
          ? `I'm actively loaded with **${brand.name}**'s voice parameters${brand.location ? ' in **' + brand.location + '**' : ''}${brand.assets?.length ? ' and **' + brand.assets.length + ' Brand Knowledge Assets**' : ''}.`
          : 'Select a brand or ask me anything regarding algorithms, hook optimization, community growth, or crisis mitigation.'
      }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter alerts by active client or unassigned
  const clientAlerts = alerts.filter(
    (a) => !a.brandId || !brand || a.brandId === brand.id
  );
  const unreadCount = clientAlerts.filter((a) => !a.isRead).length;
  const replyAlerts = clientAlerts.filter((a) => a.type === 'reply');
  const auditAlerts = clientAlerts.filter((a) => a.type === 'audit_task');

  const filteredAlerts = clientAlerts.filter((a) => {
    if (alertFilter === 'reply') return a.type === 'reply';
    if (alertFilter === 'audit_task') return a.type === 'audit_task';
    return true;
  });

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'alerts' && onMarkAllRead) {
      onMarkAllRead();
    }
  }, [messages, isOpen, activeTab]);

  function handleCreateSampleAlerts() {
    if (!onAddAlert) return;
    onAddAlert({
      brandId: brand?.id,
      type: 'reply',
      title: 'Review Suggested Reply: "Do you ship worldwide?"',
      description: 'Incoming customer DM on Instagram asking about international transit times and free shipping thresholds.\n\nRecommended: "Hey there! We currently ship across North America with free shipping over $45. Check our bio link for international dispatch dates!"',
      severity: 'action_needed',
      targetTab: 'replies',
    });
    onAddAlert({
      brandId: brand?.id,
      type: 'audit_task',
      title: 'Audit Remediation: Rewrite 150-char bio value proposition',
      description: 'Stage 1 Immediate Priority: Bio currently lacks a clear customer-centric benefit and one-tap lead magnet link.\n\nImpact: +18% profile-to-follower conversion rate.',
      severity: 'urgent',
      targetTab: 'audits',
    });
  }

  if (!isOpen) return null;

  async function handleSend(textToSend?: string) {
    const query = textToSend || input;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Math.random().toString(36).slice(2, 9),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsSending(true);

    try {
      const res = await askSmmAssistant({
        brand: brand!,
        message: query.trim(),
        chatHistory: messages.slice(-8),
      });

      const assistantMsg: ChatMessage = {
        id: 'a-' + Math.random().toString(36).slice(2, 9),
        role: 'assistant',
        content: res.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Math.random().toString(36).slice(2, 9),
        role: 'assistant',
        content: `Error consulting director: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsSending(false);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleResetChat() {
    setMessages([
      {
        id: 'm-reset',
        role: 'assistant',
        content: `Chat session reset. I'm ready to advise on **${brand?.name || 'your client'}**'s strategy, ad hooks, or crisis mitigation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }

  // Quick action: Ask director to solve an alert item in chat
  function handleSolveAlertInChat(alert: DirectorAlert) {
    let prompt = '';
    if (alert.type === 'audit_task') {
      prompt = `Director, I need to execute this audit task for ${brand?.name || 'our client'}: "${alert.title}". Detailed description: "${alert.description}". What are 3 actionable, high-conviction options or specific copy templates to implement this today?`;
    } else if (alert.type === 'reply') {
      prompt = `Director, we have a customer message needing review: "${alert.description}". Title: "${alert.title}". How should we respond in ${brand?.name || 'our brand'}'s voice while mitigating any PR or customer friction?`;
    } else {
      prompt = `Director, can you help me solve this action item: "${alert.title}" (${alert.description})?`;
    }

    setActiveTab('chat');
    handleSend(prompt);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FBFBF8] h-full shadow-2xl flex flex-col border-l-2 border-[#14273A] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#14273A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8B422] flex items-center justify-center text-[#14273A] shrink-0 font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight font-heading">
                  SMM Director
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              </div>
              <p className="text-[11px] text-[#A6B8A9]">
                15+ yr veteran social media strategist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition"
              title="Reset Chat Session"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Client Voice Context Banner */}
        {brand && (
          <div className="px-4 py-2 bg-[#EAEFEA] border-b border-[#CBD4CD] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FlagBadge flag={brand.flag} size="sm" />
              <span className="font-bold text-[#14273A] truncate font-heading">
                {brand.name}
              </span>
              <span className="text-[#5A6B7A] text-[11px] hidden sm:inline truncate">
                • {brand.industry || 'All platforms'}
              </span>
            </div>
            <span className="text-[10px] text-[#1E6F78] font-bold uppercase tracking-wider shrink-0 bg-white px-2 py-0.5 rounded border border-[#CBD4CD]">
              Voice Injected
            </span>
          </div>
        )}

        {/* Tab Navigation: Chat vs Alerts Center */}
        <div className="px-4 py-2.5 bg-white border-b border-[#CBD4CD] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#FBFBF8] p-1 rounded-lg border border-[#CBD4CD] w-full">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'text-[#5A6B7A] hover:text-[#14273A]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Director Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 relative ${
                activeTab === 'alerts'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'text-[#5A6B7A] hover:text-[#14273A]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Action Alerts</span>
              {clientAlerts.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  activeTab === 'alerts'
                    ? 'bg-[#E8B422] text-[#14273A]'
                    : 'bg-[#D9432B] text-white animate-pulse'
                }`}>
                  <span>{clientAlerts.length}</span>
                  {replyAlerts.length > 0 && auditAlerts.length > 0 && (
                    <span className="text-[9px] opacity-80 font-normal hidden sm:inline">
                      ({replyAlerts.length}r·{auditAlerts.length}a)
                    </span>
                  )}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Alert Notification Banner if in Chat Tab and alerts exist */}
        {activeTab === 'chat' && clientAlerts.length > 0 && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-2 text-xs shrink-0 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D9432B]"></span>
              </span>
              <span className="font-semibold truncate text-[11px] sm:text-xs">
                {replyAlerts.length > 0 && auditAlerts.length > 0
                  ? `${replyAlerts.length} suggested replies & ${auditAlerts.length} audit tasks pending`
                  : replyAlerts.length > 0
                  ? `${replyAlerts.length} suggested reply item(s) to review`
                  : `${auditAlerts.length} pending audit roadmap task(s)`}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-[11px] font-bold text-[#14273A] hover:underline flex items-center gap-0.5 shrink-0 bg-white px-2 py-1 rounded border border-amber-300"
            >
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Content Body: Chat Mode vs Alerts Mode */}
        {activeTab === 'chat' ? (
          <>
            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#14273A] text-white rounded-br-xs'
                          : 'bg-white text-[#14273A] border border-[#CBD4CD] rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {m.content}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-[#5A6B7A]">{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.content, m.id)}
                          className="text-[10px] text-[#5A6B7A] hover:text-[#14273A] flex items-center gap-0.5"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" /> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-[#5A6B7A] bg-white p-3 rounded-lg border border-[#CBD4CD] w-fit animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#14273A]" />
                  <span>Director is formulating strategy...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="px-4 py-2 border-t border-[#CBD4CD]/60 bg-[#FBFBF8] overflow-x-auto shrink-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                <span className="text-[10px] font-bold text-[#5A6B7A] uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-[#E8B422]" /> Prompts:
                </span>
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isSending}
                    className="px-2.5 py-1 rounded-full bg-white border border-[#CBD4CD] hover:border-[#14273A] text-[#14273A] text-[11px] shrink-0 transition"
                  >
                    {q.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-[#CBD4CD] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask director about ${brand?.name || 'social strategy'}...`}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-[#FBFBF8] text-xs sm:text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="p-2.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white transition disabled:opacity-50 shrink-0"
                  title="Send to Director"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Alerts & Tasks Center Tab */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setAlertFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                    alertFilter === 'all'
                      ? 'bg-[#14273A] text-white'
                      : 'bg-white text-[#5A6B7A] border border-[#CBD4CD]'
                  }`}
                >
                  All ({clientAlerts.length})
                </button>
                <button
                  onClick={() => setAlertFilter('reply')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    alertFilter === 'reply'
                      ? 'bg-[#14273A] text-white'
                      : 'bg-white text-[#5A6B7A] border border-[#CBD4CD]'
                  }`}
                >
                  <MessageSquareText className="w-3 h-3 text-[#1E6F78]" />
                  <span>Replies ({replyAlerts.length})</span>
                </button>
                <button
                  onClick={() => setAlertFilter('audit_task')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    alertFilter === 'audit_task'
                      ? 'bg-[#14273A] text-white'
                      : 'bg-white text-[#5A6B7A] border border-[#CBD4CD]'
                  }`}
                >
                  <SearchCheck className="w-3 h-3 text-[#D9432B]" />
                  <span>Audit Tasks ({auditAlerts.length})</span>
                </button>
              </div>

              {clientAlerts.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prompt = `Director, here is our current list of pending social alerts and audit tasks for ${brand?.name || 'our client'}:\n${clientAlerts.map((a, i) => `${i + 1}. [${a.type.toUpperCase()}] ${a.title}: ${a.description}`).join('\n')}\n\nPlease give us an executive breakdown on which of these should be prioritized first and provide concrete templates to execute them.`;
                      setActiveTab('chat');
                      handleSend(prompt);
                    }}
                    className="text-[11px] font-bold text-[#1E6F78] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Batch Solve All</span>
                  </button>
                  {onClearAllAlerts && (
                    <button
                      onClick={onClearAllAlerts}
                      className="text-[11px] font-semibold text-[#5A6B7A] hover:text-[#D9432B] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Empty Alerts State */}
            {filteredAlerts.length === 0 && (
              <div className="py-10 text-center space-y-3 bg-white rounded-xl border border-dashed border-[#CBD4CD] p-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#14273A] font-heading">
                    All Caught Up!
                  </h4>
                  <p className="text-xs text-[#5A6B7A] max-w-xs mx-auto mt-1">
                    No pending audit remediation tasks or suggested replies for {brand?.name || 'your client'}.
                  </p>
                </div>
                <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('audits');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#14273A] text-xs font-bold text-[#14273A] hover:bg-[#EAEFEA] transition"
                  >
                    Run Account Audit
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('replies');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#14273A] text-white text-xs font-bold hover:bg-[#1E364E] transition"
                  >
                    Screen Replies
                  </button>
                  <button
                    onClick={handleCreateSampleAlerts}
                    className="px-3 py-1.5 rounded-lg border border-[#E8B422] bg-[#E8B422]/15 text-[#14273A] text-xs font-bold hover:bg-[#E8B422]/25 transition flex items-center gap-1"
                    title="Generate 2 sample tasks to test the alert system"
                  >
                    <Sparkles className="w-3 h-3 text-[#E8B422]" />
                    <span>Test Sample Alerts</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Alerts */}
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const isReply = alert.type === 'reply';
                const isUrgent = alert.severity === 'urgent';

                return (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-xl border-2 p-4 space-y-3 shadow-xs transition ${
                      isUrgent
                        ? 'border-red-300 ring-1 ring-red-200'
                        : isReply
                        ? 'border-teal-200'
                        : 'border-[#CBD4CD] hover:border-[#14273A]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                            isReply
                              ? 'bg-teal-50 text-[#1E6F78] border border-teal-200'
                              : 'bg-amber-50 text-[#D9432B] border border-amber-200'
                          }`}
                        >
                          {isReply ? (
                            <MessageSquareText className="w-4 h-4" />
                          ) : (
                            <SearchCheck className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider ${
                                isUrgent
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {alert.severity.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-[#5A6B7A]">
                              {alert.timestamp}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#14273A] font-heading mt-0.5">
                            {alert.title}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="p-1 rounded text-[#5A6B7A] hover:text-[#D9432B] hover:bg-gray-100 transition shrink-0"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Description Body */}
                    <p className="text-xs text-[#5A6B7A] leading-relaxed bg-[#FBFBF8] p-2.5 rounded-lg border border-[#CBD4CD]/60 whitespace-pre-line">
                      {alert.description}
                    </p>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#CBD4CD]/60 text-xs">
                      <button
                        onClick={() => handleSolveAlertInChat(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#14273A] text-white hover:bg-[#1E364E] font-bold text-xs transition shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-[#E8B422]" />
                        <span>Solve with Director</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {alert.targetTab && (
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateTab(alert.targetTab!);
                            }}
                            className="px-2.5 py-1.5 rounded-md border border-[#CBD4CD] bg-white hover:border-[#14273A] text-[#14273A] font-semibold text-[11px] transition flex items-center gap-1"
                          >
                            <span>Open {alert.targetTab.toUpperCase()}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#5A6B7A]" />
                          </button>
                        )}

                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-2 py-1.5 rounded-md text-emerald-800 hover:bg-emerald-50 text-[11px] font-bold transition flex items-center gap-0.5"
                          title="Mark task done"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
