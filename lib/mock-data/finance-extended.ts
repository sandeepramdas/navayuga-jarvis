// Finance 360° extended mock data

export interface CashFlowMonth {
  month: string
  period: 'actual' | 'forecast'
  inflows: number
  outflows: number
  netFlow: number
  cumulativeNet: number
  breakdownIn: { raCollections: number; advanceReceipts: number; retentionReleases: number }
  breakdownOut: { materials: number; labor: number; plant: number; subcontractor: number; overheads: number }
}

export interface EVMMetrics {
  projectId: string
  bac: number
  plannedProgress: number
  actualProgress: number
  pv: number
  ev: number
  ac: number
  cpi: number
  spi: number
  eac: number
  vac: number
  tcpi: number
  weeklyCPI: number[]
}

export interface CostCategoryBreakdown {
  projectId: string
  materials: number
  labor: number
  plant: number
  subcontractor: number
  overheads: number
  total: number
  materialsPct: number
  laborPct: number
  plantPct: number
  subcontractorPct: number
  overheadsPct: number
}

export interface BankGuarantee {
  id: string
  projectId: string
  type: 'performance' | 'advance' | 'retention' | 'bid'
  amount: number
  issuedDate: string
  expiryDate: string
  client: string
  bank: string
  status: 'active' | 'expiring-soon' | 'expired' | 'returned'
  daysToExpiry: number
}

export interface TaxPosition {
  projectId: string
  gstInputCredit: number
  gstOutputLiability: number
  netGSTPosition: number
  tdsDeductedByClient: number
  advanceTaxPaid: number
  totalTaxLocked: number
}

export interface ClientDSO {
  client: string
  projects: string[]
  totalBilledLast12Months: number
  totalCollectedLast12Months: number
  avgDSODays: number
  longestOutstanding: number
  reliabilityRating: 'excellent' | 'good' | 'poor' | 'critical'
}

export interface RetentionSummary {
  projectId: string
  client: string
  totalContractValue: number
  retentionHeldPct: number
  retentionAmount: number
  releaseMilestone: string
  releaseDate: string
}

// ── Cash Flow ─────────────────────────────────────────────────────────────────

export const cashFlow: CashFlowMonth[] = [
  {
    month: 'Jan 26',
    period: 'actual',
    inflows: 62000000,
    outflows: 58000000,
    netFlow: 4000000,
    cumulativeNet: 4000000,
    breakdownIn: { raCollections: 55000000, advanceReceipts: 5000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 28000000, labor: 14000000, plant: 8000000, subcontractor: 5000000, overheads: 3000000 },
  },
  {
    month: 'Feb 26',
    period: 'actual',
    inflows: 89000000,
    outflows: 72000000,
    netFlow: 17000000,
    cumulativeNet: 21000000,
    breakdownIn: { raCollections: 79000000, advanceReceipts: 8000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 34000000, labor: 16000000, plant: 11000000, subcontractor: 7000000, overheads: 4000000 },
  },
  {
    month: 'Mar 26',
    period: 'actual',
    inflows: 75000000,
    outflows: 81000000,
    netFlow: -6000000,
    cumulativeNet: 15000000,
    breakdownIn: { raCollections: 68000000, advanceReceipts: 5000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 38000000, labor: 18000000, plant: 12000000, subcontractor: 9000000, overheads: 4000000 },
  },
  {
    month: 'Apr 26',
    period: 'actual',
    inflows: 48000000,
    outflows: 89000000,
    netFlow: -41000000,
    cumulativeNet: -26000000,
    breakdownIn: { raCollections: 40000000, advanceReceipts: 6000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 42000000, labor: 19000000, plant: 14000000, subcontractor: 10000000, overheads: 4000000 },
  },
  {
    month: 'May 26',
    period: 'actual',
    inflows: 124000000,
    outflows: 94000000,
    netFlow: 30000000,
    cumulativeNet: 4000000,
    breakdownIn: { raCollections: 116000000, advanceReceipts: 6000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 44000000, labor: 20000000, plant: 15000000, subcontractor: 11000000, overheads: 4000000 },
  },
  {
    month: 'Jun 26',
    period: 'actual',
    inflows: 32000000,
    outflows: 108000000,
    netFlow: -76000000,
    cumulativeNet: -72000000,
    breakdownIn: { raCollections: 24000000, advanceReceipts: 6000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 48000000, labor: 22000000, plant: 18000000, subcontractor: 14000000, overheads: 6000000 },
  },
  {
    month: 'Jul 26',
    period: 'forecast',
    inflows: 185000000,
    outflows: 122000000,
    netFlow: 63000000,
    cumulativeNet: -9000000,
    breakdownIn: { raCollections: 175000000, advanceReceipts: 8000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 55000000, labor: 24000000, plant: 19000000, subcontractor: 16000000, overheads: 8000000 },
  },
  {
    month: 'Aug 26',
    period: 'forecast',
    inflows: 96000000,
    outflows: 118000000,
    netFlow: -22000000,
    cumulativeNet: -31000000,
    breakdownIn: { raCollections: 86000000, advanceReceipts: 8000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 52000000, labor: 24000000, plant: 18000000, subcontractor: 16000000, overheads: 8000000 },
  },
  {
    month: 'Sep 26',
    period: 'forecast',
    inflows: 142000000,
    outflows: 115000000,
    netFlow: 27000000,
    cumulativeNet: -4000000,
    breakdownIn: { raCollections: 132000000, advanceReceipts: 8000000, retentionReleases: 2000000 },
    breakdownOut: { materials: 50000000, labor: 23000000, plant: 17000000, subcontractor: 17000000, overheads: 8000000 },
  },
]

// ── EVM Metrics ───────────────────────────────────────────────────────────────

export const evmMetrics: EVMMetrics[] = [
  {
    projectId: 'HYD-M3',
    bac: 84500000,
    plannedProgress: 81,
    actualProgress: 67,
    pv: 68445000,
    ev: 56615000,
    ac: 94752000,
    cpi: 0.597,
    spi: 0.827,
    eac: 187532000,
    vac: -103032000,
    tcpi: 0.946,
    weeklyCPI: [0.68, 0.66, 0.64, 0.63, 0.61, 0.60, 0.597],
  },
  {
    projectId: 'BMRC-E2',
    bac: 127000000,
    plannedProgress: 46,
    actualProgress: 43,
    pv: 58420000,
    ev: 54610000,
    ac: 51840000,
    cpi: 1.053,
    spi: 0.935,
    eac: 120617000,
    vac: 6383000,
    tcpi: 0.967,
    weeklyCPI: [1.01, 1.02, 1.03, 1.04, 1.05, 1.05, 1.053],
  },
  {
    projectId: 'NH-44X',
    bac: 56200000,
    plannedProgress: 79,
    actualProgress: 81,
    pv: 44398000,
    ev: 45522000,
    ac: 54834000,
    cpi: 0.830,
    spi: 1.025,
    eac: 67737000,
    vac: -11537000,
    tcpi: 0.956,
    weeklyCPI: [0.85, 0.84, 0.83, 0.83, 0.83, 0.83, 0.830],
  },
  {
    projectId: 'KDSP-B1',
    bac: 38900000,
    plannedProgress: 65,
    actualProgress: 54,
    pv: 25285000,
    ev: 21006000,
    ac: 42256000,
    cpi: 0.497,
    spi: 0.831,
    eac: 78232000,
    vac: -39332000,
    tcpi: 0.798,
    weeklyCPI: [0.60, 0.58, 0.55, 0.53, 0.51, 0.50, 0.497],
  },
  {
    projectId: 'CHN-FLY',
    bac: 18700000,
    plannedProgress: 94,
    actualProgress: 92,
    pv: 17578000,
    ev: 17204000,
    ac: 17952000,
    cpi: 0.958,
    spi: 0.979,
    eac: 19519000,
    vac: -819000,
    tcpi: 0.807,
    weeklyCPI: [0.97, 0.96, 0.96, 0.96, 0.96, 0.958, 0.958],
  },
  {
    projectId: 'MUM-CST',
    bac: 215000000,
    plannedProgress: 29,
    actualProgress: 29,
    pv: 62350000,
    ev: 62350000,
    ac: 64716000,
    cpi: 0.963,
    spi: 1.000,
    eac: 223147000,
    vac: -8147000,
    tcpi: 0.977,
    weeklyCPI: [0.97, 0.97, 0.97, 0.96, 0.96, 0.963, 0.963],
  },
  {
    projectId: 'RLWY-G4',
    bac: 29400000,
    plannedProgress: 70,
    actualProgress: 71,
    pv: 20580000,
    ev: 20874000,
    ac: 30576000,
    cpi: 0.683,
    spi: 1.014,
    eac: 43053000,
    vac: -13653000,
    tcpi: 0.699,
    weeklyCPI: [0.74, 0.73, 0.71, 0.70, 0.69, 0.684, 0.683],
  },
  {
    projectId: 'VIZG-P2',
    bac: 74800000,
    plannedProgress: 32,
    actualProgress: 38,
    pv: 23936000,
    ev: 28424000,
    ac: 29542000,
    cpi: 0.962,
    spi: 1.188,
    eac: 77752000,
    vac: -2952000,
    tcpi: 1.003,
    weeklyCPI: [0.97, 0.97, 0.96, 0.96, 0.963, 0.962, 0.962],
  },
]

// ── Cost Category Breakdown ───────────────────────────────────────────────────

export const costCategoryBreakdown: CostCategoryBreakdown[] = [
  {
    projectId: 'HYD-M3',
    total: 94752000,
    materials: 43986000,
    labor: 22040000,
    plant: 14213000,
    subcontractor: 10423000,
    overheads: 4090000,
    materialsPct: 46.4,
    laborPct: 23.3,
    plantPct: 15.0,
    subcontractorPct: 11.0,
    overheadsPct: 4.3,
  },
  {
    projectId: 'BMRC-E2',
    total: 51840000,
    materials: 21773000,
    labor: 13478000,
    plant: 7254000,
    subcontractor: 6221000,
    overheads: 3114000,
    materialsPct: 42.0,
    laborPct: 26.0,
    plantPct: 14.0,
    subcontractorPct: 12.0,
    overheadsPct: 6.0,
  },
  {
    projectId: 'NH-44X',
    total: 54834000,
    materials: 25764000,
    labor: 10967000,
    plant: 11515000,
    subcontractor: 4935000,
    overheads: 1653000,
    materialsPct: 47.0,
    laborPct: 20.0,
    plantPct: 21.0,
    subcontractorPct: 9.0,
    overheadsPct: 3.0,
  },
  {
    projectId: 'KDSP-B1',
    total: 42256000,
    materials: 18138000,
    labor: 11432000,
    plant: 6338000,
    subcontractor: 4226000,
    overheads: 2122000,
    materialsPct: 42.9,
    laborPct: 27.1,
    plantPct: 15.0,
    subcontractorPct: 10.0,
    overheadsPct: 5.0,
  },
  {
    projectId: 'CHN-FLY',
    total: 17952000,
    materials: 7002000,
    labor: 4488000,
    plant: 2693000,
    subcontractor: 2693000,
    overheads: 1076000,
    materialsPct: 39.0,
    laborPct: 25.0,
    plantPct: 15.0,
    subcontractorPct: 15.0,
    overheadsPct: 6.0,
  },
  {
    projectId: 'MUM-CST',
    total: 64716000,
    materials: 23298000,
    labor: 16179000,
    plant: 12943000,
    subcontractor: 9707000,
    overheads: 2589000,
    materialsPct: 36.0,
    laborPct: 25.0,
    plantPct: 20.0,
    subcontractorPct: 15.0,
    overheadsPct: 4.0,
  },
  {
    projectId: 'RLWY-G4',
    total: 30576000,
    materials: 12230000,
    labor: 7644000,
    plant: 6421000,
    subcontractor: 3058000,
    overheads: 1223000,
    materialsPct: 40.0,
    laborPct: 25.0,
    plantPct: 21.0,
    subcontractorPct: 10.0,
    overheadsPct: 4.0,
  },
  {
    projectId: 'VIZG-P2',
    total: 29542000,
    materials: 11817000,
    labor: 7385000,
    plant: 5909000,
    subcontractor: 2954000,
    overheads: 1477000,
    materialsPct: 40.0,
    laborPct: 25.0,
    plantPct: 20.0,
    subcontractorPct: 10.0,
    overheadsPct: 5.0,
  },
]

// ── Bank Guarantees ───────────────────────────────────────────────────────────

export const bankGuarantees: BankGuarantee[] = [
  {
    id: 'bg-1',
    projectId: 'HYD-M3',
    type: 'performance',
    amount: 8450000,
    issuedDate: '2024-02-15',
    expiryDate: '2027-02-28',
    client: 'HMRL',
    bank: 'SBI',
    status: 'active',
    daysToExpiry: 609,
  },
  {
    id: 'bg-2',
    projectId: 'HYD-M3',
    type: 'advance',
    amount: 12675000,
    issuedDate: '2024-03-01',
    expiryDate: '2026-08-31',
    client: 'HMRL',
    bank: 'HDFC',
    status: 'expiring-soon',
    daysToExpiry: 63,
  },
  {
    id: 'bg-3',
    projectId: 'BMRC-E2',
    type: 'performance',
    amount: 12700000,
    issuedDate: '2024-06-01',
    expiryDate: '2027-12-31',
    client: 'BMRCL',
    bank: 'Canara',
    status: 'active',
    daysToExpiry: 550,
  },
  {
    id: 'bg-4',
    projectId: 'KDSP-B1',
    type: 'performance',
    amount: 3890000,
    issuedDate: '2023-11-01',
    expiryDate: '2026-12-31',
    client: 'KSPH',
    bank: 'SBI',
    status: 'active',
    daysToExpiry: 185,
  },
  {
    id: 'bg-5',
    projectId: 'KDSP-B1',
    type: 'advance',
    amount: 5835000,
    issuedDate: '2023-12-15',
    expiryDate: '2026-07-31',
    client: 'KSPH',
    bank: 'SBI',
    status: 'expiring-soon',
    daysToExpiry: 32,
  },
  {
    id: 'bg-6',
    projectId: 'CHN-FLY',
    type: 'retention',
    amount: 1870000,
    issuedDate: '2025-01-10',
    expiryDate: '2026-07-15',
    client: 'CMDA',
    bank: 'ICICI',
    status: 'expiring-soon',
    daysToExpiry: 16,
  },
  {
    id: 'bg-7',
    projectId: 'MUM-CST',
    type: 'performance',
    amount: 21500000,
    issuedDate: '2025-03-20',
    expiryDate: '2028-09-30',
    client: 'MMRDA',
    bank: 'SBI',
    status: 'active',
    daysToExpiry: 824,
  },
  {
    id: 'bg-8',
    projectId: 'MUM-CST',
    type: 'advance',
    amount: 32250000,
    issuedDate: '2025-04-01',
    expiryDate: '2026-09-30',
    client: 'MMRDA',
    bank: 'HDFC',
    status: 'active',
    daysToExpiry: 93,
  },
  {
    id: 'bg-9',
    projectId: 'RLWY-G4',
    type: 'performance',
    amount: 2940000,
    issuedDate: '2024-05-01',
    expiryDate: '2026-10-31',
    client: 'S.Rly',
    bank: 'PNB',
    status: 'active',
    daysToExpiry: 124,
  },
  {
    id: 'bg-10',
    projectId: 'VIZG-P2',
    type: 'performance',
    amount: 7480000,
    issuedDate: '2025-01-15',
    expiryDate: '2027-12-31',
    client: 'VPT',
    bank: 'Canara',
    status: 'active',
    daysToExpiry: 550,
  },
  {
    id: 'bg-11',
    projectId: 'NH-44X',
    type: 'performance',
    amount: 5620000,
    issuedDate: '2024-01-20',
    expiryDate: '2026-09-15',
    client: 'NHAI',
    bank: 'SBI',
    status: 'active',
    daysToExpiry: 78,
  },
  {
    id: 'bg-12',
    projectId: 'BMRC-E2',
    type: 'advance',
    amount: 9525000,
    issuedDate: '2024-07-01',
    expiryDate: '2026-07-31',
    client: 'BMRCL',
    bank: 'HDFC',
    status: 'expiring-soon',
    daysToExpiry: 32,
  },
]

// ── Tax Positions ─────────────────────────────────────────────────────────────

export const taxPositions: TaxPosition[] = [
  {
    projectId: 'HYD-M3',
    gstInputCredit: 6240000,
    gstOutputLiability: 4560000,
    netGSTPosition: 1680000,
    tdsDeductedByClient: 1895040,
    advanceTaxPaid: 950000,
    totalTaxLocked: 2845040,
  },
  {
    projectId: 'BMRC-E2',
    gstInputCredit: 3310000,
    gstOutputLiability: 2210000,
    netGSTPosition: 1100000,
    tdsDeductedByClient: 1036800,
    advanceTaxPaid: 520000,
    totalTaxLocked: 1556800,
  },
  {
    projectId: 'NH-44X',
    gstInputCredit: 2540000,
    gstOutputLiability: 2620000,
    netGSTPosition: -80000,
    tdsDeductedByClient: 1096680,
    advanceTaxPaid: 550000,
    totalTaxLocked: 1646680,
  },
  {
    projectId: 'KDSP-B1',
    gstInputCredit: 2110000,
    gstOutputLiability: 1820000,
    netGSTPosition: 290000,
    tdsDeductedByClient: 845120,
    advanceTaxPaid: 420000,
    totalTaxLocked: 1265120,
  },
  {
    projectId: 'CHN-FLY',
    gstInputCredit: 890000,
    gstOutputLiability: 780000,
    netGSTPosition: 110000,
    tdsDeductedByClient: 359040,
    advanceTaxPaid: 180000,
    totalTaxLocked: 539040,
  },
  {
    projectId: 'MUM-CST',
    gstInputCredit: 4210000,
    gstOutputLiability: 3520000,
    netGSTPosition: 690000,
    tdsDeductedByClient: 1294320,
    advanceTaxPaid: 650000,
    totalTaxLocked: 1944320,
  },
  {
    projectId: 'RLWY-G4',
    gstInputCredit: 1840000,
    gstOutputLiability: 1680000,
    netGSTPosition: 160000,
    tdsDeductedByClient: 611520,
    advanceTaxPaid: 300000,
    totalTaxLocked: 911520,
  },
  {
    projectId: 'VIZG-P2',
    gstInputCredit: 1920000,
    gstOutputLiability: 1610000,
    netGSTPosition: 310000,
    tdsDeductedByClient: 590840,
    advanceTaxPaid: 300000,
    totalTaxLocked: 890840,
  },
]

// ── Client DSO ────────────────────────────────────────────────────────────────

export const clientDSO: ClientDSO[] = [
  {
    client: 'HMRL',
    projects: ['HYD-M3'],
    totalBilledLast12Months: 146000000,
    totalCollectedLast12Months: 119800000,
    avgDSODays: 72,
    longestOutstanding: 45,
    reliabilityRating: 'poor',
  },
  {
    client: 'BMRCL',
    projects: ['BMRC-E2'],
    totalBilledLast12Months: 121000000,
    totalCollectedLast12Months: 121000000,
    avgDSODays: 38,
    longestOutstanding: 12,
    reliabilityRating: 'good',
  },
  {
    client: 'NHAI',
    projects: ['NH-44X'],
    totalBilledLast12Months: 164000000,
    totalCollectedLast12Months: 156000000,
    avgDSODays: 28,
    longestOutstanding: 5,
    reliabilityRating: 'excellent',
  },
  {
    client: 'KSPH',
    projects: ['KDSP-B1'],
    totalBilledLast12Months: 32000000,
    totalCollectedLast12Months: 0,
    avgDSODays: 89,
    longestOutstanding: 67,
    reliabilityRating: 'critical',
  },
  {
    client: 'CMDA',
    projects: ['CHN-FLY'],
    totalBilledLast12Months: 34200000,
    totalCollectedLast12Months: 25200000,
    avgDSODays: 42,
    longestOutstanding: 8,
    reliabilityRating: 'good',
  },
  {
    client: 'MMRDA',
    projects: ['MUM-CST'],
    totalBilledLast12Months: 68000000,
    totalCollectedLast12Months: 52000000,
    avgDSODays: 54,
    longestOutstanding: 22,
    reliabilityRating: 'poor',
  },
  {
    client: 'S.Rly',
    projects: ['RLWY-G4'],
    totalBilledLast12Months: 113800000,
    totalCollectedLast12Months: 107400000,
    avgDSODays: 35,
    longestOutstanding: 5,
    reliabilityRating: 'good',
  },
  {
    client: 'VPT',
    projects: ['VIZG-P2'],
    totalBilledLast12Months: 44000000,
    totalCollectedLast12Months: 28000000,
    avgDSODays: 61,
    longestOutstanding: 31,
    reliabilityRating: 'poor',
  },
]

// ── Retention Summary ─────────────────────────────────────────────────────────

export const retentionSummary: RetentionSummary[] = [
  {
    projectId: 'HYD-M3',
    client: 'HMRL',
    totalContractValue: 84500000,
    retentionHeldPct: 5,
    retentionAmount: 4225000,
    releaseMilestone: 'DLP completion',
    releaseDate: '2027-08-30',
  },
  {
    projectId: 'BMRC-E2',
    client: 'BMRCL',
    totalContractValue: 127000000,
    retentionHeldPct: 5,
    retentionAmount: 6350000,
    releaseMilestone: 'DLP completion',
    releaseDate: '2028-04-15',
  },
  {
    projectId: 'MUM-CST',
    client: 'MMRDA',
    totalContractValue: 215000000,
    retentionHeldPct: 5,
    retentionAmount: 10750000,
    releaseMilestone: 'DLP completion',
    releaseDate: '2029-03-31',
  },
  {
    projectId: 'KDSP-B1',
    client: 'KSPH',
    totalContractValue: 38900000,
    retentionHeldPct: 5,
    retentionAmount: 1945000,
    releaseMilestone: 'DLP completion',
    releaseDate: '2027-12-01',
  },
  {
    projectId: 'VIZG-P2',
    client: 'VPT',
    totalContractValue: 74800000,
    retentionHeldPct: 5,
    retentionAmount: 3740000,
    releaseMilestone: 'DLP completion',
    releaseDate: '2028-07-15',
  },
]
