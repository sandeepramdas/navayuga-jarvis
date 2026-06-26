export type EventType = 'alert' | 'update' | 'procurement' | 'milestone' | 'system' | 'crew' | 'finance'
export type EventSeverity = 'critical' | 'high' | 'medium' | 'info' | 'success'

export interface ActivityEvent {
  id: string
  projectId: string
  type: EventType
  title: string
  detail: string
  severity: EventSeverity
  minutesAgo: number
  tickReveal: number
}

export const activityEvents: ActivityEvent[] = [
  // Always visible (tick 0)
  { id: 'AE-001', projectId: 'HYD-M3',    type: 'alert',       title: 'Steel stockout in 4 days',           detail: 'PO-2847 JSW Steel 200MT TMT — no ETD confirmed. Site stock: 42MT vs 80MT reorder point.', severity: 'critical', minutesAgo: 3,   tickReveal: 0 },
  { id: 'AE-002', projectId: 'HYD-M3',    type: 'alert',       title: 'VLV-EC300E hydraulic failure',        detail: 'Volvo EC300E (Reg: KA-09-TH-2021) hydraulic pump confirmed failed. Grounded at HYD-M3.', severity: 'critical', minutesAgo: 8,   tickReveal: 0 },
  { id: 'AE-003', projectId: 'KDSP-B1',   type: 'alert',       title: 'Fe-415 steel critically low',         detail: 'PO-2852 SAIL Steel 480MT — 3 days stock remaining at Medigadda site. ETA July 8.', severity: 'critical', minutesAgo: 12,  tickReveal: 0 },
  { id: 'AE-004', projectId: 'PORTFOLIO', type: 'finance',      title: 'Portfolio cost overrun widening',    detail: 'HYD-M3 CPI: 0.89 (-0.02 vs last week). KDSP-B1 CPI: 0.92. Combined exposure ₹14.5L.', severity: 'high',     minutesAgo: 18,  tickReveal: 0 },
  { id: 'AE-005', projectId: 'VIZG-P2',   type: 'alert',       title: 'Screw pile delivery at risk',         detail: 'Atlas Copco PO-2860 — supplier confirms 6-day delay. Quay Wall Ph-1 at risk.', severity: 'high',     minutesAgo: 22,  tickReveal: 0 },
  { id: 'AE-006', projectId: 'NH-44X',    type: 'procurement',  title: 'Bitumen PO-2865 awaiting sign-off', detail: 'HPCL VG-30 bitumen 1,850MT PO requires MD approval. HPCL lead time 7 days — urgent.', severity: 'high',     minutesAgo: 31,  tickReveal: 0 },
  { id: 'AE-007', projectId: 'BMRC-E2',   type: 'alert',       title: 'Concrete pump breakdown',             detail: 'Pier cap concreting halted at BMRC-E2. Schwing pump failure. ETA repair: 5 days.', severity: 'high',     minutesAgo: 35,  tickReveal: 0 },
  { id: 'AE-008', projectId: 'RLWY-G4',   type: 'alert',       title: 'Monsoon disruption — 8 days lost',   detail: 'Formation works Km 45–72 halted. 3 consecutive days heavy rain forecast. Slippage risk.', severity: 'medium',   minutesAgo: 42,  tickReveal: 0 },
  { id: 'AE-009', projectId: 'CHN-FLY',   type: 'milestone',   title: 'Deck slab completed ✓',              detail: 'M4 (Deck Slab & Parapet) certified complete — 18 days ahead. QA sign-off obtained.', severity: 'success',  minutesAgo: 48,  tickReveal: 0 },

  // Tick 1 — appears after first live tick
  { id: 'AE-010', projectId: 'HYD-M3',    type: 'update',      title: 'Span erection paused — crew idle',   detail: 'Viaduct crew (68 workers) on standby since 08:00. Idle cost: ₹2.8L/day. Escalated to PM.', severity: 'critical', minutesAgo: 55,  tickReveal: 1 },
  { id: 'AE-011', projectId: 'BMRC-E2',   type: 'procurement', title: 'Precast girder order secured',        detail: 'PO for 148 precast girders (Mabey precast, Tumkur) signed. Delivery commences Aug 5.', severity: 'success',  minutesAgo: 62,  tickReveal: 1 },
  { id: 'AE-012', projectId: 'MUM-CST',   type: 'update',      title: 'Pile driving — 40 of 96 complete',   detail: 'Marine piling Phase-1 at 42%. Progress on track. Next barge positioning: Zone C.', severity: 'info',     minutesAgo: 68,  tickReveal: 1 },

  // Tick 2
  { id: 'AE-013', projectId: 'NH-44X',    type: 'update',      title: 'WMM Km 180–218 at 85%',              detail: 'Night shift accelerated. Expected WMM completion 2 days ahead of Jul 15 target.', severity: 'success',  minutesAgo: 74,  tickReveal: 2 },
  { id: 'AE-014', projectId: 'KDSP-B1',   type: 'crew',        title: 'Priya Menon — high attrition risk',  detail: 'HRMS pulse survey: engagement score 4.2/10. 2 offers received externally. Flag: HR action needed.', severity: 'high', minutesAgo: 81, tickReveal: 2 },
  { id: 'AE-015', projectId: 'VIZG-P2',   type: 'update',      title: 'Sheet pile driving 62% complete',    detail: 'Zone B 250–500m: 155 of 250 piles driven. Progress recovering post-cyclone.', severity: 'info',     minutesAgo: 88,  tickReveal: 2 },

  // Tick 3
  { id: 'AE-016', projectId: 'HYD-M3',    type: 'finance',     title: 'Cost overrun breached 12%',          detail: 'Week 25 cost variance: 12.1%. If trajectory holds, 15% breach in 4 weeks. Board threshold.', severity: 'high', minutesAgo: 95,  tickReveal: 3 },
  { id: 'AE-017', projectId: 'RLWY-G4',   type: 'milestone',   title: 'MG Track Removal 100% ✓',            detail: 'All 72km Meter Gauge track removed and stacked. BG transition phase now fully cleared.', severity: 'success',  minutesAgo: 102, tickReveal: 3 },
  { id: 'AE-018', projectId: 'CHN-FLY',   type: 'update',      title: 'Road surfacing BC layer started',     detail: 'Flyover deck BC course commenced. Apollo Asphalt paver deployed. Target: 5 days.', severity: 'info',     minutesAgo: 108, tickReveal: 3 },

  // Tick 4
  { id: 'AE-019', projectId: 'PORTFOLIO', type: 'system',      title: 'Jarvis AI model retrained',           detail: 'Predictive maintenance model v2.4 deployed. Fleet downtime prediction accuracy: 91.3%.', severity: 'info',   minutesAgo: 118, tickReveal: 4 },
  { id: 'AE-020', projectId: 'HYD-M3',    type: 'procurement', title: 'Emergency spot purchase approved',    detail: '₹4.2L spot purchase — 40MT TMT from Vizag Steel (22% premium). MD approval obtained.', severity: 'high',   minutesAgo: 124, tickReveal: 4 },
  { id: 'AE-021', projectId: 'BMRC-E2',   type: 'crew',        title: 'Crew productivity 94% — Week 26',     detail: 'BMRC-E2 crew at 94% productivity. Pier cap concrete crew working double shifts.', severity: 'success',  minutesAgo: 132, tickReveal: 4 },

  // Tick 5
  { id: 'AE-022', projectId: 'KDSP-B1',   type: 'milestone',   title: 'Canal Lining Foundation certified ✓', detail: 'M3 (Canal Foundation) certified by KLIS. All 24 reaches accepted. Ready for lining.', severity: 'success',  minutesAgo: 140, tickReveal: 5 },
  { id: 'AE-023', projectId: 'MUM-CST',   type: 'update',      title: 'MCZMA environment clearance extended', detail: 'EC renewed for 2 years. Allows Zone B & C coastal construction without reapplication.', severity: 'success',  minutesAgo: 148, tickReveal: 5 },

  // Tick 6
  { id: 'AE-024', projectId: 'RLWY-G4',   type: 'procurement', title: 'Rail panels delivery confirmed',      detail: 'SAIL 52kg/m BG LWR rail — 800MT delivery confirmed for Aug 10. Track laying can accelerate.', severity: 'success', minutesAgo: 155, tickReveal: 6 },
  { id: 'AE-025', projectId: 'VIZG-P2',   type: 'finance',     title: 'Quay wall cost variance at 0.8%',     detail: 'VIZG-P2 on budget. ₹29.5Cr spent vs ₹29.3Cr planned. Efficient material procurement.', severity: 'info',    minutesAgo: 162, tickReveal: 6 },

  // Tick 7
  { id: 'AE-026', projectId: 'NH-44X',    type: 'milestone',   title: 'WMM milestone nearly complete',       detail: 'NH-44X WMM layer 96% done. 2 days ahead of target. DBM bitumen supply approved.', severity: 'success',  minutesAgo: 168, tickReveal: 7 },
  { id: 'AE-027', projectId: 'HYD-M3',    type: 'crew',        title: 'Overtime hours breach — 1,840 hrs',  detail: 'Viaduct crew at 1,840 OT hours in June (budget: 400). Fatigue-driven productivity loss.', severity: 'high',   minutesAgo: 175, tickReveal: 7 },

  // Tick 8
  { id: 'AE-028', projectId: 'CHN-FLY',   type: 'system',      title: 'Handover milestone in 52 days',       detail: 'CHN-FLY on course for Aug 15 handover — 16 days ahead. CMDA inspection scheduled Jul 28.', severity: 'success', minutesAgo: 180, tickReveal: 8 },
]

export function getEventsForProjects(projectIds: string[], maxTick: number): ActivityEvent[] {
  return activityEvents
    .filter(e => (e.projectId === 'PORTFOLIO' || projectIds.includes(e.projectId)) && e.tickReveal <= maxTick)
    .sort((a, b) => a.minutesAgo - b.minutesAgo)
}

export function formatMinutesAgo(minutesAgo: number, offsetMinutes: number = 0): string {
  const total = minutesAgo + offsetMinutes
  if (total < 1) return 'just now'
  if (total < 60) return `${total}m ago`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}
