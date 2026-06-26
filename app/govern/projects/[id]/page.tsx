import ProjectDetailContent from './ProjectDetailContent'
import projectsData from '@/data/projects.json'

export function generateStaticParams() {
  return (projectsData as { id: string }[]).map(p => ({ id: p.id }))
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectDetailContent params={params} />
}
