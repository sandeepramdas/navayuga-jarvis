export type Role = 'md' | 'fleet-head' | 'site-manager' | 'analyst'

export interface RoleDefinition {
  id: Role
  label: string
  name: string
  description: string
  projectScope: string[] | 'all'
  departmentScope: string[] | 'all'
  canApproveRecommendations: boolean
  canViewFinancials: boolean
  canViewPII: boolean
  canViewAllFleet: boolean
}

export const ROLES: Record<Role, RoleDefinition> = {
  'md': {
    id: 'md',
    label: 'MD / CXO',
    name: 'Arjun Mehta',
    description: 'Full org view — all projects, all departments, all data',
    projectScope: 'all',
    departmentScope: 'all',
    canApproveRecommendations: true,
    canViewFinancials: true,
    canViewPII: true,
    canViewAllFleet: true,
  },
  'fleet-head': {
    id: 'fleet-head',
    label: 'Fleet Head',
    name: 'Ravi Kumar',
    description: 'Fleet & operations scope — all projects, fleet data',
    projectScope: 'all',
    departmentScope: ['fleet', 'operations'],
    canApproveRecommendations: true,
    canViewFinancials: false,
    canViewPII: false,
    canViewAllFleet: true,
  },
  'site-manager': {
    id: 'site-manager',
    label: 'Site Manager',
    name: 'Priya Menon',
    description: 'Kaleshwaram Dam Support Pkg-B — single site scope',
    projectScope: ['KDSP-B1'],
    departmentScope: 'all',
    canApproveRecommendations: false,
    canViewFinancials: true,
    canViewPII: false,
    canViewAllFleet: false,
  },
  'analyst': {
    id: 'analyst',
    label: 'Analyst',
    name: 'Deepa Krishnan',
    description: 'Read-only access across all data domains',
    projectScope: 'all',
    departmentScope: 'all',
    canApproveRecommendations: false,
    canViewFinancials: true,
    canViewPII: false,
    canViewAllFleet: true,
  },
}

export const RBAC_MATRIX = {
  rows: ['MD / CXO', 'Dept Head', 'Site Manager', 'Team Lead', 'Analyst'],
  columns: [
    'All Projects',
    'Own Dept',
    'Assigned Site',
    'Own Team',
    'Financial ₹',
    'PII-masked HR',
    'Fleet All',
    'Fleet Own Site',
    'AI Insights',
  ],
  cells: [
    // MD
    ['✅ Full', '✅ Full', '✅ Full', '✅ Full', '✅ Full', '✅ Full', '✅ Full', '✅ Full', '✅ Full'],
    // Dept Head
    ['👁 Read', '✅ Full', '👁 Read', '✅ Full', '✅ Full', '⚠️ Masked', '✅ Full', '✅ Full', '✅ Full'],
    // Site Manager
    ['❌ No', '❌ No', '✅ Full', '✅ Full', '👁 Read', '⚠️ Masked', '❌ No', '👁 Read', '✅ Full'],
    // Team Lead
    ['❌ No', '❌ No', '👁 Read', '✅ Full', '❌ No', '⚠️ Masked', '❌ No', '👁 Read', '👁 Read'],
    // Analyst
    ['👁 Read', '👁 Read', '👁 Read', '👁 Read', '👁 Read', '⚠️ Masked', '👁 Read', '👁 Read', '👁 Read'],
  ],
}
