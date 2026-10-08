import React, { useState } from 'react';
import { Brand, RepurposeResult } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { repurposeContent } from '../lib/api.ts';
import {
  Repeat,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Film,
  Layers,
  MessageCircle,
  FileText,
  Send,
  ShieldCheck,
  Target,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react';

interface RepurposerViewProps {
  brand: Brand | null;
  onNavigateTab: (tab: string) => void;
}

const FORMULAS = [
  { id: 'PAS (Problem, Agitate, Solution)', label: 'PAS (Problem, Agitate, Solution)', desc: 'Best when solving a real customer frustration. Agitates the cost of doing nothing.' },
  { id: 'BAB (Before, After, Bridge)', label: 'BAB (Before, After, Bridge)', desc: 'Best for life transformations. Contrasts uncomfortable present with desired future.' },
  { id: 'AIDA (Attention, Interest, Desire, Action)', label: 'AIDA (Attention, Interest, Desire, Action)', desc: 'Classic direct-response arc: scroll-stopping hook into emotional desire.' },
  { id: 'The 4 Ps (Promise, Picture, Proof, Push)', label: 'The 4 Ps (Promise, Picture, Proof, Push)', desc: 'Proof-heavy copy: bold promise backed by evidence and low-friction push.' },
  { id: 'FAB (Feature, Advantage, Benefit)', label: 'FAB (Feature, Advantage, Benefit)', desc: 'Translates technical specs into tangible human outcomes (The "So What?" test).' },
];

const ANGLES = [
  'Contrarian / Unpopular Truth',
  'Direct Pain & Agitation',
  'Identity & Transformation',
  'Curiosity & Blindspot',
  'Before / After Contrast',
];

const JOURNEY_STAGES = [
  { id: 'Awareness', label: 'Awareness Stage (Zero hard sell, reveal the blindspot gently)' },
  { id: 'Consideration', label: 'Consideration Stage (Highlight mechanism, proof, and outcomes)' },
  { id: 'Decision', label: 'Decision Stage (Remove objections, risk reduction, 3-part CTA)' },
];

const SAMPLE_SOURCE_TEXT = `We spent the last six months analyzing why most customer onboarding workflows drop off within the first 14 days. It is almost never the pricing, and it is rarely the product feature set.

The real culprit is cognitive overload in the first two sessions. When users are presented with 8 setup steps simultaneously, decision fatigue sets in. By simply reducing the initial onboarding down to one single milestone, 30-day activation improved by 65%. Don't optimize your marketing funnel before fixing your initial user friction point.`;

export const RepurposerView: React.FC<RepurposerViewProps> = ({
  brand,
  onNavigateTab,
}) => {
  const [sourceText, setSourceText] = useState('');
  const [selectedFormula, setSelectedFormula] = useState(FORMULAS[0].id);
  const [selectedAngle, setSelectedAngle] = useState(ANGLES[0]);
  const [selectedStage, setSelectedStage] = useState(JOURNEY_STAGES[1].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RepurposeResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!brand) {
    return (
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-[#14273A] font-heading mb-2">
          Select a Client First
        </h2>
        <p className="text-sm text-[#5A6B7A] mb-4">
          The Repurposer extracts insights and re-writes them in your active client's voice using direct-response copywriting formulas.
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

  async function handleRepurpose(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!brand) return;
    if (!sourceText.trim() || sourceText.length < 50) {
      alert('Please paste at least a paragraph of source material.');
      return;
    }

    setIsProcessing(true);
    try {
      const data = await repurposeContent({
        brand,
        sourceText,
        formula: selectedFormula,
        angle: selectedAngle,
        journeyStage: selectedStage,
      });
      setResult(data);
    } catch (err: any) {
      alert('Repurpose failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Anti-Generic Constitution Banner */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FlagBadge flag={brand.flag} size="md" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E6F78]">
                {brand.name}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#14273A] text-white">
                Anti-Generic Copy Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
              Direct-Response Content Repurposer
            </h1>
            <p className="text-[#5A6B7A] text-sm max-w-2xl leading-relaxed">
              Transform long-form thinking into 5 high-converting, un-generic distribution assets: 
              <strong> High-Density Carousel</strong>, <strong>3-Second Hook Video Script</strong>, <strong>Viral Thread</strong>, <strong>Multi-Platform Captions</strong>, and <strong>1-on-1 WhatsApp Sales Copy</strong>.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#CBD4CD] text-xs max-w-xs shrink-0 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B422]" />
              <span>Core Copywriting Tenet:</span>
            </div>
            <p className="text-[#14273A] italic text-[11px] leading-snug">
              "Features tell. Benefits explain. Outcomes sell. If the line doesn't survive the 'So What?' test, cut it."
            </p>
            <div className="pt-1 border-t border-[#CBD4CD] flex items-center justify-between text-[10px] text-[#5A6B7A]">
              <span>Client Voice:</span>
              <span className="font-bold text-[#14273A] truncate max-w-[150px]">{brand.voice || 'Conversational'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Panel with Strategy Parameters */}
      <form
        onSubmit={handleRepurpose}
        className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm"
      >
        {/* Source Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#14273A] flex items-center gap-2">
              <span>Source Material (Blog, Transcript, Newsletter, Memo)</span>
              <span className="text-[#D9432B]">*</span>
            </label>
            <button
              type="button"
              onClick={() => setSourceText(SAMPLE_SOURCE_TEXT)}
              className="text-xs text-[#1E6F78] hover:underline font-bold flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3 text-[#E8B422]" />
              <span>Load Case Study Sample</span>
            </button>
          </div>

          <textarea
            rows={6}
            required
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste your source material here. The engine will strip fluff, extract the real tension, and restructure it through your chosen copywriting formula..."
            className="w-full px-3.5 py-3 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422] leading-relaxed"
          />
        </div>

        {/* Copywriting Strategy Control Bar (Formulas & Angles) */}
        <div className="p-5 rounded-xl bg-white border-2 border-[#14273A] space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#CBD4CD]">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D9432B]" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#14273A]">
                Copywriting Strategy Architecture (Sound Less Generic)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#5A6B7A]">
              Direct-Response Masterclass Frameworks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Copywriting Formula */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
                Copy Formula
              </label>
              <select
                value={selectedFormula}
                onChange={(e) => setSelectedFormula(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-[#14273A] bg-[#FBFBF8] text-xs font-semibold text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              >
                {FORMULAS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#5A6B7A] mt-1 line-clamp-2">
                {FORMULAS.find((f) => f.id === selectedFormula)?.desc}
              </p>
            </div>

            {/* 2. Creative Angle */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
                Strategic Hook Angle
              </label>
              <select
                value={selectedAngle}
                onChange={(e) => setSelectedAngle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-[#14273A] bg-[#FBFBF8] text-xs font-semibold text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              >
                {ANGLES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#5A6B7A] mt-1">
                "The product doesn't change. The angle changes." Pushes beyond the first obvious idea.
              </p>
            </div>

            {/* 3. Customer Journey Stage */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#14273A] mb-1.5">
                Customer Journey Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-[#14273A] bg-[#FBFBF8] text-xs font-semibold text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
              >
                {JOURNEY_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#5A6B7A] mt-1">
                Calibrates selling pressure. Never hard-sell someone who doesn't know they have a problem yet.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying Formula & Repurposing (5 Native Formats)...
              </>
            ) : (
              <>
                <Repeat className="w-4 h-4" />
                Repurpose with Direct-Response Engine
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-[#5A6B7A]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>0% AI Clichés • Outcomes over Features • 3-Part CTAs</span>
          </div>
        </div>
      </form>

      {/* Output Display */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Masterclass Copywriting Strategy & Anti-Fluff Scorecard */}
          <div className="bg-white border-2 border-[#14273A] rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CBD4CD]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#1E6F78] text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#14273A] font-heading">
                    Copy Strategy Scorecard (Un-Generic Verification)
                  </h3>
                  <p className="text-[11px] text-[#5A6B7A]">
                    Every repurposed asset is grounded in direct-response architecture.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                Fluff Banned & Eliminated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#FBFBF8] p-3 rounded-lg border border-[#CBD4CD]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
                  Formula Applied:
                </span>
                <span className="font-bold text-[#14273A] font-heading mt-0.5 block">
                  {result.copyStrategy?.formula || selectedFormula}
                </span>
                <span className="text-[10px] text-[#1E6F78] mt-0.5 block">
                  Angle: {result.copyStrategy?.angle || selectedAngle}
                </span>
              </div>

              <div className="bg-[#FBFBF8] p-3 rounded-lg border border-[#CBD4CD]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
                  The "So What?" Outcome:
                </span>
                <p className="text-[#14273A] text-xs font-medium mt-0.5 leading-snug">
                  {result.copyStrategy?.soWhatOutcome || 'Customer eliminates friction and achieves clarity without wasting budget on unnecessary tools.'}
                </p>
              </div>

              <div className="bg-[#FBFBF8] p-3 rounded-lg border border-[#CBD4CD]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
                  3-Part CTA Engine:
                </span>
                <p className="text-[#14273A] text-xs font-medium mt-0.5 leading-snug">
                  {result.copyStrategy?.ctaBreakdown || '1. Action Verb + 2. Specific Deliverable + 3. Low-Friction Guarantee'}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Multi-Slide Carousel */}
          {result.carousel && result.carousel.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#1E6F78]" />
                    <span>Swipeable Carousel ({result.carousel.length} Slides)</span>
                  </h3>
                  <p className="text-xs text-[#5A6B7A] mt-0.5">
                    Built for high save-to-reach ratios: Hook Slide → Framework & Outcomes → 3-Part CTA Slide.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      result.carousel
                        .map((s, i) => `[Slide ${i + 1}] ${s.title}\n${s.text}`)
                        .join('\n\n'),
                      'all-carousel'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14273A] bg-white text-xs font-bold text-[#14273A] hover:bg-[#EAEFEA] transition shadow-2xs"
                >
                  {copiedKey === 'all-carousel' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied All
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy All Slides
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {result.carousel.map((slide, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-[#14273A] rounded-xl p-4 flex flex-col justify-between shadow-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] mb-1.5">
                        <span>Slide {idx + 1}</span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-[#D9432B] font-extrabold">
                            Pattern Interrupt Hook
                          </span>
                        )}
                        {idx === result.carousel.length - 1 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                            3-Part CTA
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-[#14273A] font-heading leading-tight mb-2">
                        {slide.title}
                      </h4>
                      <p className="text-xs text-[#5A6B7A] leading-relaxed whitespace-pre-line">
                        {slide.text}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#CBD4CD] flex justify-end">
                      <button
                        onClick={() => handleCopy(`${slide.title}\n\n${slide.text}`, `slide-${idx}`)}
                        className="text-[11px] text-[#1E6F78] hover:underline font-semibold flex items-center gap-1"
                      >
                        {copiedKey === `slide-${idx}` ? 'Copied' : 'Copy Slide'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Short-Form Video Script */}
          {result.reel && (
            <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#D9432B]" />
                    <span>20-30s Short-Form Video Script (Reels / TikTok)</span>
                  </h3>
                  <p className="text-xs text-[#5A6B7A] mt-0.5">
                    Tuned for the 3-second attention threshold: Spoken Hook → Mistake vs Fix → Action.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `[0-3s Spoken Hook]\n"${result.reel.hook}"\n\n[Visual Action]\n${result.reel.visualHook || 'None'}\n\n[Story Progression Beats]\n${result.reel.beats.join('\n')}\n\n[3-Part CTA]\n${result.reel.cta}`,
                      'reel'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14273A] bg-white text-xs font-bold text-[#14273A] hover:bg-[#EAEFEA] transition shadow-2xs"
                >
                  {copiedKey === 'reel' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Script
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Script
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#CBD4CD] space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#D9432B]" />
                    <span>0-3s Spoken Pattern Interrupt (The Hook):</span>
                  </span>
                  <div className="font-extrabold text-sm text-[#14273A] font-heading">
                    "{result.reel.hook}"
                  </div>
                  {result.reel.visualHook && (
                    <div className="text-xs text-[#5A6B7A] pt-1">
                      <strong className="text-[#14273A]">Visual Hook Direction:</strong> {result.reel.visualHook}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
                    Story Beats & Mechanism (Passes the "So What?" test):
                  </span>
                  {result.reel.beats.map((beat, bIdx) => (
                    <div
                      key={bIdx}
                      className="text-xs p-3 rounded-lg bg-[#EAEFEA] border border-[#CBD4CD] flex items-start gap-2.5"
                    >
                      <span className="font-bold text-[#1E6F78] shrink-0">Beat {bIdx + 1}:</span>
                      <span className="text-[#14273A] leading-relaxed">{beat}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#14273A] text-white p-3.5 rounded-lg">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8B422] block">
                    Closing 3-Part Call to Action (CTA):
                  </span>
                  <p className="text-xs mt-1 font-medium leading-relaxed">
                    {result.reel.cta}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Viral Thread */}
          {result.thread && result.thread.length > 0 && (
            <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#14273A]" />
                    <span>Viral Thread (X / Threads)</span>
                  </h3>
                  <p className="text-xs text-[#5A6B7A] mt-0.5">
                    Reads like a sharp thought, not an advert. Opens with a strong contrarian insight.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(result.thread.join('\n\n---\n\n'), 'thread')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14273A] bg-white text-xs font-bold text-[#14273A] hover:bg-[#EAEFEA] transition shadow-2xs"
                >
                  {copiedKey === 'thread' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Thread
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Full Thread
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {result.thread.map((tweet, tIdx) => (
                  <div
                    key={tIdx}
                    className="bg-white p-4 rounded-xl border border-[#CBD4CD] text-xs sm:text-sm text-[#14273A] leading-relaxed relative flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="whitespace-pre-line flex-1">{tweet}</div>
                    <button
                      onClick={() => handleCopy(tweet, `t-${tIdx}`)}
                      className="p-1 rounded hover:bg-[#EAEFEA] text-[#5A6B7A] shrink-0"
                      title="Copy single tweet"
                    >
                      {copiedKey === `t-${tIdx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Standalone Native Captions */}
          {result.captions && result.captions.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1E6F78]" />
                  <span>Standalone Native Platform Captions</span>
                </h3>
                <p className="text-xs text-[#5A6B7A] mt-0.5">
                  Platform-specific adaptations (Instagram truncated hook, LinkedIn result-first authority).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.captions.map((cap, cIdx) => (
                  <div
                    key={cIdx}
                    className="bg-white border-2 border-[#14273A] rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 rounded bg-[#14273A] text-white text-[10px] font-bold uppercase tracking-wider">
                        {cap.platform}
                      </span>
                      <p className="text-xs sm:text-sm text-[#14273A] whitespace-pre-line leading-relaxed">
                        {cap.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#CBD4CD]">
                      <button
                        onClick={() => handleCopy(cap.caption, `cap-${cIdx}`)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14273A] text-xs font-bold text-[#14273A] hover:bg-[#EAEFEA] transition"
                      >
                        {copiedKey === `cap-${cIdx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Caption
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. WhatsApp 1-on-1 Sales Copy (Masterclass Part 9 & Part 14) */}
          {result.whatsappPitch && (
            <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-xl p-6 sm:p-8 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950">
                  <Send className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-bold font-heading">
                      WhatsApp 1-on-1 Conversational Sales Pitch
                    </h3>
                    <p className="text-xs text-emerald-900">
                      As taught in Part 9: Personal, human, sounds like someone who remembers the customer, with a low-friction question.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(result.whatsappPitch || '', 'whatsapp')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-2xs"
                >
                  {copiedKey === 'whatsapp' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Pitch
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-300 text-xs sm:text-sm text-[#14273A] leading-relaxed whitespace-pre-line">
                {result.whatsappPitch}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
