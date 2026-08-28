import React from 'react';
import { Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingGuideProps {
  onClose: () => void;
  onRunAgent: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onClose, onRunAgent }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 p-5 lg:p-6 shadow-xl animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        title="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-base sm:text-lg font-black text-white">
            Welcome to Revenue Recovery 👋
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The AI agent automatically finds revenue at risk, decides the best recovery action to take, and tracks the money recovered back into your account.
        </p>

        {/* 3 Simple Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px] font-black">1</span>
              Review Risk
            </div>
            <p className="text-slate-400 text-[11px]">
              See how much revenue is at risk from failed payments or overdue invoices.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-black">2</span>
              Run Agent
            </div>
            <p className="text-slate-400 text-[11px]">
              Click <strong>▶ Run Recovery Agent</strong> to automatically diagnose and recover funds.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px] font-black">3</span>
              Track Recovery
            </div>
            <p className="text-slate-400 text-[11px]">
              Watch money move directly from 🔴 <strong>At Risk</strong> to 🟢 <strong>Recovered</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onRunAgent}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            Start Recovery Agent Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Got it, hide this guide
          </button>
        </div>
      </div>
    </div>
  );
};
