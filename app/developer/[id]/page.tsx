import DeveloperContent from './DeveloperContent'

export function generateStaticParams() {
  return [
    { id: 'zion-estate' },
    { id: 'ozone-group' },
    { id: 'prestige-group' },
    { id: 'skylark-constructions' },
  ]
}

export default function Page({ params }: { params: { id: string } }) {
  return <div data-theme="slate"><DeveloperContent params={params} /></div>
}
