import React, { useState } from 'react';
import { Brand, Platform, Post, StudioVersion, GeneratedAIVisual, VisualEngine, VisualFormat } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { generateStudioPosts, generateAIVisual } from '../lib/api.ts';
import { AIVisualGenerator } from './AIVisualGenerator.tsx';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  CalendarPlus,
  Loader2,
  RefreshCw,
  Lightbulb,
  Layers,
  ArrowRight,
  ShieldCheck,
  Target,
  Zap,
  Wand2,
  Film,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  RotateCcw
} from 'lucide-react';

interface StudioViewProps {
  brand: Brand | null;
  onAddPostToCalendar: (post: Omit<Post, 'id'>) => void;
  onNavigateTab: (tab: string) => void;
  preFillTopic?: string;
}

const GOALS = [
  'Drive Engagement & Discussion',
  'Build Niche Authority & Trust',
  'Product Conversion & Sales',
  'Announce Feature or Launch',
  'Educate with Actionable Value',
];

const FORMULAS = [
  { id: 'PAS (Problem, Agitate, Solution)', label: 'PAS (Problem, Agitate, Solution)' },
  { id: 'BAB (Before, After, Bridge)', label: 'BAB (Before, After, Bridge)' },
  { id: 'AIDA (Attention, Interest, Desire, Action)', label: 'AIDA (Attention, Interest, Desire, Action)' },
  { id: 'The 4 Ps (Promise, Picture, Proof, Push)', label: 'The 4 Ps (Promise, Picture, Proof, Push)' },
  { id: 'FAB (Feature, Advantage, Benefit)', label: 'FAB (Feature, Advantage, Benefit)' },
];

const ANGLES = [
  'Contrarian / Unpopular Truth',
  'Direct Pain & Agitation',
  'Identity & Transformation',
  'Curiosity & Blindspot',
  'Before / After Contrast',
];

const JOURNEY_STAGES = [
  'Awareness (Zero hard sell, reveal the problem)',
  'Consideration (Contrast mechanism & proof)',
  'Decision (Eliminate friction, 3-part CTA)',
];

const PROMPT_INSPIRATIONS = [
  'The one mistake almost everyone makes with customer retention',
  'Unpopular opinion: why standard industry advice is completely backward',
  'Stop guessing what to do: How to achieve the result without the usual headache',
  'Before vs After: What happened when we eliminated 50% of the friction',
  'Customer transformation: moving from stuck to predictable results',
];

export const StudioView: React.FC<StudioViewProps> = ({
  brand,
  onAddPostToCalendar,
  onNavigateTab,
  preFillTopic = '',
}) => {
  const [topic, setTopic] = useState(preFillTopic);
  const [goal, setGoal] = useState(GOALS[0]);
  const [formula, setFormula] = useState(FORMULAS[0].id);
  const [angle, setAngle] = useState(ANGLES[0]);
  const [journeyStage, setJourneyStage] = useState(JOURNEY_STAGES[1]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    brand?.platforms || ['Instagram', 'LinkedIn', 'X']
  );
  const [versionsCount, setVersionsCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<StudioVersion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [calendarDates, setCalendarDates] = useState<{ [key: number]: string }>({});
  const [addedSuccessIndex, setAddedSuccessIndex] = useState<number | null>(null);

  // AI Visual Studio Integration State (Nano Banana 2 & Omni 1.1)
  const [activeTabMode, setActiveTabMode] = useState<'copy' | 'visuals'>('copy');
  const [isGeneratingVisualForPost, setIsGeneratingVisualForPost] = useState<{ [key: number]: boolean }>({});
  const [activeCarouselSlideIndices, setActiveCarouselSlideIndices] = useState<{ [key: number]: number }>({});
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [modalPostTargetIndex, setModalPostTargetIndex] = useState<number | null>(null);

  async function handleQuickGenerateVisualForPost(
    index: number,
    engine: VisualEngine = 'nano-banana-2',
    format: VisualFormat = 'image'
  ) {
    const targetPost = generatedPosts[index];
    if (!targetPost || !brand) return;

    setIsGeneratingVisualForPost((prev) => ({ ...prev, [index]: true }));
    try {
      const visual = await generateAIVisual({
        engine,
        format,
        prompt: targetPost.hook || topic,
        hook: targetPost.hook,
        caption: targetPost.caption,
        brand,
        aspectRatio: targetPost.platform === 'Instagram' ? '4:5' : '1:1',
        stylePreset: engine === 'nano-banana-2' ? 'Vibrant 3D Render' : 'Minimalist Editorial',
      });

      setGeneratedPosts((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], visualAsset: visual };
        return updated;
      });
      setActiveCarouselSlideIndices((prev) => ({ ...prev, [index]: 0 }));
    } catch (err: any) {
      console.error('Failed to generate visual for post:', err);
      alert('Could not generate visual: ' + err.message);
    } finally {
      setIsGeneratingVisualForPost((prev) => ({ ...prev, [index]: false }));
    }
  }

  // Sync selected platforms and preFillTopic
  React.useEffect(() => {
    if (brand?.platforms) {
      setSelectedPlatforms(brand.platforms);
    }
  }, [brand?.id]);

  React.useEffect(() => {
    if (preFillTopic) {
      setTopic(preFillTopic);
    }
  }, [preFillTopic]);

  if (!brand) {
    return (
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-[#14273A] font-heading mb-2">
          Select or Create a Client First
        </h2>
        <p className="text-sm text-[#5A6B7A] mb-4">
          The Studio requires an active Brand Voice Vault to anchor vocabulary, tone, and guardrails.
        </p>
        <button
          onClick={() => onNavigateTab('brands')}
          className="px-4 py-2 rounded-lg bg-[#D9432B] text-white font-bold text-xs"
        >
          Open Brand Voice Vault
        </button>
      </div>
    );
  }

  function togglePlatform(p: Platform) {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  }

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!brand) return;
    if (!topic.trim()) {
      alert('Please describe what the post is about.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateStudioPosts({
        brand,
        topic,
        goal,
        platforms: selectedPlatforms,
        versionsCount,
        formula,
        angle,
        journeyStage,
      });
      setGeneratedPosts(res.posts || []);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const initialDates: { [key: number]: string } = {};
      (res.posts || []).forEach((_, idx) => {
        initialDates[idx] = tomorrowStr;
      });
      setCalendarDates(initialDates);
    } catch (err: any) {
      alert('Generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function handleAddToCalendar(postVersion: StudioVersion, index: number) {
    if (!brand) return;
    const targetDate = calendarDates[index] || new Date().toISOString().split('T')[0];
    const tags = (postVersion.hashtags || []).map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ');
    const fullText = `${postVersion.caption}${tags ? '\n\n' + tags : ''}`;

    onAddPostToCalendar({
      brandId: brand.id,
      date: targetDate,
      platform: postVersion.platform,
      text: fullText,
      status: 'draft',
      hook: postVersion.hook,
      visual: postVersion.visual,
      visualAsset: postVersion.visualAsset,
      pillar: goal,
    });

    setAddedSuccessIndex(index);
    setTimeout(() => setAddedSuccessIndex(null), 2500);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Studio Banner */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FlagBadge flag={brand.flag} size="md" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6F78]">
                {brand.name}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#14273A] text-white">
                Direct-Response Studio
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
              Content Studio & Hook Crafter
            </h1>
            <p className="text-[#5A6B7A] max-w-2xl text-sm leading-relaxed">
              Write scroll-stopping posts rooted in direct-response psychology: <strong>Features tell, benefits explain, outcomes sell</strong>. Zero fluff, 3-part CTAs, and native platform formatting.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-[#CBD4CD] text-xs shrink-0 max-w-xs space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
              Client Guardrails Active:
            </span>
            <p className="text-[#14273A] text-xs line-clamp-2">
              {brand.donts ? `Never: ${brand.donts}` : 'No AI clichés, no generic hype.'}
            </p>
            <div className="pt-1 border-t border-[#CBD4CD] text-[10px] text-[#1E6F78] font-bold">
              Voice: {brand.voice || 'Engaging & Authentic'}
            </div>
          </div>
        </div>

        {/* Mode Navigation Tabs: Copy & Hook Crafter vs AI Visual Studio */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#CBD4CD]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTabMode('copy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTabMode === 'copy'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'bg-white text-[#5A6B7A] border border-[#CBD4CD] hover:text-[#14273A]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Direct-Response Copy & Hooks
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode('visuals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTabMode === 'visuals'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'bg-white text-[#5A6B7A] border border-[#CBD4CD] hover:text-[#14273A]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[#E8B422]" />
              AI Visual & Motion Studio
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#E8B422] text-[#14273A]">
                Nano Banana 2 & Omni 1.1
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5A6B7A]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#14273A]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Neural Visual Engines Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* RENDER MODE: STANDALONE AI VISUAL STUDIO */}
      {activeTabMode === 'visuals' && (
        <AIVisualGenerator
          brand={brand}
          initialHook={topic || generatedPosts[0]?.hook || ''}
          initialCaption={generatedPosts[0]?.caption || ''}
          initialTopic={topic}
          isInline={true}
          onAttachVisualToPost={(visual) => {
            if (generatedPosts.length > 0) {
              setGeneratedPosts((prev) => {
                const updated = [...prev];
                updated[0] = { ...updated[0], visualAsset: visual };
                return updated;
              });
              alert('Attached visual asset to first post draft!');
              setActiveTabMode('copy');
            } else {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              onAddPostToCalendar({
                brandId: brand.id,
                date: tomorrow.toISOString().split('T')[0],
                platform: 'Instagram',
                text: `${visual.title}\n\n[Visual: ${visual.engineBadge}]`,
                status: 'draft',
                hook: visual.title,
                visual: visual.visualDirection,
                visualAsset: visual,
                pillar: goal,
              });
              alert('Scheduled visual asset as a Draft in your Content Calendar!');
            }
          }}
        />
      )}

      {/* RENDER MODE: DIRECT-RESPONSE COPY CRAFTER */}
      {activeTabMode === 'copy' && (
        <>
          {/* Generator Form */}
      <form
        onSubmit={handleGenerate}
        className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
      >
        {/* Topic Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
            What is this post about? <span className="text-[#D9432B]">*</span>
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Why most customer onboarding workflows drop off in the first 14 days and how we fix it"
            className="w-full px-3.5 py-3 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
          />

          {/* Prompt Inspirations */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-[#5A6B7A] shrink-0">Hook Templates:</span>
            {PROMPT_INSPIRATIONS.map((insp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTopic(insp)}
                className="px-2.5 py-1 rounded bg-white border border-[#CBD4CD] hover:border-[#14273A] text-[#14273A] text-[11px] shrink-0 transition"
              >
                {insp.slice(0, 45)}...
              </button>
            ))}
          </div>
        </div>

        {/* Masterclass Copywriting Architecture Bar */}
        <div className="p-4 rounded-xl bg-white border-2 border-[#14273A] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#CBD4CD]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#14273A]">
              <Target className="w-4 h-4 text-[#D9432B]" />
              <span>Copywriting Strategy (Sound Less Generic)</span>
            </div>
            <span className="text-[10px] font-bold text-[#1E6F78]">
              "A Copy That Changes Your Copywriting" Frameworks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Copy Formula */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Copy Formula
              </label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs font-semibold text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              >
                {FORMULAS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Creative Angle */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Strategic Angle
              </label>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs font-semibold text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              >
                {ANGLES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Journey Stage */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14273A] mb-1">
                Customer Stage
              </label>
              <select
                value={journeyStage}
                onChange={(e) => setJourneyStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs font-semibold text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              >
                {JOURNEY_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Goal and Variations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
              Business Pillar / Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
              Variations Per Platform
            </label>
            <select
              value={versionsCount}
              onChange={(e) => setVersionsCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
            >
              <option value={1}>1 High-Conviction Post</option>
              <option value={2}>2 A/B Hook Variations</option>
              <option value={3}>3 Diverse Angles</option>
            </select>
          </div>
        </div>

        {/* Target Platforms */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-2">
            Target Platforms to Write For
          </label>
          <div className="flex flex-wrap gap-2">
            {brand.platforms.map((p) => {
              const active = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                    active
                      ? 'bg-[#14273A] text-white border-[#14273A]'
                      : 'bg-white text-[#5A6B7A] border-[#CBD4CD] hover:border-[#14273A]'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Writing in {brand.name}'s Voice with {formula.split(' ')[0]}...
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                Generate Tailored Copy
              </>
            )}
          </button>

          <span className="text-xs text-[#5A6B7A] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Enforcing {brand.name}'s voice • "So What?" outcomes • 3-part CTAs</span>
          </span>
        </div>
      </form>

      {/* Output Post Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
            <span>Generated Copy Drafts</span>
            {generatedPosts.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#14273A] text-white">
                {generatedPosts.length}
              </span>
            )}
          </h2>

          {generatedPosts.length > 0 && (
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="text-xs text-[#1E6F78] hover:underline font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reroll All with New Angle
            </button>
          )}
        </div>

        {generatedPosts.length === 0 && !isGenerating && (
          <div className="bg-[#FBFBF8] border-2 border-dashed border-[#CBD4CD] rounded-xl p-12 text-center text-[#5A6B7A]">
            <Sparkles className="w-8 h-8 text-[#E8B422] mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-base text-[#14273A] font-heading">
              Ready to write
            </h3>
            <p className="text-xs max-w-md mx-auto mt-1">
              Select a copywriting formula and enter a topic. Halyard will write native format copy tailored for each platform in {brand.name}'s voice with zero fluff.
            </p>
          </div>
        )}

        {/* List of Generated Slips */}
        <div className="space-y-4">
          {generatedPosts.map((post, idx) => {
            const tags = (post.hashtags || []).map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ');
            const fullPostText = `${post.caption}${tags ? '\n\n' + tags : ''}`;
            const isCopied = copiedIndex === idx;
            const isAdded = addedSuccessIndex === idx;

            return (
              <div
                key={idx}
                className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl overflow-hidden shadow-xs flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                {/* Left Colored Brand Strip */}
                <div
                  className="w-full md:w-3.5 h-2 md:h-auto shrink-0"
                  style={{
                    backgroundColor: brand.flag.a || '#14273A',
                  }}
                />

                {/* Main Card Body */}
                <div className="p-5 sm:p-6 flex-1 space-y-4">
                  {/* Platform & Metadata Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#14273A] text-white text-xs font-bold uppercase tracking-wider">
                        {post.platform}
                      </span>
                      {post.copyStrategy?.formula && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {post.copyStrategy.formula.split(' ')[0]}
                        </span>
                      )}
                      {post.estimatedReadingTime && (
                        <span className="text-xs text-[#5A6B7A]">
                          ~{post.estimatedReadingTime}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(fullPostText, idx)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#CBD4CD] bg-white hover:border-[#14273A] text-xs font-semibold text-[#14273A] transition shadow-2xs"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Copy Strategy Breakdown Pill */}
                  {post.copyStrategy && (
                    <div className="p-3 rounded-lg bg-[#EAEFEA] border border-[#CBD4CD] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#1E6F78]">
                        <span>Strategy: {post.copyStrategy.formula} • {post.copyStrategy.angle}</span>
                        <span className="text-emerald-700">✓ 3-Part CTA Engine</span>
                      </div>
                      <p className="text-[#14273A] text-[11px] leading-snug">
                        <strong>"So What?" Outcome:</strong> {post.copyStrategy.soWhatOutcome}
                      </p>
                    </div>
                  )}

                  {/* Hook */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] block">
                      Thumb-Stop Hook:
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#14273A] font-heading mt-0.5">
                      {post.hook}
                    </h3>
                  </div>

                  {/* Caption Body */}
                  <div className="bg-white p-4 rounded-lg border border-[#CBD4CD] text-sm text-[#14273A] whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                    {post.caption}
                  </div>

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="text-xs text-[#1E6F78] font-medium break-words">
                      {tags}
                    </div>
                  )}

                  {/* Visual Creative Direction */}
                  {post.visual && (
                    <div className="bg-[#EAEFEA] p-3 rounded-md text-xs text-[#14273A] border border-[#CBD4CD] italic">
                      <strong className="not-italic font-bold text-[#1E6F78]">Visual / Footage Direction: </strong>
                      {post.visual}
                    </div>
                  )}

                  {/* AI Visual Asset Block (Nano Banana 2 & Omni 1.1) */}
                  {post.visualAsset ? (
                    <div className="p-4 rounded-xl bg-[#0B131E] text-white border border-black/40 shadow-md space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-extrabold text-xs text-[#E8B422]">
                            {post.visualAsset.engineBadge}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                            {post.visualAsset.format.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.visualAsset.svgGraphic && (
                            <button
                              type="button"
                              onClick={() => {
                                const blob = new Blob([post.visualAsset!.svgGraphic!], { type: 'image/svg+xml;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${post.visualAsset!.engine}-${Date.now()}.svg`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white flex items-center gap-1 transition"
                            >
                              <Download className="w-3 h-3" />
                              Export SVG
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickGenerateVisualForPost(
                                idx,
                                post.visualAsset!.engine === 'nano-banana-2' ? 'omni-1.1' : 'nano-banana-2',
                                post.visualAsset!.format
                              )
                            }
                            disabled={isGeneratingVisualForPost[idx]}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white flex items-center gap-1 transition"
                            title="Toggle engine"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {post.visualAsset.engine === 'nano-banana-2' ? 'Switch to Omni 1.1' : 'Switch to Nano Banana 2'}
                          </button>
                        </div>
                      </div>

                      {/* Display based on visual format */}
                      {post.visualAsset.format === 'image' && (
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          <div
                            className="w-full sm:w-44 h-44 rounded-lg overflow-hidden border border-white/20 shrink-0 shadow-inner bg-black flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: post.visualAsset.svgGraphic || '' }}
                          />
                          <div className="text-xs space-y-1.5 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8B422] block">
                              Visual Art Direction:
                            </span>
                            <p className="text-gray-300 line-clamp-3 text-[11px] leading-relaxed">
                              {post.visualAsset.visualDirection}
                            </p>
                            <div className="pt-1 text-[10px] text-gray-400">
                              Format: <strong>{post.visualAsset.aspectRatio}</strong> • Resolution: <strong>{post.visualAsset.engineSpecs?.resolution || '2048px'}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {post.visualAsset.format === 'carousel' && post.visualAsset.carouselSlides && (
                        <div className="space-y-2">
                          {(() => {
                            const slideIdx = activeCarouselSlideIndices[idx] || 0;
                            const currentSlide = post.visualAsset.carouselSlides[slideIdx];
                            return (
                              <div>
                                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/10">
                                  <span className="font-extrabold text-[#E8B422]">
                                    Slide {slideIdx + 1} of {post.visualAsset.carouselSlides.length}: {currentSlide?.badge}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveCarouselSlideIndices((prev) => ({
                                          ...prev,
                                          [idx]: Math.max(0, slideIdx - 1),
                                        }))
                                      }
                                      disabled={slideIdx === 0}
                                      className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveCarouselSlideIndices((prev) => ({
                                          ...prev,
                                          [idx]: Math.min(post.visualAsset!.carouselSlides!.length - 1, slideIdx + 1),
                                        }))
                                      }
                                      disabled={slideIdx === post.visualAsset.carouselSlides.length - 1}
                                      className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg mt-2 space-y-1 text-xs">
                                  <h4 className="font-bold text-white text-sm">{currentSlide?.headline}</h4>
                                  <p className="text-gray-300 text-[11px]">{currentSlide?.subtext}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {(post.visualAsset.format === 'motion' || post.visualAsset.format === 'animation') && post.visualAsset.motionConfig && (
                        <div className="p-3.5 rounded-lg bg-gradient-to-r from-red-950/40 to-amber-950/40 border border-amber-500/30 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#E8B422] flex items-center gap-1">
                              <Film className="w-3.5 h-3.5" />
                              Kinetic Motion Graphic ({post.visualAsset.motionConfig.durationSeconds}s)
                            </span>
                            <span className="text-[10px] font-mono text-gray-300 uppercase">
                              {post.visualAsset.motionConfig.animationStyle}
                            </span>
                          </div>
                          <p className="text-white font-extrabold text-sm">
                            "{post.visualAsset.motionConfig.headlineText}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/10">
                            <span>Cue: {post.visualAsset.motionConfig.soundCue}</span>
                            <span className="text-[#E8B422] font-bold">Attached to Post</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Visual Creation Prompt Bar if not yet generated */
                    <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E8B422]/60 space-y-2 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎨</span>
                          <div>
                            <span className="text-xs font-extrabold text-[#14273A] block">
                              AI Visual Generator Available
                            </span>
                            <span className="text-[11px] text-[#5A6B7A]">
                              Auto-create thumb-stopping graphics or carousels based on this hook:
                            </span>
                          </div>
                        </div>

                        {isGeneratingVisualForPost[idx] && (
                          <span className="text-xs font-bold text-[#1E6F78] flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Synthesizing Visual...
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleQuickGenerateVisualForPost(idx, 'nano-banana-2', 'image')}
                          disabled={isGeneratingVisualForPost[idx]}
                          className="px-2.5 py-1.5 rounded-lg bg-[#E8B422] hover:bg-[#d4a31a] text-[#14273A] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          🍌 Nano Banana 2 (Feed Image)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickGenerateVisualForPost(idx, 'omni-1.1', 'image')}
                          disabled={isGeneratingVisualForPost[idx]}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1E6F78] hover:bg-[#185860] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          ✨ Omni 1.1 (Editorial Image)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickGenerateVisualForPost(idx, 'nano-banana-2', 'carousel')}
                          disabled={isGeneratingVisualForPost[idx]}
                          className="px-2.5 py-1.5 rounded-lg border border-[#CBD4CD] bg-white hover:bg-gray-50 text-[#14273A] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          5-Slide Carousel Deck
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickGenerateVisualForPost(idx, 'omni-1.1', 'motion')}
                          disabled={isGeneratingVisualForPost[idx]}
                          className="px-2.5 py-1.5 rounded-lg border border-[#CBD4CD] bg-white hover:bg-gray-50 text-[#14273A] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <Film className="w-3.5 h-3.5 text-[#E8B422]" />
                          Kinetic Motion Reel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Calendar Integration Bar */}
                  <div className="pt-3 border-t border-[#CBD4CD] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5A6B7A] font-medium">Schedule on:</span>
                      <input
                        type="date"
                        value={calendarDates[idx] || ''}
                        onChange={(e) =>
                          setCalendarDates({ ...calendarDates, [idx]: e.target.value })
                        }
                        className="px-2 py-1 rounded border border-[#CBD4CD] bg-white text-xs text-[#14273A]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCalendar(post, idx)}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#14273A] text-white hover:bg-[#1E364A]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Added to Calendar!
                        </>
                      ) : (
                        <>
                          <CalendarPlus className="w-3.5 h-3.5" />
                          Add to Calendar
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
      </>
      )}
    </div>
  );
};
