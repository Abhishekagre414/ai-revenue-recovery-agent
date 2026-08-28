import React, { useState, useEffect, useRef } from 'react';
import { RevenueEvent, BatchSummary, Stage, TerminalState, AuditLogEntry } from './types/recovery';
import { generateSyntheticEvents } from './engine/syntheticData';
import { detector } from './engine/detector';
import { diagnoser } from './engine/diagnoser';
import { policyDecider } from './engine/policyDecider';
import { stoppingRules } from './engine/stoppingRules';
import { actuator } from './engine/actuator';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
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

export function App() {
  // State initialization with 100 cases by default
  const [events, setEvents] = useState<RevenueEvent[]>(() => generateSyntheticEvents(100));
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCase, setSelectedCase] = useState<RevenueEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'compliance' | 'analytics' | 'audit'>('pipeline');
  const [selectedStageFilter, setSelectedStageFilter] = useState<Stage | 'all'>('all');
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [globalAuditLogs, setGlobalAuditLogs] = useState<AuditLogEntry[]>([]);
  
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
    }, 280); // Smooth batch processing pace for live judging demo

    return () => clearInterval(interval);
  }, [isRunning, selectedCase]);

  // Event Handlers
  const handleToggleRun = () => {
    setIsRunning(r => !r);
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
  };

  const handleToggleKillSwitch = () => {
    const next = !killSwitchActive;
    setKillSwitchActive(next);
    stoppingRules.setGlobalKillSwitch(next);
    if (next) setIsRunning(false);
  };

  const handleAddEvent = (rawEvt: Partial<RevenueEvent>) => {
    const norm = detector.normalizeEvent(rawEvt);
    setEvents(prev => [norm, ...prev]);
    setGlobalAuditLogs(g => [...g, ...norm.audit_logs]);
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
  };

  const scrollToActivity = () => {
    activityPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processedCount = events.filter(e => e.status !== 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 selection:bg-blue-500 selection:text-white pb-16 font-sans">
      
      {/* Top Header Bar */}
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
        
        {/* Hero Landing Banner */}
        <HeroBanner
          summary={summary}
          isRunning={isRunning}
          onRunAgent={handleToggleRun}
          onViewActivity={scrollToActivity}
          onResetDemo={handleResetDemo}
        />

        {/* 10-Step Batch Progress Bar & Summary Counters */}
        <BatchWorkflowTracker
          isRunning={isRunning}
          currentStepIndex={currentStepIndex}
          summary={summary}
        />

        {/* Live Agent Activity Panel (🤖 Recovery Agent Activity) */}
        <div ref={activityPanelRef}>
          <LiveActivityPanel
            currentEvent={activeProcessingEvent}
            totalEvents={events.length}
            processedCount={processedCount}
            isRunning={isRunning}
          />
        </div>

        {/* KPI Metrics Dashboard Overview (Strong ₹ Recovered prominence) */}
        <MetricsOverview summary={summary} />

        {/* BEFORE vs AFTER AI Visual Comparison Flowchart */}
        <BeforeAfterSection summary={summary} />

        {/* Tab Views */}
        {activeTab === 'pipeline' && (
          <QueueTable
            events={events}
            onSelectCase={(evt) => setSelectedCase(evt)}
            selectedStageFilter={selectedStageFilter}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceGuardrailsView
            onTriggerMockViolation={handleTriggerMockViolation}
            killSwitchActive={killSwitchActive}
            onToggleKillSwitch={handleToggleKillSwitch}
            blockedCount={summary.blocked_guardrails_count}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts summary={summary} />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView logs={globalAuditLogs} />
        )}

      </main>

      {/* Case Details Inspector Modal */}
      <CaseDetailModal
        event={selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdateStatus={handleUpdateStatus}
      />

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
