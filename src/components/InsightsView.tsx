import React, { useState } from 'react';
import { Brand, InsightsResult, Post } from '../types.ts';
import { FlagBadge } from './FlagBadge.tsx';
import { analyzeInsights } from '../lib/api.ts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  CalendarPlus,
  Loader2,
  AlertCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface InsightsViewProps {
  brand: Brand | null;
  onAddPostToCalendar: (post: Omit<Post, 'id'>) => void;
  onNavigateTab: (tab: string) => void;
}

const SAMPLE_METRICS = `Reel "Top 3 beginner mistakes": 24.8k views, 890 saves, 142 shares, 64 comments
Carousel "Framework breakdown guide": 4.1k impressions, 380 saves, 12 shares, 18 website clicks
Static photo "Behind the scenes workspace": 1.2k impressions, 14 saves, 1 share
Story poll "Topic A vs Topic B": 420 views, 68 votes`;

export const InsightsView: React.FC<InsightsViewProps> = ({
  brand,
  onAddPostToCalendar,
  onNavigateTab,
}) => {
  const [metricsText, setMetricsText] = useState('');
  const [note, setNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insightsResult, setInsightsResult] = useState<InsightsResult | null>(null);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);

  if (!brand) {
    return (
      <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-[#14273A] font-heading mb-2">
          Select a Client First
        </h2>
        <p className="text-sm text-[#5A6B7A] mb-4">
          Insights evaluate data relative to your client's specific business goals and voice.
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

  async function handleAnalyze(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!brand) return;
    if (!metricsText.trim() || metricsText.length < 20) {
      alert('Please paste analytics numbers to evaluate.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeInsights({
        brand,
        metricsText,
        additionalNote: note.trim() || undefined,
      });
      setInsightsResult(data);
    } catch (err: any) {
      alert('Failed to analyze metrics: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAddAllExperimentsToCalendar() {
    if (!brand || !insightsResult || !insightsResult.nextExperiments) return;

    insightsResult.nextExperiments.forEach((exp, idx) => {
      const date = new Date();
      date.setDate(date.getDate() + idx + 1);

      onAddPostToCalendar({
        brandId: brand.id,
        date: date.toISOString().split('T')[0],
        platform: exp.platform || brand.platforms[0] || 'Instagram',
        text: `[Hypothesis Experiment] ${exp.idea}\n\nHypothesis: ${exp.hypothesis}`,
        status: 'idea',
        hook: exp.idea,
        pillar: 'Data Experiment',
      });
    });

    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 2500);
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
              Performance Insights & Next Moves
            </h1>
            <p className="text-[#5A6B7A] text-sm mt-1">
              Raw analytics numbers in, candid diagnostics and data-backed post experiments out.
            </p>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <form
        onSubmit={handleAnalyze}
        className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#14273A]">
            Paste Raw Numbers <span className="text-xs font-normal text-[#5A6B7A] lowercase">(from Meta, TikTok, LinkedIn, or spreadsheet)</span>
          </label>
          <button
            type="button"
            onClick={() => setMetricsText(SAMPLE_METRICS)}
            className="text-xs text-[#1E6F78] hover:underline font-bold"
          >
            Insert Sample Metrics
          </button>
        </div>

        <textarea
          rows={6}
          required
          value={metricsText}
          onChange={(e) => setMetricsText(e.target.value)}
          placeholder={`Reel 'Batch 14': 14.2k views, 480 saves, 41 shares\nCarousel 'Grinder setup': 3.1k reach, 22 saves\nStory poll: 410 views, 38 votes`}
          className="w-full px-3.5 py-3 rounded-lg border-2 border-[#14273A] bg-white text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#14273A] mb-1">
            Focus or Priority Goal This Period <span className="text-xs font-normal text-[#5A6B7A] lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Focus this month is newsletter signups rather than vanity reach"
            className="w-full px-3.5 py-2.5 rounded-lg border-2 border-[#14273A] bg-white text-xs sm:text-sm text-[#14273A] focus:outline-none focus:ring-2 focus:ring-[#E8B422]"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#D9432B] hover:bg-[#C03720] text-white font-bold text-sm transition shadow-xs disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Metrics...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                Read the Numbers & Extract Moves
              </>
            )}
          </button>

          <span className="text-xs text-[#5A6B7A]">
            Evaluates save-to-reach ratios and retention drop-offs
          </span>
        </div>
      </form>

      {/* Results View */}
      {insightsResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Summary Slip */}
          <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E6F78]">
              <TrendingUp className="w-4 h-4" />
              Strategic Takeaway
            </div>
            <h2 className="text-2xl font-bold text-[#14273A] font-heading leading-tight">
              {insightsResult.summary}
            </h2>

            {/* Quick Diagnostics badges */}
            {insightsResult.diagnostics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#CBD4CD]">
                {insightsResult.diagnostics.topFormat && (
                  <div className="bg-white p-3 rounded-lg border border-[#CBD4CD] text-xs">
                    <span className="font-bold text-[#5A6B7A] uppercase text-[10px] block">
                      Top Format:
                    </span>
                    <span className="font-bold text-[#14273A] text-sm font-heading">
                      {insightsResult.diagnostics.topFormat}
                    </span>
                  </div>
                )}
                {insightsResult.diagnostics.topEngagementDriver && (
                  <div className="bg-white p-3 rounded-lg border border-[#CBD4CD] text-xs">
                    <span className="font-bold text-[#5A6B7A] uppercase text-[10px] block">
                      Growth Driver:
                    </span>
                    <span className="font-bold text-[#1E6F78] text-sm font-heading">
                      {insightsResult.diagnostics.topEngagementDriver}
                    </span>
                  </div>
                )}
                {insightsResult.diagnostics.retentionAlert && (
                  <div className="bg-white p-3 rounded-lg border border-[#CBD4CD] text-xs">
                    <span className="font-bold text-[#D9432B] uppercase text-[10px] block">
                      Friction Alert:
                    </span>
                    <span className="font-bold text-red-950 text-xs">
                      {insightsResult.diagnostics.retentionAlert}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Worked vs Underperformed Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What worked */}
            <div className="bg-[#FBFBF8] border-2 border-emerald-900/30 rounded-xl p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-lg text-emerald-950 font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                What Overperformed (With Proof)
              </h3>
              <div className="space-y-3">
                {(insightsResult.worked || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3.5 rounded-lg border border-emerald-200 text-xs space-y-1"
                  >
                    <div className="font-bold text-sm text-[#14273A] font-heading">
                      {item.post}
                    </div>
                    <div className="text-[#1E6F78] font-mono text-[11px] font-semibold">
                      Proof: {item.proof}
                    </div>
                    <p className="text-[#5A6B7A] leading-relaxed mt-1">
                      {item.takeaway}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* What flopped */}
            <div className="bg-[#FBFBF8] border-2 border-[#D9432B]/30 rounded-xl p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-lg text-[#D9432B] font-heading flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#D9432B]" />
                What Underperformed (Diagnosis)
              </h3>
              <div className="space-y-3">
                {(insightsResult.underperformed || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3.5 rounded-lg border border-red-200 text-xs space-y-1"
                  >
                    <div className="font-bold text-sm text-[#14273A] font-heading">
                      {item.post}
                    </div>
                    <div className="text-red-800 font-mono text-[11px] font-semibold">
                      Proof: {item.proof}
                    </div>
                    <p className="text-[#5A6B7A] leading-relaxed mt-1">
                      {item.diagnosis}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Experiments to Schedule */}
          <div className="bg-[#FBFBF8] border-2 border-[#14273A] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#14273A] font-heading flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#E8B422]" />
                  Recommended Post Experiments to Schedule Next
                </h3>
                <p className="text-xs text-[#5A6B7A] mt-0.5">
                  Actionable hypotheses to validate in your next content sprint.
                </p>
              </div>

              <button
                onClick={handleAddAllExperimentsToCalendar}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14273A] text-white hover:bg-[#1E364E] text-xs font-bold transition shadow-xs shrink-0"
              >
                {addedAllSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Added to Calendar!
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 text-[#E8B422]" />
                    Add All to Calendar as Ideas
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(insightsResult.nextExperiments || []).map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-[#CBD4CD] space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#14273A] text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                      {exp.platform} • {exp.format}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#14273A] font-heading">
                      {exp.idea}
                    </h4>
                    <p className="text-xs text-[#5A6B7A] leading-relaxed">
                      <strong>Hypothesis: </strong>
                      {exp.hypothesis}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + idx + 1);
                      onAddPostToCalendar({
                        brandId: brand.id,
                        date: tomorrow.toISOString().split('T')[0],
                        platform: exp.platform || brand.platforms[0] || 'Instagram',
                        text: `[Hypothesis Experiment] ${exp.idea}\n\nHypothesis: ${exp.hypothesis}`,
                        status: 'idea',
                        hook: exp.idea,
                      });
                      alert(`Added "${exp.idea}" to calendar!`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#FBFBF8] hover:bg-[#EAEFEA] border border-[#CBD4CD] text-xs font-bold text-[#14273A] transition mt-2"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#1E6F78]" />
                    Add to Calendar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
