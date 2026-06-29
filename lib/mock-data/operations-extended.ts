// Extended operations mock data: RA bills, client gates, variation orders, critical blockers, monsoon risk

export type RABillStatus = 'submitted' | 'under-review' | 'certified' | 'payment-received'
export type ClientGateType = 'drawing' | 'design-clearance' | 'variation-order' | 'technical-query'
export type GatePriority = 'critical' | 'high' | 'medium'
export type VOStatus = 'submitted' | 'pending-approval' | 'approved' | 'mobilized'
export type VOType = 'scope-addition' | 'design-change' | 'quantity-variation'
export type BlockerType = 'material' | 'client-approval' | 'resource' | 'design' | 'weather'
export type MonsoonExposure = 'high' | 'medium' | 'low'

export interface RABill {
  id: string
  projectId: string
  billNo: string
  amount: number
  submittedDate: string
  status: RABillStatus
  certifiedAmount?: number
  daysStuck: number
  client: string
}

export interface ClientGate {
  id: string
  projectId: string
  type: ClientGateType
  title: string
  daysWaiting: number
  blocksActivity: string
  client: string
  priority: GatePriority
}

export interface VariationOrder {
  id: string
  projectId: string
  title: string
  value: number
  status: VOStatus
  type: VOType
  submittedDate: string
}

export interface CriticalBlocker {
  id: string
  projectId: string
  blockingActivity: string
  reason: string
  daysImpact: number
  targetResolution: string
  owner: string
  type: BlockerType
}

export interface MonsoonRisk {
  projectId: string
  exposureLevel: MonsoonExposure
  activitiesAtRisk: string[]
  daysAffected: number
  mitigationStatus: 'in-place' | 'partial' | 'none'
}

// ── Running Account Bills ──────────────────────────────────────────────────────

export const raBills: RABill[] = [
  {
    id: 'rab-1', projectId: 'HYD-M3', billNo: 'RA-14', amount: 84000000,
    submittedDate: '2026-05-15', status: 'under-review', daysStuck: 45, client: 'HMRL',
  },
  {
    id: 'rab-2', projectId: 'HYD-M3', billNo: 'RA-13', amount: 62000000,
    submittedDate: '2026-02-10', status: 'payment-received', certifiedAmount: 59800000, daysStuck: 0, client: 'HMRL',
  },
  {
    id: 'rab-3', projectId: 'BMRC-E2', billNo: 'RA-9', amount: 121000000,
    submittedDate: '2026-06-17', status: 'submitted', daysStuck: 12, client: 'BMRCL',
  },
  {
    id: 'rab-4', projectId: 'KDSP-B1', billNo: 'RA-7', amount: 32000000,
    submittedDate: '2026-04-23', status: 'under-review', daysStuck: 67, client: 'KSPH',
  },
  {
    id: 'rab-5', projectId: 'CHN-FLY', billNo: 'RA-6', amount: 18000000,
    submittedDate: '2026-06-21', status: 'submitted', daysStuck: 8, client: 'CMDA',
  },
  {
    id: 'rab-6', projectId: 'MUM-CST', billNo: 'RA-3', amount: 68000000,
    submittedDate: '2026-06-07', status: 'under-review', daysStuck: 22, client: 'MMRDA',
  },
  {
    id: 'rab-7', projectId: 'VIZG-P2', billNo: 'RA-4', amount: 44000000,
    submittedDate: '2026-05-29', status: 'under-review', daysStuck: 31, client: 'VPT',
  },
  {
    id: 'rab-8', projectId: 'NH-44X', billNo: 'RA-20', amount: 41000000,
    submittedDate: '2026-05-01', status: 'certified', certifiedAmount: 39000000, daysStuck: 5, client: 'NHAI',
  },
  {
    id: 'rab-9', projectId: 'RLWY-G4', billNo: 'RA-12', amount: 29000000,
    submittedDate: '2026-06-01', status: 'certified', certifiedAmount: 28500000, daysStuck: 5, client: 'S.Rly',
  },
]

// ── Client Approval Gates ──────────────────────────────────────────────────────

export const clientGates: ClientGate[] = [
  {
    id: 'cg-1', projectId: 'HYD-M3', type: 'drawing', priority: 'critical',
    title: 'Viaduct Design Drawing Set Rev-C (14 sheets)',
    daysWaiting: 22, blocksActivity: 'Viaduct casting — Pier 34–41', client: 'HMRL DPR Cell',
  },
  {
    id: 'cg-2', projectId: 'KDSP-B1', type: 'design-clearance', priority: 'critical',
    title: 'Revised Canal Lining Design (slope 1:1.5)',
    daysWaiting: 38, blocksActivity: 'Canal lining Ph-2 (7.4km stretch)', client: 'KSPH Chief Engineer',
  },
  {
    id: 'cg-3', projectId: 'MUM-CST', type: 'technical-query', priority: 'high',
    title: 'Pile depth revision TQ-MUM-031 (SBC variation)',
    daysWaiting: 19, blocksActivity: 'Pile extension works — 48 nos.', client: 'MMRDA PMC',
  },
  {
    id: 'cg-4', projectId: 'BMRC-E2', type: 'drawing', priority: 'high',
    title: 'Track alignment TDR — KR Pura to Byappanahalli',
    daysWaiting: 15, blocksActivity: 'Pier spacing and foundation works', client: 'BMRCL',
  },
  {
    id: 'cg-5', projectId: 'VIZG-P2', type: 'variation-order', priority: 'medium',
    title: 'Cathodic protection system VO approval',
    daysWaiting: 11, blocksActivity: 'Marine equipment procurement', client: 'VPT Board',
  },
  {
    id: 'cg-6', projectId: 'CHN-FLY', type: 'drawing', priority: 'medium',
    title: 'Pavement design approval — Junction at Ch 1+380',
    daysWaiting: 5, blocksActivity: 'Road surfacing final stretch', client: 'CMDA',
  },
]

// ── Variation Orders ────────────────────────────────────────────────────────────

export const variationOrders: VariationOrder[] = [
  {
    id: 'vo-1', projectId: 'HYD-M3', title: 'Additional staircase provisions at 3 stations (accessibility norms)',
    value: 42000000, status: 'pending-approval', type: 'scope-addition', submittedDate: '2026-05-12',
  },
  {
    id: 'vo-2', projectId: 'HYD-M3', title: 'Steel reinforcement rate revision (market price escalation)',
    value: 19000000, status: 'approved', type: 'quantity-variation', submittedDate: '2026-02-28',
  },
  {
    id: 'vo-3', projectId: 'KDSP-B1', title: 'Canal extension 2.1km additional scope — Pkg B2',
    value: 31000000, status: 'submitted', type: 'scope-addition', submittedDate: '2026-06-05',
  },
  {
    id: 'vo-4', projectId: 'BMRC-E2', title: 'Underground utility diversion — BWSSB pipeline relocation',
    value: 18000000, status: 'approved', type: 'design-change', submittedDate: '2026-01-15',
  },
  {
    id: 'vo-5', projectId: 'CHN-FLY', title: 'Additional lane provision at Manali Road Junction',
    value: 9000000, status: 'mobilized', type: 'design-change', submittedDate: '2025-11-20',
  },
  {
    id: 'vo-6', projectId: 'MUM-CST', title: 'Additional piling works due to SBC variation (48 nos.)',
    value: 24000000, status: 'approved', type: 'quantity-variation', submittedDate: '2026-03-10',
  },
  {
    id: 'vo-7', projectId: 'RLWY-G4', title: 'Embankment reinforcement at 4 critical locations',
    value: 22000000, status: 'pending-approval', type: 'scope-addition', submittedDate: '2026-05-22',
  },
  {
    id: 'vo-8', projectId: 'VIZG-P2', title: 'Cathodic protection system for berth structure',
    value: 16000000, status: 'submitted', type: 'scope-addition', submittedDate: '2026-06-01',
  },
]

// ── Critical Path Blockers ─────────────────────────────────────────────────────

export const criticalBlockers: CriticalBlocker[] = [
  {
    id: 'cb-1', projectId: 'HYD-M3', type: 'material',
    blockingActivity: 'Viaduct casting — Piers 34–41',
    reason: 'Acrow India formwork delivery delayed due to logistics at Chennai port. 3 full sets required.',
    daysImpact: 30,
    targetResolution: '2026-07-15',
    owner: 'Rajesh Nair / Procurement',
  },
  {
    id: 'cb-2', projectId: 'KDSP-B1', type: 'client-approval',
    blockingActivity: 'Canal lining Ph-2 works (7.4km)',
    reason: 'KSPH Chief Engineer pending approval on slope revision from 1:1 to 1:1.5. Design submitted 38 days ago.',
    daysImpact: 49,
    targetResolution: '2026-07-10',
    owner: 'KSPH Chief Engineer / Priya Menon',
  },
  {
    id: 'cb-3', projectId: 'RLWY-G4', type: 'client-approval',
    blockingActivity: 'Ballast quarry sourcing for BG track laying',
    reason: 'Southern Railways zonal approval for Bellary quarry pending — alternate source adds 40km haul distance.',
    daysImpact: 21,
    targetResolution: '2026-08-01',
    owner: 'Venkat Rao / Railways Liaison',
  },
  {
    id: 'cb-4', projectId: 'CHN-FLY', type: 'weather',
    blockingActivity: 'Road surfacing — final 480m',
    reason: 'CMDA norms prohibit bituminous work Jul 1–Aug 15 during peak Chennai monsoon. 45-day mandatory halt.',
    daysImpact: 45,
    targetResolution: '2026-08-16',
    owner: 'Karthik Iyer (monitoring)',
  },
]

// ── Monsoon Risk ───────────────────────────────────────────────────────────────

export const monsoonRisks: MonsoonRisk[] = [
  {
    projectId: 'HYD-M3', exposureLevel: 'medium',
    activitiesAtRisk: ['Concrete pours', 'Earthwork backfill', 'Steel erection'],
    daysAffected: 45, mitigationStatus: 'partial',
  },
  {
    projectId: 'BMRC-E2', exposureLevel: 'low',
    activitiesAtRisk: ['Pier top works'],
    daysAffected: 12, mitigationStatus: 'in-place',
  },
  {
    projectId: 'NH-44X', exposureLevel: 'high',
    activitiesAtRisk: ['Base course laying', 'Bituminous surfacing', 'Embankment fills'],
    daysAffected: 60, mitigationStatus: 'none',
  },
  {
    projectId: 'KDSP-B1', exposureLevel: 'high',
    activitiesAtRisk: ['Canal lining concreting', 'Pump house foundation', 'Site flooding risk'],
    daysAffected: 55, mitigationStatus: 'partial',
  },
  {
    projectId: 'CHN-FLY', exposureLevel: 'high',
    activitiesAtRisk: ['Road surfacing (mandatory halt)', 'Pavement marking'],
    daysAffected: 45, mitigationStatus: 'partial',
  },
  {
    projectId: 'MUM-CST', exposureLevel: 'high',
    activitiesAtRisk: ['Marine piling', 'Deck formwork', 'Material barging'],
    daysAffected: 70, mitigationStatus: 'in-place',
  },
  {
    projectId: 'RLWY-G4', exposureLevel: 'medium',
    activitiesAtRisk: ['Embankment stabilization', 'Formation grading'],
    daysAffected: 30, mitigationStatus: 'partial',
  },
  {
    projectId: 'VIZG-P2', exposureLevel: 'high',
    activitiesAtRisk: ['Quay wall construction', 'Marine crane works', 'Cyclone risk (Cat 1–2)'],
    daysAffected: 65, mitigationStatus: 'partial',
  },
]
