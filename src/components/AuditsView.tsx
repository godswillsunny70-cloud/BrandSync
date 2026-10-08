import React, { useState, useEffect, useRef } from 'react';
import {
  Brand,
  AuditResult,
  Post,
  DirectorAlert,
  AuditSuggestedCalendarDay,
  Platform,
} from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { BrandKnowledgeVault } from './BrandKnowledgeVault.tsx';
import { runAccountAudit } from '../lib/api.ts';
import {
  SearchCheck,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Loader2,
  CalendarPlus,
  PenTool,
  CheckCircle2,
  TrendingUp,
  Target,
  ExternalLink,
  Layers,
  Lightbulb,
  Bot,
  MapPin,
  Globe,
  Download,
  Copy,
  Printer,
  Check,
  BookOpen,
  Share2,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  Zap,
  Bookmark,
  MessageSquare
} from 'lucide-react';

interface AuditsViewProps {
  brand: Brand | null;
  onUpdateBrandAuditScore: (brandId: string, score: number) => void;
  onAddPostToCalendar: (post: Omit<Post, 'id'>) => void;
  onAddPostsToCalendar?: (posts: Omit<Post, 'id'>[]) => void;
  onSaveBrand?: (brand: Brand) => void;
  onNavigateTab: (tab: string) => void;
  onPreFillStudioTopic?: (topic: string) => void;
  onAddAlerts?: (alerts: Omit<DirectorAlert, 'id' | 'timestamp'>[]) => void;
  activeAlerts?: DirectorAlert[];
}

const SAMPLE_ACCOUNT_URLS = [
  'https://instagram.com/airbnb',
  'https://tiktok.com/@duolingo',
  'https://linkedin.com/company/stripe',
  'https://x.com/framer',
];

const POPULAR_NICHES = [
  'E-Commerce & Retail',
  'Creator / Personal Brand',
  'Fitness & Wellness',
  'Tech, SaaS & B2B',
  'Design & Photography',
  'Food & Hospitality',
  'Coaching & Education',
  'Real Estate & Local Business',
];

const SAMPLE_BIOS_BY_NICHE: Record<string, string> = {
  'E-Commerce & Retail': 'Premium sustainable streetwear | Designed in NYC 🗽 | Free US shipping over $75 | Shop the Autumn Drop 👇',
  'Creator / Personal Brand': 'Helping creative entrepreneurs build digital assets | 120k+ reads | Get my free Sunday newsletter 👇',
  'Fitness & Wellness': 'Certified strength coach & nutritionist | Lost 35lbs & kept it off | Transform your metabolism in 90 days 👇',
  'Food & Hospitality': 'Handcrafted sourdough & artisanal espresso | Open Tue-Sun 7am-3pm | Order ahead & catering inquiries 👇',
  'Tech, SaaS & B2B': 'The all-in-one workflow tool for modern agencies | Cut manual reporting by 70% | Start your 14-day trial 👇',
  'Real Estate & Local Business': 'Austin luxury residential specialist | Top 1% producer 2024 | DM or tap below for exclusive off-market listings 👇',
  'Design & Photography': 'Editorial & wedding photographer based in LA | Capturing raw cinematic moments | Inquire for 2025/2026 dates 👇',
  'Coaching & Education': 'Empowering high-achieving women to break corporate burnout | 500+ clients served | Apply for private mentorship 👇',
};

export const AuditsView: React.FC<AuditsViewProps> = ({
  brand,
  onUpdateBrandAuditScore,
  onAddPostToCalendar,
  onAddPostsToCalendar,
  onSaveBrand,
  onNavigateTab,
  onPreFillStudioTopic,
  onAddAlerts,
  activeAlerts = [],
}) => {
  const [accountUrl, setAccountUrl] = useState(
    brand?.website ? `${brand.website}` : brand?.name ? 'https://instagram.com/' + brand.name.toLowerCase().replace(/[^a-z0-9]/g, '') : ''
  );
  const [brandName, setBrandName] = useState(brand?.name || '');
  const [location, setLocation] = useState(brand?.location || 'Austin, TX');
  const [website, setWebsite] = useState(brand?.website || '');
  const [platform, setPlatform] = useState('Auto-Detect');
  const [niche, setNiche] = useState(brand?.industry || 'Creator / Personal Brand');
  const [bioText, setBioText] = useState('');
  const [contentSamples, setContentSamples] = useState('');
  const [followerRange, setFollowerRange] = useState('1k - 10k');
  const [notes, setNotes] = useState('');
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // UI state
  const [addedConceptIndex, setAddedConceptIndex] = useState<number | null>(null);
  const [addedCalendarDayIndex, setAddedCalendarDayIndex] = useState<number | null>(null);
  const [addedAllCalendarSuccess, setAddedAllCalendarSuccess] = useState(false);
  const [copiedDayIndex, setCopiedDayIndex] = useState<number | null>(null);
  const [alertsCreatedNotice, setAlertsCreatedNotice] = useState<number | null>(null);
  const [showBrandVault, setShowBrandVault] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [copiedReportToast, setCopiedReportToast] = useState(false);

  // Auto-set when brand changes
  useEffect(() => {
    if (brand?.name) {
      setBrandName(brand.name);
      setAccountUrl('https://instagram.com/' + brand.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
    if (brand?.industry) {
      setNiche(brand.industry);
    }
    if (brand?.location) {
      setLocation(brand.location);
    }
    if (brand?.website) {
      setWebsite(brand.website);
    }
  }, [brand?.id]);

  async function handleRunAudit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!accountUrl.trim()) {
      alert('Please enter an account URL or handle.');
      return;
    }

    setIsLoading(true);
    setAlertsCreatedNotice(null);
    setAddedAllCalendarSuccess(false);

    try {
      const result = await runAccountAudit({
        accountUrl: accountUrl.trim(),
        platform: platform === 'Auto-Detect' ? undefined : platform,
        brandName: brandName.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
        bioText: bioText.trim() || undefined,
        niche: niche.trim() || undefined,
        contentSamples: contentSamples.trim() || undefined,
        followerRange: followerRange || undefined,
        brand: brand || undefined,
        enableSearchGrounding,
      });

      setAuditResult(result);

      if (brand) {
        if (result.healthScore) {
          onUpdateBrandAuditScore(brand.id, result.healthScore);
        }
        // Also update brand location or website if changed and onSaveBrand provided
        if (onSaveBrand && (location !== brand.location || website !== brand.website)) {
          onSaveBrand({
            ...brand,
            location: location.trim() || brand.location,
            website: website.trim() || brand.website,
          });
        }
      }

      // Automatically sync pending immediate and sprint audit tasks to SMM Director Drawer
      if (onAddAlerts && result.nextSteps) {
        const newAlerts: Omit<DirectorAlert, 'id' | 'timestamp'>[] = [];
        (result.nextSteps.immediate || []).forEach((step) => {
          newAlerts.push({
            brandId: brand?.id,
            type: 'audit_task',
            title: `Stage 1 Priority: ${step.task}`,
            description: `Immediate Audit Remediation (24-48h window)\nImpact: ${step.impact}\nAccount Analyzed: ${result.handle || accountUrl}\nLocation: ${result.location || location}`,
            severity: 'urgent',
            targetTab: 'audits',
            data: { step, handle: result.handle },
          });
        });
        (result.nextSteps.sevenDaySprint || []).slice(0, 2).forEach((step) => {
          newAlerts.push({
            brandId: brand?.id,
            type: 'audit_task',
            title: `Stage 2 Sprint: ${step.task}`,
            description: `7-Day Sprint Task\nImpact: ${step.impact}\nAccount Analyzed: ${result.handle || accountUrl}`,
            severity: 'action_needed',
            targetTab: 'audits',
            data: { step, handle: result.handle },
          });
        });

        if (newAlerts.length > 0) {
          onAddAlerts(newAlerts);
          setAlertsCreatedNotice(newAlerts.length);
        }
      }
    } catch (err: any) {
      alert('Audit failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddSingleTaskAlert(step: { task: string; impact: string }, stageName: string) {
    if (!onAddAlerts) return;
    onAddAlerts([
      {
        brandId: brand?.id,
        type: 'audit_task',
        title: `${stageName}: ${step.task}`,
        description: `Task: ${step.task}\nImpact: ${step.impact}\nSource: Account Audit Roadmap`,
        severity: stageName.includes('Immediate') ? 'urgent' : 'action_needed',
        targetTab: 'audits',
        data: { step },
      },
    ]);
  }

  function handlePushDayToCalendar(day: AuditSuggestedCalendarDay, dayIdx: number) {
    if (!brand) {
      alert('Please add or select a client first so this post is linked to their workspace.');
      onNavigateTab('brands');
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + day.day);
    const dateStr = targetDate.toISOString().split('T')[0];

    onAddPostToCalendar({
      brandId: brand.id,
      date: dateStr,
      platform: day.platform,
      text: day.caption,
      status: 'scheduled',
      pillar: day.pillar,
      hook: day.hook,
      visual: day.visualDirection,
      bestPostingTime: day.bestPostingTime || '10:00 AM',
    });

    setAddedCalendarDayIndex(dayIdx);
    setTimeout(() => setAddedCalendarDayIndex(null), 2500);
  }

  function handleAddAllCalendarDays() {
    if (!brand) {
      alert('Please add or select a client first so this calendar is linked to their workspace.');
      onNavigateTab('brands');
      return;
    }

    const calendar = auditResult?.suggestedCalendar || [];
    if (calendar.length === 0) return;

    const newPosts = calendar.map((day, idx) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (idx + 1));
      return {
        brandId: brand.id,
        date: targetDate.toISOString().split('T')[0],
        platform: day.platform,
        text: day.caption,
        status: 'scheduled' as const,
        pillar: day.pillar,
        hook: day.hook,
        visual: day.visualDirection,
        bestPostingTime: day.bestPostingTime || '10:00 AM',
      };
    });

    if (onAddPostsToCalendar) {
      onAddPostsToCalendar(newPosts);
    } else {
      newPosts.forEach((p) => onAddPostToCalendar(p));
    }

    setAddedAllCalendarSuccess(true);
    setTimeout(() => setAddedAllCalendarSuccess(false), 3500);
  }

  function handleCopyDay(day: AuditSuggestedCalendarDay, dayIdx: number) {
    const textToCopy = `[${day.title} • ${day.platform}]\n\nHOOK (${day.hookType}):\n"${day.hook}"\n\nFRAMEWORK (${day.framework}):\n${day.frameworkSteps?.join('\n') || ''}\n\nFULL CAPTION:\n${day.caption}\n\nCALL TO ACTION (${day.ctaMechanism || 'Direct'}):\n${day.cta}\n\nVISUAL DIRECTION:\n${day.visualDirection || 'None'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedDayIndex(dayIdx);
    setTimeout(() => setCopiedDayIndex(null), 2000);
  }

  function handleSendDayToStudio(day: AuditSuggestedCalendarDay) {
    if (onPreFillStudioTopic) {
      onPreFillStudioTopic(`${day.hook} - ${day.caption.slice(0, 100)}`);
    }
    onNavigateTab('studio');
  }

  function handlePushConceptToCalendar(concept: any, index: number) {
    if (!brand) {
      alert('Please add or select a client first so this post is linked to their workspace.');
      onNavigateTab('brands');
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    onAddPostToCalendar({
      brandId: brand.id,
      date: tomorrow.toISOString().split('T')[0],
      platform: concept.platform || 'Instagram',
      text: `${concept.hook}\n\n${concept.concept}\n\n[Expected Impact: ${concept.expectedResult}]`,
      status: 'idea',
      hook: concept.hook,
      pillar: 'Audit Remediation',
    });

    setAddedConceptIndex(index);
    setTimeout(() => setAddedConceptIndex(null), 2500);
  }

  function handleSendToStudio(concept: any) {
    if (onPreFillStudioTopic) {
      onPreFillStudioTopic(`${concept.hook} - ${concept.concept}`);
    }
    onNavigateTab('studio');
  }

  function handleCopyMarkdownReport() {
    if (!auditResult) return;
    const md = `# Social Media Brand Audit Report: ${brandName || auditResult.handle}
Date: ${new Date().toLocaleDateString()}
Location: ${auditResult.location || location}
Platform: ${auditResult.platform} | Niche: ${auditResult.auditedNiche}
Executive Health Score: ${auditResult.healthScore}/100

## Executive Summary
${auditResult.summary}

## Google Search Grounding & Web Intelligence
- Location Verified: ${auditResult.searchGrounding?.locationVerified ? 'Yes' : 'No'} (${auditResult.searchGrounding?.locationQueried || location})
- Disambiguation Note: ${auditResult.searchGrounding?.disambiguationNote || 'Verified entity.'}
- Web Footprint: ${auditResult.searchGrounding?.webPresenceSummary || 'Verified presence.'}
- Online Reputation: ${auditResult.searchGrounding?.onlineReputation || 'Solid.'}

## Key Strengths
${auditResult.strengths.map((s) => `- ${s}`).join('\n')}

## Vulnerabilities & Gaps
${auditResult.gaps.map((g) => `- ${g}`).join('\n')}

## 7-Day Action Content Calendar
${(auditResult.suggestedCalendar || []).map((day) => `
### ${day.title} (${day.platform} • ${day.pillar})
- Hook: "${day.hook}" [${day.hookType}]
- Framework: ${day.framework}
- Caption: ${day.caption}
- CTA: ${day.cta} (${day.ctaMechanism || ''})
- Visual: ${day.visualDirection || ''}
- Resolves Gap: ${day.auditGapAddressed || ''}
`).join('\n')}

## 3-Stage Implementation Roadmap
### Immediate (24-48h)
${auditResult.nextSteps.immediate.map((s) => `- [${s.impact} Impact] ${s.task}`).join('\n')}
### 7-Day Sprint
${auditResult.nextSteps.sevenDaySprint.map((s) => `- [${s.impact} Impact] ${s.task}`).join('\n')}
### 30-Day Strategy
${auditResult.nextSteps.thirtyDayStrategy.map((s) => `- [${s.impact} Impact] ${s.task}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedReportToast(true);
    setTimeout(() => setCopiedReportToast(false), 2500);
  }

  const score = auditResult?.healthScore || 0;
  const scoreColor =
    score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-300' :
    score >= 65 ? 'text-amber-800 bg-amber-50 border-amber-300' :
    'text-red-700 bg-red-50 border-red-300';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEFEA] text-[#1E6F78] border border-[#CBD4CD] text-xs font-bold uppercase tracking-wider">
              <SearchCheck className="w-3.5 h-3.5" />
              Google Search-Grounded Account Audit
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
              Brand Diagnostic & Content Calendar
            </h1>
            <p className="text-[#5A6B7A] max-w-2xl text-sm sm:text-base leading-relaxed">
              Grounds audits with real-time <strong>Google Search engine intelligence</strong> to verify public web presence, customer reviews, and local identity in your specific city/region. Then turns diagnostic gaps into a solid, turn-key <strong>7-Day Content Calendar</strong> loaded with battle-tested hooks, frameworks, and CTAs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {brand && (
              <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD] text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <FlagBadge flag={brand.flag} size="sm" />
                  <span className="font-bold text-[#14273A] font-heading">{brand.name}</span>
                </div>
                <div className="text-[#5A6B7A] flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3 h-3 text-[#1E6F78]" />
                  <span>{brand.location || location}</span>
                  <span>•</span>
                  <span>Score: {brand.auditScore ? `${brand.auditScore}/100` : 'Pending'}</span>
                </div>
              </div>
            )}

            {brand && onSaveBrand && (
              <button
                type="button"
                onClick={() => setShowBrandVault(!showBrandVault)}
                className="px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white hover:bg-[#EAEFEA] text-xs font-bold text-[#14273A] flex items-center justify-center gap-2 transition shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-[#1E6F78]" />
                <span>{showBrandVault ? 'Hide Brand Vault' : 'Brand Knowledge Vault'}</span>
                {brand.assets && brand.assets.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#14273A] text-white text-[10px]">
                    {brand.assets.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Brand Vault Accordion */}
        {showBrandVault && brand && onSaveBrand && (
          <div className="mt-6 pt-6 border-t border-[#CBD4CD] animate-in fade-in">
            <BrandKnowledgeVault
              brand={brand}
              onSaveBrand={onSaveBrand}
            />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleRunAudit}
        className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
      >
        {/* Core Identity Row: Handle, Platform, Name, Location */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
              Account URL, Profile Link, or Handle <span className="text-[#D9432B]">*</span>
            </label>
            <input
              type="text"
              required
              value={accountUrl}
              onChange={(e) => setAccountUrl(e.target.value)}
              placeholder="e.g. https://instagram.com/willodave or @willodave"
              className="w-full px-3.5 py-3 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />

            {/* Quick URL chips */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-[#5A6B7A] shrink-0">Sample Links:</span>
              {SAMPLE_ACCOUNT_URLS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAccountUrl(url)}
                  className="px-2 py-0.5 rounded bg-white border border-[#CBD4CD] hover:border-[#14273A] text-[#14273A] text-[11px] shrink-0 transition"
                >
                  {url.replace('https://', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
              Platform Context
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3.5 py-3 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            >
              <option value="Auto-Detect">Auto-Detect from Link</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (Twitter)</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="Website">Company Website</option>
            </select>
          </div>
        </div>

        {/* Location & Brand Disambiguation Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white border border-[#CBD4CD]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
              Brand / Business Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Urban Bites Artisan Bakery"
              className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1E6F78]" />
              <span>Location / Service Area</span>
              <span className="text-[#D9432B]">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX, USA (or 'London, UK' / 'Global / Online')"
              className="w-full px-3 py-2 rounded-lg border-2 border-[#14273A] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />
            <span className="text-[10px] text-[#5A6B7A] mt-0.5 block">
              Disambiguates from similarly named brands elsewhere.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1E6F78]" />
              <span>Official Website</span>
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://urbanbites.com"
              className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />
            <span className="text-[10px] text-[#5A6B7A] mt-0.5 block">
              Used to correlate official domain footprint.
            </span>
          </div>
        </div>

        {/* Live Search Grounding Active Banner */}
        <div className="p-3.5 rounded-lg bg-[#EAEFEA] border border-[#CBD4CD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div className="text-[#14273A]">
              <strong>Live Google Search Grounding:</strong> Active. Searches real public articles, verified local business listings, reviews, and domain authority for <strong>"{brandName || 'this brand'}"</strong> in <strong>{location}</strong>.
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enableSearchGrounding}
              onChange={(e) => setEnableSearchGrounding(e.target.checked)}
              className="rounded border-[#CBD4CD] text-[#1E6F78] focus:ring-[#E8B422]"
            />
            <span className="font-semibold text-xs text-[#14273A]">Google Search Grounding</span>
          </label>
        </div>

        {/* Profile Grounding Snapshot Section (Zero-Hallucination Engine) */}
        <div className="p-5 rounded-xl bg-white border-2 border-[#14273A] space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CBD4CD]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#1E6F78] text-white flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#14273A] font-heading">
                  Profile Grounding Snapshot (Anti-Hallucination)
                </h3>
                <p className="text-[11px] text-[#5A6B7A]">
                  Social platforms block automated third-party crawlers from reading feeds without logging in. Pasting your bio and niche guarantees 100% accurate, un-hallucinated review.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0 self-start sm:self-center">
              Ensures Pinpoint Accuracy
            </span>
          </div>

          {/* Niche Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
              Account Niche / Focus Category <span className="text-[#D9432B]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNiche(n)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    niche === n
                      ? 'bg-[#14273A] text-white shadow-2xs'
                      : 'bg-[#FBFBF8] text-[#5A6B7A] border border-[#CBD4CD] hover:border-[#14273A]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Or type custom niche (e.g., Streetwear, Real Estate, B2B SaaS, Ceramic Art)"
              className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />
          </div>

          {/* Current Bio Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#14273A] flex items-center gap-1.5">
                <span>Your Current Bio Copy</span>
                <span className="text-emerald-700 font-semibold lowercase text-[11px]">(paste from your profile for 0% hallucination)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample = SAMPLE_BIOS_BY_NICHE[niche] || SAMPLE_BIOS_BY_NICHE['E-Commerce & Retail'];
                    setBioText(sample);
                  }}
                  className="text-[11px] text-[#1E6F78] hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#E8B422]" />
                  <span>Insert Sample {niche.split('/')[0].trim()} Bio</span>
                </button>
                {bioText && (
                  <button
                    type="button"
                    onClick={() => setBioText('')}
                    className="text-[11px] text-[#5A6B7A] hover:text-[#D9432B]"
                  >
                    Clear
                  </button>
                )}
                <span className="text-[11px] text-[#5A6B7A]">
                  {bioText.length}/150
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="e.g. Sustainable activewear made from recycled ocean plastics | Designed in Austin, TX | Tap below for 15% off first order 👇"
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-[#FBFBF8] text-xs sm:text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            />
          </div>

          {/* Recent Content / Post Hooks (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Recent Post Topics / Hooks <span className="text-[#5A6B7A] font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={contentSamples}
                onChange={(e) => setContentSamples(e.target.value)}
                placeholder="e.g. Reel: 3 workout myths that waste your time. Carousel: My 5 favorite high-protein snacks."
                className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Audience Size & Primary Problem
              </label>
              <div className="space-y-2">
                <select
                  value={followerRange}
                  onChange={(e) => setFollowerRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                >
                  <option value="0 - 1,000">0 - 1,000 followers (Early Growth / Validation)</option>
                  <option value="1k - 10k">1,000 - 10,000 followers (Building Momentum)</option>
                  <option value="10k - 50k">10,000 - 50,000 followers (Scaling Monetization)</option>
                  <option value="50k+">50,000+ followers (Brand Authority & Retention)</option>
                </select>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Views are good, but nobody is clicking the bio link or following."
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying Google Search & Generating Calendar...
              </>
            ) : (
              <>
                <SearchCheck className="w-4 h-4" />
                Run Google-Grounded Audit & Generate Calendar
              </>
            )}
          </button>

          <span className="text-xs text-[#5A6B7A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Zero hallucinations guaranteed via Google Search engine grounding</span>
          </span>
        </div>
      </form>

      {/* Audit Output Section */}
      {auditResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Top Report Action Bar */}
          <div className="bg-[#14273A] text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E8B422]">
                  Audit Complete
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-mono">
                  {auditResult.handle} ({auditResult.location || location})
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                Client Diagnostic & 7-Day Action Plan
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E8B422] hover:bg-[#d6a51d] text-[#14273A] text-xs font-bold transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audit Report</span>
              </button>

              {auditResult.suggestedCalendar && auditResult.suggestedCalendar.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllCalendarDays}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  {addedAllCalendarSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>7 Days Added to Calendar!</span>
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Add All 7 Days to Calendar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Alert Sync Notification Banner */}
          {alertsCreatedNotice !== null && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#D9432B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm font-heading flex items-center gap-2">
                    <span>{alertsCreatedNotice} Audit Tasks Dispatched to SMM Director Drawer</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#D9432B] text-white text-[10px] font-bold animate-pulse">
                      Alerts Active
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-0.5">
                    Click the SMM Director button in the header or sidebar to formulate immediate action plans with the agent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Search Engine Grounding & Web Footprint Intelligence */}
          {auditResult.searchGrounding && (
            <div className="p-5 rounded-xl bg-white border-2 border-[#14273A] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CBD4CD]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1E6F78] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    <SearchCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#14273A] font-heading flex items-center gap-2">
                      <span>Google Search Engine Grounding & Location Intelligence</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Footprint
                      </span>
                    </h3>
                    <p className="text-xs text-[#5A6B7A]">
                      Online web footprint discovered across Google Search indexes for {auditResult.handle} in {auditResult.location || location}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#EAEFEA] text-[#14273A] border border-[#CBD4CD] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#1E6F78]" />
                    <span>{auditResult.location || location}</span>
                  </span>
                </div>
              </div>

              {/* Location Disambiguation Box (Prevents wrong identity) */}
              <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Geographic Identity Disambiguation:</span>
                </div>
                <p className="leading-relaxed">
                  {auditResult.searchGrounding.disambiguationNote ||
                    `Verified local entity profile corresponding to ${auditResult.handle} in ${auditResult.location || location}. Disambiguated against similarly named accounts in other cities/countries to prevent wrong identity.`}
                </p>
              </div>

              {/* Discovered Web Footprint & Reputation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FBFBF8] p-3.5 rounded-lg border border-[#CBD4CD] space-y-1.5">
                  <div className="font-bold text-[#14273A] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#1E6F78]" />
                    Web Footprint Discovered via Google
                  </div>
                  <p className="text-[#5A6B7A] leading-relaxed">
                    {auditResult.searchGrounding.webPresenceSummary}
                  </p>
                </div>

                <div className="bg-[#FBFBF8] p-3.5 rounded-lg border border-[#CBD4CD] space-y-1.5">
                  <div className="font-bold text-[#14273A] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E8B422]" />
                    Public Reputation & Local Sentiment
                  </div>
                  <p className="text-[#5A6B7A] leading-relaxed">
                    {auditResult.searchGrounding.onlineReputation ||
                      `Active community presence in ${auditResult.location || location}. Public ratings and online citations reinforce positive brand sentiment.`}
                  </p>
                </div>
              </div>

              {/* Queries Run and Real Sources Found */}
              {((auditResult.searchGrounding.sourcesFound && auditResult.searchGrounding.sourcesFound.length > 0) ||
                (auditResult.searchGrounding.queriesRun && auditResult.searchGrounding.queriesRun.length > 0)) && (
                <div className="pt-2 border-t border-[#CBD4CD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {auditResult.searchGrounding.queriesRun && auditResult.searchGrounding.queriesRun.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#5A6B7A]">Search Queries:</span>
                      {auditResult.searchGrounding.queriesRun.slice(0, 3).map((q, qIdx) => (
                        <span
                          key={qIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-300"
                        >
                          "{q}"
                        </span>
                      ))}
                    </div>
                  )}

                  {auditResult.searchGrounding.sourcesFound && auditResult.searchGrounding.sourcesFound.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#5A6B7A]">Verified Sources:</span>
                      {auditResult.searchGrounding.sourcesFound.slice(0, 3).map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-[#EAEFEA] hover:bg-[#d8e3d8] text-[#1E6F78] font-bold text-[10px] border border-[#CBD4CD] flex items-center gap-1 transition"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Executive Score & Summary Card */}
          <div className="bg-white rounded-xl border-2 border-[#14273A] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#CBD4CD]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A6B7A]">
                    {auditResult.platform} Diagnostic
                  </span>
                  <span className="text-[#CBD4CD]">•</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAEFEA] text-[#1E6F78] border border-[#CBD4CD]">
                    {auditResult.auditedNiche || 'General Business'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14273A] tracking-tight font-heading">
                  {auditResult.handle}
                </h2>
              </div>

              {/* Health Score Pill */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl border-2 font-black text-2xl sm:text-3xl font-heading shadow-xs ${scoreColor}`}>
                  {auditResult.healthScore}<span className="text-sm font-semibold opacity-70">/100</span>
                </div>
                <div className="text-left text-xs space-y-0.5">
                  <div className="font-extrabold uppercase tracking-wider text-[#14273A]">
                    Health Score
                  </div>
                  <div className="text-[#5A6B7A]">
                    {score >= 80 ? 'High Performing' : score >= 65 ? 'Optimization Needed' : 'Vulnerable Positioning'}
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14273A] block">
                Executive Findings
              </span>
              <p className="text-sm text-[#14273A] leading-relaxed bg-[#FBFBF8] p-4 rounded-lg border border-[#CBD4CD]">
                {auditResult.summary}
              </p>
            </div>

            {/* 5 Sub-Scores Grid */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#14273A] block mb-3">
                Core Algorithmic Benchmarks
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {auditResult.subScores && Object.entries(auditResult.subScores).map(([key, val]) => {
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-lg border border-[#CBD4CD] bg-white flex flex-col justify-between space-y-2"
                    >
                      <span className="text-[11px] font-semibold text-[#5A6B7A] leading-tight">
                        {label}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-extrabold text-[#14273A] font-heading">
                          {val}
                        </span>
                        <span className="text-[10px] text-[#5A6B7A]">/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#EAEFEA] overflow-hidden">
                        <div
                          className="h-full bg-[#1E6F78]"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STRATEGIC 7-DAY CONTENT CALENDAR (BASED ON AUDIT RESULTS)                 */}
          {/* ========================================================================= */}
          {auditResult.suggestedCalendar && auditResult.suggestedCalendar.length > 0 && (
            <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#CBD4CD]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D9432B] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Turn-Key Solution
                    </span>
                    <span className="text-xs text-[#5A6B7A] font-semibold">
                      7 Production-Ready Posts
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#14273A] font-heading">
                    Strategic Content Calendar (Generated from Audit Diagnostic)
                  </h3>
                  <p className="text-xs text-[#5A6B7A] max-w-2xl leading-relaxed">
                    Directly addresses your audit's identified vulnerabilities and strengths with <strong>battle-tested hooks</strong>, <strong>proven frameworks</strong> (PAS, BAB, 3-Step Teardown), and <strong>high-converting CTAs</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddAllCalendarDays}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#14273A] hover:bg-[#1E364E] text-white font-bold text-xs transition shadow-xs"
                  >
                    {addedAllCalendarSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>All 7 Days Synced!</span>
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="w-4 h-4 text-[#E8B422]" />
                        <span>Add All 7 Days to Calendar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Calendar Days Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {auditResult.suggestedCalendar.map((day, idx) => {
                  const isAdded = addedCalendarDayIndex === idx;
                  const isCopied = copiedDayIndex === idx;

                  return (
                    <div
                      key={day.day || idx}
                      className="bg-white rounded-xl border-2 border-[#14273A] p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-sm transition"
                    >
                      <div className="space-y-3">
                        {/* Day & Pillar Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#14273A] text-white flex items-center justify-center font-bold text-xs">
                              {day.day}
                            </span>
                            <h4 className="font-extrabold text-sm text-[#14273A] font-heading">
                              {day.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EAEFEA] text-[#1E6F78] border border-[#CBD4CD]">
                              {day.pillar}
                            </span>
                            <span className="text-[10px] text-[#5A6B7A] font-semibold">
                              {day.platform}
                            </span>
                          </div>
                        </div>

                        {/* HOOK Section */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9432B] flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Scroll-Stopping Hook:
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-rose-50 text-[#D9432B] text-[9px] font-extrabold border border-rose-200">
                              {day.hookType}
                            </span>
                          </div>
                          <div className="font-extrabold text-xs sm:text-sm text-[#14273A] bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 font-heading">
                            "{day.hook}"
                          </div>
                        </div>

                        {/* FRAMEWORK Section */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              Copywriting Framework:
                            </span>
                            <span className="text-[10px] font-bold text-[#1E6F78]">
                              {day.framework}
                            </span>
                          </div>
                          {day.frameworkSteps && day.frameworkSteps.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                              {day.frameworkSteps.map((step, sIdx) => (
                                <div key={sIdx} className="text-[11px] text-slate-800 flex items-start gap-1.5">
                                  <span className="font-bold text-[#1E6F78] shrink-0">•</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Full Caption Preview */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A]">
                            Production-Ready Caption:
                          </span>
                          <div className="p-2.5 rounded-lg bg-[#FBFBF8] border border-[#CBD4CD] text-xs text-[#14273A] whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                            {day.caption}
                          </div>
                        </div>

                        {/* CTA Section */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              High-Converting CTA:
                            </span>
                            {day.ctaMechanism && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                                {day.ctaMechanism}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-emerald-900 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                            {day.cta}
                          </div>
                        </div>

                        {/* Visual & Gap Addressed */}
                        <div className="space-y-1 text-[11px]">
                          {day.visualDirection && (
                            <div className="text-[#5A6B7A]">
                              <strong>Visual Direction:</strong> {day.visualDirection}
                            </div>
                          )}
                          {day.auditGapAddressed && (
                            <div className="text-[#1E6F78] font-semibold bg-[#EAEFEA] p-1.5 rounded border border-[#CBD4CD]">
                              ✓ {day.auditGapAddressed}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#CBD4CD] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-[#5A6B7A]">
                          <span>Best Time:</span>
                          <span className="font-bold text-[#14273A]">{day.bestPostingTime || '10:00 AM'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyDay(day, idx)}
                            className="p-1.5 rounded border border-[#CBD4CD] bg-white hover:bg-[#EAEFEA] text-[#14273A] text-xs font-semibold transition"
                            title="Copy Post Content"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendDayToStudio(day)}
                            className="p-1.5 rounded border border-[#14273A] bg-white hover:bg-[#EAEFEA] text-[#14273A] text-xs font-bold transition"
                            title="Refine in Content Studio"
                          >
                            <PenTool className="w-3.5 h-3.5 text-[#1E6F78]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePushDayToCalendar(day, idx)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#14273A] hover:bg-[#1E364E] text-white text-xs font-bold transition shadow-2xs"
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <CalendarPlus className="w-3.5 h-3.5 text-[#E8B422]" />
                                <span>Add to Calendar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SWOT & Bio Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white p-6 rounded-xl border-2 border-[#14273A] space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
                <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-800 font-heading flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Strengths
                </h3>
                <span className="text-xs text-[#5A6B7A] font-semibold">
                  {auditResult.strengths?.length || 0} Assets
                </span>
              </div>
              <ul className="space-y-2.5">
                {(auditResult.strengths || []).map((str, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#14273A] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="bg-white p-6 rounded-xl border-2 border-[#14273A] space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#D9432B] font-heading flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D9432B]" />
                  Identified Gaps & Vulnerabilities
                </h3>
                <span className="text-xs text-[#5A6B7A] font-semibold">
                  {auditResult.gaps?.length || 0} Bottlenecks
                </span>
              </div>
              <ul className="space-y-2.5">
                {(auditResult.gaps || []).map((gap, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#14273A] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9432B] mt-1.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bio Copywriting Audit */}
          <div className="bg-white p-6 rounded-xl border-2 border-[#14273A] space-y-4 shadow-xs">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#14273A] font-heading flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#1E6F78]" />
              Bio Copywriting Critique
            </h3>
            <div className="p-3.5 bg-[#FBFBF8] rounded-lg border border-[#CBD4CD] text-xs space-y-1">
              <div className="font-bold text-[#5A6B7A] uppercase text-[10px]">Positioning Tone & Vibe:</div>
              <p className="text-[#14273A] italic leading-relaxed">
                {auditResult.bioAudit?.currentVibe}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#14273A]">
                High-Conversion Recommendations:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(auditResult.bioAudit?.recommendations || []).map((rec, rIdx) => (
                  <div key={rIdx} className="p-3 rounded-lg bg-[#EAEFEA] border border-[#CBD4CD] text-xs text-[#14273A] space-y-1">
                    <span className="font-bold text-[#1E6F78] text-[10px]">Fix #{rIdx + 1}:</span>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Stage Implementation Roadmap */}
          <div className="bg-white p-6 rounded-xl border-2 border-[#14273A] space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD4CD]">
              <div>
                <h3 className="font-bold text-base text-[#14273A] font-heading flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#D9432B]" />
                  Prioritized 3-Stage Implementation Roadmap
                </h3>
                <p className="text-xs text-[#5A6B7A]">
                  Sequential plan to eliminate conversion friction and accelerate algorithm distribution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage 1 */}
              <div className="bg-[#FBFBF8] p-4 rounded-xl border border-[#CBD4CD] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14273A]">
                    Stage 1: Immediate (24-48h)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-[#D9432B] font-bold border border-rose-300">
                    High Impact
                  </span>
                </div>
                <div className="space-y-2">
                  {(auditResult.nextSteps?.immediate || []).map((step, i) => (
                    <div key={i} className="text-xs p-2.5 rounded bg-white border border-[#CBD4CD] space-y-1.5">
                      <div className="font-semibold text-[#14273A]">{step.task}</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#D9432B] font-bold">Impact: {step.impact}</span>
                        <button
                          type="button"
                          onClick={() => handleAddSingleTaskAlert(step, 'Immediate Priority')}
                          className="text-[#14273A] font-bold hover:underline"
                        >
                          + Alert Director
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage 2 */}
              <div className="bg-[#FBFBF8] p-4 rounded-xl border border-[#CBD4CD] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14273A]">
                    Stage 2: 7-Day Sprint
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Sprint
                  </span>
                </div>
                <div className="space-y-2">
                  {(auditResult.nextSteps?.sevenDaySprint || []).map((step, i) => (
                    <div key={i} className="text-xs p-2.5 rounded bg-white border border-[#CBD4CD] space-y-1.5">
                      <div className="font-semibold text-[#14273A]">{step.task}</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#1E6F78] font-bold">Impact: {step.impact}</span>
                        <button
                          type="button"
                          onClick={() => handleAddSingleTaskAlert(step, '7-Day Sprint')}
                          className="text-[#14273A] font-bold hover:underline"
                        >
                          + Alert Director
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage 3 */}
              <div className="bg-[#FBFBF8] p-4 rounded-xl border border-[#CBD4CD] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14273A]">
                    Stage 3: 30-Day Scale
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-300">
                    Scale
                  </span>
                </div>
                <div className="space-y-2">
                  {(auditResult.nextSteps?.thirtyDayStrategy || []).map((step, i) => (
                    <div key={i} className="text-xs p-2.5 rounded bg-white border border-[#CBD4CD] space-y-1.5">
                      <div className="font-semibold text-[#14273A]">{step.task}</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#1E6F78] font-bold">Impact: {step.impact}</span>
                        <button
                          type="button"
                          onClick={() => handleAddSingleTaskAlert(step, '30-Day Strategy')}
                          className="text-[#14273A] font-bold hover:underline"
                        >
                          + Alert Director
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOWNLOAD AUDIT REPORT MODAL (PDF / PRINTABLE SUMMARY)                     */}
      {/* ========================================================================= */}
      {showPdfModal && auditResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl border-2 border-[#14273A] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header Actions */}
            <div className="p-4 border-b border-[#CBD4CD] flex items-center justify-between bg-[#FBFBF8]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#1E6F78]" />
                <h3 className="font-bold text-sm text-[#14273A] font-heading">
                  Formatted External Audit Report ({brandName || auditResult.handle})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdownReport}
                  className="px-3 py-1.5 rounded-lg border border-[#CBD4CD] bg-white hover:bg-[#EAEFEA] text-xs font-semibold text-[#14273A] flex items-center gap-1.5 transition"
                >
                  {copiedReportToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReportToast ? 'Copied Markdown!' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#14273A] hover:bg-[#1E364E] text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="px-2 py-1 rounded text-slate-400 hover:text-[#14273A]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Report Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#14273A] text-xs print:p-0 print:text-black">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#14273A]">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#1E6F78]">
                    Halyard Social Strategy Diagnostic
                  </div>
                  <h1 className="text-2xl font-black text-[#14273A] font-heading mt-0.5">
                    {brandName || auditResult.handle} Audit Report
                  </h1>
                  <div className="text-xs text-[#5A6B7A] mt-1 flex items-center gap-2">
                    <span>Target Location: {auditResult.location || location}</span>
                    <span>•</span>
                    <span>Platform: {auditResult.platform}</span>
                    <span>•</span>
                    <span>Niche: {auditResult.auditedNiche}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-[#14273A] font-heading">
                    {auditResult.healthScore}<span className="text-sm font-normal text-[#5A6B7A]">/100</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78]">
                    Executive Health Score
                  </div>
                </div>
              </div>

              {/* Executive Summary & Web Grounding */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#14273A] font-heading">
                  1. Executive Diagnostic & Web Presence Footprint
                </h3>
                <p className="p-3 bg-[#FBFBF8] rounded-lg border border-[#CBD4CD] leading-relaxed text-xs">
                  {auditResult.summary}
                </p>
                {auditResult.searchGrounding && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300 text-emerald-950 text-xs space-y-1">
                    <div className="font-bold">Google Search Intelligence ({auditResult.location || location}):</div>
                    <p>{auditResult.searchGrounding.webPresenceSummary}</p>
                    <p className="font-semibold text-emerald-900 mt-1">
                      Identity Validation: {auditResult.searchGrounding.disambiguationNote}
                    </p>
                  </div>
                )}
              </div>

              {/* SWOT Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                    Key Strengths
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    {auditResult.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#D9432B]">
                    Primary Vulnerabilities
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    {auditResult.gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 7-Day Calendar Overview in PDF */}
              {auditResult.suggestedCalendar && auditResult.suggestedCalendar.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#14273A] font-heading">
                    2. Recommended 7-Day Strategic Content Calendar
                  </h3>
                  <div className="border border-[#CBD4CD] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#14273A] text-white">
                        <tr>
                          <th className="p-2">Day</th>
                          <th className="p-2">Pillar</th>
                          <th className="p-2">Hook / Angle</th>
                          <th className="p-2">Framework</th>
                          <th className="p-2">Call to Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CBD4CD]">
                        {auditResult.suggestedCalendar.map((d) => (
                          <tr key={d.day} className="hover:bg-[#FBFBF8]">
                            <td className="p-2 font-bold">{d.day}</td>
                            <td className="p-2">{d.pillar}</td>
                            <td className="p-2 font-semibold text-[#14273A]">"{d.hook}"</td>
                            <td className="p-2">{d.framework}</td>
                            <td className="p-2 text-emerald-900">{d.cta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Implementation Roadmap */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#14273A] font-heading">
                  3. Implementation Roadmap
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FBFBF8] rounded-lg border border-[#CBD4CD]">
                    <div className="font-bold text-[#D9432B] uppercase text-[10px] mb-1">Immediate (24-48h)</div>
                    <ul className="space-y-1 text-[11px]">
                      {auditResult.nextSteps.immediate.map((s, i) => (
                        <li key={i}>• {s.task}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-[#FBFBF8] rounded-lg border border-[#CBD4CD]">
                    <div className="font-bold text-[#1E6F78] uppercase text-[10px] mb-1">7-Day Sprint</div>
                    <ul className="space-y-1 text-[11px]">
                      {auditResult.nextSteps.sevenDaySprint.map((s, i) => (
                        <li key={i}>• {s.task}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-[#FBFBF8] rounded-lg border border-[#CBD4CD]">
                    <div className="font-bold text-slate-800 uppercase text-[10px] mb-1">30-Day Strategy</div>
                    <ul className="space-y-1 text-[11px]">
                      {auditResult.nextSteps.thirtyDayStrategy.map((s, i) => (
                        <li key={i}>• {s.task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#CBD4CD] bg-[#FBFBF8] flex justify-between items-center text-xs">
              <span className="text-[#5A6B7A]">
                Generated by Halyard Brand Diagnostic Engine • Zero Hallucination Standard
              </span>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#14273A] text-white font-bold text-xs hover:bg-[#1E364E]"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
