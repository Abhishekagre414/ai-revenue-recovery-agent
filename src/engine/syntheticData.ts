import { RevenueEvent, LeakType, RiskLevel } from '../types/recovery';

const FIRST_NAMES = ['Aarav', 'Neha', 'Rohan', 'Priya', 'Vikram', 'Ananya', 'Rahul', 'Sneha', 'Kabir', 'Tanvi', 'Aditya', 'Meera', 'Karan', 'Isha', 'Dev'];
const LAST_NAMES = ['Sharma', 'Gupta', 'Patel', 'Verma', 'Mehta', 'Singh', 'Reddy', 'Chawla', 'Deshmukh', 'Joshi', 'Kapoor', 'Nair', 'Bhasin', 'Bhatia', 'Malhotra'];
const COMPANIES = ['Apex Digital India', 'Nexus Cloud Solutions', 'Vortex Commerce', 'OmniLogistics Pvt Ltd', 'Starlight Tech', 'Zeta Pay', 'Nova Enterprises', 'Hyperion Software', 'Zenith Retail', 'Kriti Fashion Lab'];

export const generateSyntheticEvents = (count: number = 100): RevenueEvent[] => {
  const events: RevenueEvent[] = [];
  const now = Date.now();

  // We want to generate ~100 realistic cases with total risk ~₹8,20,000
  // Distribution across 5 scenarios:
  // 1. payment_failure (25 cases)
  // 2. failed_subscription (25 cases)
  // 3. overdue_invoice (20 cases)
  // 4. checkout_abandonment (15 cases)
  // 5. mandate_failure (15 cases)

  for (let i = 1; i <= count; i++) {
    let type: LeakType;
    if (i <= 25) type = 'payment_failure';
    else if (i <= 50) type = 'failed_subscription';
    else if (i <= 70) type = 'overdue_invoice';
    else if (i <= 85) type = 'checkout_abandonment';
    else type = 'mandate_failure';

    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const isEnterprise = type === 'overdue_invoice' || (i % 4 === 0);
    const customerName = isEnterprise 
      ? `${firstName} ${lastName} (${COMPANIES[i % COMPANIES.length]})`
      : `${firstName} ${lastName}`;
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${isEnterprise ? 'enterprise.co.in' : 'gmail.com'}`;
    const phone = `+91 ${9820000000 + (i * 98765) % 899999999}`;
    const tier = isEnterprise ? (i % 2 === 0 ? 'enterprise' : 'growth') : (i % 3 === 0 ? 'smb' : 'b2c');

    let amount: number;
    let rawPayload: Record<string, any>;
    let baseProbability: number;
    let riskLevel: RiskLevel;

    if (type === 'payment_failure') {
      // Amounts between ₹2,000 and ₹25,000
      amount = Math.round((2000 + (i * 850) % 23000));
      const declineCodes = [
        { code: 'insufficient_funds', msg: 'Soft decline: Insufficient funds in bank account.', prob: 87, risk: 'MEDIUM' as RiskLevel },
        { code: 'expired_card', msg: 'Card expired or debit mandate expired.', prob: 92, risk: 'LOW' as RiskLevel },
        { code: '3ds_timeout', msg: '3DS OTP step timed out on customer device.', prob: 84, risk: 'LOW' as RiskLevel },
        { code: 'issuer_do_not_honor', msg: 'Decline code 05: Do Not Honor by issuing bank.', prob: 52, risk: 'HIGH' as RiskLevel }
      ];
      const codeSel = declineCodes[i % declineCodes.length];
      baseProbability = codeSel.prob;
      riskLevel = codeSel.risk;
      rawPayload = {
        gateway: i % 2 === 0 ? 'Razorpay Production Rail' : 'Cashfree Payments Sandbox',
        decline_code: codeSel.code,
        decline_message: codeSel.msg,
        card_brand: i % 2 === 0 ? 'Visa' : 'Mastercard',
        last4: `${4000 + (i * 17) % 5000}`,
        attempt_number: (i % 2) + 1,
        support_ticket: i % 7 === 0 ? 'Customer reported app crash during payment' : null
      };

    } else if (type === 'failed_subscription') {
      // Amounts between ₹999 and ₹14,999
      amount = Math.round((999 + (i * 620) % 14000));
      const subReasons = [
        { code: 'recurring_mandate_failed', msg: 'Auto-debit mandate failed: Bank processing error.', prob: 88, risk: 'LOW' as RiskLevel },
        { code: 'card_expired', msg: 'Subscription renewal failed due to expired card.', prob: 91, risk: 'LOW' as RiskLevel },
        { code: 'daily_limit_exceeded', msg: 'Customer bank daily transaction limit exceeded.', prob: 79, risk: 'MEDIUM' as RiskLevel }
      ];
      const sel = subReasons[i % subReasons.length];
      baseProbability = sel.prob;
      riskLevel = sel.risk;
      rawPayload = {
        subscription_id: `SUB-2026-${3000 + i}`,
        plan_name: i % 2 === 0 ? 'SaaS Enterprise Growth Annual' : 'Pro Business Monthly',
        renewal_date: new Date(now - (i % 5) * 86400000).toISOString().split('T')[0],
        failure_code: sel.code,
        internal_notes: sel.msg
      };

    } else if (type === 'overdue_invoice') {
      // High B2B amounts: ₹25,000 to ₹1,20,000
      amount = Math.round((25000 + (i * 4700) % 95000));
      const invReasons = [
        { status: 'overdue_15_days', msg: 'Invoice past 15 days due date.', prob: 85, risk: 'MEDIUM' as RiskLevel },
        { status: 'po_dispute', msg: 'Client accounts payable flagged PO line item mismatch.', prob: 48, risk: 'HIGH' as RiskLevel },
        { status: 'ap_bounce', msg: 'Accounts payable bounce code 550 email fail.', prob: 78, risk: 'MEDIUM' as RiskLevel }
      ];
      const sel = invReasons[i % invReasons.length];
      baseProbability = sel.prob;
      riskLevel = sel.risk;
      rawPayload = {
        invoice_id: `INV-2026-${1000 + i}`,
        due_date: new Date(now - (15 + (i % 30)) * 86400000).toISOString().split('T')[0],
        days_past_due: 15 + (i % 30),
        po_number: `PO-IND-${880 + i}`,
        ap_email: email,
        internal_notes: sel.msg,
        has_dispute: sel.status === 'po_dispute'
      };

    } else if (type === 'checkout_abandonment') {
      // Amounts ₹1,500 to ₹18,000
      amount = Math.round((1500 + (i * 1100) % 16500));
      const cartReasons = [
        { reason: 'delivery_fee_dropoff', msg: 'Cart abandoned after express delivery fee calculated.', prob: 82, risk: 'LOW' as RiskLevel },
        { reason: 'payment_gateway_hesitation', msg: 'Customer stayed on UPI QR page for 3 mins then closed window.', prob: 75, risk: 'MEDIUM' as RiskLevel }
      ];
      const sel = cartReasons[i % cartReasons.length];
      baseProbability = sel.prob;
      riskLevel = sel.risk;
      rawPayload = {
        cart_id: `CART-IND-${900 + i}`,
        items: [{ id: `PROD-${i}`, name: 'Premium AI Suite Membership', qty: 1 }],
        abandoned_step: 'payment_method',
        idle_time_mins: 25 + (i % 90),
        session_notes: sel.msg
      };

    } else {
      // mandate_failure: ₹3,500 to ₹35,000
      amount = Math.round((3500 + (i * 2100) % 31000));
      const mandateReasons = [
        { code: 'e_mandate_revoked', msg: 'e-Mandate cancelled or revoked by customer bank.', prob: 45, risk: 'HIGH' as RiskLevel },
        { code: 'account_dormant', msg: 'Bank account dormant or inactive for NACH auto-debit.', prob: 60, risk: 'HIGH' as RiskLevel },
        { code: 'nach_technical_reject', msg: 'NPCI NACH technical failure / bank server timeout.', prob: 86, risk: 'LOW' as RiskLevel }
      ];
      const sel = mandateReasons[i % mandateReasons.length];
      baseProbability = sel.prob;
      riskLevel = sel.risk;
      rawPayload = {
        mandate_id: `MND-2026-${700 + i}`,
        bank_name: i % 2 === 0 ? 'HDFC Bank' : 'ICICI Bank',
        failure_reason: sel.code,
        notes: sel.msg
      };
    }

    const recoveryProbability = Math.max(30, Math.min(96, baseProbability));
    const expectedValue = Math.round(amount * (recoveryProbability / 100));

    const outreachCount = i % 5 === 0 ? 2 : i % 7 === 0 ? 1 : 0;
    const doNotContact = i === 18 || i === 54; // specific guardrail test cases
    const quietHours = i % 13 === 0;

    let nextAction = 'Ready for AI Agent Batch Run';

    events.push({
      id: `CUST-${1000 + i}`,
      type,
      customer_id: `CUST-${1000 + i}`,
      customer_name: customerName,
      customer_email: email,
      customer_phone: phone,
      customer_tier: tier,
      amount,
      currency: 'INR',
      timestamp: new Date(now - (i * 2400000)).toISOString(),
      raw_payload: rawPayload,
      risk_level: riskLevel,
      recovery_probability: recoveryProbability,
      expected_recoverable_value: expectedValue,
      status: 'pending',
      current_stage: 'detect',
      outreach_count: outreachCount,
      last_outreach_at: outreachCount > 0 ? new Date(now - (outreachCount * 43200000)).toISOString() : undefined,
      do_not_contact: doNotContact,
      quiet_hours_active: quietHours,
      next_action: nextAction,
      escalation_status: 'normal',
      audit_logs: [
        {
          id: `LOG-DET-${i}`,
          timestamp: new Date(now - (i * 2400000)).toISOString(),
          event_id: `CUST-${1000 + i}`,
          stage: 'detect',
          actor: 'DETECTOR',
          action_taken: 'REVENUE_RISK_DETECTED',
          description: `Detected ${type.replace('_', ' ')} risk for ${customerName}. Amount: ₹${amount.toLocaleString('en-IN')}. Prioritized value: ₹${expectedValue.toLocaleString('en-IN')}.`,
          amount,
          metadata: { amount, recoveryProbability }
        }
      ]
    });
  }

  return events;
};
