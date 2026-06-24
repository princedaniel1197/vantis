import { LEND_PROJECT_IDS } from '@/lib/lend-portfolio'
import LendTrancheContent from './LendTrancheContent'

export function generateStaticParams() {
  return LEND_PROJECT_IDS.map(id => ({ id }))
}

export default function LendTranchePage({ params }: { params: { id: string } }) {
  return <LendTrancheContent id={params.id} />
}
