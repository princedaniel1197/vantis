import { LEND_DEVELOPER_IDS } from '@/lib/lend-portfolio'
import LendDeveloperContent from './LendDeveloperContent'

export function generateStaticParams() {
  return LEND_DEVELOPER_IDS.map(id => ({ id }))
}

export default function LendDeveloperPage({ params }: { params: { id: string } }) {
  return <LendDeveloperContent id={params.id} />
}
