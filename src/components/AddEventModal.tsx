import React, { useState } from 'react';
import { RevenueEvent, LeakType } from '../types/recovery';
import { X, PlusCircle } from 'lucide-react';

interface AddEventModalProps {
  onClose: () => void;
  onAddEvent: (evt: Partial<RevenueEvent>) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onAddEvent }) => {
  const [type, setType] = useState<LeakType>('payment_degradation');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@company.com');
  const [amount, setAmount] = useState(499);
  const [declineCode, setDeclineCode] = useState('expired_card');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      type,
      customer_name: name,
      customer_email: email,
      amount,
      raw_payload: {
        decline_code: declineCode,
        decline_message: `Manual injection event for ${declineCode}`
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-[#0B111E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Inject Mock Revenue Leak Event
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Leak Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeakType)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5"
            >
              <option value="payment_degradation">Payment Degradation (Card Decline)</option>
              <option value="b2b_receivables">B2B Receivables (Overdue Invoice)</option>
              <option value="checkout_abandonment">Checkout Abandonment (Cart Abandon)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Customer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Customer Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Decline / Failure Signal</label>
            <select
              value={declineCode}
              onChange={(e) => setDeclineCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5"
            >
              <option value="expired_card">expired_card (Card Expired)</option>
              <option value="insufficient_funds">insufficient_funds (Payday Deficit)</option>
              <option value="po_dispute">po_dispute (B2B SOW Dispute)</option>
              <option value="shipping_shock">shipping_shock (Checkout Fee Abandonment)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Inject Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
