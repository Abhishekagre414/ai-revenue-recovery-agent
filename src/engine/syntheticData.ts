import { RevenueEvent } from '../types/recovery';

const FIRST_NAMES = ['Aarav', 'Neha', 'Rohan', 'Priya', 'Vikram', 'Ananya', 'Rahul', 'Sneha', 'Kabir', 'Tanvi', 'Marcus', 'Elena', 'David', 'Sophia', 'Chen'];
const LAST_NAMES = ['Sharma', 'Gupta', 'Patel', 'Verma', 'Mehta', 'Singh', 'Reddy', 'Chawla', 'Deshmukh', 'Joshi', 'Vance', 'Schneider', 'Miller', 'Tanaka', 'Zhao'];
const COMPANIES = ['Acme Corp', 'Nexus Technologies', 'Starlight SaaS', 'OmniLogistics India', 'Vortex AI', 'CloudScale Inc', 'Apex Digital', 'Zenith Retail', 'Hyperion Dynamics', 'Nova Labs'];

export const generateSyntheticEvents = (count: number = 200): RevenueEvent[] => {
  const events: RevenueEvent[] = [];
  const now = Date.now();

  for (let i = 1; i <= count; i++) {
    const isPaymentDegradation = i <= 100;
    const isB2BReceivable = i > 100 && i <= 160;
    const isCheckoutAbandonment = i > 160;

    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const customerName = isB2BReceivable 
      ? `${firstName} ${lastName} (${COMPANIES[i % COMPANIES.length]})`
      : `${firstName} ${lastName}`;
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${isB2BReceivable ? 'enterprise.co' : 'gmail.com'}`;
    const phone = `+91 ${9800000000 + (i * 12345) % 899999999}`;
    
    // Select customer tier
    const tier = isB2BReceivable 
      ? (i % 3 === 0 ? 'enterprise' : 'growth') 
      : (i % 4 === 0 ? 'growth' : 'smb');

    let type: RevenueEvent['type'];
    let amount: number;
    let rawPayload: Record<string, any>;

    if (isPaymentDegradation) {
      type = 'payment_degradation';
      amount = Math.round((50 + (i * 73) % 2450) * 100) / 100;
      
      const declineReasons = [
        { code: 'expired_card', msg: 'Your card has expired. Update details.', recoverability: 92 },
        { code: 'insufficient_funds', msg: 'Soft decline: Insufficient funds in card account.', recoverability: 78 },
        { code: 'issuer_block', msg: 'Decline code 05: Do Not Honor by issuing bank.', recoverability: 45 },
        { code: '3ds_friction', msg: 'Authentication required. 3DS challenge timeout.', recoverability: 85 },
        { code: 'currency_mismatch', msg: 'Cross-border transaction disabled on consumer card.', recoverability: 68 }
      ];
      const selected = declineReasons[i % declineReasons.length];

      rawPayload = {
        gateway: i % 2 === 0 ? 'Stripe Test Rail' : 'Razorpay Sandbox',
        decline_code: selected.code,
        decline_message: selected.msg,
        card_brand: i % 2 === 0 ? 'Visa' : 'Mastercard',
        last4: `${1000 + (i * 7) % 8999}`,
        attempt_number: (i % 3) + 1,
        support_ticket_transcript: i % 5 === 0 ? `Customer notes: "I got a new card last week, haven't updated it yet."` : null
      };
    } else if (isB2BReceivable) {
      type = 'b2b_receivables';
      amount = Math.round((1200 + (i * 350) % 18800) * 100) / 100;
      
      const invoiceReasons = [
        { status: 'overdue_30', msg: 'Invoice past 30 days due date.', recoverability: 88 },
        { status: 'po_dispute', msg: 'Client stated PO line item #3 does not match delivered SOW.', recoverability: 60 },
        { status: 'wrong_ap_contact', msg: 'Accounts Payable bouncing email. Bounce code 550.', recoverability: 80 },
        { status: 'cash_flow_delay', msg: 'Customer requested 15-day grace period for quarter-end audit.', recoverability: 75 }
      ];
      const selected = invoiceReasons[i % invoiceReasons.length];

      rawPayload = {
        invoice_id: `INV-2026-${1000 + i}`,
        due_date: new Date(now - (15 + (i % 45)) * 86400000).toISOString().split('T')[0],
        days_past_due: 15 + (i % 45),
        po_number: `PO-88${i}`,
        ap_email: email,
        internal_notes: selected.msg,
        has_open_dispute: selected.status === 'po_dispute'
      };
    } else {
      type = 'checkout_abandonment';
      amount = Math.round((80 + (i * 29) % 820) * 100) / 100;
      
      const cartReasons = [
        { reason: 'shipping_shock', msg: 'Cart abandoned at shipping step after calculating Express Delivery fee.', recoverability: 82 },
        { reason: 'price_hesitation', msg: 'Customer viewed coupon input 4 times before exiting.', recoverability: 74 },
        { reason: 'out_of_stock_variant', msg: 'Customer tried selecting Blue XL which became backordered.', recoverability: 65 }
      ];
      const selected = cartReasons[i % cartReasons.length];

      rawPayload = {
        cart_id: `CART-99${i}`,
        items: [{ id: `PROD-${i}`, name: 'Premium Cloud Subscription / Enterprise Add-on', qty: 1 }],
        abandoned_step: selected.reason === 'shipping_shock' ? 'shipping_method' : 'checkout_payment',
        time_elapsed_minutes: 45 + (i % 120),
        session_notes: selected.msg
      };
    }

    // Baseline recoverability score
    const baseScore = type === 'payment_degradation' ? 82 : type === 'b2b_receivables' ? 76 : 70;
    const scoreModifier = (i * 13) % 25 - 12;
    const recoverability_score = Math.max(20, Math.min(98, baseScore + scoreModifier));
    const expected_recoverable_value = Math.round(amount * (recoverability_score / 100) * 100) / 100;

    // Outbound history simulation
    const outreachCount = i % 4 === 0 ? 2 : i % 5 === 0 ? 3 : i % 7 === 0 ? 1 : 0;
    const doNotContact = i === 12 || i === 44 || i === 105; // edge cases for guardrails
    const quietHours = i % 11 === 0;

    events.push({
      id: `EVT-${1000 + i}`,
      type,
      customer_id: `CUST-${500 + i}`,
      customer_name: customerName,
      customer_email: email,
      customer_phone: phone,
      customer_tier: tier,
      amount,
      currency: 'USD',
      timestamp: new Date(now - (i * 3600000)).toISOString(),
      raw_payload: rawPayload,
      recoverability_score,
      expected_recoverable_value,
      status: 'pending',
      current_stage: 'detect',
      outreach_count: outreachCount,
      last_outreach_at: outreachCount > 0 ? new Date(now - (outreachCount * 43200000)).toISOString() : undefined,
      do_not_contact: doNotContact,
      quiet_hours_active: quietHours,
      audit_logs: [
        {
          id: `LOG-DET-${i}`,
          timestamp: new Date(now - (i * 3600000)).toISOString(),
          event_id: `EVT-${1000 + i}`,
          stage: 'detect',
          actor: 'DETECTOR',
          action_taken: 'EVENT_INGESTED',
          description: `Ingested ${type} event. Amount: $${amount}. Prioritized value: $${expected_recoverable_value}.`,
          metadata: { amount, recoverability_score }
        }
      ]
    });
  }

  return events;
};
