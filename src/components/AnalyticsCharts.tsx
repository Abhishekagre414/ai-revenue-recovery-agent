import React from 'react';
import { BatchSummary } from '../types/recovery';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsChartsProps {
  summary: BatchSummary;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ summary }) => {
  const formatRupeeLakhs = (val: number) => `₹${(val / 100000).toFixed(1)}L`;

  // 1. Scenario Leak Breakdown Data
  const scenarioData = Object.entries(summary.leak_breakdown).map(([key, val]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    total: Math.round(val.total),
    recovered: Math.round(val.recovered),
    rate: val.total > 0 ? ((val.recovered / val.total) * 100).toFixed(1) : 0
  }));

  // 2. Recovery Rate by Intervention Data
  const interventionData = [
    { name: 'Payment Retry', rate: 88, recovered: 195000 },
    { name: 'WhatsApp Reminder', rate: 84, recovered: 140000 },
    { name: 'Email Reminder', rate: 76, recovered: 95000 },
    { name: 'Checkout Recovery', rate: 72, recovered: 60000 },
    { name: 'Subscription Recovery', rate: 82, recovered: 50000 }
  ];

  // 3. Status Breakdown
  const statusPieData = [
    { name: 'Recovered', value: summary.recovered_count, color: '#10B981' },
    { name: 'Active / Pending', value: summary.active_recoveries_count + summary.pending_count, color: '#3B82F6' },
    { name: 'Escalated', value: summary.escalated_count, color: '#F59E0B' },
    { name: 'Guardrail Stopped', value: summary.blocked_guardrails_count, color: '#EF4444' }
  ];

  // 4. Recovery Trend over 7 days
  const trendData = [
    { day: 'Mon', atRisk: 120000, recovered: 78000 },
    { day: 'Tue', atRisk: 140000, recovered: 92000 },
    { day: 'Wed', atRisk: 160000, recovered: 105000 },
    { day: 'Thu', atRisk: 130000, recovered: 89000 },
    { day: 'Fri', atRisk: 170000, recovered: 112000 },
    { day: 'Sat', atRisk: 100000, recovered: 64000 },
    { day: 'Sun', atRisk: summary.total_value_at_risk, recovered: summary.total_recovered_value }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue at Risk vs Recovered by Scenario */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Revenue at Risk vs Recovered by Problem Type
            </h3>
            <span className="text-xs text-slate-400 font-mono">Rupees (₹)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" name="At Risk (₹)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" name="Recovered (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Recovery Rate by Intervention */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Recovery Success Rate by Intervention (%)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Percentage</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interventionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Recovery Rate']}
                />
                <Bar dataKey="rate" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 3: Case Status Breakdown Pie */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              Case Distribution (Recovered vs Pending vs Escalated vs Stopped)
            </h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: 7-Day Cumulative Recovery Trend */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Cumulative Recovery Trend Over Time
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="atRisk" name="At Risk (₹)" stroke="#6366F1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recovered" name="Recovered (₹)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
