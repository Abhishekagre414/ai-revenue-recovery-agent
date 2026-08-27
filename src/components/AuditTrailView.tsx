import React, { useState } from 'react';
import { AuditLogEntry } from '../types/recovery';
import { Search, Download, ShieldCheck, FileText, Filter } from 'lucide-react';

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
      const matchActor = log.actor.toLowerCase().includes(term);
      const matchAction = log.action_taken.toLowerCase().includes(term);
      const matchDesc = log.description.toLowerCase().includes(term);
      const matchEvt = log.event_id.toLowerCase().includes(term);
      if (!matchActor && !matchAction && !matchDesc && !matchEvt) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'EventID', 'Stage', 'Actor', 'Action', 'Description'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.event_id,
      l.stage,
      l.actor,
      `"${l.action_taken}"`,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recovery_agent_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `recovery_agent_audit_trail_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-0">
      
      {/* Header Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Immutable Audit Trail & Compliance Log
          </h2>
          <p className="text-xs text-slate-400">Complete cryptographically traceable history of every detection, policy lookup, guardrail check, and action</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-950/60 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter audit entries by keyword or event ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All Actors</option>
          <option value="DETECTOR">DETECTOR</option>
          <option value="DIAGNOSER">DIAGNOSER</option>
          <option value="POLICY_ENGINE">POLICY_ENGINE</option>
          <option value="STOPPING_ENGINE">STOPPING_ENGINE</option>
          <option value="ACTUATOR">ACTUATOR</option>
          <option value="HUMAN_OPERATOR">HUMAN_OPERATOR</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-3 px-4">Log Timestamp</th>
              <th className="py-3 px-4">Event ID</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Actor Module</th>
              <th className="py-3 px-4">Action Taken</th>
              <th className="py-3 px-4">Audit Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  No audit log entries matching query.
                </td>
              </tr>
            ) : (
              filteredLogs.slice(0, 100).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-4 text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-blue-400">
                    {log.event_id}
                  </td>
                  <td className="py-2.5 px-4 uppercase text-[10px] text-slate-300 font-sans font-semibold">
                    {log.stage}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.actor === 'STOPPING_ENGINE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      log.actor === 'POLICY_ENGINE' ? 'bg-purple-500/20 text-purple-300' :
                      log.actor === 'ACTUATOR' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.actor}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-200">
                    {log.action_taken}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 font-sans max-w-lg truncate">
                    {log.description}
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
