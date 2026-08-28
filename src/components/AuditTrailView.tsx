import React, { useState } from 'react';
import { AuditLogEntry } from '../types/recovery';
import { Search, FileText, Filter, ShieldCheck, Stethoscope, Scale, Send, Bot } from 'lucide-react';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (actorFilter !== 'all' && log.actor !== actorFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = log.event_id.toLowerCase().includes(term);
      const matchActor = log.actor.toLowerCase().includes(term);
      const matchDesc = log.description.toLowerCase().includes(term);
      const matchAction = log.action_taken.toLowerCase().includes(term);
      if (!matchId && !matchActor && !matchDesc && !matchAction) return false;
    }
    return true;
  });

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'DETECTOR':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">DETECTOR</span>;
      case 'DIAGNOSER':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">DIAGNOSER</span>;
      case 'POLICY_ENGINE':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">POLICY ENGINE</span>;
      case 'STOPPING_ENGINE':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">STOPPING ENGINE</span>;
      case 'ACTUATOR':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">ACTUATOR</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">{actor}</span>;
    }
  };

  const formatRupee = (val?: number) => val ? `₹${val.toLocaleString('en-IN')}` : '-';

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
      
      {/* Header & Search Toolbar */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            📋 Agent Immutable Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every AI agent decision, diagnostic step, guardrail check, and money recovery is logged with precise timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by Case ID or text..."
              className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Actor Filter */}
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Agent Actors</option>
            <option value="DETECTOR">Detector</option>
            <option value="DIAGNOSER">Diagnoser</option>
            <option value="POLICY_ENGINE">Policy Engine</option>
            <option value="STOPPING_ENGINE">Stopping Engine</option>
            <option value="ACTUATOR">Actuator Engine</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action Taken</th>
              <th className="py-3 px-4">Event Details & Log Description</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  No audit log entries found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.slice(-100).reverse().map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {log.event_id}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {getActorBadge(log.actor)}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-300">
                    {log.action_taken}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                    {log.description}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {formatRupee(log.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
