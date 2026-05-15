export type RiskLevel = 'COMPLIANT' | 'CAUTION' | 'HIGH RISK'

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'COMPLIANT'
  if (score >= 40) return 'CAUTION'
  return 'HIGH RISK'
}

export function getRiskColor(status: RiskLevel): string {
  switch (status) {
    case 'COMPLIANT': return 'text-green'
    case 'CAUTION': return 'text-amber'
    case 'HIGH RISK': return 'text-red'
  }
}
