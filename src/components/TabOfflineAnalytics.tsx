import React, { useState } from 'react';
import {
  BarChart3,
  Hash,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { computeOfflineMetrics } from '../utils/aiEngine';

export const TabOfflineAnalytics: React.FC = () => {
  const [caption, setCaption] = useState('');
  const metrics = computeOfflineMetrics(caption);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Hashtag & Engagement Analyzer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test any caption before publishing. Check character counts, hashtag discovery rating, and estimated audience reach in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time Engagement Scoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Paste Post or Story Caption to Analyze</span>
              </label>
              {caption && (
                <button
                  onClick={() => setCaption('')}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-medium cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={8}
              placeholder="Paste or type any social media caption here to analyze character count, hashtags, and viral score..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none selection:bg-cyan-500/20"
            />
          </div>

          {/* Hashtag Inspector */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Detected Hashtags ({metrics.hashtagCount})</span>
              </span>
              <span className="text-xs text-cyan-400 font-medium">{metrics.densityRating}</span>
            </div>

            <div className="flex flex-wrap gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 min-h-[50px]">
              {metrics.hashtags.length > 0 ? (
                metrics.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No hashtags detected in text</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metrics Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Readability
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-cyan-400">{metrics.readabilityScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <span className="text-[11px] text-slate-300 block mt-1">{metrics.readabilityGrade}</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Estimated Reach
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-400">{metrics.engagementIndex}%</span>
              </div>
              <span className="text-[11px] text-emerald-400 block mt-1">High Virality Index</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Character Count
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{metrics.charCount}</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                {metrics.charCount <= 280 ? 'Fits X / Twitter thread' : 'Standard feed caption'}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Word Count
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{metrics.wordCount}</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">~{Math.max(1, Math.round(metrics.wordCount / 180))} min read</span>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Reach Optimization Tips</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Instagram & TikTok:</strong> Include 5 to 10 niche hashtags relevant to your creator industry.
                </span>
              </div>

              <div className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>LinkedIn & X:</strong> Keep sentences punchy with line breaks to maximize mobile engagement.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
