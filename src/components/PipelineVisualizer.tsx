import React from 'react';
import { Stage } from '../types/recovery';
import { Search, Stethoscope, Scale, Send, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

interface PipelineVisualizerProps {
  stageCounts: Record<Stage, number>;
  activeStage?: Stage;
  onSelectStageFilter?: (stage: Stage | 'all') => void;
  selectedStageFilter: Stage | 'all';
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  stageCounts,
  onSelectStageFilter,
  selectedStageFilter
}) => {
  const stages: { id: Stage; label: string; sub: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'detect',
      label: '1. DETECT',
      sub: 'Normalized Ingestion & Value Scoring',
      icon: <Search className="w-4 h-4 text-blue-400" />,
      color: 'from-blue-600/20 to-blue-900/40 border-blue-500/40 text-blue-300'
    },
    {
      id: 'diagnose',
      label: '2. DIAGNOSE',
      sub: 'Root Cause Classifier + LLM Signals',
      icon: <Stethoscope className="w-4 h-4 text-indigo-400" />,
      color: 'from-indigo-600/20 to-indigo-900/40 border-indigo-500/40 text-indigo-300'
    },
    {
      id: 'decide',
      label: '3. DECIDE',
      sub: 'Hard Policy Table + Bounded LLM Copy',
      icon: <Scale className="w-4 h-4 text-purple-400" />,
      color: 'from-purple-600/20 to-purple-900/40 border-purple-500/40 text-purple-300'
    },
    {
      id: 'act',
      label: '4. ACT',
      sub: 'Sandboxed Connectors (Links, Retries, Voice)',
      icon: <Send className="w-4 h-4 text-amber-400" />,
      color: 'from-amber-600/20 to-amber-900/40 border-amber-500/40 text-amber-300'
    },
    {
      id: 'measure',
      label: '5. MEASURE',
      sub: 'Outcome State Machine & Audit Log',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      color: 'from-emerald-600/20 to-emerald-900/40 border-emerald-500/40 text-emerald-300'
    }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>5-Stage Agent Pipeline Architecture</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Live Stream
            </span>
          </h2>
          <p className="text-xs text-slate-400">Click any stage block to filter cases currently in that processing stage</p>
        </div>

        {selectedStageFilter !== 'all' && (
          <button
            onClick={() => onSelectStageFilter?.('all')}
            className="text-xs text-blue-400 hover:underline font-semibold"
          >
            Clear Stage Filter
          </button>
        )}
      </div>

      {/* 5-stage flex grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((st, idx) => {
          const isSelected = selectedStageFilter === st.id;
          const count = stageCounts[st.id] || 0;

          return (
            <div key={st.id} className="relative group">
              <button
                onClick={() => onSelectStageFilter?.(st.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden bg-gradient-to-b ${st.color} ${
                  isSelected ? 'ring-2 ring-blue-500 scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700">
                    {st.icon}
                  </div>
                  <span className="text-lg font-black text-white px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800">
                    {count}
                  </span>
                </div>
                <div className="font-bold text-xs text-white tracking-wide">{st.label}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{st.sub}</div>

                {/* Processing bar */}
                <div className="w-full bg-slate-950/60 rounded-full h-1 mt-3 overflow-hidden">
                  <div 
                    className="bg-blue-400 h-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (count / 200) * 100)}%` }}
                  />
                </div>
              </button>

              {/* Arrow Connector for Desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stopping Rules Engine Interceptor Line */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between bg-rose-950/20 p-2.5 rounded-xl border-rose-900/30">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Stopping Rules Engine Active</span>
          <span className="text-xs text-slate-400 hidden sm:inline">• Enforces frequency caps, 24h cooldowns, $50 discount ceilings & human escalation</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
          Hard Gate
        </span>
      </div>
    </div>
  );
};
