import React, { useState } from 'react';
import { RevenueEvent, LeakType, TerminalState, RiskLevel } from '../types/recovery';
import { 
  CreditCard, 
  FileText, 
  ShoppingCart, 
  Search, 
  ArrowUpDown, 
  ChevronRight,
  RefreshCw,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface QueueTableProps {
  events: RevenueEvent[];
  onSelectCase: (evt: RevenueEvent) => void;
  selectedStageFilter: string;
  onOpenConfirmationModal?: (evt: RevenueEvent, action: string) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  events,
  onSelectCase,
  selectedStageFilter,
  onOpenConfirmationModal
}) => {
  const [leakFilter, setLeakFilter] = useState<LeakType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TerminalState | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'amount' | 'score'>('value');

  // Filtering
  const filteredEvents = events.filter(evt => {
    if (leakFilter !== 'all' && evt.type !== leakFilter) return false;
    if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
    if (riskFilter !== 'all' && evt.risk_level !== riskFilter) return false;
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
    if (sortBy === 'score') return b.recovery_probability - a.recovery_probability;
    return 0;
  });

  const formatRupee = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const getIssueLabel = (type: LeakType) => {
    switch (type) {
      case 'payment_failure':
        return <span className="text-slate-200 font-semibold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-400" /> Payment Failed</span>;
      case 'failed_subscription':
        return <span className="text-slate-200 font-semibold flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Subscription Failed</span>;
      case 'overdue_invoice':
        return <span className="text-slate-200 font-semibold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-purple-400" /> Invoice Overdue</span>;
      case 'checkout_abandonment':
        return <span className="text-slate-200 font-semibold flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Checkout Abandoned</span>;
      case 'mandate_failure':
        return <span className="text-slate-200 font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Mandate Failed</span>;
    }
  };

  // Requirement #6: Use status indicators consistently with both icon/dot AND text
  const getStatusBadge = (status: TerminalState) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <span>🟢</span> Recovered
          </span>
        );
      case 'actioned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
            <span>🔵</span> Actioned
          </span>
        );
      case 'escalated_to_human':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <span>🟠</span> Escalated
          </span>
        );
      case 'blocked_by_guardrail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
            <span>⚪</span> Stopped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
            <span>🟡</span> Pending
          </span>
        );
    }
  };

  const getActionLabel = (action: string) => {
    if (action.includes('retry')) return 'Retry Payment';
    if (action.includes('whatsapp') || action.includes('email')) return 'Send Reminder';
    if (action.includes('invoice')) return 'Invoice Follow-up';
    if (action.includes('checkout')) return 'Cart Reminder';
    if (action.includes('subscription')) return 'Subscription Renewal';
    return 'Escalate to AR';
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Customer name, email, invoice ID..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Scenario Filter */}
          <select
            value={leakFilter}
            onChange={(e) => setLeakFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Issues</option>
            <option value="payment_failure">Payment Failed</option>
            <option value="failed_subscription">Subscription Renewal Failed</option>
            <option value="overdue_invoice">Invoice Overdue</option>
            <option value="checkout_abandonment">Checkout Abandoned</option>
            <option value="mandate_failure">Mandate Failed</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="actioned">Actioned</option>
            <option value="recovered">Recovered</option>
            <option value="escalated_to_human">Escalated</option>
            <option value="blocked_by_guardrail">Stopped</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 mr-1" />
            <button
              onClick={() => setSortBy('value')}
              className={`px-2 py-1 rounded-lg ${sortBy === 'value' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-200'}`}
            >
              Exp. Value
            </button>
            <button
              onClick={() => setSortBy('amount')}
              className={`px-2 py-1 rounded-lg ${sortBy === 'amount' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-200'}`}
            >
              Amount
            </button>
          </div>

        </div>
      </div>

      {/* Events Table (Requirement #7: Simple Customer Table) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Issue</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4">Risk</th>
              <th className="py-3.5 px-4">Recommended Action</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {sortedEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-sans space-y-2">
                  <div className="text-2xl">🎉</div>
                  <div className="font-bold text-slate-200">No Revenue at Risk</div>
                  <p className="text-xs text-slate-500">All currently detected revenue issues have been handled or match your filter parameters.</p>
                </td>
              </tr>
            ) : (
              sortedEvents.slice(0, 50).map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => onSelectCase(evt)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{evt.customer_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{evt.customer_email}</div>
                  </td>

                  {/* Issue */}
                  <td className="py-3.5 px-4">
                    {getIssueLabel(evt.type)}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-bold text-slate-200 font-mono">
                    {formatRupee(evt.amount)}
                  </td>

                  {/* Risk */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      evt.risk_level === 'HIGH'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : evt.risk_level === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {evt.risk_level === 'HIGH' ? '🔴 High Risk' : evt.risk_level === 'MEDIUM' ? '🟡 Medium Risk' : '🟢 Low Risk'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-blue-400 font-bold">
                    {evt.decision ? (
                      <span className="capitalize">{getActionLabel(evt.decision.chosen_action_type)}</span>
                    ) : (
                      <span className="text-slate-500 italic">Analyzing...</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(evt.status)}
                  </td>

                  {/* Inspect */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(evt);
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition"
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
          Showing top 50 cases out of {sortedEvents.length} total events.
        </div>
      )}
    </div>
  );
};
