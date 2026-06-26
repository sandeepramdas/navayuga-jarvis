export type SubTaskStatus = 'not-started' | 'in-progress' | 'at-risk' | 'blocked' | 'complete'
export type MilestoneStatus = 'not-started' | 'in-progress' | 'at-risk' | 'delayed' | 'complete'
export type ProjectPhase =
  | 'Pre-Construction'
  | 'Early Construction'
  | 'Active Construction'
  | 'Advanced Construction'
  | 'Near Completion'
  | 'Close-out'

export interface SubTask {
  id: string
  name: string
  progress: number
  owner: string
  status: SubTaskStatus
  blocker?: string
  targetDate?: string
}

export interface Milestone {
  id: string
  seq: number
  name: string
  shortName: string
  progress: number
  status: MilestoneStatus
  targetDate: string
  revisedDate?: string
  completedDate?: string
  owner: string
  daysVariance: number
  isCriticalPath: boolean
  subTasks: SubTask[]
}

export interface ProjectOrchestration {
  projectId: string
  projectName: string
  phase: ProjectPhase
  overallProgress: number
  nextMilestoneId?: string
  milestones: Milestone[]
}

export const projectOrchestrations: ProjectOrchestration[] = [
  // ── HYD-M3 ──────────────────────────────────────────────────────────────────
  {
    projectId: 'HYD-M3',
    projectName: 'Hyderabad Metro Pkg-3',
    phase: 'Active Construction',
    overallProgress: 67,
    nextMilestoneId: 'HM3-M4',
    milestones: [
      {
        id: 'HM3-M1', seq: 1, name: 'Site Mobilization & Setup', shortName: 'Mobilization',
        progress: 100, status: 'complete', targetDate: '2025-01-31', completedDate: '2025-01-28',
        owner: 'Rajesh Nair', daysVariance: -3, isCriticalPath: false,
        subTasks: [
          { id: 'HM3-M1-T1', name: 'Temporary site office & labour camp', progress: 100, owner: 'Suresh Kumar', status: 'complete' },
          { id: 'HM3-M1-T2', name: 'Equipment deployment (cranes, batching plant)', progress: 100, owner: 'Ravi Shankar', status: 'complete' },
          { id: 'HM3-M1-T3', name: 'Safety systems & PPE distribution', progress: 100, owner: 'Anil Sharma', status: 'complete' },
          { id: 'HM3-M1-T4', name: 'Subcontractor mobilization & induction', progress: 100, owner: 'Rajesh Nair', status: 'complete' },
        ],
      },
      {
        id: 'HM3-M2', seq: 2, name: 'Piling & Foundation Works', shortName: 'Foundation',
        progress: 100, status: 'complete', targetDate: '2025-03-31', completedDate: '2025-03-24',
        owner: 'Venkat Prasad', daysVariance: -7, isCriticalPath: true,
        subTasks: [
          { id: 'HM3-M2-T1', name: 'Bore pile drilling (48 nos, 600mm dia)', progress: 100, owner: 'Venkat Prasad', status: 'complete' },
          { id: 'HM3-M2-T2', name: 'Pile cap concreting (M40 grade)', progress: 100, owner: 'Arun Babu', status: 'complete' },
          { id: 'HM3-M2-T3', name: 'Pile integrity testing (PIT)', progress: 100, owner: 'QA Team', status: 'complete' },
          { id: 'HM3-M2-T4', name: 'Foundation approval from DMRC', progress: 100, owner: 'Rajesh Nair', status: 'complete' },
        ],
      },
      {
        id: 'HM3-M3', seq: 3, name: 'Pier & Cap Beam Construction', shortName: 'Pier Works',
        progress: 89, status: 'in-progress', targetDate: '2025-08-15',
        owner: 'Venkat Prasad', daysVariance: 5, isCriticalPath: true,
        subTasks: [
          { id: 'HM3-M3-T1', name: 'Pier column casting — Piers 1–24', progress: 100, owner: 'Ravi Shankar', status: 'complete', targetDate: '2025-06-30' },
          { id: 'HM3-M3-T2', name: 'Pier column casting — Piers 25–48', progress: 88, owner: 'Arun Babu', status: 'in-progress', targetDate: '2025-08-05' },
          { id: 'HM3-M3-T3', name: 'Pier cap shuttering & reinforcement', progress: 76, owner: 'Suresh Kumar', status: 'in-progress', targetDate: '2025-08-10' },
          { id: 'HM3-M3-T4', name: 'Pier cap concreting (M50 grade)', progress: 58, owner: 'Venkat Prasad', status: 'in-progress', targetDate: '2025-08-15' },
        ],
      },
      {
        id: 'HM3-M4', seq: 4, name: 'Viaduct Superstructure', shortName: 'Viaduct',
        progress: 54, status: 'delayed', targetDate: '2025-10-31', revisedDate: '2025-12-31',
        owner: 'Rajesh Nair', daysVariance: 61, isCriticalPath: true,
        subTasks: [
          { id: 'HM3-M4-T1', name: 'Launching girder erection & commissioning', progress: 100, owner: 'Ravi Shankar', status: 'complete', targetDate: '2025-05-31' },
          { id: 'HM3-M4-T2', name: 'Span erection — Spans 1–20 (of 67)', progress: 88, owner: 'Venkat Prasad', status: 'in-progress', targetDate: '2025-08-31' },
          { id: 'HM3-M4-T3', name: 'Span erection — Spans 21–48 (steel dependent)', progress: 30, owner: 'Arun Babu', status: 'blocked', blocker: 'PO-2847: JSW Steel 200MT TMT delivery delayed — ETA Jul 5. Stock covers 4 days only.', targetDate: '2025-11-30' },
          { id: 'HM3-M4-T4', name: 'Deck slab shuttering & concreting', progress: 22, owner: 'Suresh Kumar', status: 'at-risk', targetDate: '2025-12-15', blocker: 'Dependent on Span erection progress' },
          { id: 'HM3-M4-T5', name: 'Pre-stressed tendons & grouting', progress: 8, owner: 'Venkat Prasad', status: 'at-risk', targetDate: '2025-12-31' },
        ],
      },
      {
        id: 'HM3-M5', seq: 5, name: 'Station Box Structure', shortName: 'Station Box',
        progress: 28, status: 'in-progress', targetDate: '2026-04-30',
        owner: 'Pradeep Kumar', daysVariance: 12, isCriticalPath: false,
        subTasks: [
          { id: 'HM3-M5-T1', name: 'Station-1 (Ameerpet) — Foundation & diaphragm wall', progress: 100, owner: 'Pradeep Kumar', status: 'complete', targetDate: '2025-07-31' },
          { id: 'HM3-M5-T2', name: 'Station-1 — Structural concrete works', progress: 65, owner: 'Mahesh Babu', status: 'in-progress', targetDate: '2025-10-31' },
          { id: 'HM3-M5-T3', name: 'Stations 2–8 — Foundation works', progress: 42, owner: 'Srinivas Rao', status: 'in-progress', targetDate: '2026-01-31' },
          { id: 'HM3-M5-T4', name: 'Stations 2–8 — Structural works', progress: 10, owner: 'Pradeep Kumar', status: 'in-progress', targetDate: '2026-04-30' },
          { id: 'HM3-M5-T5', name: 'Roof slab & platform slab', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-04-30' },
        ],
      },
      {
        id: 'HM3-M6', seq: 6, name: 'MEP & Architectural Works', shortName: 'MEP/Arch',
        progress: 6, status: 'in-progress', targetDate: '2026-07-31',
        owner: 'Arun Prakash', daysVariance: 0, isCriticalPath: false,
        subTasks: [
          { id: 'HM3-M6-T1', name: 'MEP design approval from DMRC', progress: 100, owner: 'Arun Prakash', status: 'complete', targetDate: '2025-09-30' },
          { id: 'HM3-M6-T2', name: 'First fix MEP (HVAC, electrical conduits)', progress: 8, owner: 'K. Murali', status: 'in-progress', targetDate: '2026-05-31' },
          { id: 'HM3-M6-T3', name: 'Architectural finishes & cladding', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-07-15' },
          { id: 'HM3-M6-T4', name: 'Lifts, escalators & travelators', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-07-31' },
        ],
      },
      {
        id: 'HM3-M7', seq: 7, name: 'Track Laying & OHE', shortName: 'Track/OHE',
        progress: 0, status: 'not-started', targetDate: '2026-10-31',
        owner: 'DMRC Specialist', daysVariance: 0, isCriticalPath: true,
        subTasks: [
          { id: 'HM3-M7-T1', name: 'Ballast laying & compaction', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-08-31' },
          { id: 'HM3-M7-T2', name: 'Rail laying (25m sections)', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-09-30' },
          { id: 'HM3-M7-T3', name: 'OHE mast & catenary installation', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-10-15' },
          { id: 'HM3-M7-T4', name: 'Traction power & substations', progress: 0, owner: 'TBD', status: 'not-started', targetDate: '2026-10-31' },
        ],
      },
      {
        id: 'HM3-M8', seq: 8, name: 'Systems Integration & Handover', shortName: 'Commissioning',
        progress: 0, status: 'not-started', targetDate: '2026-11-15',
        owner: 'Rajesh Nair', daysVariance: 0, isCriticalPath: true,
        subTasks: [
          { id: 'HM3-M8-T1', name: 'Signaling, AFC & SCADA integration', progress: 0, owner: 'TBD', status: 'not-started' },
          { id: 'HM3-M8-T2', name: 'Trial runs & safety certification', progress: 0, owner: 'TBD', status: 'not-started' },
          { id: 'HM3-M8-T3', name: 'CMRS inspection & handover', progress: 0, owner: 'TBD', status: 'not-started' },
        ],
      },
    ],
  },

  // ── BMRC-E2 ─────────────────────────────────────────────────────────────────
  {
    projectId: 'BMRC-E2',
    projectName: 'Bengaluru Metro E2 Corridor',
    phase: 'Active Construction',
    overallProgress: 43,
    nextMilestoneId: 'BE2-M4',
    milestones: [
      {
        id: 'BE2-M1', seq: 1, name: 'Survey & Design Finalization', shortName: 'Survey/Design',
        progress: 100, status: 'complete', targetDate: '2024-11-30', completedDate: '2024-11-22',
        owner: 'Sunita Krishnan', daysVariance: -8, isCriticalPath: false,
        subTasks: [
          { id: 'BE2-M1-T1', name: 'Detailed project report (DPR) approval', progress: 100, owner: 'Sunita Krishnan', status: 'complete' },
          { id: 'BE2-M1-T2', name: 'Utility shifting design & approvals', progress: 100, owner: 'R. Nagaraj', status: 'complete' },
          { id: 'BE2-M1-T3', name: 'Structural design & drawing issue', progress: 100, owner: 'Design Team', status: 'complete' },
        ],
      },
      {
        id: 'BE2-M2', seq: 2, name: 'Land Acquisition & Utility Shifting', shortName: 'Land/Utilities',
        progress: 100, status: 'complete', targetDate: '2025-01-31', completedDate: '2025-02-05',
        owner: 'K. Venkatesh', daysVariance: 5, isCriticalPath: false,
        subTasks: [
          { id: 'BE2-M2-T1', name: 'LA for 2.3 ha acquired (BBMP coordination)', progress: 100, owner: 'K. Venkatesh', status: 'complete' },
          { id: 'BE2-M2-T2', name: 'BESCOM HT line shifting (4.2km)', progress: 100, owner: 'BESCOM Team', status: 'complete' },
          { id: 'BE2-M2-T3', name: 'Water main diversion (BWSSB)', progress: 100, owner: 'BWSSB Liaison', status: 'complete' },
        ],
      },
      {
        id: 'BE2-M3', seq: 3, name: 'Foundation & Piling Works', shortName: 'Foundation',
        progress: 97, status: 'in-progress', targetDate: '2025-04-30',
        owner: 'Mahesh Hegde', daysVariance: 22, isCriticalPath: true,
        subTasks: [
          { id: 'BE2-M3-T1', name: 'Bore pile drilling — 96 nos (1000mm dia)', progress: 100, owner: 'Mahesh Hegde', status: 'complete' },
          { id: 'BE2-M3-T2', name: 'Pile cap concreting — all 24 caps', progress: 96, owner: 'Rajesh B', status: 'in-progress', targetDate: '2025-04-25' },
          { id: 'BE2-M3-T3', name: 'Pile load tests (3 nos)', progress: 100, owner: 'QA Team', status: 'complete' },
          { id: 'BE2-M3-T4', name: 'BMRCL Foundation certification', progress: 90, owner: 'Sunita Krishnan', status: 'in-progress' },
        ],
      },
      {
        id: 'BE2-M4', seq: 4, name: 'Pier & Cap Beam Construction', shortName: 'Pier Works',
        progress: 62, status: 'at-risk', targetDate: '2025-09-30',
        owner: 'Mahesh Hegde', daysVariance: 15, isCriticalPath: true,
        subTasks: [
          { id: 'BE2-M4-T1', name: 'Pier columns (H=8–22m) — Piers 1–16', progress: 100, owner: 'Mahesh Hegde', status: 'complete' },
          { id: 'BE2-M4-T2', name: 'Pier columns — Piers 17–32', progress: 68, owner: 'Sanjay N', status: 'in-progress', targetDate: '2025-08-31' },
          { id: 'BE2-M4-T3', name: 'Pier cap reinforcement & formwork', progress: 52, owner: 'Rajesh B', status: 'in-progress', targetDate: '2025-09-15' },
          { id: 'BE2-M4-T4', name: 'Pier cap concreting (M50)', progress: 35, owner: 'Mahesh Hegde', status: 'at-risk', targetDate: '2025-09-30', blocker: 'Concrete pump breakdown — repair estimated 5 days' },
        ],
      },
      {
        id: 'BE2-M5', seq: 5, name: 'Viaduct Superstructure Casting', shortName: 'Viaduct',
        progress: 28, status: 'in-progress', targetDate: '2026-03-31',
        owner: 'T. Venkataraman', daysVariance: 0, isCriticalPath: true,
        subTasks: [
          { id: 'BE2-M5-T1', name: 'Precast yard setup & curing facility', progress: 100, owner: 'T. Venkataraman', status: 'complete' },
          { id: 'BE2-M5-T2', name: 'Precast girder casting — 40 of 148', progress: 27, owner: 'Precast Team', status: 'in-progress', targetDate: '2025-12-31' },
          { id: 'BE2-M5-T3', name: 'Girder erection & placing', progress: 18, owner: 'Erection Crew', status: 'in-progress', targetDate: '2026-01-31' },
          { id: 'BE2-M5-T4', name: 'Deck slab in-situ casting', progress: 10, owner: 'Sanjay N', status: 'in-progress', targetDate: '2026-03-31' },
        ],
      },
      {
        id: 'BE2-M6', seq: 6, name: 'Station Structural Works', shortName: 'Stations',
        progress: 5, status: 'in-progress', targetDate: '2026-10-31',
        owner: 'Sunita Krishnan', daysVariance: 0, isCriticalPath: false,
        subTasks: [
          { id: 'BE2-M6-T1', name: 'KR Pura station — diaphragm wall', progress: 22, owner: 'Deep Foundation Team', status: 'in-progress' },
          { id: 'BE2-M6-T2', name: 'Whitefield station — foundation', progress: 8, owner: 'Mahesh Hegde', status: 'in-progress' },
          { id: 'BE2-M6-T3', name: 'Intermediate stations 2–5 — survey', progress: 5, owner: 'Survey Team', status: 'in-progress' },
          { id: 'BE2-M6-T4', name: 'Station architectural design freeze', progress: 0, owner: 'Design Team', status: 'not-started' },
        ],
      },
      {
        id: 'BE2-M7', seq: 7, name: 'Finishing, MEP & Systems', shortName: 'MEP/Finishing',
        progress: 0, status: 'not-started', targetDate: '2027-03-31',
        owner: 'TBD', daysVariance: 0, isCriticalPath: false,
        subTasks: [],
      },
      {
        id: 'BE2-M8', seq: 8, name: 'Testing & Commissioning', shortName: 'Commissioning',
        progress: 0, status: 'not-started', targetDate: '2027-04-15',
        owner: 'TBD', daysVariance: 0, isCriticalPath: true,
        subTasks: [],
      },
    ],
  },

  // ── NH-44X ──────────────────────────────────────────────────────────────────
  {
    projectId: 'NH-44X',
    projectName: 'NH-44 Highway Expansion Ph-2',
    phase: 'Advanced Construction',
    overallProgress: 81,
    nextMilestoneId: 'NH4-M6',
    milestones: [
      {
        id: 'NH4-M1', seq: 1, name: 'ROW & Land Acquisition', shortName: 'ROW/LA',
        progress: 100, status: 'complete', targetDate: '2024-09-30', completedDate: '2024-09-18',
        owner: 'Anand Sharma', daysVariance: -12, isCriticalPath: false,
        subTasks: [{ id: 'NH4-M1-T1', name: 'LA for 218km corridor (680 ha)', progress: 100, owner: 'Anand Sharma', status: 'complete' }],
      },
      {
        id: 'NH4-M2', seq: 2, name: 'Clearing, Grubbing & Earthwork', shortName: 'Earthwork',
        progress: 100, status: 'complete', targetDate: '2024-12-31', completedDate: '2024-12-22',
        owner: 'Mohan Lal', daysVariance: -9, isCriticalPath: false,
        subTasks: [
          { id: 'NH4-M2-T1', name: 'Clearing & grubbing (218km)', progress: 100, owner: 'Mohan Lal', status: 'complete' },
          { id: 'NH4-M2-T2', name: 'Cut & fill earthwork (12.4 lakh cum)', progress: 100, owner: 'Earth Crew', status: 'complete' },
          { id: 'NH4-M2-T3', name: 'Culverts & minor bridges (42 nos)', progress: 100, owner: 'Structures Team', status: 'complete' },
        ],
      },
      {
        id: 'NH4-M3', seq: 3, name: 'Sub-grade Formation', shortName: 'Sub-grade',
        progress: 100, status: 'complete', targetDate: '2025-02-28', completedDate: '2025-02-20',
        owner: 'Mohan Lal', daysVariance: -8, isCriticalPath: false,
        subTasks: [{ id: 'NH4-M3-T1', name: 'Sub-grade preparation & compaction (218km)', progress: 100, owner: 'Mohan Lal', status: 'complete' }],
      },
      {
        id: 'NH4-M4', seq: 4, name: 'Granular Sub-Base (GSB)', shortName: 'GSB Layer',
        progress: 100, status: 'complete', targetDate: '2025-05-31', completedDate: '2025-05-15',
        owner: 'Rajeev Gupta', daysVariance: -16, isCriticalPath: false,
        subTasks: [
          { id: 'NH4-M4-T1', name: 'GSB laying — 218km @ 250mm thickness', progress: 100, owner: 'Rajeev Gupta', status: 'complete' },
          { id: 'NH4-M4-T2', name: 'GSB compaction & quality testing', progress: 100, owner: 'QA Team', status: 'complete' },
        ],
      },
      {
        id: 'NH4-M5', seq: 5, name: 'Wet Mix Macadam (WMM)', shortName: 'WMM Layer',
        progress: 96, status: 'in-progress', targetDate: '2025-07-15',
        owner: 'Rajeev Gupta', daysVariance: -5, isCriticalPath: false,
        subTasks: [
          { id: 'NH4-M5-T1', name: 'WMM laying — 0–180km', progress: 100, owner: 'Rajeev Gupta', status: 'complete', targetDate: '2025-06-30' },
          { id: 'NH4-M5-T2', name: 'WMM laying — 180–218km', progress: 85, owner: 'Sunil Mehta', status: 'in-progress', targetDate: '2025-07-15' },
          { id: 'NH4-M5-T3', name: 'Density & gradation testing (IS:2720)', progress: 90, owner: 'QA Lab', status: 'in-progress' },
        ],
      },
      {
        id: 'NH4-M6', seq: 6, name: 'Dense Bituminous Macadam (DBM)', shortName: 'DBM Layer',
        progress: 68, status: 'in-progress', targetDate: '2025-11-30',
        owner: 'Rajeev Gupta', daysVariance: -10, isCriticalPath: true,
        subTasks: [
          { id: 'NH4-M6-T1', name: 'Bitumen VG-30 procurement & storage (1,850MT)', progress: 85, owner: 'Procurement', status: 'in-progress', targetDate: '2025-08-31', blocker: 'PO-2865 awaiting sign-off — HPCL lead time 7 days' },
          { id: 'NH4-M6-T2', name: 'DBM laying — Km 0–140 (70mm thick)', progress: 80, owner: 'Rajeev Gupta', status: 'in-progress', targetDate: '2025-09-30' },
          { id: 'NH4-M6-T3', name: 'DBM laying — Km 140–218', progress: 45, owner: 'Sunil Mehta', status: 'in-progress', targetDate: '2025-11-30' },
          { id: 'NH4-M6-T4', name: 'Bridges & structure overlay', progress: 55, owner: 'Structures Team', status: 'in-progress', targetDate: '2025-10-31' },
        ],
      },
      {
        id: 'NH4-M7', seq: 7, name: 'Bituminous Concrete (BC) Surface Course', shortName: 'BC Surface',
        progress: 0, status: 'not-started', targetDate: '2026-06-30',
        owner: 'Rajeev Gupta', daysVariance: 0, isCriticalPath: true,
        subTasks: [],
      },
      {
        id: 'NH4-M8', seq: 8, name: 'Road Furniture, Safety & Handover', shortName: 'Handover',
        progress: 0, status: 'not-started', targetDate: '2026-09-15',
        owner: 'Anand Sharma', daysVariance: 0, isCriticalPath: false,
        subTasks: [],
      },
    ],
  },

  // ── KDSP-B1 ─────────────────────────────────────────────────────────────────
  {
    projectId: 'KDSP-B1',
    projectName: 'Kaleshwaram Dam Support Pkg-B',
    phase: 'Active Construction',
    overallProgress: 54,
    nextMilestoneId: 'KD1-M4',
    milestones: [
      {
        id: 'KD1-M1', seq: 1, name: 'Site Preparation & Enabling Works', shortName: 'Site Prep',
        progress: 100, status: 'complete', targetDate: '2024-11-30', completedDate: '2024-11-20',
        owner: 'Priya Menon', daysVariance: -10, isCriticalPath: false,
        subTasks: [
          { id: 'KD1-M1-T1', name: 'Access road to site (4.2km)', progress: 100, owner: 'Priya Menon', status: 'complete' },
          { id: 'KD1-M1-T2', name: 'Labour camp & site office (350 workers)', progress: 100, owner: 'Admin Team', status: 'complete' },
          { id: 'KD1-M1-T3', name: 'Dewatering & cofferdam', progress: 100, owner: 'Mohammed Shareef', status: 'complete' },
        ],
      },
      {
        id: 'KD1-M2', seq: 2, name: 'Geotechnical Investigation', shortName: 'Geotech',
        progress: 100, status: 'complete', targetDate: '2024-12-31', completedDate: '2024-12-28',
        owner: 'IIT-H Consultant', daysVariance: -3, isCriticalPath: false,
        subTasks: [
          { id: 'KD1-M2-T1', name: 'Bore holes (15 nos) & SPT tests', progress: 100, owner: 'Geotech Team', status: 'complete' },
          { id: 'KD1-M2-T2', name: 'Lab testing & soil report', progress: 100, owner: 'IIT-H Lab', status: 'complete' },
        ],
      },
      {
        id: 'KD1-M3', seq: 3, name: 'Canal Lining Foundation', shortName: 'Foundation',
        progress: 100, status: 'complete', targetDate: '2025-03-31', completedDate: '2025-04-05',
        owner: 'Mohammed Shareef', daysVariance: 5, isCriticalPath: true,
        subTasks: [
          { id: 'KD1-M3-T1', name: 'Excavation for canal lining — Reach 1–24', progress: 100, owner: 'Mohammed Shareef', status: 'complete' },
          { id: 'KD1-M3-T2', name: 'Lean concrete bedding (M15)', progress: 100, owner: 'Concrete Crew', status: 'complete' },
          { id: 'KD1-M3-T3', name: 'Approval from KLIS (Kaleshwaram LIS)', progress: 100, owner: 'Priya Menon', status: 'complete' },
        ],
      },
      {
        id: 'KD1-M4', seq: 4, name: 'Canal Lining Phase-1 (Reach 1–12)', shortName: 'Canal Ph-1',
        progress: 71, status: 'delayed', targetDate: '2025-09-30', revisedDate: '2025-11-30',
        owner: 'Mohammed Shareef', daysVariance: 49, isCriticalPath: true,
        subTasks: [
          { id: 'KD1-M4-T1', name: 'Reinforcement (Fe-415) — Reaches 1–6', progress: 100, owner: 'Rebar Team', status: 'complete', targetDate: '2025-07-31' },
          { id: 'KD1-M4-T2', name: 'Reinforcement — Reaches 7–12', progress: 45, owner: 'Mohammed Shareef', status: 'blocked', blocker: 'PO-2852 SAIL Steel 480MT Fe-415 — 3 days stock remaining. Delivery ETA: July 8.', targetDate: '2025-09-30' },
          { id: 'KD1-M4-T3', name: 'Canal lining concreting (M25, 200mm)', progress: 82, owner: 'Concrete Crew', status: 'in-progress', targetDate: '2025-10-31' },
          { id: 'KD1-M4-T4', name: 'Expansion joint & waterproofing', progress: 60, owner: 'Priya Menon', status: 'in-progress', targetDate: '2025-11-15' },
          { id: 'KD1-M4-T5', name: 'Curing & quality acceptance (IS:456)', progress: 50, owner: 'QA Team', status: 'in-progress', targetDate: '2025-11-30' },
        ],
      },
      {
        id: 'KD1-M5', seq: 5, name: 'Pump House Structural Works', shortName: 'Pump House',
        progress: 38, status: 'in-progress', targetDate: '2026-03-31',
        owner: 'Ravi Babu', daysVariance: 8, isCriticalPath: false,
        subTasks: [
          { id: 'KD1-M5-T1', name: 'Pump house foundation (raft, M35)', progress: 100, owner: 'Ravi Babu', status: 'complete' },
          { id: 'KD1-M5-T2', name: 'Columns & retaining walls', progress: 55, owner: 'Concrete Crew', status: 'in-progress' },
          { id: 'KD1-M5-T3', name: 'Roof slab & crane girder', progress: 20, owner: 'Ravi Babu', status: 'in-progress' },
          { id: 'KD1-M5-T4', name: 'EOT crane installation (2×25T)', progress: 0, owner: 'ISGEC', status: 'not-started' },
        ],
      },
      {
        id: 'KD1-M6', seq: 6, name: 'Canal Lining Phase-2 (Reach 13–24)', shortName: 'Canal Ph-2',
        progress: 12, status: 'at-risk', targetDate: '2026-06-30',
        owner: 'Mohammed Shareef', daysVariance: 20, isCriticalPath: true,
        subTasks: [
          { id: 'KD1-M6-T1', name: 'Excavation Reaches 13–24', progress: 45, owner: 'Mohammed Shareef', status: 'in-progress' },
          { id: 'KD1-M6-T2', name: 'Lean concrete bedding', progress: 15, owner: 'Concrete Crew', status: 'in-progress' },
          { id: 'KD1-M6-T3', name: 'Reinforcement & lining concrete', progress: 0, owner: 'TBD', status: 'not-started' },
        ],
      },
      {
        id: 'KD1-M7', seq: 7, name: 'Electromechanical Works', shortName: 'E&M Works',
        progress: 0, status: 'not-started', targetDate: '2026-10-31',
        owner: 'TBD', daysVariance: 0, isCriticalPath: false,
        subTasks: [],
      },
      {
        id: 'KD1-M8', seq: 8, name: 'Testing, Trial Runs & Commissioning', shortName: 'Commissioning',
        progress: 0, status: 'not-started', targetDate: '2026-12-01',
        owner: 'TBD', daysVariance: 0, isCriticalPath: true,
        subTasks: [],
      },
    ],
  },

  // ── CHN-FLY ─────────────────────────────────────────────────────────────────
  {
    projectId: 'CHN-FLY',
    projectName: 'Chennai Flyover Pkg-7',
    phase: 'Near Completion',
    overallProgress: 92,
    nextMilestoneId: 'CF7-M7',
    milestones: [
      { id: 'CF7-M1', seq: 1, name: 'Foundation & Piling', shortName: 'Foundation', progress: 100, status: 'complete', targetDate: '2024-10-31', completedDate: '2024-10-18', owner: 'Karthik Iyer', daysVariance: -13, isCriticalPath: false, subTasks: [] },
      { id: 'CF7-M2', seq: 2, name: 'Pier & Sub-structure', shortName: 'Piers', progress: 100, status: 'complete', targetDate: '2024-12-31', completedDate: '2025-01-05', owner: 'Karthik Iyer', daysVariance: 5, isCriticalPath: false, subTasks: [] },
      { id: 'CF7-M3', seq: 3, name: 'Superstructure Casting', shortName: 'Superstructure', progress: 100, status: 'complete', targetDate: '2025-05-31', completedDate: '2025-05-22', owner: 'Suresh T', daysVariance: -9, isCriticalPath: true, subTasks: [] },
      { id: 'CF7-M4', seq: 4, name: 'Deck Slab & Parapet', shortName: 'Deck Slab', progress: 100, status: 'complete', targetDate: '2026-02-28', completedDate: '2026-02-10', owner: 'Suresh T', daysVariance: -18, isCriticalPath: true, subTasks: [] },
      {
        id: 'CF7-M5', seq: 5, name: 'Finishing & Waterproofing', shortName: 'Finishing',
        progress: 95, status: 'in-progress', targetDate: '2026-05-31',
        owner: 'Karthik Iyer', daysVariance: -8, isCriticalPath: false,
        subTasks: [
          { id: 'CF7-M5-T1', name: 'Elastomeric bearing installation', progress: 100, owner: 'Suresh T', status: 'complete' },
          { id: 'CF7-M5-T2', name: 'Waterproofing membrane (polyurethane)', progress: 98, owner: 'Waterproof Crew', status: 'in-progress' },
          { id: 'CF7-M5-T3', name: 'Expansion joint installation', progress: 90, owner: 'Suresh T', status: 'in-progress' },
        ],
      },
      {
        id: 'CF7-M6', seq: 6, name: 'Approach Roads & Ramp Works', shortName: 'Approaches',
        progress: 82, status: 'in-progress', targetDate: '2026-06-30',
        owner: 'Murugan S', daysVariance: -12, isCriticalPath: false,
        subTasks: [
          { id: 'CF7-M6-T1', name: 'North approach road (450m)', progress: 100, owner: 'Murugan S', status: 'complete' },
          { id: 'CF7-M6-T2', name: 'South approach road (380m)', progress: 88, owner: 'Road Crew', status: 'in-progress' },
          { id: 'CF7-M6-T3', name: 'Service road & storm drains', progress: 65, owner: 'Murugan S', status: 'in-progress' },
        ],
      },
      {
        id: 'CF7-M7', seq: 7, name: 'Road Surfacing & Markings', shortName: 'Surfacing',
        progress: 35, status: 'in-progress', targetDate: '2026-07-15',
        owner: 'Murugan S', daysVariance: -16, isCriticalPath: true,
        subTasks: [
          { id: 'CF7-M7-T1', name: 'Bituminous concrete (BC) — main flyover deck', progress: 72, owner: 'Murugan S', status: 'in-progress' },
          { id: 'CF7-M7-T2', name: 'Road markings & delineators', progress: 15, owner: 'Road Marking Crew', status: 'in-progress' },
          { id: 'CF7-M7-T3', name: 'Street lighting installation (32 poles)', progress: 20, owner: 'Electrical Team', status: 'in-progress' },
        ],
      },
      {
        id: 'CF7-M8', seq: 8, name: 'Safety Systems & Handover', shortName: 'Handover',
        progress: 8, status: 'in-progress', targetDate: '2026-08-15',
        owner: 'Karthik Iyer', daysVariance: -16, isCriticalPath: true,
        subTasks: [
          { id: 'CF7-M8-T1', name: 'Crash barriers & railing (Grade A)', progress: 25, owner: 'Safety Team', status: 'in-progress' },
          { id: 'CF7-M8-T2', name: 'CCTV & emergency phones', progress: 5, owner: 'Electrical Team', status: 'in-progress' },
          { id: 'CF7-M8-T3', name: 'IRC & CMDA inspection & NOC', progress: 0, owner: 'Karthik Iyer', status: 'not-started' },
        ],
      },
    ],
  },

  // ── MUM-CST ─────────────────────────────────────────────────────────────────
  {
    projectId: 'MUM-CST',
    projectName: 'Mumbai Coastal Road Sec-3',
    phase: 'Early Construction',
    overallProgress: 29,
    nextMilestoneId: 'MC3-M3',
    milestones: [
      { id: 'MC3-M1', seq: 1, name: 'Marine Survey & Design', shortName: 'Survey/Design', progress: 100, status: 'complete', targetDate: '2024-09-30', completedDate: '2024-09-22', owner: 'Deepak Nambiar', daysVariance: -8, isCriticalPath: false, subTasks: [] },
      {
        id: 'MC3-M2', seq: 2, name: 'Enabling Works & Cofferdams', shortName: 'Enabling Works',
        progress: 78, status: 'in-progress', targetDate: '2025-08-31',
        owner: 'Vinod Kadam', daysVariance: 5, isCriticalPath: false,
        subTasks: [
          { id: 'MC3-M2-T1', name: 'Sheet pile cofferdam — Zone A (Haji Ali end)', progress: 100, owner: 'Vinod Kadam', status: 'complete' },
          { id: 'MC3-M2-T2', name: 'Sheet pile cofferdam — Zone B (mid section)', progress: 82, owner: 'Marine Crew', status: 'in-progress', targetDate: '2025-08-31' },
          { id: 'MC3-M2-T3', name: 'Dewatering & reclamation fill (Zone A)', progress: 68, owner: 'Deepak Nambiar', status: 'in-progress' },
          { id: 'MC3-M2-T4', name: 'Environmental monitoring (MCZMA)', progress: 75, owner: 'Env Consultant', status: 'in-progress' },
        ],
      },
      {
        id: 'MC3-M3', seq: 3, name: 'Marine Piling Phase-1 (Worli end)', shortName: 'Marine Piling-1',
        progress: 42, status: 'in-progress', targetDate: '2026-03-31',
        owner: 'Sandip More', daysVariance: 0, isCriticalPath: true,
        subTasks: [
          { id: 'MC3-M3-T1', name: 'Offshore barge positioning & anchor system', progress: 100, owner: 'Marine Ops', status: 'complete' },
          { id: 'MC3-M3-T2', name: 'Tubular steel piles (800mm) — 40 of 96 driven', progress: 42, owner: 'Sandip More', status: 'in-progress', targetDate: '2025-12-31' },
          { id: 'MC3-M3-T3', name: 'Pile cut-off & cap beam preparation', progress: 18, owner: 'Structural Team', status: 'in-progress' },
          { id: 'MC3-M3-T4', name: 'Pile load testing (IS:2911)', progress: 10, owner: 'QA Team', status: 'in-progress' },
        ],
      },
      { id: 'MC3-M4', seq: 4, name: 'Marine Piling Phase-2', shortName: 'Marine Piling-2', progress: 0, status: 'not-started', targetDate: '2026-12-31', owner: 'Sandip More', daysVariance: 0, isCriticalPath: true, subTasks: [] },
      { id: 'MC3-M5', seq: 5, name: 'Reclamation & Fill (full section)', shortName: 'Reclamation', progress: 5, status: 'in-progress', targetDate: '2027-06-30', owner: 'Deepak Nambiar', daysVariance: 0, isCriticalPath: false, subTasks: [] },
      { id: 'MC3-M6', seq: 6, name: 'Deck Slab & Road Carriageway', shortName: 'Deck Slab', progress: 0, status: 'not-started', targetDate: '2027-12-31', owner: 'TBD', daysVariance: 0, isCriticalPath: true, subTasks: [] },
      { id: 'MC3-M7', seq: 7, name: 'Utilities, Services & Finishing', shortName: 'Utilities', progress: 0, status: 'not-started', targetDate: '2028-02-28', owner: 'TBD', daysVariance: 0, isCriticalPath: false, subTasks: [] },
      { id: 'MC3-M8', seq: 8, name: 'Testing & Handover', shortName: 'Handover', progress: 0, status: 'not-started', targetDate: '2028-03-31', owner: 'Deepak Nambiar', daysVariance: 0, isCriticalPath: true, subTasks: [] },
    ],
  },

  // ── RLWY-G4 ─────────────────────────────────────────────────────────────────
  {
    projectId: 'RLWY-G4',
    projectName: 'Railway Gauge Conv. Guntakal',
    phase: 'Advanced Construction',
    overallProgress: 71,
    nextMilestoneId: 'RG4-M4',
    milestones: [
      { id: 'RG4-M1', seq: 1, name: 'Survey & Engineering Design', shortName: 'Survey/Design', progress: 100, status: 'complete', targetDate: '2024-08-31', completedDate: '2024-08-20', owner: 'Venkat Rao', daysVariance: -11, isCriticalPath: false, subTasks: [] },
      { id: 'RG4-M2', seq: 2, name: 'Meter Gauge Track Removal (72km)', shortName: 'MG Removal', progress: 100, status: 'complete', targetDate: '2025-02-28', completedDate: '2025-02-22', owner: 'Raman Kumar', daysVariance: -6, isCriticalPath: true, subTasks: [] },
      {
        id: 'RG4-M3', seq: 3, name: 'Formation Preparation & Earthwork', shortName: 'Formation',
        progress: 84, status: 'in-progress', targetDate: '2025-07-31',
        owner: 'Raman Kumar', daysVariance: 8, isCriticalPath: true,
        subTasks: [
          { id: 'RG4-M3-T1', name: 'Formation widening — Km 0–45', progress: 100, owner: 'Raman Kumar', status: 'complete' },
          { id: 'RG4-M3-T2', name: 'Formation widening — Km 45–72', progress: 72, owner: 'Earth Crew', status: 'in-progress', targetDate: '2025-07-31', blocker: 'Monsoon rains — field work disrupted 8 days last week' },
          { id: 'RG4-M3-T3', name: 'Bridge wing walls & protection works', progress: 78, owner: 'Structures Team', status: 'in-progress' },
        ],
      },
      {
        id: 'RG4-M4', seq: 4, name: 'Sub-Ballast & Ballast Laying', shortName: 'Ballast',
        progress: 66, status: 'in-progress', targetDate: '2025-12-31',
        owner: 'Mahendra Singh', daysVariance: 15, isCriticalPath: true,
        subTasks: [
          { id: 'RG4-M4-T1', name: 'Sub-ballast (stone dust) — Km 0–40', progress: 100, owner: 'Mahendra Singh', status: 'complete' },
          { id: 'RG4-M4-T2', name: 'Sub-ballast — Km 40–72', progress: 55, owner: 'Track Crew', status: 'in-progress', targetDate: '2025-10-31' },
          { id: 'RG4-M4-T3', name: 'Ballast laying (60kg/m IRS spec)', progress: 60, owner: 'Mahendra Singh', status: 'in-progress', targetDate: '2025-12-31' },
        ],
      },
      {
        id: 'RG4-M5', seq: 5, name: 'Broad Gauge Track Laying', shortName: 'BG Track',
        progress: 42, status: 'in-progress', targetDate: '2026-04-30',
        owner: 'Mahendra Singh', daysVariance: 0, isCriticalPath: true,
        subTasks: [
          { id: 'RG4-M5-T1', name: 'BG rail panels (52kg/m LWR) — Km 0–30', progress: 85, owner: 'Mahendra Singh', status: 'in-progress' },
          { id: 'RG4-M5-T2', name: 'BG rail panels — Km 30–72', progress: 20, owner: 'Track Crew', status: 'in-progress' },
          { id: 'RG4-M5-T3', name: 'Alignment & track geometry (PLASSER trolley)', progress: 35, owner: 'Track QA', status: 'in-progress' },
        ],
      },
      {
        id: 'RG4-M6', seq: 6, name: 'Points, Crossings & Turnouts', shortName: 'Points/Crossings',
        progress: 18, status: 'in-progress', targetDate: '2026-07-31',
        owner: 'Raman Kumar', daysVariance: 0, isCriticalPath: false,
        subTasks: [
          { id: 'RG4-M6-T1', name: 'Points & crossings at Guntakal junction', progress: 40, owner: 'Raman Kumar', status: 'in-progress' },
          { id: 'RG4-M6-T2', name: 'Turnout installation (7 nos)', progress: 15, owner: 'Track Crew', status: 'in-progress' },
          { id: 'RG4-M6-T3', name: 'Level crossing gates & safety works', progress: 5, owner: 'Safety Team', status: 'in-progress' },
        ],
      },
      { id: 'RG4-M7', seq: 7, name: 'Signaling & Telecom Systems', shortName: 'S&T Works', progress: 5, status: 'in-progress', targetDate: '2026-08-31', owner: 'S&T Contractor', daysVariance: 0, isCriticalPath: true, subTasks: [] },
      { id: 'RG4-M8', seq: 8, name: 'Testing, Commissioning & Handover', shortName: 'Handover', progress: 0, status: 'not-started', targetDate: '2026-09-30', owner: 'Venkat Rao', daysVariance: 0, isCriticalPath: true, subTasks: [] },
    ],
  },

  // ── VIZG-P2 ─────────────────────────────────────────────────────────────────
  {
    projectId: 'VIZG-P2',
    projectName: 'Visakhapatnam Port Berth-2',
    phase: 'Active Construction',
    overallProgress: 38,
    nextMilestoneId: 'VP2-M4',
    milestones: [
      { id: 'VP2-M1', seq: 1, name: 'Marine Survey & Geotech Investigation', shortName: 'Survey/Geotech', progress: 100, status: 'complete', targetDate: '2024-12-31', completedDate: '2024-12-20', owner: 'Sarita Patel', daysVariance: -11, isCriticalPath: false, subTasks: [] },
      { id: 'VP2-M2', seq: 2, name: 'Dredging & Seabed Preparation', shortName: 'Dredging', progress: 100, status: 'complete', targetDate: '2025-03-31', completedDate: '2025-03-25', owner: 'Marine Contractor', daysVariance: -6, isCriticalPath: true, subTasks: [] },
      {
        id: 'VP2-M3', seq: 3, name: 'Sheet Pile & Cofferdam Construction', shortName: 'Sheet Piling',
        progress: 72, status: 'in-progress', targetDate: '2025-09-30',
        owner: 'Rajiv Sinha', daysVariance: 12, isCriticalPath: false,
        subTasks: [
          { id: 'VP2-M3-T1', name: 'Sheet pile driving — 0 to 250m (landward side)', progress: 100, owner: 'Rajiv Sinha', status: 'complete' },
          { id: 'VP2-M3-T2', name: 'Sheet pile driving — 250 to 500m', progress: 62, owner: 'Marine Ops', status: 'in-progress', targetDate: '2025-09-15', blocker: 'Cyclone Michaung recovery — 8 days lost' },
          { id: 'VP2-M3-T3', name: 'Cofferdam dewatering & plug concrete', progress: 55, owner: 'Rajiv Sinha', status: 'in-progress' },
        ],
      },
      {
        id: 'VP2-M4', seq: 4, name: 'Quay Wall Phase-1 (0–250m)', shortName: 'Quay Wall-1',
        progress: 38, status: 'at-risk', targetDate: '2025-10-31', revisedDate: '2026-02-28',
        owner: 'Sarita Patel', daysVariance: 47, isCriticalPath: true,
        subTasks: [
          { id: 'VP2-M4-T1', name: 'Capping beam & anchor slab concreting', progress: 68, owner: 'Sarita Patel', status: 'in-progress', targetDate: '2025-09-30' },
          { id: 'VP2-M4-T2', name: 'Tie rod & deadman anchor installation', progress: 42, owner: 'Structural Team', status: 'in-progress', targetDate: '2025-10-15' },
          { id: 'VP2-M4-T3', name: 'Backfill (controlled) behind quay wall', progress: 20, owner: 'Civil Crew', status: 'at-risk', blocker: 'Screw pile supply (Atlas Copco PO-2860) delayed 6 days — alternate supplier being evaluated', targetDate: '2025-10-31' },
          { id: 'VP2-M4-T4', name: 'Marine concrete quality certification (VPT)', progress: 15, owner: 'QA Team', status: 'in-progress' },
        ],
      },
      { id: 'VP2-M5', seq: 5, name: 'Quay Wall Phase-2 (250–500m)', shortName: 'Quay Wall-2', progress: 0, status: 'not-started', targetDate: '2026-08-31', owner: 'Sarita Patel', daysVariance: 0, isCriticalPath: true, subTasks: [] },
      { id: 'VP2-M6', seq: 6, name: 'Crane Rails, Fender & Fendering System', shortName: 'Crane Rails', progress: 0, status: 'not-started', targetDate: '2026-12-31', owner: 'TBD', daysVariance: 0, isCriticalPath: false, subTasks: [] },
      { id: 'VP2-M7', seq: 7, name: 'Electrical, Marine Systems & Utilities', shortName: 'E&M Systems', progress: 0, status: 'not-started', targetDate: '2027-05-31', owner: 'TBD', daysVariance: 0, isCriticalPath: false, subTasks: [] },
      { id: 'VP2-M8', seq: 8, name: 'Equipment Installation & Commissioning', shortName: 'Commissioning', progress: 0, status: 'not-started', targetDate: '2027-07-15', owner: 'Sarita Patel', daysVariance: 0, isCriticalPath: true, subTasks: [] },
    ],
  },
]

export function getOrchestrationByProject(id: string): ProjectOrchestration | undefined {
  return projectOrchestrations.find(p => p.projectId === id)
}

export function getMilestoneStats(orchestrations: ProjectOrchestration[]) {
  let total = 0, complete = 0, onTrack = 0, atRisk = 0, delayed = 0, blocked = 0
  for (const p of orchestrations) {
    for (const m of p.milestones) {
      total++
      if (m.status === 'complete') complete++
      else if (m.status === 'in-progress') onTrack++
      else if (m.status === 'at-risk') atRisk++
      else if (m.status === 'delayed') delayed++
      for (const t of m.subTasks) {
        if (t.status === 'blocked') blocked++
      }
    }
  }
  return { total, complete, onTrack, atRisk, delayed, blocked }
}
