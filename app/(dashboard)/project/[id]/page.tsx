import { use } from 'react'
import { notFound } from 'next/navigation'
import { projects, getProjectById } from '@/lib/mock-data/projects'
import { getFleetByProject } from '@/lib/mock-data/fleet'
import { getPOsByProject } from '@/lib/mock-data/procurement'
import { getEmployeesByProject } from '@/lib/mock-data/hr'
import { getAlertsByProject } from '@/lib/mock-data/alerts'
import { getRecommendationsByProject } from '@/lib/mock-data/predictions'
import { ProjectPageClient } from './ProjectPageClient'

export function generateStaticParams() {
  return projects.map(p => ({ id: p.id }))
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = getProjectById(id)
  if (!project) notFound()

  const machines = getFleetByProject(id)
  const pos = getPOsByProject(id)
  const emps = getEmployeesByProject(id)
  const projectAlerts = getAlertsByProject(id)
  const recs = getRecommendationsByProject(id)

  return (
    <ProjectPageClient
      project={project}
      machines={machines}
      pos={pos}
      employees={emps}
      projectAlerts={projectAlerts}
      recommendations={recs}
    />
  )
}
