'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import inventoryData from '@/data/os-inventory.json'

type UnitStatus = 'sold' | 'available' | 'reserved'

const STATUS_STYLE: Record<UnitStatus, { bg: string; border: string; text: string; label: string }> = {
  sold:      { bg: 'color-mix(in srgb, var(--gold) 18%, var(--surf2))', border: 'var(--gold-dim)', text: 'var(--gold)',  label: 'Sold' },
  reserved:  { bg: 'color-mix(in srgb, var(--rb) 14%, var(--surf2))',   border: 'color-mix(in srgb, var(--rb) 50%, var(--bord))', text: 'var(--rb)', label: 'Reserved' },
  available: { bg: 'var(--surf2)',                                        border: 'var(--bord)',                            text: 'var(--muted)', label: 'Available' },
}

interface Unit {
  id: string; floor: number; pos: number; status: string;
  buyer?: string; reserved_for?: string;
}

export default function InventoryPage() {
  const [projectIdx, setProjectIdx] = useState(0)
  const [towerIdx, setTowerIdx] = useState(0)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [filter, setFilter] = useState<'all' | UnitStatus>('all')

  const project = inventoryData.projects[projectIdx]
  const tower = project.towers[towerIdx]

  const unitsByFloor = tower.units.reduce<Record<number, Unit[]>>((acc, u) => {
    const floor = u.floor
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(u as Unit)
    return acc
  }, {})

  const floors = Object.keys(unitsByFloor).map(Number).sort((a, b) => b - a)
  const totalUnits = tower.units.length
  const soldCount = tower.units.filter(u => u.status === 'sold').length
  const reservedCount = tower.units.filter(u => u.status === 'reserved').length
  const availableCount = tower.units.filter(u => u.status === 'available').length

  const unitType = (pos: number) => tower.types[pos - 1] ?? '?'
  const unitArea = (pos: number) => tower.areas_sqft[pos - 1] ?? 0
  const unitPrice = (pos: number, floor: number) => {
    const base = tower.base_prices_lakh[pos - 1] ?? 0
    const floorPremium = Math.max(0, floor - 5) * 0.5
    return (base + floorPremium).toFixed(1)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1 block" style={{ color: 'var(--muted)' }}>Sales · Inventory</span>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Inventory & Bookings</h1>
      </div>

      {/* Project + Tower selector */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <select value={projectIdx} onChange={e => { setProjectIdx(+e.target.value); setTowerIdx(0); setSelectedUnit(null) }}
            className="bg-transparent text-sm outline-none" style={{ color: 'var(--ink)' }}>
            {inventoryData.projects.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
        </div>
        <div className="flex gap-1">
          {project.towers.map((t, i) => (
            <button key={t.id} onClick={() => { setTowerIdx(i); setSelectedUnit(null) }}
              className="px-3 py-1.5 text-xs font-mono rounded-sm"
              style={{ background: towerIdx === i ? 'var(--gold)' : 'var(--surf)', color: towerIdx === i ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--bord)' }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + Kaveri guidance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="font-syne text-2xl font-bold" style={{ color: 'var(--ink)' }}>{totalUnits}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Total Units</span>
        </div>
        <div className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="font-syne text-2xl font-bold" style={{ color: 'var(--gold)' }}>{soldCount}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Sold ({Math.round(soldCount / totalUnits * 100)}%)</span>
        </div>
        <div className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="font-syne text-2xl font-bold" style={{ color: 'var(--rb)' }}>{reservedCount}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Reserved</span>
        </div>
        <div className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid color-mix(in srgb, var(--ra) 30%, var(--bord))' }}>
          <div className="font-syne text-2xl font-bold" style={{ color: 'var(--ra)' }}>{availableCount}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Available</span>
        </div>
      </div>

      {/* Kaveri guidance strip */}
      <div className="mb-4 px-4 py-2.5 rounded-sm flex items-center gap-3" style={{ background: 'color-mix(in srgb, var(--gold) 5%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 25%, var(--bord))' }}>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--gold)' }}>Kaveri 2.0 Guidance</span>
        <span className="font-mono text-xs" style={{ color: 'var(--ink)' }}>₹{(project.kaveri_guidance_lakh_per_sqft * 100).toFixed(0)}/sqft in {project.location.split(',')[0]}</span>
        <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>· RERA: {project.rera.slice(-8)}</span>
      </div>

      {/* Legend + filter */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {(['all', 'available', 'reserved', 'sold'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 font-mono text-[11px] capitalize"
            style={{ opacity: filter === f ? 1 : 0.5, color: f === 'all' ? 'var(--ink)' : STATUS_STYLE[f as UnitStatus]?.text ?? 'var(--ink)' }}>
            {f !== 'all' && <span className="w-2 h-2 rounded-sm inline-block" style={{ background: STATUS_STYLE[f as UnitStatus]?.bg, border: `1px solid ${STATUS_STYLE[f as UnitStatus]?.border}` }} />}
            {f}
          </button>
        ))}
      </div>

      {/* Unit grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 overflow-x-auto">
          <div className="min-w-[360px]">
            <div className="flex items-center gap-1 mb-2 px-2">
              <div className="w-10 shrink-0 font-mono text-[10px] text-center" style={{ color: 'var(--muted)' }}>FL</div>
              {Array.from({ length: tower.units_per_floor }, (_, i) => (
                <div key={i} className="flex-1 text-center font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                  {tower.types[i]}
                </div>
              ))}
            </div>
            {floors.map(floor => {
              const units = unitsByFloor[floor] ?? []
              return (
                <div key={floor} className="flex items-center gap-1 mb-1">
                  <div className="w-10 shrink-0 font-mono text-[10px] text-center" style={{ color: 'var(--muted)' }}>{floor}</div>
                  {Array.from({ length: tower.units_per_floor }, (_, pos) => {
                    const unit = units.find(u => u.pos === pos + 1)
                    if (!unit) return <div key={pos} className="flex-1 h-8" />
                    const st = (unit.status as UnitStatus) in STATUS_STYLE ? unit.status as UnitStatus : 'available'
                    const style = STATUS_STYLE[st]
                    const show = filter === 'all' || filter === st
                    return (
                      <motion.button key={unit.id}
                        whileHover={{ scale: 1.06 }}
                        onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit as Unit)}
                        className="flex-1 h-8 rounded-sm text-[9px] font-mono transition-all hover:border-vgold/30"
                        style={{
                          background: style.bg,
                          border: `1px solid ${selectedUnit?.id === unit.id ? 'var(--gold)' : style.border}`,
                          color: style.text,
                          opacity: show ? 1 : 0.15,
                          outline: selectedUnit?.id === unit.id ? '1px solid var(--gold)' : 'none',
                        }}>
                        {unit.id.split('-').pop()}
                      </motion.button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Unit detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selectedUnit ? (
              <motion.div key={selectedUnit.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="p-4 rounded-sm sticky top-20" style={{ background: 'var(--surf)', border: '1px solid var(--gold)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-sm font-bold" style={{ color: 'var(--gold)' }}>{selectedUnit.id}</div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm capitalize"
                    style={{ background: STATUS_STYLE[selectedUnit.status as UnitStatus]?.bg, color: STATUS_STYLE[selectedUnit.status as UnitStatus]?.text, border: `1px solid ${STATUS_STYLE[selectedUnit.status as UnitStatus]?.border}` }}>
                    {selectedUnit.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    ['Type', unitType(selectedUnit.pos)],
                    ['Floor', selectedUnit.floor.toString()],
                    ['Area', `${unitArea(selectedUnit.pos).toLocaleString()} sqft`],
                    ['Price', `₹${unitPrice(selectedUnit.pos, selectedUnit.floor)}L`],
                    ['Kaveri Guidance', `₹${(unitArea(selectedUnit.pos) * project.kaveri_guidance_lakh_per_sqft).toFixed(1)}L`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>{label}</span>
                      <span className="font-mono" style={{ color: 'var(--ink)' }}>{value}</span>
                    </div>
                  ))}
                  {selectedUnit.buyer && (
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>Buyer</span>
                      <span className="font-mono" style={{ color: 'var(--gold)' }}>{selectedUnit.buyer}</span>
                    </div>
                  )}
                  {selectedUnit.reserved_for && (
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>Reserved for</span>
                      <span className="font-mono" style={{ color: 'var(--rb)' }}>{selectedUnit.reserved_for}</span>
                    </div>
                  )}
                </div>
                {selectedUnit.status === 'available' && (
                  <button className="mt-4 w-full py-2 text-xs font-mono rounded-sm" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                    Book This Unit →
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="p-8 rounded-sm text-center" style={{ background: 'var(--surf)', border: '1px dashed var(--bord)' }}>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1 block" style={{ color: 'var(--muted)' }}>Unit Detail</span>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Click any unit to see details</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
