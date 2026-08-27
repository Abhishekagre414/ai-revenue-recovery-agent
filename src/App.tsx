import React, { useState, useEffect, useRef } from 'react';
import { RevenueEvent, BatchSummary, Stage, TerminalState, AuditLogEntry } from './types/recovery';
import { generateSyntheticEvents } from './engine/syntheticData';
import { detector } from './engine/detector';
import { diagnoser } from './engine/diagnoser';
import { policyDecider } from './engine/policyDecider';
import { stoppingRules } from './engine/stoppingRules';
import { actuator } from './engine/actuator';

import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { QueueTable } from './components/QueueTable';
import { CaseDetailModal } from './components/CaseDetailModal';
import { ComplianceGuardrailsView } from './components/ComplianceGuardrailsView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AuditTrailView } from './components/AuditTrailView';
import { AddEventModal } from './components/AddEventModal';

export function App() {
  // State
  const [events, setEvents] = useState<RevenueEvent[]>(() => generateSyntheticEvents(200));
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCase, setSelectedCase] = useState<RevenueEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'compliance' | 'analytics' | 'audit'>('pipeline');
  const [selectedStageFilter, setSelectedStageFilter] = useState<Stage | 'all'>('all');
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [globalAuditLogs, setGlobalAuditLogs] = useState<AuditLogEntry[]>([]);

  // Sync audit logs from initial dataset
  useEffect(() => {
    const logs: AuditLogEntry[] = [];
    events.forEach(e => logs.push(...e.audit_logs));
    setGlobalAuditLogs(logs);
  }, []);

  // Compute batch summary stats
  const summary: BatchSummary = React.useMemo(() => {
    let totalValueAtRisk = 0;
    let totalRecoveredValue = 0;
    let escalatedCount = 0;
    let blockedCount = 0;

    const leakBreakdown = {
      payment_degradation: { total: 0, recovered: 0, count: 0 },
      b2b_receivables: { total: 0, recovered: 0, count: 0 },
      checkout_abandonment: { total: 0, recovered: 0, count: 0 }
    };

    events.forEach(evt => {
      totalValueAtRisk += evt.amount;
      leakBreakdown[evt.type].total += evt.amount;
      leakBreakdown[evt.type].count += 1;

      if (evt.status === 'recovered') {
        totalRecoveredValue += evt.amount;
        leakBreakdown[evt.type].recovered += evt.amount;
      }
      if (evt.status === 'escalated_to_human') {
        escalatedCount += 1;
      }
      if (evt.status === 'blocked_by_guardrail') {
        blockedCount += 1;
      }
    });

    const recoveryRate = totalValueAtRisk > 0 ? (totalRecoveredValue / totalValueAtRisk) * 100 : 0;

    return {
      total_events: events.length,
      total_value_at_risk: Math.round(totalValueAtRisk),
      total_recovered_value: Math.round(totalRecoveredValue),
      overall_recovery_rate: recoveryRate,
      escalated_count: escalatedCount,
      blocked_guardrails_count: blockedCount,
      avg_time_to_recovery_hours: 14.2,
      leak_breakdown: leakBreakdown
    };
  }, [events]);

  // Stage counts for pipeline visualizer
  const stageCounts: Record<Stage, number> = React.useMemo(() => {
    const counts: Record<Stage, number> = {
      detect: 0,
      diagnose: 0,
      decide: 0,
      act: 0,
      measure: 0
    };
    events.forEach(evt => {
      counts[evt.current_stage] = (counts[evt.current_stage] || 0) + 1;
    });
    return counts;
  }, [events]);

  // Automated Batch Runner Interval
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
          return prevEvents;
        }

        const updated = [...prevEvents];
        const event = { ...updated[targetIndex] };
        const now = new Date().toISOString();

        // Step 1: Diagnose
        const diag = diagnoser.diagnose(event);
        event.diagnosis = diag;
        event.current_stage = 'diagnose';

        // Step 2: Decide
        const dec = policyDecider.decide(event, diag);
        event.decision = dec;
        event.current_stage = 'decide';

        // Step 3: Stopping Rules Check
        const stopCheck = stoppingRules.evaluate(event, dec);
        event.stopping_rule_check = stopCheck;

        // Add Log
        const newLogs: AuditLogEntry[] = [
          ...event.audit_logs,
          {
            id: `LOG-DIAG-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'diagnose',
            actor: 'DIAGNOSER',
            action_taken: 'ROOT_CAUSE_DIAGNOSED',
            description: `Diagnosed root cause: '${diag.root_cause}' with ${diag.confidence}% confidence.`
          },
          {
            id: `LOG-DEC-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'decide',
            actor: 'POLICY_ENGINE',
            action_taken: 'POLICY_RULE_MATCHED',
            description: `Matched Policy '${dec.policy_id}'. Selected action '${dec.chosen_action_type}'.`
          },
          {
            id: `LOG-STOP-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'decide',
            actor: 'STOPPING_ENGINE',
            action_taken: stopCheck.passed ? 'GUARDRAIL_PASSED' : 'GUARDRAIL_BLOCKED',
            description: stopCheck.passed 
              ? 'Passed all frequency, cooldown, and spend guardrails.'
              : `Blocked: ${stopCheck.block_reason}`
          }
        ];

        if (!stopCheck.action_allowed) {
          event.status = stopCheck.requires_human_approval ? 'escalated_to_human' : 'blocked_by_guardrail';
          event.current_stage = 'measure';
        } else {
          // Step 4: Actuate
          const act = actuator.execute(event, dec);
          event.action = act;
          event.current_stage = 'act';
          event.outreach_count += 1;
          event.last_outreach_at = now;

          // Step 5: Measure / Outcome Simulation (82% recovery rate simulation for demo)
          const isRecovered = Math.random() < 0.82;
          event.status = isRecovered ? 'recovered' : 'actioned';
          event.current_stage = 'measure';

          newLogs.push({
            id: `LOG-ACT-${Date.now()}`,
            timestamp: now,
            event_id: event.id,
            stage: 'act',
            actor: 'ACTUATOR',
            action_taken: 'CONNECTOR_EXECUTED',
            description: `Executed connector '${act.connector}'. Terminal status: ${event.status.toUpperCase()}.`
          });
        }

        event.audit_logs = newLogs;
        updated[targetIndex] = event;

        // Also append to global audit stream
        setGlobalAuditLogs(g => [...g, ...newLogs]);

        // Keep selected case updated if open in modal
        if (selectedCase && selectedCase.id === event.id) {
          setSelectedCase(event);
        }

        return updated;
      });
    }, 250); // fast hackathon processing speed

    return () => clearInterval(interval);
  }, [isRunning, selectedCase]);

  // Event handlers
  const handleToggleRun = () => {
    setIsRunning(r => !r);
  };

  const handleReset = () => {
    setIsRunning(false);
    const fresh = generateSyntheticEvents(200);
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
    const mockId = `EVT-VIOL-${Math.floor(100 + Math.random() * 900)}`;
    let rawPayload = { decline_code: 'expired_card' };
    let doNotContact = false;
    let quietHours = false;
    let outreachCount = 1;

    if (type === 'optout') doNotContact = true;
    if (type === 'quiethours') quietHours = true;
    if (type === 'frequency') outreachCount = 3;

    const mockEvt: RevenueEvent = {
      id: mockId,
      type: type === 'discount' ? 'checkout_abandonment' : 'payment_degradation',
      customer_id: 'CUST-TEST-VIOLATION',
      customer_name: 'Test Guardrail Persona',
      customer_email: 'guardrail.test@company.com',
      customer_phone: '+1 555-9999',
      customer_tier: 'enterprise',
      amount: type === 'discount' ? 1200 : 450,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      raw_payload: rawPayload,
      recoverability_score: 90,
      expected_recoverable_value: 1080,
      status: 'blocked_by_guardrail',
      current_stage: 'decide',
      outreach_count: outreachCount,
      do_not_contact: doNotContact,
      quiet_hours_active: quietHours,
      stopping_rule_check: {
        passed: false,
        triggered_rules: [type === 'discount' ? 'RULE_DISCOUNT_PERCENT_CAP_EXCEEDED' : 'RULE_GUARDRAIL_BLOCKED'],
        action_allowed: false,
        requires_human_approval: true,
        block_reason: `Demonstration: Stopping rules blocked illegal ${type} attempt in real-time.`
      },
      audit_logs: [
        {
          id: `LOG-VIOL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event_id: mockId,
          stage: 'decide',
          actor: 'STOPPING_ENGINE',
          action_taken: 'GUARDRAIL_VIOLATION_INTERCEPTED',
          description: `Blocked illegal ${type} action. Required manager handoff.`
        }
      ]
    };

    setEvents(prev => [mockEvt, ...prev]);
    setGlobalAuditLogs(g => [...g, ...mockEvt.audit_logs]);
  };

  const processedCount = events.filter(e => e.status !== 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-blue-500 selection:text-white pb-12">
      
      {/* Header Bar */}
      <Header
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
        killSwitchActive={killSwitchActive}
        onToggleKillSwitch={handleToggleKillSwitch}
        onOpenAddEvent={() => setIsAddModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        processedCount={processedCount}
        totalCount={events.length}
      />

      {/* Main Body Container */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* KPI Metrics overview */}
        <MetricsOverview summary={summary} />

        {/* 5-Stage Visualizer */}
        <PipelineVisualizer
          stageCounts={stageCounts}
          onSelectStageFilter={setSelectedStageFilter}
          selectedStageFilter={selectedStageFilter}
        />

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

      {/* Case Inspector Modal */}
      <CaseDetailModal
        event={selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Add Custom Event Modal */}
      {isAddModalOpen && (
        <AddEventModal
          onClose={() => setIsAddModalOpen(false)}
          onAddEvent={handleAddEvent}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        AI Revenue Recovery Agent • Hackathon Demo Build • Built with Gemini 3.6 Flash & Sandboxed Payment Connectors
      </footer>

    </div>
  );
}

export default App;
