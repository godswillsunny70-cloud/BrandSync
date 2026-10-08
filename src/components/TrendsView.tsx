import React, { useState, useEffect } from 'react';
import { Brand, SocialTrend, TrendsResponse, Platform } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { fetchSocialTrends } from '../lib/api.ts';
import {
  TrendingUp,
  RefreshCw,
  Flame,
  Sparkles,
  PenTool,
  Clock,
  Compass,
  ArrowRight,
  Loader2,
  Info,
  Hash
} from 'lucide-react';

interface TrendsViewProps {
  brand: Brand | null;
  onNavigateTab: (tab: string) => void;
  onPreFillStudioTopic: (topic: string) => void;
}

const PLATFORM_FILTERS: (Platform | 'All')[] = [
  'All',
  'TikTok',
  'Instagram',
  'LinkedIn',
  'X',
  'YouTube Shorts',
];

const INDUSTRY_PRESETS = [
  'General / Cross-Platform',
  'Specialty Food, Cafe & Hospitality',
  'Tech, B2B SaaS & Developer Tools',
  'Beauty, Wellness & Clean Skincare',
  'Direct to Consumer & E-Commerce',
  'Creator Economy & Personal Branding',
];

export const TrendsView: React.FC<TrendsViewProps> = ({
  brand,
  onNavigateTab,
  onPreFillStudioTopic,
}) => {
  const [platform, setPlatform] = useState<Platform | 'All'>('All');
  const [industry, setIndustry] = useState<string>(
    brand?.industry ? `${brand.name} Industry (${brand.industry.slice(0, 30)})` : INDUSTRY_PRESETS[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);

  // Initial fetch on mount
  useEffect(() => {
    loadTrends();
  }, [platform]);

  async function loadTrends() {
    setIsLoading(true);
    try {
      const data = await fetchSocialTrends({
        platform: platform === 'All' ? undefined : platform,
        industry,
        brand: brand || undefined,
      });
      setTrendsData(data);
    } catch (err: any) {
      console.error('Failed to load trends:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleJumpOnTrend(trend: SocialTrend) {
    const brief = `Adapt trending "${trend.title}" format (${trend.type}): Hook "${trend.sampleHook}". Brand adaptation: ${trend.brandAdaptation}`;
    onPreFillStudioTopic(brief);
    onNavigateTab('studio');
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Trends Header */}
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9432B]/10 text-[#D9432B] border border-[#D9432B]/30 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              Live Social Intelligence Radar
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14273A] tracking-tight font-heading">
              Current Social Media Trends
            </h1>
            <p className="text-[#5A6B7A] max-w-2xl text-sm sm:text-base leading-relaxed">
              Scans viral formats, audio archetypes, and algorithm ranking shifts across TikTok, Reels, X, and LinkedIn. Each trend includes an authentic adaptation blueprint for {brand?.name || 'your client'}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => loadTrends()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364E] font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-[#E8B422] ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Trend Feed
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 pt-6 border-t border-[#CBD4CD]">
          <div className="md:col-span-7">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6B7A] block mb-2">
              Filter by Platform
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_FILTERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    platform === p
                      ? 'bg-[#14273A] text-white border-[#14273A]'
                      : 'bg-white text-[#5A6B7A] border-[#CBD4CD] hover:border-[#14273A]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6B7A] block mb-2">
              Niche Focus
            </span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border-2 border-[#14273A] bg-white text-xs font-semibold text-[#14273A]"
            >
              {INDUSTRY_PRESETS.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Algorithm Dynamics Alert Banner */}
      {trendsData?.algorithmNotes && trendsData.algorithmNotes.length > 0 && (
        <div className="bg-[#EAEFEA] border-2 border-[#1E6F78] rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E6F78]">
            <Info className="w-4 h-4" />
            Active Algorithm Shifts & Ranking Triggers
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#14273A]">
            {trendsData.algorithmNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-md border border-[#CBD4CD]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E6F78] mt-1.5 shrink-0" />
                <span className="leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#D9432B] animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#14273A] font-heading">
            Scanning Social Networks & FYP Feeds...
          </h3>
          <p className="text-xs text-[#5A6B7A] mt-1">
            Parsing audio meme velocity, carousel blueprints, and retention trends.
          </p>
        </div>
      )}

      {/* Trends Grid */}
      {trendsData && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trendsData.trends.map((trend, idx) => {
            const isExploding = trend.velocity === 'Exploding';
            return (
              <div
                key={trend.id || idx}
                className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-5 flex flex-col justify-between shadow-xs transition hover:shadow-md space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#14273A] text-white text-[10px] font-bold uppercase tracking-wider">
                      {trend.type}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        isExploding
                          ? 'bg-red-100 text-[#D9432B] border border-red-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      {trend.velocity}
                    </span>
                  </div>

                  {/* Title & Platforms */}
                  <div>
                    <h3 className="font-extrabold text-lg text-[#14273A] font-heading leading-tight">
                      {trend.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(trend.platforms || []).map((pl) => (
                        <span
                          key={pl}
                          className="px-1.5 py-0.5 rounded bg-white border border-[#CBD4CD] text-[10px] font-semibold text-[#5A6B7A]"
                        >
                          {pl}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Why it works */}
                  <div className="text-xs text-[#5A6B7A] leading-relaxed">
                    <strong className="text-[#14273A] font-bold">Why it’s surging: </strong>
                    {trend.whyItWorks}
                  </div>

                  {/* Anatomy / Blueprint */}
                  <div className="bg-white p-3 rounded-lg border border-[#CBD4CD] text-xs space-y-1">
                    <div className="font-bold text-[10px] uppercase tracking-wider text-[#1E6F78]">
                      Format Blueprint:
                    </div>
                    <p className="text-[#14273A] font-mono text-[11px] leading-relaxed">
                      {trend.structure}
                    </p>
                  </div>

                  {/* Sample Hook */}
                  <div className="bg-[#EAEFEA] p-2.5 rounded-md border border-[#CBD4CD] text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B7A] block">
                      Sample Viral Hook:
                    </span>
                    <p className="font-bold text-[#14273A] font-heading italic mt-0.5">
                      "{trend.sampleHook}"
                    </p>
                  </div>

                  {/* Client Brand Adaptation */}
                  {brand && (
                    <div className="border-t border-[#CBD4CD]/60 pt-2 text-xs space-y-1">
                      <div className="font-bold text-[10px] uppercase tracking-wider text-[#D9432B] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {brand.name} Authentic Angle:
                      </div>
                      <p className="text-[#14273A] text-xs leading-relaxed italic">
                        {trend.brandAdaptation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom CTA: Jump into Studio */}
                <div className="pt-3 border-t border-[#CBD4CD]">
                  <button
                    onClick={() => handleJumpOnTrend(trend)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364E] text-xs font-bold transition shadow-xs"
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#E8B422]" />
                    <span>Draft for {brand?.name || 'Client'} in Studio</span>
                    <ArrowRight className="w-3 h-3 text-white/70" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
