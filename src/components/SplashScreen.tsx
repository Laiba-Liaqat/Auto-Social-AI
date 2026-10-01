import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing AI Neural Engine...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Syncing Connected Social Channels...');
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Loading Multimodal Media Pipeline...');
    }, 950);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Workspace Ready!');
    }, 1400);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4 text-white select-none">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm space-y-6">
        {/* Animated Brand Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-3xl shadow-2xl shadow-cyan-500/30 animate-bounce duration-1000">
            ⚡
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-600 blur opacity-40 -z-10 animate-pulse" />
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white">
            AutoSocial <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Autonomous Social Media & Story Copilot
          </p>
        </div>

        {/* Progress Bar & Status */}
        <div className="w-64 space-y-2.5">
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-cyan-300 font-medium">
            {statusText}
          </p>
        </div>

        {/* Skip button for instant entry */}
        <button
          onClick={onComplete}
          className="pt-2 text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Skip loading</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
