import { RevenueEvent } from '../types/recovery';

export class DetectionEngine {
  /**
   * Prioritizes incoming event batch by Expected Recoverable Value (₹)
   */
  public prioritizeQueue(events: RevenueEvent[]): RevenueEvent[] {
    return [...events].sort((a, b) => b.expected_recoverable_value - a.expected_recoverable_value);
  }

  /**
   * Normalizes incoming raw telemetry event into standard RevenueEvent format
   */
  public normalizeEvent(raw: Partial<RevenueEvent>): RevenueEvent {
    const now = new Date().toISOString();
    const id = raw.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const amount = Number(raw.amount) || 15000;
    const type = raw.type || 'payment_failure';
    
    let prob = 80;
    let riskLevel = raw.risk_level || 'MEDIUM';

    if (type === 'payment_failure') {
      if (raw.raw_payload?.decline_code === 'expired_card') prob = 92;
      else if (raw.raw_payload?.decline_code === 'insufficient_funds') prob = 85;
      else if (raw.raw_payload?.decline_code === 'issuer_do_not_honor') { prob = 50; riskLevel = 'HIGH'; }
    } else if (type === 'overdue_invoice') {
      const age = raw.raw_payload?.days_past_due || 20;
      prob = Math.max(30, 95 - age * 1.2);
      if (age > 30) riskLevel = 'HIGH';
    } else if (type === 'mandate_failure') {
      prob = 70;
      riskLevel = 'HIGH';
    } else if (type === 'failed_subscription') {
      prob = 88;
    } else {
      prob = 82;
    }

    const expectedValue = Math.round(amount * (prob / 100));

    return {
      id,
      type,
      customer_id: raw.customer_id || id,
      customer_name: raw.customer_name || 'Valued Customer',
      customer_email: raw.customer_email || 'billing@customer.in',
      customer_phone: raw.customer_phone || '+91 9876543210',
      customer_tier: raw.customer_tier || 'smb',
      amount,
      currency: 'INR',
      timestamp: raw.timestamp || now,
      raw_payload: raw.raw_payload || {},
      risk_level: riskLevel,
      recovery_probability: Math.round(prob),
      expected_recoverable_value: expectedValue,
      status: 'pending',
      current_stage: 'detect',
      outreach_count: raw.outreach_count || 0,
      do_not_contact: Boolean(raw.do_not_contact),
      quiet_hours_active: Boolean(raw.quiet_hours_active),
      next_action: 'Ingested into AI Recovery Pipeline',
      escalation_status: 'normal',
      audit_logs: [
        {
          id: `LOG-DET-${Date.now()}`,
          timestamp: now,
          event_id: id,
          stage: 'detect',
          actor: 'DETECTOR',
          action_taken: 'REVENUE_RISK_DETECTED',
          description: `Normalized risk event ${id}. Value: ₹${amount.toLocaleString('en-IN')}. Prioritized value: ₹${expectedValue.toLocaleString('en-IN')}.`,
          amount,
          metadata: { amount, recovery_probability: prob }
        }
      ]
    };
  }
}

export const detector = new DetectionEngine();
