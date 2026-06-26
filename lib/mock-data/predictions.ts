export type ForecastCategory = 'budget' | 'schedule' | 'stockout' | 'downtime' | 'attrition' | 'safety'

export interface Forecast {
  id: string
  modelName: string
  category: ForecastCategory
  entity: string
  projectId: string
  predictedValue: string
  confidence: number
  timeHorizon: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  drivers: string[]
  trend: 'worsening' | 'improving' | 'stable'
  baselineValue?: string
  alertId?: string
}

export interface Recommendation {
  id: string
  title: string
  department: string
  expectedImpact: string
  expectedImpactValue: number
  impactUnit: 'inr' | 'days' | 'percent'
  confidence: number
  forecastId?: string
  alertId?: string
  evidenceBullets: string[]
  assignTo: string
  priority: number
  projectId: string
  state?: 'approved' | 'dismissed' | 'assigned' | null
}

export const forecasts: Forecast[] = [
  {
    id: 'FCST-001',
    modelName: 'Cost Overrun Risk',
    category: 'budget',
    entity: 'HYD-M3 · Hyderabad Metro Pkg-3',
    projectId: 'HYD-M3',
    predictedValue: '14–16% overrun',
    confidence: 91,
    timeHorizon: 'in 18 days',
    severity: 'critical',
    drivers: [
      'Steel spot purchase premiums averaging +22% over 4 weeks',
      'Overtime labor cost ₹18.4L over budget in June',
      'CPM slip creating compression in remaining work package costs',
    ],
    trend: 'worsening',
    baselineValue: '12.1% current',
    alertId: 'ALT-015',
  },
  {
    id: 'FCST-002',
    modelName: 'Stockout Prediction',
    category: 'stockout',
    entity: 'PO-2847 · JSW Steel (HYD-M3)',
    projectId: 'HYD-M3',
    predictedValue: 'Zero stock in 4 days',
    confidence: 96,
    timeHorizon: 'in 4 days',
    severity: 'critical',
    drivers: [
      'PO-2847 delivery 6 days delayed, no confirmed ETA',
      'Daily consumption: 10 MT/day; current stock: 42 MT',
      'No alternative supplier pre-qualified for this grade',
    ],
    trend: 'worsening',
    baselineValue: '42 MT remaining',
    alertId: 'ALT-001',
  },
  {
    id: 'FCST-003',
    modelName: 'Equipment Downtime Model',
    category: 'downtime',
    entity: 'VLV-EC480-019 · VIZG-P2',
    projectId: 'VIZG-P2',
    predictedValue: 'Failure in 3–7 days',
    confidence: 84,
    timeHorizon: 'in 3–7 days',
    severity: 'high',
    drivers: [
      'Volvo Connect seal wear index: 8.4/10 (critical: 7.0)',
      'Hydraulic pressure pattern indicates imminent seal blow',
      'Machine scheduled for critical berth wall casting June 30',
    ],
    trend: 'worsening',
    baselineValue: 'Wear index 8.4/10',
    alertId: 'ALT-013',
  },
  {
    id: 'FCST-004',
    modelName: 'Schedule Slip Forecast',
    category: 'schedule',
    entity: 'KDSP-B1 · Kaleshwaram Dam',
    projectId: 'KDSP-B1',
    predictedValue: '49–65 days behind plan',
    confidence: 78,
    timeHorizon: 'by December 2025',
    severity: 'high',
    drivers: [
      'Steel delivery delays causing concrete works to pause 3 times in June',
      'Crew productivity at 78% of plan for 5 consecutive weeks',
      'Monsoon seasonal risk (July–September) not yet factored',
    ],
    trend: 'worsening',
    baselineValue: '49 days current slip',
    alertId: 'ALT-003',
  },
  {
    id: 'FCST-005',
    modelName: 'Attrition Risk Model',
    category: 'attrition',
    entity: 'KDSP-B1 · 3 Staff',
    projectId: 'KDSP-B1',
    predictedValue: '1-2 resignations likely',
    confidence: 72,
    timeHorizon: 'within 60 days',
    severity: 'high',
    drivers: [
      'Engagement scores declined >20pts in 6 weeks for 2 employees',
      'Remote posting with no rotation schedule in place',
      'Market demand for Irrigation Engineers up 34% (LinkedIn data)',
    ],
    trend: 'worsening',
    baselineValue: '3 high-risk employees',
    alertId: 'ALT-006',
  },
  {
    id: 'FCST-006',
    modelName: 'Stockout Prediction',
    category: 'stockout',
    entity: 'PO-2860 · Screw Piles (VIZG-P2)',
    projectId: 'VIZG-P2',
    predictedValue: 'Stockout in 6 days',
    confidence: 89,
    timeHorizon: 'in 6 days',
    severity: 'high',
    drivers: [
      'PO-2860 overdue — supplier reports dispatch delay',
      'Stock: 45 nos | Rate: 7-8/day',
      'Site re-sequencing buys 2 extra days at most',
    ],
    trend: 'worsening',
    baselineValue: '45 nos remaining',
    alertId: 'ALT-005',
  },
  {
    id: 'FCST-007',
    modelName: 'Fleet Idle Cost Forecast',
    category: 'downtime',
    entity: 'Portfolio · 4 Idle Machines',
    projectId: 'HYD-M3',
    predictedValue: '₹5.1L idle cost (7 days)',
    confidence: 93,
    timeHorizon: 'next 7 days',
    severity: 'medium',
    drivers: [
      '4 machines currently idle: combined ₹72.3K/day cost',
      'No re-tasking plan in place for 3 of the 4 machines',
      'Historical pattern: idle periods average 8-12 days without active intervention',
    ],
    trend: 'stable',
    baselineValue: '₹72.3K/day current',
    alertId: 'ALT-010',
  },
  {
    id: 'FCST-008',
    modelName: 'Cost Overrun Risk',
    category: 'budget',
    entity: 'KDSP-B1 · Kaleshwaram Dam',
    projectId: 'KDSP-B1',
    predictedValue: 'Board threshold breach',
    confidence: 81,
    timeHorizon: 'in 18 days',
    severity: 'critical',
    drivers: [
      'Current overrun 8.6% — board threshold is 10%',
      'Emergency steel purchases add ~₹4L premium in next 2 weeks if not resolved',
      'Cement procurement also 4.2% over estimate',
    ],
    trend: 'worsening',
    baselineValue: '8.6% current overrun',
    alertId: 'ALT-003',
  },
  {
    id: 'FCST-009',
    modelName: 'Schedule Slip Forecast',
    category: 'schedule',
    entity: 'RLWY-G4 · Guntakal Gauge Conv.',
    projectId: 'RLWY-G4',
    predictedValue: '20–28 days behind plan',
    confidence: 74,
    timeHorizon: 'by September 2025',
    severity: 'medium',
    drivers: [
      'PM productivity at 74% of plan for 4 consecutive weeks',
      'CRS approval pending for 18km section — risk of 2-week queue',
      'Monsoon track closure period (July) will add ~12 days',
    ],
    trend: 'worsening',
    baselineValue: '15 days current slip',
  },
  {
    id: 'FCST-010',
    modelName: 'Equipment Downtime Model',
    category: 'downtime',
    entity: 'KMT-HD785-021 · BMRC-E2',
    projectId: 'BMRC-E2',
    predictedValue: '3-4 days for repair',
    confidence: 88,
    timeHorizon: 'next 3-4 days',
    severity: 'medium',
    drivers: [
      'Rear axle bearing failure confirmed — machine grounded',
      'Bearing sourcing: Komatsu dealer (Bengaluru) has stock',
      'Installation requires 6-8 hours of authorized technician time',
    ],
    trend: 'stable',
    baselineValue: 'Machine grounded June 25',
    alertId: 'ALT-008',
  },
  {
    id: 'FCST-011',
    modelName: 'Stockout Prediction',
    category: 'stockout',
    entity: 'PO-2865 · Bitumen VG-30 (NH-44X)',
    projectId: 'NH-44X',
    predictedValue: 'Stockout in 8 days',
    confidence: 85,
    timeHorizon: 'in 8 days',
    severity: 'medium',
    drivers: [
      'Stock 35 MT vs 50 MT reorder point',
      'PO-2865 pending approval — HPCL lead time 5-7 days',
      'Paving rate: 4-5 MT/day with planned acceleration next week',
    ],
    trend: 'worsening',
    baselineValue: '35 MT remaining',
    alertId: 'ALT-009',
  },
  {
    id: 'FCST-012',
    modelName: 'Budget Performance',
    category: 'budget',
    entity: 'CHN-FLY · Chennai Flyover',
    projectId: 'CHN-FLY',
    predictedValue: '4–5% under budget',
    confidence: 97,
    timeHorizon: 'at completion (July 30)',
    severity: 'low',
    drivers: [
      'Current under-spend: 4.0% (₹7.48L savings)',
      'Remaining work: road surfacing + markings — well within estimate',
      '16 days schedule advance reduces final month cost pressure',
    ],
    trend: 'improving',
    baselineValue: '-4.0% current',
    alertId: 'ALT-017',
  },
]

export const recommendations: Recommendation[] = [
  {
    id: 'REC-001',
    title: 'Emergency Steel Procurement — Inter-project Transfer + Spot Purchase',
    department: 'Procurement',
    expectedImpact: '₹11L cost avoidance (per week of stoppage prevented)',
    expectedImpactValue: 1100000,
    impactUnit: 'inr',
    confidence: 91,
    forecastId: 'FCST-002',
    alertId: 'ALT-001',
    evidenceBullets: [
      'Transfer 40 MT TMT from NH-44X (surplus stock: 145 MT) to HYD-M3 to cover immediate need',
      'Parallel: raise emergency PO with SAIL Steel for 60 MT at spot rate (est. +8% vs contract)',
      'Escalate PO-2847 delay with JSW Steel via NECL MD-level letter for priority delivery',
    ],
    assignTo: 'Pallavi Reddy',
    priority: 1,
    projectId: 'HYD-M3',
  },
  {
    id: 'REC-002',
    title: 'Expedite Volvo EC300E Hydraulic Pump Replacement',
    department: 'Fleet',
    expectedImpact: '₹4.2L/day critical path savings',
    expectedImpactValue: 420000,
    impactUnit: 'inr',
    confidence: 94,
    forecastId: 'FCST-003',
    alertId: 'ALT-002',
    evidenceBullets: [
      'Order replacement pump from JSW Tools Hyderabad today — confirm 24hr delivery SLA',
      'Pre-book Volvo authorized technician for June 27 08:00 installation',
      'Assign EC210B (VLV-EC210-001) to critical pile cap work as interim replacement',
    ],
    assignTo: 'Ravi Kumar',
    priority: 2,
    projectId: 'HYD-M3',
  },
  {
    id: 'REC-003',
    title: 'Cost Control Intervention — Hyderabad Metro',
    department: 'Finance',
    expectedImpact: 'Prevent 14-16% overrun — saves ₹16.8L vs trajectory',
    expectedImpactValue: 1680000,
    impactUnit: 'inr',
    confidence: 79,
    forecastId: 'FCST-001',
    alertId: 'ALT-015',
    evidenceBullets: [
      'Implement overtime authorization ceiling: 200 hrs/week (vs current 460 hrs/week)',
      'Renegotiate steel pricing with JSW Steel for July-September at locked contract rate',
      'Defer non-critical scaffolding hire by 3 weeks to reduce August cost spike',
    ],
    assignTo: 'Rajesh Nair',
    priority: 3,
    projectId: 'HYD-M3',
  },
  {
    id: 'REC-004',
    title: 'KDSP-B1 Staff Retention Plan — Immediate',
    department: 'HR',
    expectedImpact: '₹45L replacement cost avoidance + 8 weeks schedule protection',
    expectedImpactValue: 4500000,
    impactUnit: 'inr',
    confidence: 72,
    forecastId: 'FCST-005',
    alertId: 'ALT-006',
    evidenceBullets: [
      'Approve 3-month site rotation roster with 15-day city visit per month for all 3 at-risk employees',
      'Assign mentoring pair for Mohammed Shareef from Bengaluru Metro PM team (remote)',
      'Conduct 1:1 wellbeing conversations with all 3 this week — pre-arrange with HR BP',
    ],
    assignTo: 'Kavitha Nair',
    priority: 4,
    projectId: 'KDSP-B1',
  },
  {
    id: 'REC-005',
    title: 'Screw Pile Alternate Sourcing — Visakhapatnam',
    department: 'Procurement',
    expectedImpact: 'Prevents 2-week schedule slip (saves ₹8.4L LD exposure)',
    expectedImpactValue: 840000,
    impactUnit: 'inr',
    confidence: 86,
    forecastId: 'FCST-006',
    alertId: 'ALT-005',
    evidenceBullets: [
      'Issue LOI to Keller Grundbau (Pune) for 80 screw piles at +8% cost — saves 3 days vs waiting',
      'Parallel: expedite Atlas Copco dispatch resolution — 48hr deadline for confirmed dispatch date',
      'Sarita Patel to re-sequence berth wall work to maximize use of 45 nos remaining stock',
    ],
    assignTo: 'Sarita Patel',
    priority: 5,
    projectId: 'VIZG-P2',
  },
  {
    id: 'REC-006',
    title: 'Fleet Re-tasking — Reduce Idle Cost by ₹43K/day',
    department: 'Fleet',
    expectedImpact: '₹3.0L savings over 7 days through re-tasking',
    expectedImpactValue: 300000,
    impactUnit: 'inr',
    confidence: 88,
    forecastId: 'FCST-007',
    alertId: 'ALT-010',
    evidenceBullets: [
      'Re-task Eicher Pro 6025 (BMRC-E2) to NH-44X bitumen transport — saves ₹4.1K/day',
      'Re-task Volvo EC480D (VIZG-P2) to quay wall excavation — saves ₹24.5K/day once seal repaired',
      'Tata LPT 909G (KDSP-B1) — coordinate with steel delivery to activate immediately on arrival',
    ],
    assignTo: 'Ravi Kumar',
    priority: 6,
    projectId: 'HYD-M3',
  },
  {
    id: 'REC-007',
    title: 'Pre-emptive Seal Replacement — Volvo EC480D',
    department: 'Fleet',
    expectedImpact: '₹2.1L downtime cost avoidance',
    expectedImpactValue: 210000,
    impactUnit: 'inr',
    confidence: 84,
    forecastId: 'FCST-003',
    alertId: 'ALT-013',
    evidenceBullets: [
      'Book Volvo authorized technician in Visakhapatnam for boom cylinder seal replacement',
      'Replacement cost ₹35,000 vs potential ₹2.1L downtime cost during critical casting',
      'Window: June 28-29 (2 days before scheduled berth wall casting activation)',
    ],
    assignTo: 'Ravi Kumar',
    priority: 7,
    projectId: 'VIZG-P2',
  },
  {
    id: 'REC-008',
    title: 'Rebalance RLWY-G4 PM Support Structure',
    department: 'Operations',
    expectedImpact: '15-day schedule recovery + ₹80L PM attrition risk reduction',
    expectedImpactValue: 8000000,
    impactUnit: 'inr',
    confidence: 68,
    forecastId: 'FCST-009',
    alertId: 'ALT-007',
    evidenceBullets: [
      'Assign a Part-time Senior Technical Advisor (from BMRC-E2 PM office) for CRS coordination support',
      'Schedule immediate 1:1 wellbeing check by Regional Director with Venkat Rao',
      'Explore whether OHE sub-contracting can reduce PM\'s multi-agency burden',
    ],
    assignTo: 'Arjun Mehta',
    priority: 8,
    projectId: 'RLWY-G4',
  },
]

export function getRecommendationsByProject(projectId: string): Recommendation[] {
  return recommendations.filter(r => r.projectId === projectId)
}
