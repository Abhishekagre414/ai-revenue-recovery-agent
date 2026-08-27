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
  Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart2, DollarSign } from 'lucide-react';

interface AnalyticsChartsProps {
  summary: BatchSummary;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ summary }) => {
  
  // Data 1: Recovery by Leak Type
  const leakData = [
    {
      name: 'Payment Degradation',
      AtRisk: summary.leak_breakdown.payment_degradation.total,
      Recovered: summary.leak_breakdown.payment_degradation.recovered,
      Rate: summary.leak_breakdown.payment_degradation.total > 0
        ? Math.round((summary.leak_breakdown.payment_degradation.recovered / summary.leak_breakdown.payment_degradation.total) * 100)
        : 0
    },
    {
      name: 'B2B Receivables',
      AtRisk: summary.leak_breakdown.b2b_receivables.total,
      Recovered: summary.leak_breakdown.b2b_receivables.recovered,
      Rate: summary.leak_breakdown.b2b_receivables.total > 0
        ? Math.round((summary.leak_breakdown.b2b_receivables.recovered / summary.leak_breakdown.b2b_receivables.total) * 100)
        : 0
    },
    {
      name: 'Checkout Abandonment',
      AtRisk: summary.leak_breakdown.checkout_abandonment.total,
      Recovered: summary.leak_breakdown.checkout_abandonment.recovered,
      Rate: summary.leak_breakdown.checkout_abandonment.total > 0
        ? Math.round((summary.leak_breakdown.checkout_abandonment.recovered / summary.leak_breakdown.checkout_abandonment.total) * 100)
        : 0
    }
  ];

  // Data 2: Root Cause Distribution
  const causeData = [
    { name: 'Expired Credit Card', value: 38, color: '#3B82F6' },
    { name: 'Transient Payday Deficit', value: 25, color: '#6366F1' },
    { name: 'Aged Invoice Cash-Flow', value: 18, color: '#8B5CF6' },
    { name: 'PO Line Item Dispute', value: 10, color: '#F59E0B' },
    { name: 'Shipping Cost Hesitation', value: 9, color: '#10B981' }
  ];

  // Data 3: Time to Recovery
  const timeData = [
    { range: '< 6 Hours', count: 42 },
    { range: '6 - 24 Hours', count: 85 },
    { range: '24 - 48 Hours', count: 34 },
    { range: '48+ Hours', count: 16 }
  ];

  // Data 4: Cost vs Revenue Saved ROI
  const roiData = [
    { category: 'Recovered Revenue Saved', value: summary.total_recovered_value, color: '#10B981' },
    { category: 'Agent Intervention Cost (Discounts/SMS)', value: Math.round(summary.total_recovered_value * 0.022), color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue at Risk vs Recovered */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Revenue at Risk vs Recovered by Leak Type ($)
            </h3>
            <span className="text-xs text-slate-400">Total Batch Comparison</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#1F2937', color: '#F8FAFC', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Bar dataKey="AtRisk" name="Revenue at Risk" fill="#3B82F6" opacity={0.5} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Recovered" name="Recovered Revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cause Distribution Pie */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              Root Cause Breakdown Across Events
            </h3>
            <span className="text-xs text-slate-400">Diagnostic Classifier</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={causeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {causeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#1F2937', color: '#F8FAFC', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% of cases`, '']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Time to Recovery Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Time-to-Recovery Velocity Distribution
            </h3>
            <span className="text-xs text-slate-400">Hours to Resolution</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="range" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#1F2937', color: '#F8FAFC', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Cases`, 'Resolved']}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Financial ROI */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Recovery ROI (Revenue Saved vs Intervention Cost)
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              45x Net ROI
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <YAxis type="category" dataKey="category" stroke="#94A3B8" fontSize={11} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B111E', borderColor: '#1F2937', color: '#F8FAFC', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-roi-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
