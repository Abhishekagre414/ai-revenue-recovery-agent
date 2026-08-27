# 🚀 AI Revenue Recovery Agent

> **Track**: AI Revenue Recovery — *"Find revenue that's slipping away and win it back"*  
> **Model Engine**: Gemini 3.6 Flash  
> **Status**: Hackathon Production Release  

---

## 📌 Executive Summary

Revenue leaks through many small, disconnected failures: a card declines, a checkout is abandoned mid-flow, a subscription silently fails to renew, or a B2B invoice ages past due. Existing tools operate in silos without shared memory of prior attempts. 

The **AI Revenue Recovery Agent** treats revenue recovery as a **5-stage bounded workflow** with hard compliance guardrails. Detecting the leak is only 10% of the battle — our agent handles the 90%: root-causing failures, selecting policy-bounded interventions, executing sandboxed actions, enforcing stopping rules, and proving net recovered revenue with immutable audit trails.

---

## 🏗️ 5-Stage Agent Architecture

```
 ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 │  1. DETECT  │───▶│ 2. DIAGNOSE │───▶│  3. DECIDE  │───▶│   4. ACT    │───▶│ 5. MEASURE  │
 │ event feed  │    │ root cause  │    │ policy +    │    │ bounded     │    │ outcome +   │
 │ ingestion   │    │ classifier  │    │ LLM copy    │    │ action exec │    │ audit log   │
 └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                       ┌──────▼──────┐
                                       │ STOPPING    │
                                       │ RULES ENGINE│
                                       │ (caps, cool-│
                                       │ downs, human│
                                       │ handoff)    │
                                       └─────────────┘
```

### Pipeline Breakdown
1. **DETECT**: Ingests and normalizes webhook/batch events across 3 leak types. Scores each event by **Expected Recoverable Value** ($\text{Amount} \times \text{Recoverability Likelihood \%}$) to prioritize high-yield cases.
2. **DIAGNOSE**: Combines rule heuristics and Gemini 3.6 Flash reasoning over decline codes, ERP invoice aging, and support transcripts to produce root-cause labels and confidence scores.
3. **DECIDE**: Maps root causes to a strict pre-approved policy table (`POLICY_MATRIX`). The LLM drafts personalized outreach copy (Email, SMS, Hinglish Voice script) within hard policy parameters (never invents new action types or unauthorized discounts).
4. **ACT**: Sandboxed connector execution (Stripe/Razorpay update links, PSP smart retries, Twilio SMS, Telephony Hinglish voice call scripts, Jira/HubSpot AR tasks).
5. **MEASURE**: Real-time state machine tracking terminal state (`pending` ➔ `actioned` ➔ `recovered` / `lost` / `escalated_to_human` / `blocked_by_guardrail`).

---

## ⚡ Supported Leak Types

| Leak Type | Detection Signals | Root Causes Diagnosed | Bounded Interventions |
|---|---|---|---|
| **Payment Degradation** | Card decline, retry failure webhook | Expired card, transient insufficient funds, 3DS challenge timeout, issuer security block | Self-serve card update link, payday smart retry, 1-click re-authentication |
| **B2B Receivables** | Invoice past due date | PO line-item dispute, wrong AP email, aged cash-flow delay | Promise-to-Pay capture, Hinglish voice call nudge, Tier-2 human AR escalation |
| **Checkout Abandonment** | Cart created, no order within $X$ mins | Shipping cost shock, variant stock hesitation | Dynamic shipping incentive ($\le 10\%$), stock availability notice |

---

## 🛡️ Stopping Rules & Compliance Guardrails

The agent operates under hard, non-bypassable guardrails:
- **Contact Frequency Cap**: Maximum 3 outreach attempts per customer per leak. Attempt #4 automatically punts to the human queue.
- **24-Hour Cooldown Window**: Enforces mandatory 24-hour waiting periods between retries per card network & anti-spam regulations.
- **Discount Ceiling Cap**: Incentives strictly capped at $\le 10\%$ or $\le \$50$ value. Offers above ceiling trigger manager approval handoff.
- **Regulatory & Consent Guardrails**: Respects Do-Not-Contact flags, Quiet Hours (10 PM - 8 AM), and non-threatening FDCPA tone limits.
- **Global Emergency Kill Switch**: Instant global pause control.
- **Interactive Violation Simulator**: Live UI buttons allowing judges/operators to test illegal discount attempts or frequency breaches and watch the Stopping Engine intercept them in real time.

---

## 💻 Tech Stack

- **Frontend & UI**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Data Visualization**: Recharts (Recovery Rate, Root Cause Pie, Velocity, Financial ROI)
- **AI Reasoning**: Gemini 3.6 Flash diagnostic classifier & bounded copy generator
- **State & Storage**: Synthetic batch generator (200 events), immutable audit logger, CSV/JSON export engine

---

## 🚀 Quick Start & Local Running

### Prerequisites
- Node.js `v18+` or `v24+`
- npm `v10+`

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Abhishekagre414/ai-revenue-recovery-agent.git

# 2. Navigate to project directory
cd ai-revenue-recovery-agent

# 3. Install dependencies
npm install

# 4. Start Vite development server
npm run dev
```

Open `http://localhost:3000/` in your browser.

---

## 📁 Repository Structure

```
ai-revenue-recovery-agent/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── recovery.ts              # TypeScript schemas (RevenueEvent, Diagnosis, Policy)
│   ├── engine/
│   │   ├── syntheticData.ts         # 200 synthetic leak events generator
│   │   ├── detector.ts              # Stage 1: Ingestion & prioritization scoring
│   │   ├── diagnoser.ts             # Stage 2: Gemini 3.6 Flash root-cause classifier
│   │   ├── policyDecider.ts         # Stage 3: Policy table lookup & bounded copy generator
│   │   ├── stoppingRules.ts         # Hard guardrails & compliance engine
│   │   └── actuator.ts              # Stage 4: Sandboxed connectors & telephony logger
│   └── components/
│       ├── Header.tsx               # Top bar with live batch runner & kill switch
│       ├── MetricsOverview.tsx      # KPI cards (Revenue at Risk, Recovered, Blocks)
│       ├── PipelineVisualizer.tsx   # 5-stage interactive flow diagram
│       ├── QueueTable.tsx           # Searchable & filterable prioritized live queue
│       ├── CaseDetailModal.tsx      # Deep-dive 5-stage telemetry & Hinglish voice inspector
│       ├── ComplianceGuardrailsView.tsx # Guardrails rules & violation simulator
│       ├── AnalyticsCharts.tsx      # Recharts analytics dashboard
│       ├── AuditTrailView.tsx       # Immutable audit log with CSV/JSON export
│       └── AddEventModal.tsx        # Custom mock event injector
└── README.md
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
