import React, { useState } from 'react';
import { Settings, ShieldAlert, CheckCircle2, Lock, Clock, DollarSign, RotateCcw } from 'lucide-react';

interface SettingsViewProps {
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  killSwitchActive,
  onToggleKillSwitch
}) => {
  const [maxMessages, setMaxMessages] = useState(2);
  const [maxRetries, setMaxRetries] = useState(3);
  const [highValueThreshold, setHighValueThreshold] = useState(100000);
  const [quietHoursActive, setQuietHoursActive] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#0B101D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">⚙️ Recovery Agent Settings & Guardrail Rules</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure how the agent communicates with customers and when human approval is required.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved!
          </span>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* Guardrail 1: Max Customer Messages */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-emerald-400" />
            Max Messages Per Customer
          </div>
          <p className="text-slate-400 text-xs">
            Maximum automated reminders sent to a single customer before stopping.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              min={1}
              max={5}
              value={maxMessages}
              onChange={(e) => setMaxMessages(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold font-mono w-24"
            />
            <span className="text-slate-400">Messages (Recommended: 2)</span>
          </div>
        </div>

        {/* Guardrail 2: Max Payment Retries */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <RotateCcw className="w-4 h-4 text-blue-400" />
            Max Payment Retry Attempts
          </div>
          <p className="text-slate-400 text-xs">
            Maximum automated payment retry attempts per card/bank decline.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              min={1}
              max={5}
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold font-mono w-24"
            />
            <span className="text-slate-400">Retries (Recommended: 3)</span>
          </div>
        </div>

        {/* Guardrail 3: High-Value Approval Ceiling */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <DollarSign className="w-4 h-4 text-amber-400" />
            High-Value Approval Threshold (₹)
          </div>
          <p className="text-slate-400 text-xs">
            Cases above this amount require human manager approval before taking action.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="number"
              step={10000}
              value={highValueThreshold}
              onChange={(e) => setHighValueThreshold(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold font-mono w-36"
            />
            <span className="text-slate-400">Rupees (Recommended: ₹1,00,000)</span>
          </div>
        </div>

        {/* Guardrail 4: Quiet Hours Policy */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Clock className="w-4 h-4 text-cyan-400" />
            Quiet Hours Policy (10 PM - 8 AM)
          </div>
          <p className="text-slate-400 text-xs">
            Block customer messages during night hours. Scheduled for 08:01 AM automatically.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={quietHoursActive}
                onChange={(e) => setQuietHoursActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-200 font-semibold">Enable Quiet Hours Protection</span>
            </label>
          </div>
        </div>

      </div>

      {/* Emergency Kill Switch Section */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-900/50 bg-rose-950/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            Emergency Global Kill Switch
          </div>
          <button
            onClick={onToggleKillSwitch}
            className={`px-4 py-2 rounded-xl text-xs font-black transition border ${
              killSwitchActive
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-rose-400'
            }`}
          >
            {killSwitchActive ? 'Kill Switch ACTIVE' : 'Engage Emergency Kill Switch'}
          </button>
        </div>
        <p className="text-slate-300 text-xs">
          Instantly pauses all automated outreach across all active cases across the platform.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30"
        >
          Save Settings
        </button>
      </div>

    </div>
  );
};
