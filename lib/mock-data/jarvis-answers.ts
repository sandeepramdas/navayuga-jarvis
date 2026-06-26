export interface Citation {
  label: string
  source: string
  timestamp?: string
}

export interface ChartDataPoint {
  label: string
  value: number
  target?: number
}

export interface JarvisQA {
  id: string
  question: string
  answer: string
  confidence: number
  citations: Citation[]
  chartData?: ChartDataPoint[]
  chartTitle?: string
  chartType: 'bar' | 'line' | 'none'
  recommendedAction?: string
  relatedProjectId?: string
  warningLabel: string
}

export const jarvisAnswers: JarvisQA[] = [
  {
    id: 'JA-001',
    question: 'Why is Hyderabad Metro Pkg-3 slipping?',
    answer: `Hyderabad Metro Pkg-3 (HYD-M3) is currently **77 days behind** its planned completion date of August 30, 2026, with the revised forecast at November 15, 2026. My analysis across three data sources — the project cost model, Xpedeon ERP purchase records, and the crew productivity log — identifies three compounding root causes.

**Root Cause 1: Steel Supply Disruption (primary driver).** PO-2847 for 200 MT of TMT Fe-500D steel from JSW Steel is 6 days overdue with no confirmed ETD. Current site stock is 42 MT against an 80 MT reorder point, representing just 4 days of cover at the current consumption rate of ~10 MT/day. This has already forced 3 emergency spot purchases in Weeks 22–25 at an average 22% premium over the contract rate, adding ₹4.2L in unbudgeted cost. Viaduct casting — on the critical path — will stall completely within 4 days if supply is not restored.

**Root Cause 2: Crew Productivity Gap.** The Week 23 Crew Productivity Log shows viaduct casting crew productivity at 82% of plan. The gap is attributable to two sub-factors: (a) material wait times (25% of shift hours lost to standby due to intermittent steel supply), and (b) overtime scheduling conflicts — the crew has worked 1,840 overtime hours in June against a budget of 400 hours, creating fatigue-driven efficiency loss. This productivity shortfall alone accounts for approximately 28 days of the total 77-day slip.

**Root Cause 3: Cost Pressure Creating Execution Constraints.** The project cost overrun has grown from 5.2% (Week 19) to 12.1% (Week 25) — a trajectory that, if unaddressed, will breach 15% within 4 weeks. PM Rajesh Nair has confirmed that budget pressure is preventing the procurement of additional scaffolding and formwork needed to accelerate the programme. This creates a lock: the project cannot crash the schedule without incurring further cost overrun, but the overrun is already severe.

In summary, the slip is a steel supply chain failure amplifying a productivity challenge, set against a backdrop of insufficient cost control. The three issues are causally linked and must be addressed simultaneously rather than in isolation.`,
    confidence: 91,
    citations: [
      { label: 'Project Cost Model', source: 'Xpedeon ERP · HYD-M3 Cost Tracker', timestamp: '2025-06-26T00:00:00' },
      { label: 'PO #PO-2847', source: 'Xpedeon · Procurement Module', timestamp: '2025-06-25T18:00:00' },
      { label: 'Crew Productivity Log · Week 23', source: 'Site Daily Report System', timestamp: '2025-06-08T17:00:00' },
    ],
    chartData: [
      { label: 'Wk 19', value: 5.2, target: 0 },
      { label: 'Wk 20', value: 7.4, target: 0 },
      { label: 'Wk 21', value: 8.1, target: 0 },
      { label: 'Wk 22', value: 9.3, target: 0 },
      { label: 'Wk 23', value: 10.5, target: 0 },
      { label: 'Wk 24', value: 11.2, target: 0 },
      { label: 'Wk 25', value: 12.1, target: 0 },
    ],
    chartTitle: 'HYD-M3 Weekly Cost Overrun % (Weeks 19–25)',
    chartType: 'bar',
    recommendedAction: 'Initiate 3-action response: (1) Emergency inter-project steel transfer from NH-44X + spot purchase today; (2) Volvo EC300E pump replacement order placed by 12:00; (3) Schedule a PM-level cost control review with Rajesh Nair this week to implement overtime cap.',
    relatedProjectId: 'HYD-M3',
    warningLabel: 'AI-generated · verify before acting',
  },
  {
    id: 'JA-002',
    question: 'Which machines need maintenance in the next 7 days?',
    answer: `Across the 25-machine fleet, I have identified **4 machines requiring maintenance action within the next 7 days**, ranging from confirmed breakdowns to high-probability predictive alerts.

**1. VLV-EC300-002 (Volvo EC300E, HYD-M3) — ACTIVE BREAKDOWN.** Hydraulic pump failure confirmed June 25. Machine grounded. Replacement pump ordered from JSW Tools Hyderabad. ETA: 36–48 hours. Volvo technician pre-booked for June 27 08:00.

**2. KMT-HD785-021 (Komatsu HD785, BMRC-E2) — ACTIVE BREAKDOWN.** Rear axle bearing failure June 25. KOMTRAX had flagged vibration anomaly 5 days prior. Komatsu authorized dealer (Bengaluru) has bearing in stock. Estimated repair time: 6-8 hours. Target: back in service by June 28.

**3. VLV-EC480-019 (Volvo EC480D, VIZG-P2) — PREDICTIVE HIGH RISK.** Volvo Connect boom cylinder seal wear index: 8.4/10. Estimated days to failure: 3–7 days. Machine is scheduled for critical berth wall casting from June 30. Pre-emptive seal replacement recommended June 28–29 (cost: ₹35,000 vs ₹2.1L downtime risk).

**4. TATA-LPT909G-005 (Tata LPT 909G, KDSP-B1) — BRAKE SYSTEM SERVICE DUE.** Brake system service overdue as of July 5. While utilization is low (23%), the machine is needed for material transport once steel delivery arrives. Schedule service during the current low-utilization window to avoid conflict.

The total cost of unplanned downtime across all 4 machines if not addressed is approximately ₹38,700/day. Proactive action on items 3 and 4 alone prevents ₹2.1L in avoidable costs.`,
    confidence: 94,
    citations: [
      { label: 'Volvo Connect Telematics', source: 'Volvo Fleet Management System', timestamp: '2025-06-26T09:00:00' },
      { label: 'KOMTRAX Fleet Data', source: 'Komatsu KOMTRAX Portal', timestamp: '2025-06-26T08:30:00' },
      { label: 'Predictive Maintenance Model v2.3', source: 'NECL Jarvis AI Engine', timestamp: '2025-06-26T10:00:00' },
    ],
    chartData: [
      { label: 'EC300E', value: 100, target: 100 },
      { label: 'HD785', value: 100, target: 100 },
      { label: 'EC480D', value: 84, target: 100 },
      { label: 'LPT909G', value: 65, target: 100 },
    ],
    chartTitle: 'Maintenance Urgency Score (0–100)',
    chartType: 'bar',
    recommendedAction: 'Assign Ravi Kumar to coordinate all 4 maintenance actions today with a target of zero machine downtime during the July 1 critical path window.',
    relatedProjectId: 'HYD-M3',
    warningLabel: 'AI-generated · verify before acting',
  },
  {
    id: 'JA-003',
    question: 'What is the total procurement risk exposure this week?',
    answer: `Analysing the 20 open purchase orders across the portfolio, I have identified **3 critical stockout risks and 2 delayed POs** with a combined financial exposure of **₹38.2L** this week.

**Critical Risk 1 — TMT Steel, HYD-M3 (PO-2847, JSW Steel).** Stockout in 4 days. Financial exposure: ₹11L per week of work stoppage (38-person viaduct crew idle + overhead). Emergency transfer and spot purchase recommended immediately.

**Critical Risk 2 — Screw Piles, VIZG-P2 (PO-2860, Atlas Copco).** Stockout in 6 days. If site work halts: ₹8.4L LD exposure from schedule slip. Alternate supplier (Keller Grundbau, Pune) available at +8% premium.

**Critical Risk 3 — Fe-415 Steel, KDSP-B1 (PO-2852, SAIL Steel).** Stockout in 3 days. Smallest immediate exposure at ₹4.2L/week but compounds the existing 8.6% budget overrun and attrition risk at Kaleshwaram.

**Medium Risk — Bitumen VG-30, NH-44X (PO-2865).** Stockout in 8 days if PO not approved today. Approval requires Anand Sharma sign-off. HPCL lead time: 5–7 days. Fast-track approval removes this risk entirely.

**Medium Risk — Crane Spares, HYD-M3 (PO-2866).** Only 1 hydraulic pump kit in stock. PO for 3 kits approved and arriving June 27. Risk window: today only.

Total exposure if no action taken: ₹38.2L in direct stoppage costs, LD penalties, and premium spot purchases over the next 10 days.`,
    confidence: 88,
    citations: [
      { label: 'Procurement Dashboard', source: 'Xpedeon ERP · PO Module', timestamp: '2025-06-26T06:00:00' },
      { label: 'Stock Levels Report', source: 'Site Store Keeper Reports', timestamp: '2025-06-26T07:00:00' },
      { label: 'Vendor Delivery Tracker', source: 'NECL Procurement System', timestamp: '2025-06-26T08:00:00' },
    ],
    chartData: [
      { label: 'TMT Steel\nHYD-M3', value: 1100 },
      { label: 'Screw Piles\nVIZG-P2', value: 840 },
      { label: 'Steel KDSP-B1', value: 420 },
      { label: 'Bitumen\nNH-44X', value: 280 },
      { label: 'Crane Spares\nHYD-M3', value: 28 },
    ],
    chartTitle: 'Procurement Risk Exposure (₹K)',
    chartType: 'bar',
    recommendedAction: 'Procurement Manager to action items 1, 2, 3 today with escalation to MD for PO-2847. Anand Sharma to approve PO-2865 by 12:00.',
    relatedProjectId: 'HYD-M3',
    warningLabel: 'AI-generated · verify before acting',
  },
  {
    id: 'JA-004',
    question: 'Which project sites should the MD visit this week?',
    answer: `Based on current risk profiles, financial exposure, and decision-making needs, I recommend the MD prioritise visits to **two project sites** this week: Hyderabad Metro Pkg-3 and Kaleshwaram Dam Support.

**Priority 1: HYD-M3 (Hyderabad Metro Pkg-3).** This site has the highest compounded risk in the portfolio: 77-day schedule slip, 12.1% cost overrun on a ₹8.45Cr contract, active machine downtime, and a steel stockout in 4 days. An MD-level visit signals urgency to the site team, enables direct conversation with JSW Steel's regional head (who reports to Rajesh Nair's counterpart), and allows real-time assessment of the viaduct casting work front. Recommended actions during visit: (1) Inspect Station-7 pile caps; (2) Meet PM Rajesh Nair + Finance Controller Arun Prakash for cost recovery plan review; (3) Speak with viaduct casting crew to understand ground-level blockers.

**Priority 2: KDSP-B1 (Kaleshwaram, Medigadda).** This site has the highest human risk: 3 employees at high attrition risk including the Site Manager, combined with 8.6% cost overrun approaching the board threshold. A visible leadership visit has a documented impact on remote site engagement. The visit would also allow review of the steel supply situation (PO-2852 delayed). Recommended actions: (1) 1:1 with Priya Menon — wellbeing and workload check; (2) Walk the canal lining works with Mohammed Shareef; (3) Announce the rotation roster (if approved) during the visit for maximum retention impact.

Sites not requiring MD visit this week: NH-44X (on track, +₹13.3L under budget), CHN-FLY (92%, ahead of schedule), MUM-CST (on track, 29% progress).`,
    confidence: 82,
    citations: [
      { label: 'Portfolio Risk Dashboard', source: 'NECL Jarvis AI Engine', timestamp: '2025-06-26T10:00:00' },
      { label: 'Project Status Reports', source: 'Xpedeon ERP · Project Module', timestamp: '2025-06-26T00:00:00' },
      { label: 'HR Attrition Signals', source: 'HRMS Engagement Analytics', timestamp: '2025-06-25T18:00:00' },
    ],
    chartData: [
      { label: 'HYD-M3', value: 94 },
      { label: 'KDSP-B1', value: 87 },
      { label: 'RLWY-G4', value: 71 },
      { label: 'VIZG-P2', value: 64 },
      { label: 'BMRC-E2', value: 52 },
      { label: 'NH-44X', value: 24 },
      { label: 'MUM-CST', value: 21 },
      { label: 'CHN-FLY', value: 12 },
    ],
    chartTitle: 'Site Risk Score (0–100) — Higher = Greater MD Attention Needed',
    chartType: 'bar',
    recommendedAction: 'Block June 30 for Hyderabad visit and July 2 for Kaleshwaram. Brief both PMs via video call on June 27 to align on agenda.',
    warningLabel: 'AI-generated · verify before acting',
  },
  {
    id: 'JA-005',
    question: 'What is the portfolio financial health summary?',
    answer: `The NECL portfolio of 8 active projects has a **combined contract value of ₹72.4Cr** with current actual spend of **₹48.7Cr (67% expended)**. The overall weighted cost performance index (CPI) is **0.91**, indicating the portfolio is spending ₹9 for every ₹8.20 of planned value — a meaningful but not yet critical overrun.

**Projects performing well (below budget):** NH-44X is the standout at -2.4% (saving ₹13.5L on an ₹5.62Cr contract). CHN-FLY is at -4.0% and approaching close-out with ₹7.5L surplus. BMRC-E2 is tracking at -2.3% under budget, with the precast girder order now secured.

**Projects with cost concerns:** HYD-M3 is the most significant at 12.1% overrun (₹10.3L excess on a ₹8.45Cr contract), with a worsening trajectory. KDSP-B1 is at 8.6% overrun approaching the board notification threshold. RLWY-G4 is at 4.0% overrun — manageable but trending upward due to PM performance issues.

**Financial flow summary:** Total open procurement commitments across all 8 projects: ₹18.4Cr. Of this, ₹2.8Cr is in delayed POs representing supply chain risk. Monthly payroll obligation: ₹8.4Cr. The portfolio's estimated completion cost at current trajectories is ₹76.8Cr vs planned ₹72.4Cr — a portfolio-level overrun of ₹4.4Cr (6.1%).

The key financial focus areas for July: arrest the HYD-M3 and KDSP-B1 overrun trajectories, and capture the CHN-FLY close-out surplus to partially offset.`,
    confidence: 87,
    citations: [
      { label: 'Portfolio Cost Report June 2025', source: 'Xpedeon ERP · Finance Module', timestamp: '2025-06-26T00:00:00' },
      { label: 'CPI Analysis Model', source: 'NECL Jarvis EVM Engine', timestamp: '2025-06-26T10:00:00' },
      { label: 'Procurement Commitments Register', source: 'Xpedeon ERP · PO Module', timestamp: '2025-06-25T23:00:00' },
    ],
    chartData: [
      { label: 'HYD-M3', value: 112.1, target: 100 },
      { label: 'BMRC-E2', value: 97.7, target: 100 },
      { label: 'NH-44X', value: 97.6, target: 100 },
      { label: 'KDSP-B1', value: 108.6, target: 100 },
      { label: 'CHN-FLY', value: 96.0, target: 100 },
      { label: 'MUM-CST', value: 101.2, target: 100 },
      { label: 'RLWY-G4', value: 104.0, target: 100 },
      { label: 'VIZG-P2', value: 100.8, target: 100 },
    ],
    chartTitle: 'Cost Performance Index by Project (100 = on budget, >100 = overrun)',
    chartType: 'bar',
    recommendedAction: 'Schedule monthly portfolio financial review with all PMs. Prioritize HYD-M3 and KDSP-B1 cost recovery plans as standing agenda items.',
    warningLabel: 'AI-generated · verify before acting',
  },
]

export const suggestedPrompts = [
  'Why is Hyderabad Metro Pkg-3 slipping?',
  'Which machines need maintenance in the next 7 days?',
  'What is the total procurement risk exposure this week?',
  'Which project sites should the MD visit this week?',
  'What is the portfolio financial health summary?',
  'Show me all critical alerts across the portfolio',
  'Which employees are at high attrition risk?',
  'What is the fleet utilization vs target?',
  'Summarize KDSP-B1 risk for board briefing',
  'What are the top 3 actions for this week?',
]
