import ProjectDetailContent from './ProjectDetailContent'
import projectsData from '@/data/projects.json'

const DEMO_IDS = ['ozone-urbana', 'divya-villas', 'prestige-lakeside', 'skylark-arcadia']

export function generateStaticParams() {
  return DEMO_IDS.map(id => ({ id }))
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectDetailContent params={params} />
}
