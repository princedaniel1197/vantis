import { LEND_PROJECT_IDS } from '@/lib/lend-portfolio'
import LendProjectContent from './LendProjectContent'

export function generateStaticParams() {
  return LEND_PROJECT_IDS.map(id => ({ id }))
}

export default function LendProjectPage({ params }: { params: { id: string } }) {
  return <LendProjectContent id={params.id} />
}
