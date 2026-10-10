'use client'

import { useEffect, useState } from 'react'
import { LINGE_URL, computeLinge, parisNow, type LingeData, type LingeStatus } from '../lib/linge'

// Maison de Didier à Gujan-Mestras (44.64 / -1.07) — position fixe.
const COLORS = {
  red: { bg: '#7f1d1d', bd: '#ef4444', fg: '#fecaca' },
  amber: { bg: '#78350f', bd: '#f59e0b', fg: '#fde68a' },
  green: { bg: '#14532d', bd: '#22c55e', fg: '#bbf7d0' },
  grey: { bg: '#1e293b', bd: '#64748b', fg: '#cbd5e1' },
} as const

export default function LingeWidget() {
  const [st, setSt] = useState<LingeStatus | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch(LINGE_URL)
        if (!r.ok) throw new Error(String(r.status))
        const data: LingeData = await r.json()
        if (alive) { setSt(computeLinge(data, parisNow())); setErr(false) }
      } catch { if (alive) setErr(true) }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  const c = COLORS[st?.color ?? 'grey']
  return (
    <div className="box" style={{ maxWidth: 900, margin: '0 auto 14px', background: c.bg, border: `2px solid ${c.bd}` }}>
      <div className="box-hdr"><h2>Linge · Gujan-Mestras</h2></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: '4.5rem', lineHeight: 1 }} aria-hidden>{st?.icon ?? '👕'}</div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: c.fg, lineHeight: 1.15 }}>
            {st ? st.text : err ? 'Prévisions indisponibles' : 'Chargement…'}
          </div>
          {st?.detail && <div style={{ fontSize: '1rem', color: c.fg, opacity: .8, marginTop: 4 }}>{st.detail}</div>}
        </div>
      </div>
    </div>
  )
}
