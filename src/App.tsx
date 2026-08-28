import React, { useState, useEffect, useRef } from 'react';
import { RevenueEvent, BatchSummary, Stage, TerminalState, AuditLogEntry } from './types/recovery';
import { generateSyntheticEvents } from './engine/syntheticData';
import { detector } from './engine/detector';
import { diagnoser } from './engine/diagnoser';
import { policyDecider } from './engine/policyDecider';
import { stoppingRules } from './engine/stoppingRules';
import { actuator } from './engine/actuator';

import { Header, NavTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { OnboardingGuide } from './components/OnboardingGuide';
import { BatchWorkflowTracker } from './components/BatchWorkflowTracker';
import { LiveActivityPanel } from './components/LiveActivityPanel';
import { MetricsOverview } from './components/MetricsOverview';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { QueueTable } from './components/QueueTable';
import { CaseDetailModal } from './components/CaseDetailModal';
import { ComplianceGuardrailsView } from './components/ComplianceGuardrailsView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AuditTrailView } from './components/AuditTrailView';
import { AddEventModal } from './components/AddEventModal';
import { ActionConfirmationModal } from './components/ActionConfirmationModal';
import { SettingsView } from './components/SettingsView';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export function App() {
  // State initialization with 100 cases by default
  const [events, setEvents] = useState<RevenueEvent[]>(() => generateSyntheticEvents(100));
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCase, setSelectedCase] = useState<RevenueEvent | null>(null);
  
  // Navigation Tabs: 'overview' | 'agent' | 'customers' | 'revenue' | 'audit' | 'settings'
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedStageFilter, setSelectedStageFilter] = useState<Stage | 'all'>('all');
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [globalAuditLogs, setGlobalAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Action confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState<{ event: RevenueEvent; action: string } | null>(null);

  // Feedback Toast Notification State (Requirement #11)
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'recovered' } | null>(null);

  // Real-time batch processing tracker state
  const [activeProcessingEvent, setActiveProcessingEvent] = useState<RevenueEvent | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Activity panel ref for smooth scroll
  const activityPanelRef = useRef<HTMLDivElement>(null);

  // Sync initial audit logs
  useEffect(() => {
    const logs: AuditLogEntry[] = [];
    events.forEach(e => logs.push(...e.audit_logs));
    setGlobalAuditLogs(logs);
  }, []);

  // Compute batch summary stats dynamically from simulated cases
  const summary: BatchSummary = React.useMemo(() => {
    let totalValueAtRisk = 0;
    let totalRecoveredValue = 0;
    let escalatedCount = 0;
    let blockedCount = 0;
    let recoveredCount = 0;
    let pendingCount = 0;
    let activeRecoveriesCount = 0;

    const leakBreakdown = {
      payment_failure: { total: 0, recovered: 0, count: 0 },
      failed_subscription: { total: 0, recovered: 0, count: 0 },
      overdue_invoice: { total: 0, recovered: 0, count: 0 },
      checkout_abandonment: { total: 0, recovered: 0, count: 0 },
      mandate_failure: { total: 0, recovered: 0, count: 0 }
    };

    events.forEach(evt => {
      totalValueAtRisk += evt.amount;
      leakBreakdown[evt.type].total += evt.amount;
      leakBreakdown[evt.type].count += 1;

      if (evt.status === 'recovered') {
        totalRecoveredValue += evt.amount;
        recoveredCount += 1;
        leakBreakdown[evt.type].recovered += evt.amount;
      } else if (evt.status === 'pending') {
        pendingCount += 1;
      } else if (evt.status === 'escalated_to_human') {
        escalatedCount += 1;
      } else if (evt.status === 'blocked_by_guardrail') {
        blockedCount += 1;
      } else if (evt.status === 'actioned' || evt.status === 'decided' || evt.status === 'diagnosed') {
        activeRecoveriesCount += 1;
      }
    });

    const recoveryRate = totalValueAtRisk > 0 ? (totalRecoveredValue / totalValueAtRisk) * 100 : 0;

    return {
      total_events: events.length,
      total_value_at_risk: Math.round(totalValueAtRisk),
      total_recovered_value: Math.round(totalRecoveredValue),
      overall_recovery_rate: recoveryRate,
      active_recoveries_count: activeRecoveriesCount,
      escalated_count: escalatedCount,
      blocked_guardrails_count: blockedCount,
      recovered_count: recoveredCount,
      pending_count: pendingCount,
      stopped_count: blockedCount,
      avg_time_to_recovery_hours: 12.4,
      leak_breakdown: leakBreakdown
    };
  }, [events]);

  // Automated Batch Processing Engine Interval
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (!isRunningRef.current) return;

      setEvents(prevEvents => {
        // Find next event needing pipeline processing
        const targetIndex = prevEvents.findIndex(e => e.status === 'pending');
        if (targetIndex === -1) {
          setIsRunning(false);
          setActiveProcessingEvent(null);
          triggerToast('🎉 All batch cases processed! Recovery completed.', 'success');
          return prevEvents;
        }

        const updated = [...prevEvents];
        const event = { ...updated[targetIndex] };
        const now = new Date().toISOString();

        // Step 1: Diagnose Root Cause & Calculate Recovery Score
        setCurrentStepIndex(2);
        const diag = diagnoser.diagnose(event);
        event.diagnosis = diag;
        event.current_stage = 'diagnose';

        // Step 2: Decide Policy Intervention & Confidence
        setCurrentStepIndex(4);
        const dec = policyDecider.decide(event, diag);
        event.decision = dec;
        event.current_stage = 'decide';

        // Step 3: Check Stopping Guardrails
        setCurrentStepIndex(5);
        const stopCheck = stoppingRules.evaluate(event, dec);
        event.stopping_rule_check = stopCheck;

        // Build audit logs
        const formattedAmount = `₹${event.amount.toLocaleString('en-IN')}`;
        const newLogs: AuditLogEntry[] = [
          ...event.audit_logs,
          {
            id: `LOG-DIAG-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'diagnose',
            actor: 'DIAGNOSER',
            action_taken: 'ROOT_CAUSE_DIAGNOSED',
            description: `Diagnosed root cause: '${diag.root_cause}' with ${diag.confidence}% confidence.`,
            amount: event.amount
          },
          {
            id: `LOG-DEC-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'decide',
            actor: 'POLICY_ENGINE',
            action_taken: 'INTERVENTION_SELECTED',
            description: `Selected strategy '${dec.chosen_action_type}'. Rationale: ${dec.llm_rationale}`,
            amount: event.amount
          },
          {
            id: `LOG-STOP-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'decide',
            actor: 'STOPPING_ENGINE',
            action_taken: stopCheck.passed ? 'GUARDRAIL_PASSED' : 'GUARDRAIL_BLOCKED',
            description: stopCheck.passed 
              ? 'Passed all compliance frequency, cooldown, and spend guardrails.'
              : stopCheck.block_reason || 'Blocked by stopping engine.',
            amount: event.amount
          }
        ];

        if (!stopCheck.action_allowed) {
          event.status = stopCheck.requires_human_approval ? 'escalated_to_human' : 'blocked_by_guardrail';
          event.stopped_reason = stopCheck.block_reason;
          event.current_stage = 'measure';
          event.next_action = stopCheck.requires_human_approval ? 'Escalated to Human AR Queue' : 'Workflow Stopped';
          event.escalation_status = stopCheck.requires_human_approval ? 'escalated' : 'stopped';
        } else {
          // Step 4: Execute Recovery Connector
          setCurrentStepIndex(6);
          const act = actuator.execute(event, dec);
          event.action = act;
          event.current_stage = 'act';
          event.outreach_count += 1;
          event.last_outreach_at = now;

          // Step 5: Simulate Customer Response & Calculate Money Recovered (65.8% recovery rate simulation for demo accuracy)
          setCurrentStepIndex(8);
          const isRecovered = Math.random() < 0.658;
          event.status = isRecovered ? 'recovered' : 'actioned';
          event.current_stage = 'measure';
          event.next_action = isRecovered ? 'Recovery Verified & Workflow Stopped' : 'Awaiting Customer Response';

          newLogs.push({
            id: `LOG-ACT-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'act',
            actor: 'ACTUATOR',
            action_taken: isRecovered ? 'REVENUE_RECOVERED' : 'CONNECTOR_EXECUTED',
            description: isRecovered
              ? `Payment successful! Recovered ${formattedAmount} for ${event.customer_name}. Workflow stopped.`
              : `Executed connector '${act.connector}'. Status: ${event.status.toUpperCase()}.`,
            amount: isRecovered ? event.amount : undefined
          });

          if (isRecovered) {
            triggerToast(`🟢 ${formattedAmount} Recovered for ${event.customer_name}! Workflow automatically stopped.`, 'recovered');
          }
        }

        setCurrentStepIndex(9);
        event.audit_logs = newLogs;
        updated[targetIndex] = event;

        // Set as active live activity card
        setActiveProcessingEvent(event);

        // Append to global audit stream
        setGlobalAuditLogs(g => [...g, ...newLogs]);

        // Keep selected case updated if modal open
        if (selectedCase && selectedCase.id === event.id) {
          setSelectedCase(event);
        }

        return updated;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isRunning, selectedCase]);

  // Toast Helper
  const triggerToast = (message: string, type: 'success' | 'info' | 'recovered' = 'info') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Event Handlers
  const handleToggleRun = () => {
    const next = !isRunning;
    setIsRunning(next);
    if (next) {
      setActiveTab('agent');
      triggerToast('▶ Recovery Agent started batch processing!', 'info');
    }
  };

  const handleResetDemo = () => {
    setIsRunning(false);
    setActiveProcessingEvent(null);
    setCurrentStepIndex(0);
    const fresh = generateSyntheticEvents(100);
    setEvents(fresh);
    const logs: AuditLogEntry[] = [];
    fresh.forEach(e => logs.push(...e.audit_logs));
    setGlobalAuditLogs(logs);
    setSelectedCase(null);
    triggerToast('Demo reset to 100 fresh recovery cases.', 'info');
  };

  const handleToggleKillSwitch = () => {
    const next = !killSwitchActive;
    setKillSwitchActive(next);
    stoppingRules.setGlobalKillSwitch(next);
    if (next) {
      setIsRunning(false);
      triggerToast('🛑 Emergency Kill Switch engaged by administrator!', 'info');
    }
  };

  const handleAddEvent = (rawEvt: Partial<RevenueEvent>) => {
    const norm = detector.normalizeEvent(rawEvt);
    setEvents(prev => [norm, ...prev]);
    setGlobalAuditLogs(g => [...g, ...norm.audit_logs]);
    triggerToast(`Added new case: ${norm.customer_name} (₹${norm.amount.toLocaleString('en-IN')})`, 'success');
  };

  const handleUpdateStatus = (eventId: string, newStatus: TerminalState) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const updated = { ...e, status: newStatus, current_stage: 'measure' as Stage };
        if (selectedCase && selectedCase.id === eventId) {
          setSelectedCase(updated);
        }
        return updated;
      }
      return e;
    }));
    triggerToast(`Updated status to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const handleTriggerMockViolation = (type: 'discount' | 'frequency' | 'quiethours' | 'optout') => {
    const mockId = `CUST-VIOL-${Math.floor(100 + Math.random() * 900)}`;
    let doNotContact = false;
    let quietHours = false;
    let outreachCount = 1;

    if (type === 'optout') doNotContact = true;
    if (type === 'quiethours') quietHours = true;
    if (type === 'frequency') outreachCount = 3;

    const mockEvt: RevenueEvent = {
      id: mockId,
      type: 'payment_failure',
      customer_id: mockId,
      customer_name: 'Guardrail Persona Test',
      customer_email: 'guardrail.test@company.in',
      customer_phone: '+91 9999988888',
      customer_tier: 'enterprise',
      amount: 45000,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      raw_payload: { decline_code: 'expired_card' },
      risk_level: 'HIGH',
      recovery_probability: 90,
      expected_recoverable_value: 40500,
      status: 'blocked_by_guardrail',
      current_stage: 'decide',
      outreach_count: outreachCount,
      do_not_contact: doNotContact,
      quiet_hours_active: quietHours,
      next_action: 'Blocked by Stopping Rule Engine',
      escalation_status: 'stopped',
      stopping_rule_check: {
        passed: false,
        triggered_rules: ['RULE_GUARDRAIL_BLOCKED'],
        action_allowed: false,
        requires_human_approval: true,
        block_reason: `🛑 Recovery Stopped Reason: Intercepted illegal ${type} attempt in real-time.`
      },
      audit_logs: [
        {
          id: `LOG-VIOL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event_id: mockId,
          stage: 'decide',
          actor: 'STOPPING_ENGINE',
          action_taken: 'GUARDRAIL_VIOLATION_INTERCEPTED',
          description: `Blocked illegal ${type} action. Required manager handoff.`,
          amount: 45000
        }
      ]
    };

    setEvents(prev => [mockEvt, ...prev]);
    setGlobalAuditLogs(g => [...g, ...mockEvt.audit_logs]);
    setActiveProcessingEvent(mockEvt);
    triggerToast(`Intercepted ${type} violation! Guardrail rule enforced.`, 'info');
  };

  const scrollToActivity = () => {
    setActiveTab('agent');
    setTimeout(() => {
      activityPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const processedCount = events.filter(e => e.status !== 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 selection:bg-blue-500 selection:text-white pb-16 font-sans">
      
      {/* Feedback Toast Banner (Requirement #11) */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-bold ${
            feedbackToast.type === 'recovered'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50 shadow-emerald-500/20'
              : feedbackToast.type === 'success'
              ? 'bg-blue-950 text-blue-200 border-blue-500/50 shadow-blue-500/20'
              : 'bg-slate-900 text-slate-200 border-slate-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast.message}</span>
            <button onClick={() => setFeedbackToast(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onReset={handleResetDemo}
        killSwitchActive={killSwitchActive}
        onToggleKillSwitch={handleToggleKillSwitch}
        onOpenAddEvent={() => setIsAddModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        processedCount={processedCount}
        totalCount={events.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Onboarding Guide (Requirement #5) */}
        {showOnboarding && (
          <OnboardingGuide
            onClose={() => setShowOnboarding(false)}
            onRunAgent={handleToggleRun}
          />
        )}

        {/* 🏠 OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <HeroBanner
              summary={summary}
              isRunning={isRunning}
              onRunAgent={handleToggleRun}
              onViewActivity={scrollToActivity}
              onResetDemo={handleResetDemo}
            />

            <MetricsOverview summary={summary} />

            <BeforeAfterSection summary={summary} />

            {/* Quick Customer Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent At-Risk Cases</h3>
                <button
                  onClick={() => setActiveTab('customers')}
                  className="text-xs text-blue-400 hover:underline font-semibold"
                >
                  View All Customers →
                </button>
              </div>
              <QueueTable
                events={events}
                onSelectCase={(evt) => setSelectedCase(evt)}
                selectedStageFilter={selectedStageFilter}
              />
            </div>
          </div>
        )}

        {/* 🤖 RECOVERY AGENT TAB */}
        {activeTab === 'agent' && (
          <div className="space-y-6">
            <BatchWorkflowTracker
              isRunning={isRunning}
              currentStepIndex={currentStepIndex}
              summary={summary}
            />

            <div ref={activityPanelRef}>
              <LiveActivityPanel
                currentEvent={activeProcessingEvent}
                totalEvents={events.length}
                processedCount={processedCount}
                isRunning={isRunning}
              />
            </div>

            <ComplianceGuardrailsView
              onTriggerMockViolation={handleTriggerMockViolation}
              killSwitchActive={killSwitchActive}
              onToggleKillSwitch={handleToggleKillSwitch}
              blockedCount={summary.blocked_guardrails_count}
            />
          </div>
        )}

        {/* 👥 CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">👥 Customer Recovery List</h2>
                <p className="text-xs text-slate-400 mt-0.5">Filter and inspect individual customer recovery cases.</p>
              </div>
            </div>

            <QueueTable
              events={events}
              onSelectCase={(evt) => setSelectedCase(evt)}
              selectedStageFilter={selectedStageFilter}
            />
          </div>
        )}

        {/* 💰 REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <MetricsOverview summary={summary} />
            <AnalyticsCharts summary={summary} />
          </div>
        )}

        {/* 📋 AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <AuditTrailView logs={globalAuditLogs} />
        )}

        {/* ⚙️ SETTINGS TAB */}
        {activeTab === 'settings' && (
          <SettingsView
            killSwitchActive={killSwitchActive}
            onToggleKillSwitch={handleToggleKillSwitch}
          />
        )}

      </main>

      {/* Case Details Inspector Modal */}
      <CaseDetailModal
        event={selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Manual Action Confirmation Modal (Requirement #10) */}
      {confirmModalData && (
        <ActionConfirmationModal
          event={confirmModalData.event}
          actionType={confirmModalData.action}
          onClose={() => setConfirmModalData(null)}
          onConfirm={() => {
            handleUpdateStatus(confirmModalData.event.id, 'actioned');
            triggerToast(`✅ Sent ${confirmModalData.action.replace('_', ' ')} for ${confirmModalData.event.customer_name}`, 'success');
            setConfirmModalData(null);
          }}
        />
      )}

      {/* Add Custom Risk Event Modal */}
      {isAddModalOpen && (
        <AddEventModal
          onClose={() => setIsAddModalOpen(false)}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-400 space-y-1">
        <div>Track 03 • AI Revenue Recovery Agent • Autonomous Leak Mitigation Engine</div>
        <div className="text-[11px] text-slate-500">Autonomous Revenue Recovery Platform • All external connectors labeled with [Simulation / Demo Mode]</div>
      </footer>

    </div>
  );
}

export default App;
