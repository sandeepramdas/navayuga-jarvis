// Extended procurement mock data: rate contracts, escalation claims, vendor performance,
// consolidation opportunities, reallocation opportunities, payment schedule, vendor empanelment

export interface RateContract {
  id: string
  vendor: string
  material: string
  category: string // 'steel' | 'cement' | 'fuel'
  contractedRate: number
  marketRate: number
  unit: string
  contractedVolume: number
  usedVolume: number
  utilizationPct: number
  validUntil: string
  projects: string[]
  savingPerUnit: number
  remainingBenefit: number // ₹ value of remaining volume × saving per unit
}

export interface EscalationClaim {
  id: string
  projectIds: string[]
  material: string
  indexName: string
  periodLabel: string
  claimAmount: number
  status: 'unfiled' | 'filed' | 'under-review' | 'approved'
  deadline?: string // ISO date, only for unfiled
  urgencyDays?: number // days until deadline
}

export interface VendorPerformance {
  vendor: string
  category: string
  totalPOs: number
  onTimePOs: number
  onTimeRate: number
  avgDelayDays: number
  qualityRejectionRate: number
  totalPOValue: number
  activeProjects: string[]
}

export interface ConsolidationProject {
  projectId: string
  quantity: number
  unit: string
  individualCost: number
}

export interface ConsolidationOpportunity {
  id: string
  material: string
  category: string
  preferredVendor: string
  projects: ConsolidationProject[]
  individualTotal: number
  consolidatedTotal: number
  savings: number
  savingsPct: number
  reason: string
}

export interface ReallocationOpportunity {
  id: string
  material: string
  surplusProjectId: string
  surplusQty: number
  deficitProjectId: string
  deficitDaysRemaining: number
  unit: string
  emergencyCost: number
  transferCost: number
  savings: number
  urgency: 'critical' | 'high' | 'medium'
}

export interface PaymentScheduleItem {
  id: string
  poRef: string
  projectId: string
  vendor: string
  item: string
  amount: number
  dueDate: string
  termsDays: number
  status: 'upcoming' | 'due-soon' | 'overdue'
}

export interface VendorEmpanelment {
  vendor: string
  empanelmentExpiry: string
  isoCertExpiry: string
  financialStandingExpiry: string
  overallStatus: 'valid' | 'expiring-soon' | 'expired'
  daysToExpiry: number
  criticalFlag?: string
}

// ── Rate Contracts ─────────────────────────────────────────────────────────────

export const rateContracts: RateContract[] = [
  {
    id: 'rc-1',
    vendor: 'JSW Steel Ltd',
    material: 'TMT Fe-500D',
    category: 'steel',
    contractedRate: 21400,
    marketRate: 23250,
    unit: 'MT',
    contractedVolume: 500,
    usedVolume: 390,
    utilizationPct: 78,
    validUntil: '2026-12-31',
    projects: ['HYD-M3', 'VIZG-P2'],
    savingPerUnit: 1850,
    remainingBenefit: 203500, // 110MT × ₹1,850
  },
  {
    id: 'rc-2',
    vendor: 'ACC Ltd',
    material: 'OPC 53 Grade Cement',
    category: 'cement',
    contractedRate: 345,
    marketRate: 382,
    unit: 'bag',
    contractedVolume: 10000,
    usedVolume: 6200,
    utilizationPct: 62,
    validUntil: '2026-09-30',
    projects: ['HYD-M3', 'CHN-FLY'],
    savingPerUnit: 37,
    remainingBenefit: 140600, // 3800 × ₹37
  },
  {
    id: 'rc-3',
    vendor: 'HPCL Bulk Division',
    material: 'HSD Diesel',
    category: 'fuel',
    contractedRate: 92,
    marketRate: 96.5,
    unit: 'litre',
    contractedVolume: 150000,
    usedVolume: 67500,
    utilizationPct: 45,
    validUntil: '2026-08-31',
    projects: ['HYD-M3', 'BMRC-E2', 'KDSP-B1'],
    savingPerUnit: 4.5,
    remainingBenefit: 371250, // 82,500L × ₹4.5
  },
  {
    id: 'rc-4',
    vendor: 'UltraTech RMC',
    material: 'OPC 53 Grade Cement',
    category: 'cement',
    contractedRate: 338,
    marketRate: 382,
    unit: 'bag',
    contractedVolume: 15000,
    usedVolume: 4650,
    utilizationPct: 31,
    validUntil: '2026-10-31',
    projects: ['MUM-CST', 'BMRC-E2'],
    savingPerUnit: 44,
    remainingBenefit: 455400, // 10,350 × ₹44
  },
  {
    id: 'rc-5',
    vendor: 'Tata Steel Ltd',
    material: 'Structural Steel IS2062',
    category: 'steel',
    contractedRate: 54800,
    marketRate: 58400,
    unit: 'MT',
    contractedVolume: 600,
    usedVolume: 534,
    utilizationPct: 89,
    validUntil: '2026-11-30',
    projects: ['MUM-CST'],
    savingPerUnit: 3600,
    remainingBenefit: 237600, // 66MT × ₹3,600 — NEARLY EXHAUSTED
  },
]

// ── Escalation Claims ──────────────────────────────────────────────────────────

export const escalationClaims: EscalationClaim[] = [
  {
    id: 'ec-1',
    projectIds: ['HYD-M3', 'BMRC-E2', 'MUM-CST'],
    material: 'Steel (TMT & Structural)',
    indexName: 'WPI Steel Index',
    periodLabel: 'Q1 2026 (Jan–Mar)',
    claimAmount: 2140000,
    status: 'unfiled',
    deadline: '2026-07-31',
    urgencyDays: 32,
  },
  {
    id: 'ec-2',
    projectIds: ['HYD-M3', 'BMRC-E2', 'MUM-CST', 'VIZG-P2'],
    material: 'Steel (TMT & Structural)',
    indexName: 'WPI Steel Index',
    periodLabel: 'Q2 2026 (Apr–Jun)',
    claimAmount: 3860000,
    status: 'unfiled',
    deadline: '2026-09-30',
    urgencyDays: 93,
  },
  {
    id: 'ec-3',
    projectIds: ['KDSP-B1'],
    material: 'OPC 53 Cement',
    indexName: 'WPI Cement Index',
    periodLabel: 'Q4 2025 (Oct–Dec)',
    claimAmount: 380000,
    status: 'under-review',
  },
  {
    id: 'ec-4',
    projectIds: ['NH-44X', 'RLWY-G4'],
    material: 'HSD Diesel',
    indexName: 'HSD Price Index',
    periodLabel: 'Q1 2026 (Jan–Mar)',
    claimAmount: 620000,
    status: 'approved',
  },
]

// ── Vendor Performance ─────────────────────────────────────────────────────────

export const vendorPerformance: VendorPerformance[] = [
  {
    vendor: 'JSW Steel Ltd',
    category: 'steel',
    totalPOs: 8,
    onTimePOs: 5,
    onTimeRate: 62.5,
    avgDelayDays: 14,
    qualityRejectionRate: 1.8,
    totalPOValue: 89400000,
    activeProjects: ['HYD-M3', 'VIZG-P2'],
  },
  {
    vendor: 'ACC Ltd',
    category: 'cement',
    totalPOs: 6,
    onTimePOs: 5,
    onTimeRate: 83.3,
    avgDelayDays: 3,
    qualityRejectionRate: 0.3,
    totalPOValue: 23600000,
    activeProjects: ['HYD-M3', 'CHN-FLY'],
  },
  {
    vendor: 'Patil Rail Infrastructure',
    category: 'equipment',
    totalPOs: 4,
    onTimePOs: 1,
    onTimeRate: 25.0,
    avgDelayDays: 22,
    qualityRejectionRate: 8.3,
    totalPOValue: 75600000,
    activeProjects: ['RLWY-G4'],
  },
  {
    vendor: 'HPCL Bulk Division',
    category: 'fuel',
    totalPOs: 5,
    onTimePOs: 5,
    onTimeRate: 100,
    avgDelayDays: 0,
    qualityRejectionRate: 0,
    totalPOValue: 32400000,
    activeProjects: ['HYD-M3', 'KDSP-B1'],
  },
  {
    vendor: 'Tata Steel Ltd',
    category: 'steel',
    totalPOs: 3,
    onTimePOs: 2,
    onTimeRate: 66.7,
    avgDelayDays: 8,
    qualityRejectionRate: 2.1,
    totalPOValue: 99400000,
    activeProjects: ['MUM-CST'],
  },
  {
    vendor: 'UltraTech RMC',
    category: 'cement',
    totalPOs: 4,
    onTimePOs: 3,
    onTimeRate: 75.0,
    avgDelayDays: 5,
    qualityRejectionRate: 0.8,
    totalPOValue: 47100000,
    activeProjects: ['MUM-CST', 'BMRC-E2'],
  },
  {
    vendor: 'Atlas Copco India',
    category: 'equipment',
    totalPOs: 4,
    onTimePOs: 2,
    onTimeRate: 50.0,
    avgDelayDays: 12,
    qualityRejectionRate: 0,
    totalPOValue: 116300000,
    activeProjects: ['HYD-M3', 'VIZG-P2'],
  },
  {
    vendor: 'Nagarjuna Precast',
    category: 'equipment',
    totalPOs: 2,
    onTimePOs: 1,
    onTimeRate: 50.0,
    avgDelayDays: 18,
    qualityRejectionRate: 3.2,
    totalPOValue: 143400000,
    activeProjects: ['BMRC-E2'],
  },
  {
    vendor: 'Sai Quarries Pvt Ltd',
    category: 'aggregate',
    totalPOs: 3,
    onTimePOs: 3,
    onTimeRate: 100,
    avgDelayDays: 0,
    qualityRejectionRate: 0.5,
    totalPOValue: 7100000,
    activeProjects: ['NH-44X'],
  },
]

// ── Consolidation Opportunities ────────────────────────────────────────────────

export const consolidationOpportunities: ConsolidationOpportunity[] = [
  {
    id: 'co-1',
    material: 'TMT Steel Fe-500D',
    category: 'steel',
    preferredVendor: 'JSW Steel Ltd',
    projects: [
      { projectId: 'KDSP-B1', quantity: 80, unit: 'MT', individualCost: 1860000 },
      { projectId: 'VIZG-P2', quantity: 60, unit: 'MT', individualCost: 1395000 },
      { projectId: 'RLWY-G4', quantity: 45, unit: 'MT', individualCost: 1046250 },
    ],
    individualTotal: 4301250,
    consolidatedTotal: 3860000,
    savings: 440000,
    savingsPct: 10.2,
    reason: 'Rate contract at ₹21,400/MT + 2.5% bulk discount above 150MT vs market ₹23,250/MT individually',
  },
  {
    id: 'co-2',
    material: 'OPC 53 Grade Cement',
    category: 'cement',
    preferredVendor: 'ACC Ltd',
    projects: [
      { projectId: 'BMRC-E2', quantity: 2000, unit: 'bags', individualCost: 764000 },
      { projectId: 'KDSP-B1', quantity: 1500, unit: 'bags', individualCost: 573000 },
      { projectId: 'RLWY-G4', quantity: 1200, unit: 'bags', individualCost: 458400 },
    ],
    individualTotal: 1795400,
    consolidatedTotal: 1555700,
    savings: 239700,
    savingsPct: 13.4,
    reason: 'ACC rate contract ₹345/bag vs market ₹382/bag; additional 4% bulk discount on 4,700-bag consolidated order',
  },
  {
    id: 'co-3',
    material: 'HSD Diesel',
    category: 'fuel',
    preferredVendor: 'HPCL Bulk Division',
    projects: [
      { projectId: 'HYD-M3', quantity: 10000, unit: 'litres', individualCost: 965000 },
      { projectId: 'KDSP-B1', quantity: 8000, unit: 'litres', individualCost: 772000 },
      { projectId: 'RLWY-G4', quantity: 7000, unit: 'litres', individualCost: 675500 },
    ],
    individualTotal: 2412500,
    consolidatedTotal: 2300000,
    savings: 112500,
    savingsPct: 4.7,
    reason: 'HPCL rate contract ₹92/L vs retail ₹96.5/L; single tanker deployment reduces logistics cost',
  },
]

// ── Reallocation Opportunities ─────────────────────────────────────────────────

export const reallocationOpportunities: ReallocationOpportunity[] = [
  {
    id: 'ra-1',
    material: 'Aggregates (20mm)',
    surplusProjectId: 'NH-44X',
    surplusQty: 840,
    deficitProjectId: 'KDSP-B1',
    deficitDaysRemaining: 4,
    unit: 'CUM',
    emergencyCost: 1680000,
    transferCost: 85000,
    savings: 1595000,
    urgency: 'critical',
  },
  {
    id: 'ra-2',
    material: 'Formwork System (Aluminium)',
    surplusProjectId: 'CHN-FLY',
    surplusQty: 280,
    deficitProjectId: 'HYD-M3',
    deficitDaysRemaining: 14,
    unit: 'sets',
    emergencyCost: 2800000,
    transferCost: 150000,
    savings: 2650000,
    urgency: 'high',
  },
  {
    id: 'ra-3',
    material: 'HSD Diesel',
    surplusProjectId: 'BMRC-E2',
    surplusQty: 4400,
    deficitProjectId: 'RLWY-G4',
    deficitDaysRemaining: 3,
    unit: 'litres',
    emergencyCost: 192000,
    transferCost: 18000,
    savings: 174000,
    urgency: 'critical',
  },
]

// ── Payment Schedule ───────────────────────────────────────────────────────────

export const paymentSchedule: PaymentScheduleItem[] = [
  {
    id: 'ps-1',
    poRef: 'PO-2853',
    projectId: 'KDSP-B1',
    vendor: 'Finolex Industries',
    item: 'HDPE Pipes (500mm)',
    amount: 3120000,
    dueDate: '2026-07-01',
    termsDays: 21,
    status: 'due-soon',
  },
  {
    id: 'ps-2',
    poRef: 'PO-2854',
    projectId: 'NH-44X',
    vendor: 'Sai Quarries Pvt Ltd',
    item: 'Aggregates (20mm & 40mm)',
    amount: 714000,
    dueDate: '2026-07-05',
    termsDays: 21,
    status: 'upcoming',
  },
  {
    id: 'ps-3',
    poRef: 'PO-2848',
    projectId: 'HYD-M3',
    vendor: 'ACC Ltd',
    item: 'OPC Cement',
    amount: 2355200,
    dueDate: '2026-07-06',
    termsDays: 21,
    status: 'upcoming',
  },
  {
    id: 'ps-4',
    poRef: 'PO-2866',
    projectId: 'HYD-M3',
    vendor: 'Atlas Copco India',
    item: 'Crane Spares',
    amount: 566400,
    dueDate: '2026-07-10',
    termsDays: 15,
    status: 'upcoming',
  },
  {
    id: 'ps-5',
    poRef: 'PO-2858',
    projectId: 'BMRC-E2',
    vendor: 'Polycab India Ltd',
    item: 'HT Cables (11kV)',
    amount: 2643200,
    dueDate: '2026-07-12',
    termsDays: 30,
    status: 'upcoming',
  },
  {
    id: 'ps-6',
    poRef: 'PO-2849',
    projectId: 'HYD-M3',
    vendor: 'HPCL Dealers Pvt Ltd',
    item: 'HSD Diesel (Bulk)',
    amount: 920000,
    dueDate: '2026-07-13',
    termsDays: 15,
    status: 'upcoming',
  },
  {
    id: 'ps-7',
    poRef: 'PO-2863',
    projectId: 'BMRC-E2',
    vendor: 'IOC Bulk Division',
    item: 'HSD Diesel (Bulk)',
    amount: 1480000,
    dueDate: '2026-07-14',
    termsDays: 15,
    status: 'upcoming',
  },
  {
    id: 'ps-8',
    poRef: 'PO-2864',
    projectId: 'VIZG-P2',
    vendor: 'JSW Steel Ltd',
    item: 'MS Plates (10mm)',
    amount: 3351200,
    dueDate: '2026-07-17',
    termsDays: 30,
    status: 'upcoming',
  },
  {
    id: 'ps-9',
    poRef: 'PO-2855',
    projectId: 'NH-44X',
    vendor: 'BPCL Bulk Division',
    item: 'Bitumen VG-40',
    amount: 1840800,
    dueDate: '2026-07-17',
    termsDays: 15,
    status: 'upcoming',
  },
  {
    id: 'ps-10',
    poRef: 'PO-2859',
    projectId: 'MUM-CST',
    vendor: 'UltraTech RMC',
    item: 'RMC M40',
    amount: 4710400,
    dueDate: '2026-07-22',
    termsDays: 21,
    status: 'upcoming',
  },
  {
    id: 'ps-11',
    poRef: 'PO-2851',
    projectId: 'MUM-CST',
    vendor: 'Tata Steel Ltd',
    item: 'Structural Steel',
    amount: 9935600,
    dueDate: '2026-08-04',
    termsDays: 30,
    status: 'upcoming',
  },
  {
    id: 'ps-12',
    poRef: 'PO-2847',
    projectId: 'HYD-M3',
    vendor: 'JSW Steel Ltd',
    item: 'TMT Steel Bars',
    amount: 5050400,
    dueDate: '2026-08-24',
    termsDays: 30,
    status: 'upcoming',
  },
  {
    id: 'ps-13',
    poRef: 'PO-2850',
    projectId: 'RLWY-G4',
    vendor: 'Patil Rail Infrastructure',
    item: 'Concrete Sleepers',
    amount: 7560000,
    dueDate: '2026-08-29',
    termsDays: 45,
    status: 'upcoming',
  },
  {
    id: 'ps-14',
    poRef: 'PO-2860',
    projectId: 'VIZG-P2',
    vendor: 'Atlas Copco India',
    item: 'Screw Piles (Marine)',
    amount: 10856000,
    dueDate: '2026-08-29',
    termsDays: 45,
    status: 'upcoming',
  },
]

// ── Vendor Empanelment Status ──────────────────────────────────────────────────

export const vendorEmpanelments: VendorEmpanelment[] = [
  {
    vendor: 'JSW Steel Ltd',
    empanelmentExpiry: '2026-08-15',
    isoCertExpiry: '2027-01-10',
    financialStandingExpiry: '2026-12-31',
    overallStatus: 'expiring-soon',
    daysToExpiry: 47,
    criticalFlag: 'Empanelment expires Aug 15',
  },
  {
    vendor: 'Patil Rail Infrastructure',
    empanelmentExpiry: '2027-03-01',
    isoCertExpiry: '2026-03-15',
    financialStandingExpiry: '2027-02-01',
    overallStatus: 'expired',
    daysToExpiry: -106,
    criticalFlag: 'ISO 9001 expired Mar 15 2026',
  },
  {
    vendor: 'ACC Ltd',
    empanelmentExpiry: '2027-01-20',
    isoCertExpiry: '2027-02-10',
    financialStandingExpiry: '2027-03-01',
    overallStatus: 'valid',
    daysToExpiry: 205,
  },
  {
    vendor: 'HPCL Bulk Division',
    empanelmentExpiry: '2026-12-15',
    isoCertExpiry: '2027-04-01',
    financialStandingExpiry: '2027-01-01',
    overallStatus: 'valid',
    daysToExpiry: 169,
  },
  {
    vendor: 'UltraTech RMC',
    empanelmentExpiry: '2026-09-05',
    isoCertExpiry: '2027-06-01',
    financialStandingExpiry: '2027-01-01',
    overallStatus: 'expiring-soon',
    daysToExpiry: 68,
    criticalFlag: 'Empanelment expires Sep 5',
  },
  {
    vendor: 'Deep Foundation India',
    empanelmentExpiry: '2026-11-20',
    isoCertExpiry: '2026-12-01',
    financialStandingExpiry: '2027-02-01',
    overallStatus: 'valid',
    daysToExpiry: 144,
  },
  {
    vendor: 'Atlas Copco India',
    empanelmentExpiry: '2026-07-20',
    isoCertExpiry: '2027-01-15',
    financialStandingExpiry: '2026-11-30',
    overallStatus: 'expiring-soon',
    daysToExpiry: 21,
    criticalFlag: 'Empanelment expires Jul 20 — 21 days',
  },
  {
    vendor: 'PERI India Pvt Ltd',
    empanelmentExpiry: '2027-01-10',
    isoCertExpiry: '2027-03-01',
    financialStandingExpiry: '2027-04-01',
    overallStatus: 'valid',
    daysToExpiry: 195,
  },
]
