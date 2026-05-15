import ProjectDetailContent from './ProjectDetailContent'

export function generateStaticParams() {
  return [
    { id: 'divya-villas' },
    { id: 'ozone-urbana' },
    { id: 'prestige-lakeside' },
    { id: 'skylark-arcadia' },
  ]
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectDetailContent params={params} />
}
