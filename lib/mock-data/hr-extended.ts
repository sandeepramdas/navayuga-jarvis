// HR Extended Mock Data
// Interfaces and data for headcount planning, attendance trends, PM scorecards,
// key-man risk, skill inventory, remote hardship, review compliance,
// salary band analysis, workforce demand forecasting, training due, and department summaries.

export interface HeadcountPlan {
  projectId: string
  plannedHeadcount: number
  actualHeadcount: number
  gap: number
  plannedForNextQuarter: number
  windingDown: boolean
  criticalVacancies: string[]
}

export interface WeeklyAttendanceTrend {
  projectId: string
  weeks: string[]
  attendance: number[]
}

export interface PMScorecard {
  employeeId: string
  name: string
  projectId: string
  role: string
  scheduleVarianceDays: number
  costVariancePct: number
  teamAttritionRisk: number
  safetyScore: number
  clientSatisfactionScore: number
  attendancePct: number
  productivityVsPlan: number
  overallScore: number
  strengths: string[]
  developmentAreas: string[]
  successionBackup: string | null
}

export interface KeyManRisk {
  employeeId: string
  name: string
  role: string
  projectId: string
  impactScore: number
  attritionProbability: number
  riskQuadrant: 'critical' | 'watch' | 'monitor' | 'safe'
  replacementLeadWeeks: number
  replacementCost: number
  mitigationAction: string
}

export interface SkillInventory {
  skill: string
  category: 'technical' | 'managerial' | 'safety' | 'digital'
  employeeCount: number
  projects: string[]
  isCritical: boolean
  singlePointOfFailure: boolean
  demandLevel: 'high' | 'medium' | 'low'
}

export interface RemoteHardshipRecord {
  projectId: string
  location: string
  remotenessScore: number
  employeeCount: number
  avgTenureMonths: number
  supportIndex: number
  lastWelfareVisit: string
  recommendedAction: string
  attritionRiskElevation: number
}

export interface ReviewCompliance {
  employeeId: string
  name: string
  role: string
  projectId: string
  lastReview: string
  monthsOverdue: number
  status: 'current' | 'due' | 'overdue' | 'critical-overdue'
  nextReviewDue: string
}

export interface SalaryBandAnalysis {
  role: string
  marketMin: number
  marketMid: number
  marketMax: number
  employees: {
    name: string
    projectId: string
    salary: number
    positionInBand: 'below-market' | 'market' | 'above-market'
    attritionRisk: string
  }[]
}

export interface WorkforceDemandForecast {
  projectId: string
  currentHeadcount: number
  forecast30d: number
  forecast60d: number
  forecast90d: number
  reason: string
  action: 'ramp-up' | 'stable' | 'wind-down' | 'redeploy'
  redeploymentTarget?: string
}

export interface TrainingDue {
  employeeId: string
  name: string
  projectId: string
  role: string
  trainingName: string
  dueDate: string
  daysOverdue: number
  category: 'safety' | 'technical' | 'compliance' | 'leadership'
  criticality: 'mandatory' | 'recommended'
}

export interface DepartmentSummary {
  department: string
  employeeCount: number
  avgAttendance: number
  avgProductivity: number
  highAttritionCount: number
  mediumAttritionCount: number
  avgSalary: number
  overdueReviews: number
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const headcountPlan: HeadcountPlan[] = [
  {
    projectId: 'HYD-M3',
    plannedHeadcount: 340,
    actualHeadcount: 312,
    gap: -28,
    plannedForNextQuarter: 360,
    windingDown: false,
    criticalVacancies: ['Deputy PM', 'Structural Engineer (×2)', 'Formwork Supervisor'],
  },
  {
    projectId: 'BMRC-E2',
    plannedHeadcount: 480,
    actualHeadcount: 487,
    gap: 7,
    plannedForNextQuarter: 520,
    windingDown: false,
    criticalVacancies: [],
  },
  {
    projectId: 'NH-44X',
    plannedHeadcount: 240,
    actualHeadcount: 234,
    gap: -6,
    plannedForNextQuarter: 180,
    windingDown: false,
    criticalVacancies: ['Paving Supervisor'],
  },
  {
    projectId: 'KDSP-B1',
    plannedHeadcount: 200,
    actualHeadcount: 178,
    gap: -22,
    plannedForNextQuarter: 160,
    windingDown: false,
    criticalVacancies: ['Civil Engineer', 'QC Inspector', 'Store Keeper (relief)'],
  },
  {
    projectId: 'CHN-FLY',
    plannedHeadcount: 90,
    actualHeadcount: 89,
    gap: -1,
    plannedForNextQuarter: 40,
    windingDown: true,
    criticalVacancies: [],
  },
  {
    projectId: 'MUM-CST',
    plannedHeadcount: 600,
    actualHeadcount: 621,
    gap: 21,
    plannedForNextQuarter: 680,
    windingDown: false,
    criticalVacancies: ['Marine Engineer', 'Piling Supervisor (×3)'],
  },
  {
    projectId: 'RLWY-G4',
    plannedHeadcount: 180,
    actualHeadcount: 156,
    gap: -24,
    plannedForNextQuarter: 140,
    windingDown: false,
    criticalVacancies: ['Track Engineer', 'OHE Specialist'],
  },
  {
    projectId: 'VIZG-P2',
    plannedHeadcount: 260,
    actualHeadcount: 267,
    gap: 7,
    plannedForNextQuarter: 300,
    windingDown: false,
    criticalVacancies: ['Marine Crane Operator'],
  },
]

export const weeklyAttendanceTrend: WeeklyAttendanceTrend[] = [
  {
    projectId: 'HYD-M3',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [92, 91, 93, 92, 90, 89, 88],
  },
  {
    projectId: 'BMRC-E2',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [94, 95, 94, 95, 96, 95, 96],
  },
  {
    projectId: 'NH-44X',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [93, 94, 94, 95, 94, 95, 95],
  },
  {
    projectId: 'KDSP-B1',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [88, 87, 86, 85, 84, 83, 82],
  },
  {
    projectId: 'RLWY-G4',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [87, 86, 85, 84, 84, 83, 82],
  },
  {
    projectId: 'CHN-FLY',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [96, 96, 97, 97, 96, 97, 97],
  },
  {
    projectId: 'MUM-CST',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [93, 93, 94, 94, 93, 94, 94],
  },
  {
    projectId: 'VIZG-P2',
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    attendance: [94, 95, 94, 95, 95, 94, 95],
  },
]

export const pmScorecards: PMScorecard[] = [
  {
    employeeId: 'EMP-001',
    name: 'Rajesh Nair',
    projectId: 'HYD-M3',
    role: 'Project Manager',
    scheduleVarianceDays: 77,
    costVariancePct: 12.1,
    teamAttritionRisk: 28,
    safetyScore: 82,
    clientSatisfactionScore: 6.2,
    attendancePct: 98,
    productivityVsPlan: -8,
    overallScore: 54,
    strengths: ['Stakeholder management', 'Technical depth — metro viaducts'],
    developmentAreas: ['Cost control', 'Supply chain escalation', 'Schedule recovery planning'],
    successionBackup: null,
  },
  {
    employeeId: 'EMP-002',
    name: 'Sunita Krishnan',
    projectId: 'BMRC-E2',
    role: 'Project Manager',
    scheduleVarianceDays: 15,
    costVariancePct: -2.3,
    teamAttritionRisk: 8,
    safetyScore: 96,
    clientSatisfactionScore: 8.4,
    attendancePct: 96,
    productivityVsPlan: 3,
    overallScore: 84,
    strengths: ['FIDIC contract management', 'Cost discipline', 'Team cohesion'],
    developmentAreas: ['Schedule buffer management'],
    successionBackup: 'Divya Lakshmanan (Finance Analyst — pipeline)',
  },
  {
    employeeId: 'EMP-003',
    name: 'Anand Sharma',
    projectId: 'NH-44X',
    role: 'Project Manager',
    scheduleVarianceDays: -14,
    costVariancePct: -2.4,
    teamAttritionRisk: 5,
    safetyScore: 94,
    clientSatisfactionScore: 9.1,
    attendancePct: 94,
    productivityVsPlan: 6,
    overallScore: 91,
    strengths: ['Ahead of schedule', 'EHS compliance', 'NHAI relationship management'],
    developmentAreas: ['Documentation — as-built records lagging'],
    successionBackup: 'Arjun Pillai (QA/QC Engineer — grooming)',
  },
  {
    employeeId: 'EMP-004',
    name: 'Priya Menon',
    projectId: 'KDSP-B1',
    role: 'Site Manager',
    scheduleVarianceDays: 49,
    costVariancePct: 8.6,
    teamAttritionRisk: 46,
    safetyScore: 78,
    clientSatisfactionScore: 5.8,
    attendancePct: 92,
    productivityVsPlan: -12,
    overallScore: 41,
    strengths: ['Technical knowledge of hydraulic structures', 'On-site presence'],
    developmentAreas: [
      'Vendor escalation',
      'Remote team motivation',
      'Client communication — KSPH relationship strained',
    ],
    successionBackup: null,
  },
  {
    employeeId: 'EMP-005',
    name: 'Karthik Iyer',
    projectId: 'CHN-FLY',
    role: 'Site Manager',
    scheduleVarianceDays: -16,
    costVariancePct: -4.0,
    teamAttritionRisk: 3,
    safetyScore: 98,
    clientSatisfactionScore: 9.4,
    attendancePct: 97,
    productivityVsPlan: 9,
    overallScore: 95,
    strengths: ['Ahead on cost and schedule', 'Zero LTI', 'CMDA relationship excellent'],
    developmentAreas: [
      'Ready for larger project — succession plan needed for CHN-FLY closeout',
    ],
    successionBackup: 'Being groomed for next Senior PM role',
  },
  {
    employeeId: 'EMP-006',
    name: 'Deepak Nambiar',
    projectId: 'MUM-CST',
    role: 'Project Director',
    scheduleVarianceDays: 0,
    costVariancePct: 1.2,
    teamAttritionRisk: 6,
    safetyScore: 91,
    clientSatisfactionScore: 8.8,
    attendancePct: 91,
    productivityVsPlan: 1,
    overallScore: 78,
    strengths: ['22 years marine experience', 'MMRDA relationship', 'Contract management'],
    developmentAreas: [
      'Digital adoption',
      'Succession development — no backup currently',
    ],
    successionBackup: null,
  },
  {
    employeeId: 'EMP-007',
    name: 'Venkat Rao',
    projectId: 'RLWY-G4',
    role: 'Project Manager',
    scheduleVarianceDays: 15,
    costVariancePct: 4.0,
    teamAttritionRisk: 32,
    safetyScore: 74,
    clientSatisfactionScore: 5.2,
    attendancePct: 89,
    productivityVsPlan: -18,
    overallScore: 36,
    strengths: ['Railway domain knowledge', 'Track geometry expertise'],
    developmentAreas: [
      'Multi-agency coordination',
      'Cost control',
      'Team leadership under pressure',
      'Wellbeing check required',
    ],
    successionBackup: null,
  },
  {
    employeeId: 'EMP-008',
    name: 'Sarita Patel',
    projectId: 'VIZG-P2',
    role: 'Project Manager',
    scheduleVarianceDays: 47,
    costVariancePct: 0.8,
    teamAttritionRisk: 10,
    safetyScore: 88,
    clientSatisfactionScore: 7.6,
    attendancePct: 95,
    productivityVsPlan: -2,
    overallScore: 72,
    strengths: ['Port engineering expertise', 'Cost discipline', 'VPT relationship'],
    developmentAreas: [
      'Schedule recovery — 47d behind',
      'Marine crane operations oversight',
    ],
    successionBackup: 'Babu Narayanan (Civil Foreman — early pipeline)',
  },
]

export const keyManRisks: KeyManRisk[] = [
  {
    employeeId: 'EMP-007',
    name: 'Venkat Rao',
    role: 'Project Manager',
    projectId: 'RLWY-G4',
    impactScore: 9,
    attritionProbability: 72,
    riskQuadrant: 'critical',
    replacementLeadWeeks: 16,
    replacementCost: 1800000,
    mitigationAction:
      'Immediate 1:1 wellbeing check + assign senior technical advisor + explore counter-offer if resignation risk materialises',
  },
  {
    employeeId: 'EMP-006',
    name: 'Deepak Nambiar',
    role: 'Project Director',
    projectId: 'MUM-CST',
    impactScore: 10,
    attritionProbability: 18,
    riskQuadrant: 'watch',
    replacementLeadWeeks: 24,
    replacementCost: 6000000,
    mitigationAction:
      'Succession plan is critical gap. Identify and fast-track internal Deputy PD by Q3 2026',
  },
  {
    employeeId: 'EMP-004',
    name: 'Priya Menon',
    role: 'Site Manager',
    projectId: 'KDSP-B1',
    impactScore: 8,
    attritionProbability: 44,
    riskQuadrant: 'critical',
    replacementLeadWeeks: 12,
    replacementCost: 1200000,
    mitigationAction:
      'Welfare support for remote posting, provide deputy site engineer, schedule KSPH client visit together',
  },
  {
    employeeId: 'EMP-014',
    name: 'Mohammed Shareef',
    role: 'Civil Engineer',
    projectId: 'KDSP-B1',
    impactScore: 5,
    attritionProbability: 68,
    riskQuadrant: 'critical',
    replacementLeadWeeks: 8,
    replacementCost: 400000,
    mitigationAction:
      'Buddy pairing with senior engineer + location rotation eligibility check after 12 months',
  },
  {
    employeeId: 'EMP-026',
    name: 'Shankar Gupta',
    role: 'Store Keeper',
    projectId: 'KDSP-B1',
    impactScore: 4,
    attritionProbability: 62,
    riskQuadrant: 'watch',
    replacementLeadWeeks: 4,
    replacementCost: 120000,
    mitigationAction:
      'Store audit + retrain + contract staff backup for remote sites',
  },
  {
    employeeId: 'EMP-020',
    name: 'Ramaiah Krishnappa',
    role: 'Equipment Operator',
    projectId: 'HYD-M3',
    impactScore: 4,
    attritionProbability: 58,
    riskQuadrant: 'watch',
    replacementLeadWeeks: 6,
    replacementCost: 180000,
    mitigationAction:
      'Reassign to alternate machine immediately, 17-month review gap must be closed',
  },
  {
    employeeId: 'EMP-017',
    name: 'Vijay Kumar',
    role: 'Equipment Operator',
    projectId: 'BMRC-E2',
    impactScore: 3,
    attritionProbability: 55,
    riskQuadrant: 'monitor',
    replacementLeadWeeks: 6,
    replacementCost: 150000,
    mitigationAction:
      'Reassign to active machine post maintenance; certification expiry (Jun 30) must be renewed',
  },
  {
    employeeId: 'EMP-011',
    name: 'Pallavi Reddy',
    role: 'Procurement Manager',
    projectId: 'HYD-M3',
    impactScore: 7,
    attritionProbability: 38,
    riskQuadrant: 'watch',
    replacementLeadWeeks: 12,
    replacementCost: 900000,
    mitigationAction:
      'Escalation protocol training + mentorship from senior procurement lead; address steel PO delays',
  },
  {
    employeeId: 'EMP-001',
    name: 'Rajesh Nair',
    role: 'Project Manager',
    projectId: 'HYD-M3',
    impactScore: 9,
    attritionProbability: 22,
    riskQuadrant: 'watch',
    replacementLeadWeeks: 20,
    replacementCost: 4500000,
    mitigationAction:
      'Cost overrun pressure may lead to burnout. Assign deputy PM. Schedule CXO engagement to show support.',
  },
  {
    employeeId: 'EMP-024',
    name: 'Neha Kulkarni',
    role: 'HR Executive',
    projectId: 'KDSP-B1',
    impactScore: 3,
    attritionProbability: 41,
    riskQuadrant: 'monitor',
    replacementLeadWeeks: 6,
    replacementCost: 200000,
    mitigationAction:
      'Contract HR support for remote site. Prevent single-HR-person burnout.',
  },
]

export const skillInventory: SkillInventory[] = [
  {
    skill: 'Metro Rail Systems',
    category: 'technical',
    employeeCount: 2,
    projects: ['HYD-M3', 'BMRC-E2'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'Marine Engineering',
    category: 'technical',
    employeeCount: 2,
    projects: ['MUM-CST', 'VIZG-P2'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'Railway Track Geometry',
    category: 'technical',
    employeeCount: 1,
    projects: ['RLWY-G4'],
    isCritical: true,
    singlePointOfFailure: true,
    demandLevel: 'high',
  },
  {
    skill: 'FIDIC Contract Management',
    category: 'managerial',
    employeeCount: 3,
    projects: ['BMRC-E2', 'MUM-CST', 'VIZG-P2'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'Hydraulic Structures',
    category: 'technical',
    employeeCount: 2,
    projects: ['KDSP-B1'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'medium',
  },
  {
    skill: 'NEBOSH / EHS Management',
    category: 'safety',
    employeeCount: 3,
    projects: ['MUM-CST', 'HYD-M3', 'NH-44X'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'Primavera P6',
    category: 'digital',
    employeeCount: 2,
    projects: ['BMRC-E2', 'RLWY-G4'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'Power BI / Data Analytics',
    category: 'digital',
    employeeCount: 1,
    projects: ['BMRC-E2'],
    isCritical: false,
    singlePointOfFailure: true,
    demandLevel: 'high',
  },
  {
    skill: 'Offshore / Marine Crane Ops',
    category: 'technical',
    employeeCount: 2,
    projects: ['MUM-CST', 'HYD-M3'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'OHE Design (Railway)',
    category: 'technical',
    employeeCount: 1,
    projects: ['RLWY-G4'],
    isCritical: true,
    singlePointOfFailure: true,
    demandLevel: 'medium',
  },
  {
    skill: 'Telematics / Fleet Systems',
    category: 'digital',
    employeeCount: 1,
    projects: ['HYD-M3'],
    isCritical: false,
    singlePointOfFailure: true,
    demandLevel: 'medium',
  },
  {
    skill: 'SAP / ERP Systems',
    category: 'digital',
    employeeCount: 3,
    projects: ['HYD-M3', 'BMRC-E2', 'MUM-CST'],
    isCritical: false,
    singlePointOfFailure: false,
    demandLevel: 'high',
  },
  {
    skill: 'Dredging Supervision',
    category: 'technical',
    employeeCount: 2,
    projects: ['MUM-CST', 'VIZG-P2'],
    isCritical: true,
    singlePointOfFailure: false,
    demandLevel: 'medium',
  },
  {
    skill: 'NHAI / IRC Standards',
    category: 'technical',
    employeeCount: 2,
    projects: ['NH-44X'],
    isCritical: false,
    singlePointOfFailure: false,
    demandLevel: 'low',
  },
  {
    skill: 'Port Regulations / Maritime Law',
    category: 'technical',
    employeeCount: 1,
    projects: ['VIZG-P2'],
    isCritical: true,
    singlePointOfFailure: true,
    demandLevel: 'medium',
  },
]

export const remoteHardshipRecords: RemoteHardshipRecord[] = [
  {
    projectId: 'KDSP-B1',
    location: 'Medigadda',
    remotenessScore: 8,
    employeeCount: 178,
    avgTenureMonths: 14,
    supportIndex: 38,
    lastWelfareVisit: '2026-02-15',
    attritionRiskElevation: 22,
    recommendedAction:
      'Monthly welfare visits, broadband upgrade, rotation policy after 18 months, contract staff backup for solo roles',
  },
  {
    projectId: 'RLWY-G4',
    location: 'Guntakal',
    remotenessScore: 7,
    employeeCount: 156,
    avgTenureMonths: 18,
    supportIndex: 44,
    lastWelfareVisit: '2026-03-20',
    attritionRiskElevation: 18,
    recommendedAction:
      'Welfare visit overdue (3+ months). Senior HR visit with Venkat Rao meeting. Explore family accommodation support.',
  },
  {
    projectId: 'VIZG-P2',
    location: 'Visakhapatnam',
    remotenessScore: 4,
    employeeCount: 267,
    avgTenureMonths: 9,
    supportIndex: 68,
    lastWelfareVisit: '2026-05-10',
    attritionRiskElevation: 8,
    recommendedAction:
      'Adequate support. Monitor as marine phase intensifies and headcount grows to 300.',
  },
]

export const reviewCompliance: ReviewCompliance[] = [
  {
    employeeId: 'EMP-001',
    name: 'Rajesh Nair',
    role: 'Project Manager',
    projectId: 'HYD-M3',
    lastReview: '2025-04-15',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-15',
  },
  {
    employeeId: 'EMP-002',
    name: 'Sunita Krishnan',
    role: 'Project Manager',
    projectId: 'BMRC-E2',
    lastReview: '2025-03-20',
    monthsOverdue: 15,
    status: 'critical-overdue',
    nextReviewDue: '2025-09-20',
  },
  {
    employeeId: 'EMP-003',
    name: 'Anand Sharma',
    role: 'Project Manager',
    projectId: 'NH-44X',
    lastReview: '2025-05-10',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-10',
  },
  {
    employeeId: 'EMP-004',
    name: 'Priya Menon',
    role: 'Site Manager',
    projectId: 'KDSP-B1',
    lastReview: '2025-04-01',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-01',
  },
  {
    employeeId: 'EMP-005',
    name: 'Karthik Iyer',
    role: 'Site Manager',
    projectId: 'CHN-FLY',
    lastReview: '2025-05-22',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-22',
  },
  {
    employeeId: 'EMP-006',
    name: 'Deepak Nambiar',
    role: 'Project Director',
    projectId: 'MUM-CST',
    lastReview: '2025-03-05',
    monthsOverdue: 15,
    status: 'critical-overdue',
    nextReviewDue: '2025-09-05',
  },
  {
    employeeId: 'EMP-007',
    name: 'Venkat Rao',
    role: 'Project Manager',
    projectId: 'RLWY-G4',
    lastReview: '2025-02-28',
    monthsOverdue: 16,
    status: 'critical-overdue',
    nextReviewDue: '2025-08-28',
  },
  {
    employeeId: 'EMP-008',
    name: 'Sarita Patel',
    role: 'Project Manager',
    projectId: 'VIZG-P2',
    lastReview: '2025-04-20',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-20',
  },
  {
    employeeId: 'EMP-009',
    name: 'Ravi Kumar',
    role: 'Fleet Manager',
    projectId: 'HYD-M3',
    lastReview: '2025-05-01',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-01',
  },
  {
    employeeId: 'EMP-010',
    name: 'Suresh Babu',
    role: 'Equipment Operator',
    projectId: 'HYD-M3',
    lastReview: '2025-03-15',
    monthsOverdue: 15,
    status: 'critical-overdue',
    nextReviewDue: '2025-09-15',
  },
  {
    employeeId: 'EMP-011',
    name: 'Pallavi Reddy',
    role: 'Procurement Manager',
    projectId: 'HYD-M3',
    lastReview: '2025-04-08',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-08',
  },
  {
    employeeId: 'EMP-012',
    name: 'Arun Prakash',
    role: 'Finance Controller',
    projectId: 'HYD-M3',
    lastReview: '2025-05-12',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-12',
  },
  {
    employeeId: 'EMP-013',
    name: 'Kavitha Nair',
    role: 'HR Business Partner',
    projectId: 'MUM-CST',
    lastReview: '2025-04-25',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-25',
  },
  {
    employeeId: 'EMP-014',
    name: 'Mohammed Shareef',
    role: 'Civil Engineer',
    projectId: 'KDSP-B1',
    lastReview: '2025-03-10',
    monthsOverdue: 15,
    status: 'critical-overdue',
    nextReviewDue: '2025-09-10',
  },
  {
    employeeId: 'EMP-015',
    name: 'Smita Rao',
    role: 'Safety Officer',
    projectId: 'MUM-CST',
    lastReview: '2025-05-18',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-18',
  },
  {
    employeeId: 'EMP-016',
    name: 'Girish Reddy',
    role: 'Crane Operator',
    projectId: 'HYD-M3',
    lastReview: '2025-04-10',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-10',
  },
  {
    employeeId: 'EMP-017',
    name: 'Vijay Kumar',
    role: 'Equipment Operator',
    projectId: 'BMRC-E2',
    lastReview: '2025-02-15',
    monthsOverdue: 16,
    status: 'critical-overdue',
    nextReviewDue: '2025-08-15',
  },
  {
    employeeId: 'EMP-018',
    name: 'Naveena S',
    role: 'Procurement Executive',
    projectId: 'BMRC-E2',
    lastReview: '2025-05-08',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-08',
  },
  {
    employeeId: 'EMP-019',
    name: 'Santosh Narayan',
    role: 'Operations Engineer',
    projectId: 'MUM-CST',
    lastReview: '2025-04-28',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-28',
  },
  {
    employeeId: 'EMP-020',
    name: 'Ramaiah Krishnappa',
    role: 'Equipment Operator',
    projectId: 'HYD-M3',
    lastReview: '2025-01-20',
    monthsOverdue: 17,
    status: 'critical-overdue',
    nextReviewDue: '2025-07-20',
  },
  {
    employeeId: 'EMP-021',
    name: 'Divya Lakshmanan',
    role: 'Finance Analyst',
    projectId: 'BMRC-E2',
    lastReview: '2025-05-20',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-20',
  },
  {
    employeeId: 'EMP-022',
    name: 'Arjun Pillai',
    role: 'QA/QC Engineer',
    projectId: 'NH-44X',
    lastReview: '2025-04-15',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-15',
  },
  {
    employeeId: 'EMP-023',
    name: 'Sreedhara Rao',
    role: 'Surveyor',
    projectId: 'RLWY-G4',
    lastReview: '2025-03-22',
    monthsOverdue: 15,
    status: 'critical-overdue',
    nextReviewDue: '2025-09-22',
  },
  {
    employeeId: 'EMP-024',
    name: 'Neha Kulkarni',
    role: 'HR Executive',
    projectId: 'KDSP-B1',
    lastReview: '2025-05-05',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-05',
  },
  {
    employeeId: 'EMP-025',
    name: 'Rajan Pillai',
    role: 'Crane Operator',
    projectId: 'MUM-CST',
    lastReview: '2025-05-14',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-14',
  },
  {
    employeeId: 'EMP-026',
    name: 'Shankar Gupta',
    role: 'Store Keeper',
    projectId: 'KDSP-B1',
    lastReview: '2025-02-10',
    monthsOverdue: 16,
    status: 'critical-overdue',
    nextReviewDue: '2025-08-10',
  },
  {
    employeeId: 'EMP-027',
    name: 'Lavanya S',
    role: 'Safety Officer',
    projectId: 'HYD-M3',
    lastReview: '2025-05-08',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-08',
  },
  {
    employeeId: 'EMP-028',
    name: 'Babu Narayanan',
    role: 'Civil Foreman',
    projectId: 'VIZG-P2',
    lastReview: '2025-04-18',
    monthsOverdue: 14,
    status: 'critical-overdue',
    nextReviewDue: '2025-10-18',
  },
  {
    employeeId: 'EMP-029',
    name: 'Preethi Sundaram',
    role: 'Finance Manager',
    projectId: 'MUM-CST',
    lastReview: '2025-03-28',
    monthsOverdue: 15,
    status: 'critical-overdue',
    nextReviewDue: '2025-09-28',
  },
  {
    employeeId: 'EMP-030',
    name: 'Rahul Verma',
    role: 'IT / Systems Engineer',
    projectId: 'HYD-M3',
    lastReview: '2025-05-28',
    monthsOverdue: 13,
    status: 'critical-overdue',
    nextReviewDue: '2025-11-28',
  },
]

export const workforceDemandForecast: WorkforceDemandForecast[] = [
  {
    projectId: 'HYD-M3',
    currentHeadcount: 312,
    forecast30d: 320,
    forecast60d: 345,
    forecast90d: 360,
    reason:
      'Viaduct casting phase requires additional formwork crew and structural steel fixers',
    action: 'ramp-up',
  },
  {
    projectId: 'BMRC-E2',
    currentHeadcount: 487,
    forecast30d: 490,
    forecast60d: 510,
    forecast90d: 520,
    reason:
      'Pier construction continues; deck slab phase begins Q3 needing 30 additional shuttering crew',
    action: 'stable',
  },
  {
    projectId: 'NH-44X',
    currentHeadcount: 234,
    forecast30d: 225,
    forecast60d: 210,
    forecast90d: 180,
    reason:
      'Bituminous layer phase is labour-light; project 81% complete',
    action: 'wind-down',
    redeploymentTarget: 'HYD-M3',
  },
  {
    projectId: 'KDSP-B1',
    currentHeadcount: 178,
    forecast30d: 175,
    forecast60d: 165,
    forecast90d: 160,
    reason: 'Canal lining blocked by client approval; headcount stable till clearance',
    action: 'stable',
  },
  {
    projectId: 'CHN-FLY',
    currentHeadcount: 89,
    forecast30d: 55,
    forecast60d: 30,
    forecast90d: 0,
    reason:
      '92% complete; monsoon surfacing halt — full wind-down by September 2026',
    action: 'wind-down',
    redeploymentTarget: 'MUM-CST or HYD-M3',
  },
  {
    projectId: 'MUM-CST',
    currentHeadcount: 621,
    forecast30d: 640,
    forecast60d: 665,
    forecast90d: 680,
    reason:
      'Deck slab Phase-1 mobilisation begins July; marine piling peak crew needed',
    action: 'ramp-up',
  },
  {
    projectId: 'RLWY-G4',
    currentHeadcount: 156,
    forecast30d: 152,
    forecast60d: 145,
    forecast90d: 140,
    reason:
      'Track laying blocked by ballast quarry approval; minor headcount reduction expected',
    action: 'stable',
  },
  {
    projectId: 'VIZG-P2',
    currentHeadcount: 267,
    forecast30d: 275,
    forecast60d: 288,
    forecast90d: 300,
    reason: 'Quay wall Phase-2 begins August; additional marine concrete crew needed',
    action: 'ramp-up',
  },
]

export const trainingDue: TrainingDue[] = [
  {
    employeeId: 'EMP-007',
    name: 'Venkat Rao',
    projectId: 'RLWY-G4',
    role: 'Project Manager',
    trainingName: 'Multi-agency Coordination Workshop',
    dueDate: '2026-03-31',
    daysOverdue: 91,
    category: 'leadership',
    criticality: 'mandatory',
  },
  {
    employeeId: 'EMP-020',
    name: 'Ramaiah Krishnappa',
    projectId: 'HYD-M3',
    role: 'Equipment Operator',
    trainingName: 'Operator Safety Refresher (IS12285)',
    dueDate: '2025-12-01',
    daysOverdue: 211,
    category: 'safety',
    criticality: 'mandatory',
  },
  {
    employeeId: 'EMP-004',
    name: 'Priya Menon',
    projectId: 'KDSP-B1',
    role: 'Site Manager',
    trainingName: 'Advanced Hydraulic Structures Design',
    dueDate: '2026-05-31',
    daysOverdue: 30,
    category: 'technical',
    criticality: 'recommended',
  },
  {
    employeeId: 'EMP-026',
    name: 'Shankar Gupta',
    projectId: 'KDSP-B1',
    role: 'Store Keeper',
    trainingName: 'Inventory Management Certification',
    dueDate: '2026-04-30',
    daysOverdue: 61,
    category: 'compliance',
    criticality: 'mandatory',
  },
  {
    employeeId: 'EMP-014',
    name: 'Mohammed Shareef',
    projectId: 'KDSP-B1',
    role: 'Civil Engineer',
    trainingName: 'Site Safety Induction Renewal',
    dueDate: '2026-06-01',
    daysOverdue: 29,
    category: 'safety',
    criticality: 'mandatory',
  },
  {
    employeeId: 'EMP-017',
    name: 'Vijay Kumar',
    projectId: 'BMRC-E2',
    role: 'Equipment Operator',
    trainingName: 'DGFASLI Operator Certification',
    dueDate: '2026-06-30',
    daysOverdue: 0,
    category: 'safety',
    criticality: 'mandatory',
  },
  {
    employeeId: 'EMP-001',
    name: 'Rajesh Nair',
    projectId: 'HYD-M3',
    role: 'Project Manager',
    trainingName: 'Project Finance & EVM Masterclass',
    dueDate: '2026-07-31',
    daysOverdue: -31,
    category: 'leadership',
    criticality: 'recommended',
  },
  {
    employeeId: 'EMP-011',
    name: 'Pallavi Reddy',
    projectId: 'HYD-M3',
    role: 'Procurement Manager',
    trainingName: 'Strategic Procurement & Vendor Management',
    dueDate: '2026-07-15',
    daysOverdue: -15,
    category: 'technical',
    criticality: 'recommended',
  },
  {
    employeeId: 'EMP-006',
    name: 'Deepak Nambiar',
    projectId: 'MUM-CST',
    role: 'Project Director',
    trainingName: 'Executive Leadership Programme',
    dueDate: '2026-08-31',
    daysOverdue: -62,
    category: 'leadership',
    criticality: 'recommended',
  },
  {
    employeeId: 'EMP-008',
    name: 'Sarita Patel',
    projectId: 'VIZG-P2',
    role: 'Project Manager',
    trainingName: 'Maritime Law & Port Regulations',
    dueDate: '2026-09-30',
    daysOverdue: -92,
    category: 'technical',
    criticality: 'recommended',
  },
  {
    employeeId: 'EMP-005',
    name: 'Karthik Iyer',
    projectId: 'CHN-FLY',
    role: 'Site Manager',
    trainingName: 'Senior PM Fast Track (Pre-nomination)',
    dueDate: '2026-08-15',
    daysOverdue: -46,
    category: 'leadership',
    criticality: 'recommended',
  },
  {
    employeeId: 'EMP-021',
    name: 'Divya Lakshmanan',
    projectId: 'BMRC-E2',
    role: 'Finance Analyst',
    trainingName: 'Advanced Power BI & Data Analytics',
    dueDate: '2026-10-31',
    daysOverdue: -123,
    category: 'technical',
    criticality: 'recommended',
  },
]

export const salaryBandAnalysis: SalaryBandAnalysis[] = [
  {
    role: 'Project Manager / Site Manager',
    marketMin: 1800000,
    marketMid: 2400000,
    marketMax: 3200000,
    employees: [
      { name: 'Rajesh Nair', projectId: 'HYD-M3', salary: 2800000, positionInBand: 'market', attritionRisk: 'low' },
      { name: 'Sunita Krishnan', projectId: 'BMRC-E2', salary: 2600000, positionInBand: 'market', attritionRisk: 'low' },
      { name: 'Anand Sharma', projectId: 'NH-44X', salary: 2500000, positionInBand: 'market', attritionRisk: 'low' },
      { name: 'Priya Menon', projectId: 'KDSP-B1', salary: 1800000, positionInBand: 'below-market', attritionRisk: 'medium' },
      { name: 'Karthik Iyer', projectId: 'CHN-FLY', salary: 1900000, positionInBand: 'below-market', attritionRisk: 'low' },
      { name: 'Venkat Rao', projectId: 'RLWY-G4', salary: 1600000, positionInBand: 'below-market', attritionRisk: 'high' },
      { name: 'Sarita Patel', projectId: 'VIZG-P2', salary: 2400000, positionInBand: 'market', attritionRisk: 'low' },
    ],
  },
  {
    role: 'Equipment Operator',
    marketMin: 400000,
    marketMid: 520000,
    marketMax: 650000,
    employees: [
      { name: 'Suresh Babu', projectId: 'HYD-M3', salary: 480000, positionInBand: 'market', attritionRisk: 'low' },
      { name: 'Ramaiah Krishnappa', projectId: 'HYD-M3', salary: 480000, positionInBand: 'market', attritionRisk: 'high' },
      { name: 'Vijay Kumar', projectId: 'BMRC-E2', salary: 420000, positionInBand: 'below-market', attritionRisk: 'high' },
      { name: 'Rajan Pillai', projectId: 'MUM-CST', salary: 580000, positionInBand: 'market', attritionRisk: 'low' },
    ],
  },
  {
    role: 'Finance / Accounting',
    marketMin: 900000,
    marketMid: 1400000,
    marketMax: 2000000,
    employees: [
      { name: 'Arun Prakash', projectId: 'HYD-M3', salary: 1600000, positionInBand: 'market', attritionRisk: 'low' },
      { name: 'Divya Lakshmanan', projectId: 'BMRC-E2', salary: 1100000, positionInBand: 'below-market', attritionRisk: 'low' },
      { name: 'Preethi Sundaram', projectId: 'MUM-CST', salary: 2200000, positionInBand: 'above-market', attritionRisk: 'low' },
    ],
  },
  {
    role: 'Procurement',
    marketMin: 600000,
    marketMid: 1000000,
    marketMax: 1500000,
    employees: [
      { name: 'Pallavi Reddy', projectId: 'HYD-M3', salary: 1400000, positionInBand: 'market', attritionRisk: 'medium' },
      { name: 'Naveena S', projectId: 'BMRC-E2', salary: 680000, positionInBand: 'below-market', attritionRisk: 'low' },
      { name: 'Shankar Gupta', projectId: 'KDSP-B1', salary: 380000, positionInBand: 'below-market', attritionRisk: 'high' },
    ],
  },
]

export const departmentSummaries: DepartmentSummary[] = [
  {
    department: 'Engineering',
    employeeCount: 10,
    avgAttendance: 94,
    avgProductivity: 85,
    highAttritionCount: 2,
    mediumAttritionCount: 1,
    avgSalary: 2156000,
    overdueReviews: 10,
  },
  {
    department: 'Fleet',
    employeeCount: 6,
    avgAttendance: 91,
    avgProductivity: 59,
    highAttritionCount: 2,
    mediumAttritionCount: 1,
    avgSalary: 717000,
    overdueReviews: 6,
  },
  {
    department: 'Procurement',
    employeeCount: 3,
    avgAttendance: 92,
    avgProductivity: 79,
    highAttritionCount: 1,
    mediumAttritionCount: 1,
    avgSalary: 820000,
    overdueReviews: 3,
  },
  {
    department: 'Finance',
    employeeCount: 3,
    avgAttendance: 97,
    avgProductivity: 88,
    highAttritionCount: 0,
    mediumAttritionCount: 0,
    avgSalary: 1633000,
    overdueReviews: 3,
  },
  {
    department: 'HR',
    employeeCount: 2,
    avgAttendance: 96,
    avgProductivity: 89,
    highAttritionCount: 0,
    mediumAttritionCount: 1,
    avgSalary: 1060000,
    overdueReviews: 2,
  },
  {
    department: 'Safety',
    employeeCount: 2,
    avgAttendance: 99,
    avgProductivity: 91,
    highAttritionCount: 0,
    mediumAttritionCount: 0,
    avgSalary: 1090000,
    overdueReviews: 2,
  },
  {
    department: 'Operations',
    employeeCount: 4,
    avgAttendance: 94,
    avgProductivity: 86,
    highAttritionCount: 0,
    mediumAttritionCount: 1,
    avgSalary: 825000,
    overdueReviews: 4,
  },
]
