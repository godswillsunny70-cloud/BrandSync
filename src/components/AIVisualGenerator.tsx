import React, { useState, useEffect, useRef } from 'react';
import {
  Brand,
  GeneratedAIVisual,
  VisualEngine,
  VisualFormat,
  VisualAspectRatio,
  VisualCarouselSlide,
  MotionGraphicConfig
} from '../types.ts';
import { generateAIVisual } from '../lib/api.ts';
import {
  Sparkles,
  Image as ImageIcon,
  Layers,
  Film,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Sliders,
  Palette,
  Eye,
  Smartphone,
  Square,
  Monitor,
  Flame,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AIVisualGeneratorProps {
  brand: Brand | null;
  initialHook?: string;
  initialCaption?: string;
  initialTopic?: string;
  onAttachVisualToPost?: (visual: GeneratedAIVisual) => void;
  onClose?: () => void;
  isInline?: boolean;
}

const STYLE_PRESETS = [
  { id: 'Vibrant 3D Render', label: 'Vibrant 3D & Clay', desc: 'Punchy 3D shapes, high saturation, playful & modern' },
  { id: 'Minimalist Editorial', label: 'Minimalist Editorial', desc: 'Luxury typography, obsidian contrast, studio lighting' },
  { id: 'Dark Mode Tech', label: 'Dark Mode Tech', desc: 'Sleek neon accents, cyber grids, high developer authority' },
  { id: 'Bold Bauhaus Graphic', label: 'Bold Bauhaus Graphic', desc: 'Geometric abstraction, primary colors, retro modern' },
  { id: 'Cinematic Glassmorphism', label: 'Cinematic Glassmorphism', desc: 'Frosted blur cards, soft specular glow, depth-of-field' },
];

export const AIVisualGenerator: React.FC<AIVisualGeneratorProps> = ({
  brand,
  initialHook = '',
  initialCaption = '',
  initialTopic = '',
  onAttachVisualToPost,
  onClose,
  isInline = false,
}) => {
  const [engine, setEngine] = useState<VisualEngine>('nano-banana-2');
  const [format, setFormat] = useState<VisualFormat>('image');
  const [aspectRatio, setAspectRatio] = useState<VisualAspectRatio>('1:1');
  const [stylePreset, setStylePreset] = useState<string>(STYLE_PRESETS[0].id);
  const [prompt, setPrompt] = useState<string>(initialHook || initialTopic || '');
  const [hook, setHook] = useState<string>(initialHook);
  const [caption, setCaption] = useState<string>(initialCaption);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVisual, setGeneratedVisual] = useState<GeneratedAIVisual | null>(null);
  const [copied, setCopied] = useState(false);

  // Carousel slide active index
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Motion animation state
  const [isPlayingMotion, setIsPlayingMotion] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [motionProgress, setMotionProgress] = useState(0); // 0 to 100
  const motionTimerRef = useRef<any>(null);

  // Sync initial inputs when props change
  useEffect(() => {
    if (initialHook) {
      setHook(initialHook);
      if (!prompt) setPrompt(initialHook);
    }
    if (initialCaption) setCaption(initialCaption);
    if (initialTopic && !prompt) setPrompt(initialTopic);
  }, [initialHook, initialCaption, initialTopic]);

  // Motion graphic animation loop
  useEffect(() => {
    if (format !== 'motion' && format !== 'animation') return;
    if (!isPlayingMotion) {
      if (motionTimerRef.current) clearInterval(motionTimerRef.current);
      return;
    }

    const duration = (generatedVisual?.motionConfig?.durationSeconds || 7) * 1000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100 * playbackSpeed;

    motionTimerRef.current = setInterval(() => {
      setMotionProgress((prev) => {
        if (prev >= 100) return 0;
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    return () => {
      if (motionTimerRef.current) clearInterval(motionTimerRef.current);
    };
  }, [isPlayingMotion, playbackSpeed, format, generatedVisual]);

  async function handleGenerate(overrideEngine?: VisualEngine, overrideFormat?: VisualFormat) {
    const useEngine = overrideEngine || engine;
    const useFormat = overrideFormat || format;
    const usePrompt = prompt.trim() || hook.trim() || initialTopic || 'High-Impact Brand Strategy';

    setIsGenerating(true);
    try {
      const res = await generateAIVisual({
        engine: useEngine,
        format: useFormat,
        prompt: usePrompt,
        hook: hook.trim() || usePrompt,
        caption: caption.trim() || initialCaption,
        brand: brand || undefined,
        aspectRatio,
        stylePreset,
      });
      setGeneratedVisual(res);
      setActiveSlideIndex(0);
      setMotionProgress(0);
      setIsPlayingMotion(true);
    } catch (err: any) {
      console.error('Visual generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  // Generate on first mount if initialHook is provided and no visual yet
  useEffect(() => {
    if ((initialHook || initialTopic) && !generatedVisual && !isGenerating) {
      handleGenerate();
    }
  }, []);

  function handleDownloadSVG() {
    if (!generatedVisual?.svgGraphic) return;
    const blob = new Blob([generatedVisual.svgGraphic], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedVisual.engine}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleCopyPrompt() {
    if (!generatedVisual) return;
    const details = `[Halyard AI Visual Engine: ${generatedVisual.engineBadge}]\n` +
      `Format: ${generatedVisual.format.toUpperCase()} (${generatedVisual.aspectRatio})\n` +
      `Style: ${generatedVisual.stylePreset}\n` +
      `Prompt: ${generatedVisual.promptUsed}\n\n` +
      `Direction: ${generatedVisual.visualDirection || ''}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-[#FBFBF8] text-[#14273A] ${isInline ? 'border-2 border-[#14273A] rounded-xl p-5 shadow-sm' : 'p-6 rounded-2xl max-w-5xl mx-auto shadow-2xl border border-black/20'}`}>
      {/* Top Banner / Engine Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#CBD4CD]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8B422] flex items-center justify-center text-[#14273A] shadow-xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#14273A] font-heading">
                AI Visual Studio & Motion Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live 2.0
              </span>
            </div>
            <p className="text-xs text-[#5A6B7A]">
              Create thumb-stopping feed images, 5-slide carousel decks, and animated motion graphics powered by <strong>Nano Banana 2</strong> & <strong>Omni 1.1</strong>.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
          >
            Close
          </button>
        )}
      </div>

      {/* Engine Switcher (Nano Banana 2 vs Omni 1.1) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Nano Banana 2 Card */}
        <button
          type="button"
          onClick={() => {
            setEngine('nano-banana-2');
            if (generatedVisual) handleGenerate('nano-banana-2');
          }}
          className={`p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            engine === 'nano-banana-2'
              ? 'border-[#E8B422] bg-[#FFF9E6] shadow-sm ring-2 ring-[#E8B422]/20'
              : 'border-[#CBD4CD] bg-white hover:border-[#E8B422]/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍌</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-[#14273A] font-heading">
                    Nano Banana 2
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E8B422] text-[#14273A]">
                    VIRAL PUNCH
                  </span>
                </div>
                <span className="text-[11px] text-[#5A6B7A] block">
                  Ultra-Fast • Vibrant 3D & Vector • Scroll-Stopping Contrast
                </span>
              </div>
            </div>
            {engine === 'nano-banana-2' && (
              <span className="w-5 h-5 rounded-full bg-[#E8B422] text-[#14273A] flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#E8B422]/30 flex items-center justify-between text-[10px] text-[#5A6B7A]">
            <span>Latency: <strong>0.78s</strong></span>
            <span>Aesthetic: <strong>Bold Saturation</strong></span>
            <span>Resolution: <strong>2048px</strong></span>
          </div>
        </button>

        {/* Omni 1.1 Card */}
        <button
          type="button"
          onClick={() => {
            setEngine('omni-1.1');
            if (generatedVisual) handleGenerate('omni-1.1');
          }}
          className={`p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            engine === 'omni-1.1'
              ? 'border-[#1E6F78] bg-[#EAF5F6] shadow-sm ring-2 ring-[#1E6F78]/20'
              : 'border-[#CBD4CD] bg-white hover:border-[#1E6F78]/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-[#14273A] font-heading">
                    Omni 1.1
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1E6F78] text-white">
                    EDITORIAL STUDIO
                  </span>
                </div>
                <span className="text-[11px] text-[#5A6B7A] block">
                  Photorealistic Lighting • Film Grain • Cinematic Typography
                </span>
              </div>
            </div>
            {engine === 'omni-1.1' && (
              <span className="w-5 h-5 rounded-full bg-[#1E6F78] text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#1E6F78]/30 flex items-center justify-between text-[10px] text-[#5A6B7A]">
            <span>Latency: <strong>1.14s</strong></span>
            <span>Aesthetic: <strong>Luxury Editorial</strong></span>
            <span>Resolution: <strong>2560px</strong></span>
          </div>
        </button>
      </div>

      {/* Control Bar: Format Selector + Aspect Ratio + Style Preset */}
      <div className="mt-4 p-4 rounded-xl bg-white border border-[#CBD4CD] shadow-2xs space-y-3">
        {/* Format Selector: Image / Carousel / Motion Graphics */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#EAEFEA] p-1 rounded-lg border border-[#CBD4CD]">
            <button
              type="button"
              onClick={() => {
                setFormat('image');
                if (generatedVisual) handleGenerate(undefined, 'image');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                format === 'image'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'text-[#5A6B7A] hover:text-[#14273A]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Feed Image
            </button>

            <button
              type="button"
              onClick={() => {
                setFormat('carousel');
                if (generatedVisual) handleGenerate(undefined, 'carousel');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                format === 'carousel'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'text-[#5A6B7A] hover:text-[#14273A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              5-Slide Carousel
            </button>

            <button
              type="button"
              onClick={() => {
                setFormat('motion');
                if (generatedVisual) handleGenerate(undefined, 'motion');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                format === 'motion' || format === 'animation'
                  ? 'bg-[#14273A] text-white shadow-xs'
                  : 'text-[#5A6B7A] hover:text-[#14273A]'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#E8B422]" />
              Motion & Animation
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#5A6B7A]">Aspect:</span>
            <div className="flex items-center gap-1 bg-[#EAEFEA] p-1 rounded-lg border border-[#CBD4CD]">
              {[
                { id: '1:1', label: '1:1', icon: Square, desc: 'Feed Square' },
                { id: '4:5', label: '4:5', icon: Smartphone, desc: 'IG Portrait' },
                { id: '16:9', label: '16:9', icon: Monitor, desc: 'Landscape / X' },
                { id: '9:16', label: '9:16', icon: Smartphone, desc: 'Reels / Stories' },
              ].map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id as VisualAspectRatio)}
                  className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                    aspectRatio === ar.id
                      ? 'bg-white text-[#14273A] shadow-2xs font-bold'
                      : 'text-[#5A6B7A] hover:text-[#14273A]'
                  }`}
                  title={ar.desc}
                >
                  <ar.icon className="w-3 h-3" />
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style Preset Selector & Hook Synchronizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#CBD4CD]">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B7A] mb-1">
              Visual Aesthetic Preset
            </label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs font-medium text-[#14273A] focus:outline-none focus:ring-1 focus:ring-[#14273A]"
            >
              {STYLE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.desc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A6B7A] mb-1 flex items-center justify-between">
              <span>Target Hook / Visual Theme</span>
              {initialHook && (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(initialHook);
                    setHook(initialHook);
                  }}
                  className="text-[10px] text-[#1E6F78] hover:underline font-bold"
                >
                  Sync with Studio Draft
                </button>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setHook(e.target.value);
                }}
                placeholder="e.g. Why 90% of brands fail the 3-second hook test..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#CBD4CD] bg-[#FBFBF8] text-xs font-medium text-[#14273A] focus:outline-none focus:ring-1 focus:ring-[#14273A]"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="px-4 py-1.5 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364A] text-xs font-extrabold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8B422]" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#E8B422]" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Status Indicator */}
      {isGenerating && (
        <div className="mt-5 p-8 rounded-xl bg-white border border-[#CBD4CD] text-center space-y-3 shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFF9E6] text-[#E8B422] animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#14273A]">
              Rendering with {engine === 'nano-banana-2' ? 'Nano Banana 2' : 'Omni 1.1'}...
            </h4>
            <p className="text-xs text-[#5A6B7A] max-w-md mx-auto mt-1">
              Constructing vector layers, harmonic color palettes, typography layout, and pattern-interrupting visual anchors based on brand guidelines.
            </p>
          </div>
        </div>
      )}

      {/* Generated Visual Canvas / Workspace */}
      {generatedVisual && !isGenerating && (
        <div className="mt-5 space-y-4">
          {/* Header with Specs & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#CBD4CD] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-extrabold text-xs text-[#14273A] block">
                  {generatedVisual.engineBadge}
                </span>
                <span className="text-[11px] text-[#5A6B7A]">
                  Format: <strong>{generatedVisual.format.toUpperCase()}</strong> • Aspect: <strong>{generatedVisual.aspectRatio}</strong> • Style: <strong>{generatedVisual.stylePreset}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-2.5 py-1.5 rounded-lg border border-[#CBD4CD] bg-white hover:bg-gray-50 text-xs font-semibold text-[#14273A] flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Specs' : 'Copy Specs'}
              </button>

              {generatedVisual.svgGraphic && (
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="px-2.5 py-1.5 rounded-lg border border-[#CBD4CD] bg-white hover:bg-gray-50 text-xs font-semibold text-[#14273A] flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download SVG
                </button>
              )}

              {onAttachVisualToPost && (
                <button
                  type="button"
                  onClick={() => onAttachVisualToPost(generatedVisual)}
                  className="px-3 py-1.5 rounded-lg bg-[#D9432B] hover:bg-[#c03823] text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Attach to Post Draft
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: SINGLE FEED IMAGE */}
          {generatedVisual.format === 'image' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Graphic Canvas Display */}
              <div className="lg:col-span-7 bg-[#0B131E] p-4 rounded-xl shadow-lg border border-black/30 flex flex-col items-center justify-center">
                <div
                  className="w-full max-w-[420px] rounded-lg overflow-hidden shadow-2xl relative border border-white/10"
                  style={{
                    aspectRatio:
                      generatedVisual.aspectRatio === '16:9'
                        ? '16/9'
                        : generatedVisual.aspectRatio === '9:16'
                        ? '9/16'
                        : generatedVisual.aspectRatio === '4:5'
                        ? '4/5'
                        : '1/1',
                  }}
                  dangerouslySetInnerHTML={{ __html: generatedVisual.svgGraphic || '' }}
                />
                <div className="mt-2.5 text-[10px] text-gray-400 font-mono tracking-wider">
                  RENDERED VIA {generatedVisual.engine.toUpperCase()} • VECTOR HIGH-DENSITY
                </div>
              </div>

              {/* Creative Direction & Hook Strategy Breakdown */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-xl bg-white border border-[#CBD4CD] shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] block">
                    Creative Art Direction:
                  </span>
                  <p className="text-xs text-[#14273A] leading-relaxed">
                    {generatedVisual.visualDirection}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#CBD4CD] shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] block">
                    Active Thumb-Stop Hook:
                  </span>
                  <p className="text-xs font-extrabold text-[#14273A] font-heading">
                    "{generatedVisual.title}"
                  </p>
                  <p className="text-[11px] text-[#5A6B7A]">
                    Designed with high-contrast text hierarchy and subtle light balance so users reading at rapid scroll speeds immediately freeze.
                  </p>
                </div>

                {generatedVisual.engineSpecs && (
                  <div className="p-3.5 rounded-xl bg-[#EAEFEA] border border-[#CBD4CD] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#14273A]">
                      <span>Resolution: {generatedVisual.engineSpecs.resolution}</span>
                      <span className="text-[#1E6F78]">Latency: {generatedVisual.engineSpecs.renderTime}</span>
                    </div>
                    <p className="text-[11px] text-[#5A6B7A]">
                      <strong>Aesthetic Profile:</strong> {generatedVisual.engineSpecs.aesthetic}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: MULTI-SLIDE CAROUSEL DECK */}
          {generatedVisual.format === 'carousel' && generatedVisual.carouselSlides && (
            <div className="space-y-4">
              {/* Carousel Navigation Header */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#CBD4CD]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#14273A]">
                    Slide {activeSlideIndex + 1} of {generatedVisual.carouselSlides.length}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#FFF9E6] text-[#855B00] border border-[#E8B422]/50">
                    {generatedVisual.carouselSlides[activeSlideIndex]?.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={activeSlideIndex === 0}
                    className="p-1.5 rounded-lg border border-[#CBD4CD] hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex gap-1.5">
                    {generatedVisual.carouselSlides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveSlideIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === activeSlideIndex ? 'w-6 bg-[#14273A]' : 'w-2 bg-[#CBD4CD]'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex((prev) =>
                        Math.min(prev + 1, (generatedVisual.carouselSlides?.length || 1) - 1)
                      )
                    }
                    disabled={activeSlideIndex === generatedVisual.carouselSlides.length - 1}
                    className="p-1.5 rounded-lg border border-[#CBD4CD] hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Slide Display Card */}
              {(() => {
                const currentSlide = generatedVisual.carouselSlides[activeSlideIndex];
                if (!currentSlide) return null;
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Rendered Slide Card */}
                    <div className="lg:col-span-7 bg-[#14273A] text-white p-7 rounded-2xl shadow-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden border border-black/40">
                      {/* Decorative Background Aura */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8B422]/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D9432B]/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Slide Top Banner */}
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-extrabold tracking-widest text-[#E8B422] uppercase">
                          {currentSlide.badge}
                        </span>
                        <span className="text-[10px] font-bold text-[#A6B8A9] tracking-wider">
                          {(brand?.name || 'HALYARD').toUpperCase()}
                        </span>
                      </div>

                      {/* Slide Content */}
                      <div className="my-auto py-6 relative z-10 space-y-4">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading leading-tight">
                          {currentSlide.headline}
                        </h3>
                        <p className="text-sm text-[#EAEFEA] leading-relaxed">
                          {currentSlide.subtext}
                        </p>

                        {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {currentSlide.bulletPoints.map((pt, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2.5 text-xs text-white/90">
                                <span className="w-4 h-4 rounded-full bg-[#E8B422] text-[#14273A] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Slide Bottom Bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10 text-[11px] text-[#A6B8A9]">
                        <span>Slide {currentSlide.slideNumber} of {generatedVisual.carouselSlides.length}</span>
                        <span className="font-semibold text-[#E8B422]">Swipe next →</span>
                      </div>
                    </div>

                    {/* Slide Overview Strip & Copy Controls */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
                          Slide Deck Overview ({generatedVisual.carouselSlides.length} Cards):
                        </span>
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                          {generatedVisual.carouselSlides.map((slide, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => setActiveSlideIndex(sIdx)}
                              className={`w-full p-2.5 rounded-lg text-left transition border text-xs flex items-center justify-between ${
                                sIdx === activeSlideIndex
                                  ? 'bg-[#14273A] text-white border-[#14273A] font-bold'
                                  : 'bg-white hover:bg-gray-50 text-[#14273A] border-[#CBD4CD]'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="text-[10px] opacity-75 mr-2">#{slide.slideNumber}</span>
                                <span>{slide.headline}</span>
                              </div>
                              <span className="text-[10px] shrink-0 opacity-70">
                                {slide.layoutType}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-[#CBD4CD] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#14273A]">
                          <span>Copy Slide #{currentSlide.slideNumber} Copy</span>
                          <button
                            type="button"
                            onClick={() => {
                              const txt = `[SLIDE ${currentSlide.slideNumber}: ${currentSlide.headline}]\n${currentSlide.subtext}\n\n${currentSlide.bulletPoints?.join('\n') || ''}`;
                              navigator.clipboard.writeText(txt);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-[11px] text-[#1E6F78] hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Slide
                          </button>
                        </div>
                        <p className="text-[11px] text-[#5A6B7A]">
                          <strong>Visual Cue:</strong> {currentSlide.visualPrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW MODE 3: ANIMATED MOTION GRAPHICS & ANIMATION */}
          {(generatedVisual.format === 'motion' || generatedVisual.format === 'animation') && generatedVisual.motionConfig && (
            <div className="space-y-4">
              {/* Motion Graphic Live Preview Player */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7 bg-[#0B131E] p-6 rounded-2xl shadow-2xl border border-black/40 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                  {/* Dynamic Animated Gradient Mesh */}
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-700"
                    style={{
                      background: `radial-gradient(circle at ${20 + (motionProgress * 0.6)}% ${30 + (motionProgress * 0.4)}%, ${engine === 'nano-banana-2' ? '#E8B422' : '#38BDF8'}, transparent 60%), radial-gradient(circle at ${80 - (motionProgress * 0.5)}% ${70 - (motionProgress * 0.3)}%, ${engine === 'nano-banana-2' ? '#D9432B' : '#818CF8'}, transparent 60%)`,
                    }}
                  />

                  {/* Player Top Meta */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E8B422]">
                        {generatedVisual.motionConfig.callToActionBadge}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {Math.floor((motionProgress / 100) * generatedVisual.motionConfig.durationSeconds)}s / {generatedVisual.motionConfig.durationSeconds}s
                    </span>
                  </div>

                  {/* Kinetic Typography Core Animation Area */}
                  <div className="my-auto py-8 relative z-10 space-y-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-md">
                      ⚡ KINETIC MOTION REEL
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-snug px-4">
                      {generatedVisual.motionConfig.headlineText.split(' ').map((word, wIdx) => {
                        const isHighlighted = generatedVisual.motionConfig?.highlightWords?.some(
                          (hw) => hw.toLowerCase() === word.toLowerCase().replace(/[^a-z0-9]/g, '')
                        );
                        return (
                          <span
                            key={wIdx}
                            className={`inline-block mr-2 transition-all duration-300 ${
                              isHighlighted
                                ? 'text-[#E8B422] scale-105 underline decoration-[#D9432B] decoration-4'
                                : 'text-white'
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </h2>

                    <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                      {generatedVisual.motionConfig.sublineText}
                    </p>

                    {/* Animated Audio Equalizer Bars */}
                    <div className="flex items-center justify-center gap-1 pt-3">
                      {[12, 24, 18, 30, 16, 28, 14, 22].map((h, bIdx) => (
                        <span
                          key={bIdx}
                          className="w-1 bg-[#E8B422] rounded-full transition-all duration-150"
                          style={{
                            height: isPlayingMotion ? `${Math.max(6, (h * (motionProgress % 10)) / 4)}px` : '8px',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Player Bottom Scrubber Bar & Controls */}
                  <div className="relative z-10 space-y-3 pt-3 border-t border-white/10">
                    {/* Scrubber Progress Bar */}
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#E8B422] to-[#D9432B] h-full transition-all duration-75"
                        style={{ width: `${motionProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlayingMotion(!isPlayingMotion)}
                          className="p-1.5 rounded-full bg-white text-[#14273A] hover:bg-gray-200 transition"
                        >
                          {isPlayingMotion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMotionProgress(0)}
                          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
                          title="Restart"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {generatedVisual.motionConfig.animationStyle}
                        </span>
                      </div>

                      {/* Speed Controls */}
                      <div className="flex items-center gap-1 text-[11px]">
                        {[0.5, 1, 1.5].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded transition ${
                              playbackSpeed === spd
                                ? 'bg-[#E8B422] text-[#14273A] font-bold'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyframe Breakdown & Audio / Visual Specs */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="p-4 rounded-xl bg-white border border-[#CBD4CD] shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6F78] block">
                      Timeline Keyframe Script:
                    </span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {generatedVisual.motionConfig.keyframes?.map((kf, kfIdx) => (
                        <div key={kfIdx} className="p-2.5 rounded-lg bg-[#FBFBF8] border border-[#CBD4CD] text-xs">
                          <div className="flex items-center justify-between font-bold text-[#14273A] mb-0.5">
                            <span className="text-[#E8B422] font-mono">{kf.timeSec.toFixed(1)}s</span>
                            <span>{kf.label}</span>
                          </div>
                          <p className="text-[11px] text-[#5A6B7A]">
                            {kf.visualState}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EAEFEA] border border-[#CBD4CD] text-xs space-y-1.5">
                    <span className="font-bold text-[#14273A] block">Sound & Pacing Cue:</span>
                    <p className="text-[11px] text-[#5A6B7A]">
                      {generatedVisual.motionConfig.soundCue || 'Punchy lo-fi bass drop at 0.5s'}
                    </p>
                    <div className="pt-2 border-t border-[#CBD4CD] flex items-center justify-between text-[11px]">
                      <span className="text-[#5A6B7A]">Duration: <strong>{generatedVisual.motionConfig.durationSeconds}s</strong></span>
                      <span className="text-[#1E6F78] font-bold">Reels / Shorts Optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
