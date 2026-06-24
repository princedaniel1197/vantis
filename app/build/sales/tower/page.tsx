import dynamic from 'next/dynamic'

const TowerClient = dynamic(() => import('./TowerClient'), { ssr: false })

export default function TowerPage() {
  return <TowerClient />
}
