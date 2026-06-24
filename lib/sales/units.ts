export type UnitStatus = 'available' | 'held' | 'booked' | 'sold'
export type GovTruth = {
  title: 'clean' | 'flag'
  rera: 'registered' | 'pending'
  litigation: 'none' | 'active'
}
export type Unit = {
  id: string
  floor: number
  unitOnFloor: number
  type: '1BHK' | '2BHK' | '3BHK'
  sqft: number
  status: UnitStatus
  price: number
  buyer?: string
  collectionStage?: string
  govTruth: GovTruth
}

const SPECIAL: Record<string, Partial<Unit>> = {
  'A-0101': { status: 'sold',   buyer: 'R. Sharma', collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0102': { status: 'sold',   buyer: 'M. Nair',   collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0205': { status: 'sold',   buyer: 'S. Patel',  collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0803': { status: 'sold',   buyer: 'D. Kumar',  collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0104': { status: 'held',                                                        govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0207': { status: 'held',                                                        govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0502': { status: 'held',                                                        govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0103': { status: 'booked', buyer: 'K. Reddy',  collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0107': { status: 'booked', buyer: 'P. Jain',   collectionStage: 'Overdue 14d', govTruth: { title: 'flag',  rera: 'pending',    litigation: 'none' } },
  'A-1101': { status: 'booked', buyer: 'V. Mehta',  collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
  'A-0605': { status: 'booked', buyer: 'A. Singh',  collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'active' } },
  'A-0701': { status: 'booked', buyer: 'N. Rao',    collectionStage: 'On schedule', govTruth: { title: 'clean', rera: 'registered', litigation: 'none' } },
}

function gen(): Unit[] {
  const units: Unit[] = []
  const floorConfig = [
    ...Array.from({ length: 10 }, (_, i) => ({ floor: i + 1, count: 7 })),
    { floor: 11, count: 3 },
  ]
  for (const { floor, count } of floorConfig) {
    for (let u = 1; u <= count; u++) {
      const fStr = String(floor).padStart(2, '0')
      const id = `A-${fStr}0${u}`
      const isPenthouse = floor === 11
      const type: Unit['type'] = isPenthouse
        ? '3BHK'
        : u <= 3
          ? (floor <= 3 ? '1BHK' : '2BHK')
          : '3BHK'
      const sqft =
        type === '1BHK' ? 650 + u * 10 :
        type === '2BHK' ? 950 + u * 10 :
        isPenthouse ? 1650 + u * 75 : 1300 + u * 25
      const basePrice =
        type === '1BHK' ? 3800000 :
        type === '2BHK' ? 5600000 : 9500000
      const price = basePrice + floor * 100000 + u * 15000
      const special = SPECIAL[id]
      units.push({
        id,
        floor,
        unitOnFloor: u,
        type,
        sqft,
        status: special?.status ?? 'available',
        price: special?.price ?? price,
        buyer: special?.buyer,
        collectionStage: special?.collectionStage,
        govTruth: special?.govTruth ?? { title: 'clean', rera: 'registered', litigation: 'none' },
      })
    }
  }
  return units
}

export const UNITS = gen()
