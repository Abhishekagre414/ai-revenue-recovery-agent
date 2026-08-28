import React from 'react';
import { RevenueEvent } from '../types/recovery';
import { X, Send, AlertTriangle } from 'lucide-react';

interface ActionConfirmationModalProps {
  event: RevenueEvent | null;
  actionType: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  event,
  actionType,
  onClose,
  onConfirm
}) => {
  if (!event) return null;

  const formatRupee = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B111E] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Confirm Recovery Action</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Card */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Customer:</span>
            <span className="text-slate-100 font-bold">{event.customer_name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Amount At Risk:</span>
            <span className="text-emerald-400 font-black font-mono">{formatRupee(event.amount)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Recovery Action:</span>
            <span className="text-blue-400 font-bold capitalize">{actionType.replace('_', ' ')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Execution Mode:</span>
            <span className="text-amber-300 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Demo Simulation Mode
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Confirming will execute this recovery action in demo mode and log the event in the audit trail.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20"
          >
            Confirm Action
          </button>
        </div>

      </div>
    </div>
  );
};
