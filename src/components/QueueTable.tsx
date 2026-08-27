import React, { useState } from 'react';
import { RevenueEvent, LeakType, TerminalState } from '../types/recovery';
import { 
  CreditCard, 
  FileText, 
  ShoppingCart, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface QueueTableProps {
  events: RevenueEvent[];
  onSelectCase: (evt: RevenueEvent) => void;
  selectedStageFilter: string;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  events,
  onSelectCase,
  selectedStageFilter
}) => {
  const [leakFilter, setLeakFilter] = useState<LeakType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TerminalState | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'amount' | 'score'>('value');

  // Filtering
  const filteredEvents = events.filter(evt => {
    if (leakFilter !== 'all' && evt.type !== leakFilter) return false;
    if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
    if (selectedStageFilter !== 'all' && evt.current_stage !== selectedStageFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = evt.customer_name.toLowerCase().includes(term);
      const matchEmail = evt.customer_email.toLowerCase().includes(term);
      const matchId = evt.id.toLowerCase().includes(term);
      const matchPayload = JSON.stringify(evt.raw_payload).toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchId && !matchPayload) return false;
    }
    return true;
  });

  // Sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'value') return b.expected_recoverable_value - a.expected_recoverable_value;
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'score') return b.recoverability_score - a.recoverability_score;
    return 0;
  });

  const getLeakBadge = (type: LeakType) => {
    switch (type) {
      case 'payment_degradation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            Payment Fail
          </span>
        );
      case 'b2b_receivables':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            B2B Invoice
          </span>
        );
      case 'checkout_abandonment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <ShoppingCart className="w-3.5 h-3.5" />
            Cart Abandon
          </span>
        );
    }
  };

  const getStatusBadge = (status: TerminalState) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            RECOVERED
          </span>
        );
      case 'actioned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
            <Clock className="w-3 h-3" />
            ACTIONED
          </span>
        );
      case 'escalated_to_human':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <UserCheck className="w-3 h-3" />
            HUMAN QUEUE
          </span>
        );
      case 'blocked_by_guardrail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold">
            <ShieldAlert className="w-3 h-3" />
            GUARDRAIL BLOCKED
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
            LOST
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold animate-pulse">
            QUEUED
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, email, invoice ID or payload..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Leak Type Filter */}
          <select
            value={leakFilter}
            onChange={(e) => setLeakFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Leak Types</option>
            <option value="payment_degradation">Payment Degradation</option>
            <option value="b2b_receivables">B2B Receivables</option>
            <option value="checkout_abandonment">Checkout Abandonment</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Queued / Pending</option>
            <option value="actioned">Actioned</option>
            <option value="recovered">Recovered</option>
            <option value="escalated_to_human">Human Escalated</option>
            <option value="blocked_by_guardrail">Guardrail Blocked</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 mr-1" />
            <button
              onClick={() => setSortBy('value')}
              className={`px-2 py-1 rounded-lg ${sortBy === 'value' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-200'}`}
            >
              Exp. Value ($)
            </button>
            <button
              onClick={() => setSortBy('amount')}
              className={`px-2 py-1 rounded-lg ${sortBy === 'amount' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-200'}`}
            >
              Amount ($)
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-2 py-1 rounded-lg ${sortBy === 'score' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-200'}`}
            >
              Score (%)
            </button>
          </div>

        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-3 px-4">Event ID</th>
              <th className="py-3 px-4">Leak Type</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-right">Amount ($)</th>
              <th className="py-3 px-4 text-right">Recoverability</th>
              <th className="py-3 px-4 text-right">Prioritized Exp. Value</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Diagnosis / Action</th>
              <th className="py-3 px-4 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {sortedEvents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No revenue leak events match your current filter parameters.
                </td>
              </tr>
            ) : (
              sortedEvents.slice(0, 50).map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => onSelectCase(evt)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 text-slate-300 font-mono font-semibold">
                    {evt.id}
                  </td>
                  <td className="py-3 px-4">
                    {getLeakBadge(evt.type)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{evt.customer_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{evt.customer_email}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-200">
                    ${evt.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 font-bold">
                      <span className={evt.recoverability_score > 85 ? 'text-emerald-400' : evt.recoverability_score > 60 ? 'text-amber-400' : 'text-rose-400'}>
                        {evt.recoverability_score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-blue-400 font-mono">
                    ${evt.expected_recoverable_value.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(evt.status)}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                    {evt.diagnosis ? (
                      <div>
                        <div className="font-bold text-slate-200 text-[11px] truncate">
                          {evt.diagnosis.root_cause}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {evt.decision?.matched_rule || evt.diagnosis.recommended_action_class}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Pending Diagnostic Agent</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(evt);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedEvents.length > 50 && (
        <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/40">
          Showing top 50 prioritized cases out of {sortedEvents.length} total events.
        </div>
      )}
    </div>
  );
};
