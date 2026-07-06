import IntelligenceClient from './IntelligenceClient'
import { TOTAL_PROJECTS, datasetStats, buildDensityNodes } from '@/lib/ontology/dataset'

// Server component: reads the real ~8,771-project dataset and passes a small,
// serialisable payload (count, stats, ~80 density nodes) to the client — so the
// full projects.json never ships in the client bundle.
export default function IntelligencePage() {
  const density = buildDensityNodes(84)
  const stats = datasetStats()
  return <IntelligenceClient total={TOTAL_PROJECTS} stats={stats} density={density} />
}
