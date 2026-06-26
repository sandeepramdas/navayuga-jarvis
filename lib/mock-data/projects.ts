export type ProjectStatus = 'on-track' | 'at-risk' | 'delayed'

export interface Project {
  id: string
  name: string
  location: string
  type: string
  progress: number
  budget: number
  actual: number
  projectedCompletion: string
  plannedCompletion: string
  status: ProjectStatus
  crewCount: number
  equipmentCount: number
  pm: string
  costVariance: number
  scheduleVarianceDays: number
  description: string
  milestones: { name: string; date: string; completed: boolean }[]
  weeklyProgress: number[]
  weeklyCostVariance: number[]
}

export const projects: Project[] = [
  {
    id: 'HYD-M3',
    name: 'Hyderabad Metro Pkg-3',
    location: 'Hyderabad, TG',
    type: 'Metro Rail',
    progress: 67,
    budget: 84500000,
    actual: 94752000,
    projectedCompletion: '2026-11-15',
    plannedCompletion: '2026-08-30',
    status: 'at-risk',
    crewCount: 312,
    equipmentCount: 28,
    pm: 'Rajesh Nair',
    costVariance: 12.1,
    scheduleVarianceDays: 77,
    description: 'Construction of Metro Rail corridor from Ameerpet to LB Nagar covering 16.2km with 16 stations',
    milestones: [
      { name: 'Piling Complete', date: '2025-03-15', completed: true },
      { name: 'Viaduct Casting', date: '2025-09-30', completed: false },
      { name: 'Station Structure', date: '2026-03-15', completed: false },
      { name: 'Systems Integration', date: '2026-08-30', completed: false },
    ],
    weeklyProgress: [59, 61, 62, 63, 64, 65, 67],
    weeklyCostVariance: [5.2, 7.4, 8.1, 9.3, 10.5, 11.2, 12.1],
  },
  {
    id: 'BMRC-E2',
    name: 'Bengaluru Metro E2 Corridor',
    location: 'Bengaluru, KA',
    type: 'Metro Rail',
    progress: 43,
    budget: 127000000,
    actual: 51840000,
    projectedCompletion: '2027-06-30',
    plannedCompletion: '2027-04-15',
    status: 'on-track',
    crewCount: 487,
    equipmentCount: 41,
    pm: 'Sunita Krishnan',
    costVariance: -2.3,
    scheduleVarianceDays: 15,
    description: 'Eastern corridor expansion of Namma Metro from KR Pura to Whitefield covering 13.7km',
    milestones: [
      { name: 'Foundation Works', date: '2025-01-31', completed: true },
      { name: 'Pier Construction', date: '2025-08-15', completed: false },
      { name: 'Deck Slab', date: '2026-04-30', completed: false },
      { name: 'Finishing Works', date: '2027-01-31', completed: false },
    ],
    weeklyProgress: [37, 38, 39, 40, 41, 42, 43],
    weeklyCostVariance: [-1.2, -1.8, -2.0, -2.1, -2.3, -2.2, -2.3],
  },
  {
    id: 'NH-44X',
    name: 'NH-44 Highway Expansion Ph-2',
    location: 'Nagpur–Hyderabad',
    type: 'Highway',
    progress: 81,
    budget: 56200000,
    actual: 54834000,
    projectedCompletion: '2026-09-01',
    plannedCompletion: '2026-09-15',
    status: 'on-track',
    crewCount: 234,
    equipmentCount: 19,
    pm: 'Anand Sharma',
    costVariance: -2.4,
    scheduleVarianceDays: -14,
    description: 'Six-laning of NH-44 from Nagpur to Hyderabad, Phase 2 covering 218km with 3 interchanges',
    milestones: [
      { name: 'Earthwork Complete', date: '2025-02-28', completed: true },
      { name: 'Sub-base Course', date: '2025-06-30', completed: true },
      { name: 'Base Course', date: '2025-10-31', completed: false },
      { name: 'Bituminous Layer', date: '2026-06-30', completed: false },
    ],
    weeklyProgress: [74, 75, 76, 78, 79, 80, 81],
    weeklyCostVariance: [-1.5, -1.8, -2.0, -2.2, -2.3, -2.4, -2.4],
  },
  {
    id: 'KDSP-B1',
    name: 'Kaleshwaram Dam Support Pkg-B',
    location: 'Medigadda, TG',
    type: 'Irrigation',
    progress: 54,
    budget: 38900000,
    actual: 42256000,
    projectedCompletion: '2027-01-20',
    plannedCompletion: '2026-12-01',
    status: 'at-risk',
    crewCount: 178,
    equipmentCount: 14,
    pm: 'Priya Menon',
    costVariance: 8.6,
    scheduleVarianceDays: 49,
    description: 'Irrigation support works at Medigadda Barrage including canal lining and pump house construction',
    milestones: [
      { name: 'Site Preparation', date: '2024-11-30', completed: true },
      { name: 'Foundation Concreting', date: '2025-04-30', completed: true },
      { name: 'Canal Lining Ph-1', date: '2025-10-31', completed: false },
      { name: 'Pump House Structure', date: '2026-06-30', completed: false },
    ],
    weeklyProgress: [47, 48, 50, 51, 52, 53, 54],
    weeklyCostVariance: [3.2, 4.5, 5.8, 6.7, 7.8, 8.2, 8.6],
  },
  {
    id: 'CHN-FLY',
    name: 'Chennai Flyover Pkg-7',
    location: 'Chennai, TN',
    type: 'Urban Infra',
    progress: 92,
    budget: 18700000,
    actual: 17952000,
    projectedCompletion: '2026-07-30',
    plannedCompletion: '2026-08-15',
    status: 'on-track',
    crewCount: 89,
    equipmentCount: 8,
    pm: 'Karthik Iyer',
    costVariance: -4.0,
    scheduleVarianceDays: -16,
    description: 'Grade separator flyover at Madhavaram–Manali Junction, 1.8km, 4-lane',
    milestones: [
      { name: 'Substructure Complete', date: '2025-01-15', completed: true },
      { name: 'Superstructure Casting', date: '2025-05-31', completed: true },
      { name: 'Deck Finishing', date: '2026-02-28', completed: true },
      { name: 'Road Surfacing', date: '2026-07-30', completed: false },
    ],
    weeklyProgress: [86, 88, 89, 90, 91, 91, 92],
    weeklyCostVariance: [-2.8, -3.2, -3.5, -3.7, -3.9, -4.0, -4.0],
  },
  {
    id: 'MUM-CST',
    name: 'Mumbai Coastal Road Sec-3',
    location: 'Mumbai, MH',
    type: 'Coastal Highway',
    progress: 29,
    budget: 215000000,
    actual: 64716000,
    projectedCompletion: '2028-03-31',
    plannedCompletion: '2028-03-31',
    status: 'on-track',
    crewCount: 621,
    equipmentCount: 67,
    pm: 'Deepak Nambiar',
    costVariance: 1.2,
    scheduleVarianceDays: 0,
    description: 'Coastal road from Haji Ali to Worli reclamation, 4.1km, 8-lane marine structure',
    milestones: [
      { name: 'Marine Survey', date: '2024-09-30', completed: true },
      { name: 'Piling Works', date: '2025-06-30', completed: false },
      { name: 'Deck Slab Ph-1', date: '2026-06-30', completed: false },
      { name: 'Surfacing & Utilities', date: '2027-12-31', completed: false },
    ],
    weeklyProgress: [23, 24, 25, 26, 27, 28, 29],
    weeklyCostVariance: [0.5, 0.7, 0.9, 1.0, 1.1, 1.1, 1.2],
  },
  {
    id: 'RLWY-G4',
    name: 'Railway Gauge Conv. Guntakal',
    location: 'Guntakal, AP',
    type: 'Railway',
    progress: 71,
    budget: 29400000,
    actual: 30576000,
    projectedCompletion: '2026-10-15',
    plannedCompletion: '2026-09-30',
    status: 'delayed',
    crewCount: 156,
    equipmentCount: 12,
    pm: 'Venkat Rao',
    costVariance: 4.0,
    scheduleVarianceDays: 15,
    description: 'Gauge conversion from MG to BG on Guntakal–Hospet section, 72km',
    milestones: [
      { name: 'Track Removal MG', date: '2025-02-28', completed: true },
      { name: 'Formation Works', date: '2025-07-31', completed: false },
      { name: 'BG Track Laying', date: '2026-04-30', completed: false },
      { name: 'Signaling & OHE', date: '2026-09-30', completed: false },
    ],
    weeklyProgress: [64, 65, 67, 68, 69, 70, 71],
    weeklyCostVariance: [1.5, 2.0, 2.8, 3.2, 3.6, 3.8, 4.0],
  },
  {
    id: 'VIZG-P2',
    name: 'Visakhapatnam Port Berth-2',
    location: 'Visakhapatnam, AP',
    type: 'Port',
    progress: 38,
    budget: 74800000,
    actual: 29542000,
    projectedCompletion: '2027-08-31',
    plannedCompletion: '2027-07-15',
    status: 'on-track',
    crewCount: 267,
    equipmentCount: 23,
    pm: 'Sarita Patel',
    costVariance: 0.8,
    scheduleVarianceDays: 47,
    description: 'New multi-purpose berth at Vizag Port capable of handling 20,000 DWT vessels',
    milestones: [
      { name: 'Dredging Complete', date: '2025-03-31', completed: true },
      { name: 'Quay Wall Ph-1', date: '2025-10-31', completed: false },
      { name: 'Quay Wall Ph-2', date: '2026-06-30', completed: false },
      { name: 'Crane & Equipment', date: '2027-03-31', completed: false },
    ],
    weeklyProgress: [32, 33, 34, 35, 36, 37, 38],
    weeklyCostVariance: [-0.2, 0.1, 0.3, 0.5, 0.6, 0.7, 0.8],
  },
]

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

export function getProjectsByScope(scope: string[] | 'all'): Project[] {
  if (scope === 'all') return projects
  return projects.filter(p => scope.includes(p.id))
}
