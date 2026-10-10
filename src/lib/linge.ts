// ── Indicateur « Linge » ─────────────────────────────────────────────────────
// Fonction pure : prévisions Open-Meteo (timezone Europe/Paris) → statut.
// RÈGLE identique à celle du tableau de bord local du Mac (les deux écrans
// doivent dire la même chose) : ne pas la modifier sans le dire.
//  « pluie » = minutely_15.precipitation ≥ 0,1 mm
//              ou hourly.precipitation ≥ 0,2 mm ou hourly.precipitation_probability ≥ 60 %.

export const LINGE_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=44.64&longitude=-1.07' +
  '&minutely_15=precipitation&forecast_minutely_15=12' +
  '&hourly=precipitation,precipitation_probability,relative_humidity_2m,wind_speed_10m,is_day' +
  '&daily=sunset&forecast_days=2&timezone=Europe/Paris'

export interface LingeData {
  minutely_15: { time: string[]; precipitation: (number | null)[] }
  hourly: {
    time: string[]
    precipitation: (number | null)[]
    precipitation_probability: (number | null)[]
    relative_humidity_2m: (number | null)[]
    wind_speed_10m: (number | null)[]
    is_day: (number | null)[]
  }
  daily: { time: string[]; sunset: string[] }
}

export type LingeColor = 'red' | 'amber' | 'green' | 'grey'
export interface LingeStatus {
  color: LingeColor
  icon: string
  text: string
  detail?: string
}

// « YYYY-MM-DDTHH:MM » (heure locale Paris) → minutes absolues, comparables.
const mins = (t: string): number => {
  const [d, h] = t.split('T')
  const [y, mo, da] = d.split('-').map(Number)
  const [hh, mm] = h.split(':').map(Number)
  return Date.UTC(y, mo - 1, da, hh, mm) / 60000
}
const hm = (t: string) => { const [h, m] = t.split('T')[1].split(':'); return `${+h}h${m}` }
const hh = (t: string) => `${+t.split('T')[1].split(':')[0]}h`

/** Heure locale Paris « YYYY-MM-DDTHH:MM » d'une Date. */
export function parisNow(d: Date = new Date()): string {
  const p = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(d)
  return p.replace(' ', 'T')
}

export function computeLinge(data: LingeData, nowLocal: string): LingeStatus {
  const now = mins(nowLocal)
  const nowQ = now - (now % 15)          // quart d'heure courant
  const nowH = now - (now % 60)          // heure courante
  const { minutely_15: m, hourly: h, daily } = data

  // Événements de pluie : [minutes, source]. Une heure en cours est ramenée au quart courant.
  const rain: number[] = []
  m.time.forEach((t, i) => {
    const x = mins(t)
    if (x >= nowQ && (m.precipitation[i] ?? 0) >= 0.1) rain.push(x)
  })
  const idxNow = h.time.findIndex(t => mins(t) === nowH)
  const i0 = idxNow >= 0 ? idxNow : 0
  h.time.forEach((t, i) => {
    const x = mins(t)
    if (x < nowH || x >= nowQ + 8 * 60) return
    if ((h.precipitation[i] ?? 0) >= 0.2 || (h.precipitation_probability[i] ?? 0) >= 60) rain.push(Math.max(x, nowQ))
  })
  rain.sort((a, b) => a - b)
  const first = rain[0]
  const stamp = (x: number) => {
    const d = new Date(x * 60000).toISOString() // UTC fictif = heure locale
    return d.slice(0, 16)
  }

  const isDay = (h.is_day[i0] ?? 1) === 1

  if (first !== undefined && first < nowQ + 180) {
    if (first <= nowQ) return { color: 'red', icon: '🌧️', text: 'Rentre ton linge — il pleut' }
    return { color: 'red', icon: '🌧️', text: `Rentre ton linge — pluie vers ${hm(stamp(first))}` }
  }
  if (first !== undefined) {
    return { color: 'amber', icon: '🌦️', text: `Rentre-le avant ${hh(stamp(first))} — pluie prévue` }
  }
  if (!isDay) return { color: 'grey', icon: '🌙', text: 'Nuit — rien à signaler' }

  // Humidité après le coucher du soleil (jusqu'à minuit)
  const today = nowLocal.slice(0, 10)
  const sunset = daily.sunset[Math.max(0, daily.time.indexOf(today))] ?? daily.sunset[0]
  if (sunset) {
    const s = mins(sunset)
    const end = mins(today + 'T00:00') + 24 * 60
    const vals = h.time
      .map((t, i) => [mins(t), h.relative_humidity_2m[i]] as const)
      .filter(([x, v]) => x >= s && x < end && v != null)
      .map(([, v]) => v as number)
    if (vals.length && vals.reduce((a, b) => a + b, 0) / vals.length >= 90) {
      return { color: 'amber', icon: '🌫️', text: 'Rentre-le avant la nuit (humidité)', detail: `Coucher du soleil ${hm(sunset)}` }
    }
  }

  const rh = h.relative_humidity_2m[i0]
  if (rh != null && rh < 75) {
    const fast = (h.wind_speed_10m[i0] ?? 0) >= 10
    return {
      color: 'green', icon: '☀️',
      text: fast ? 'Tu peux étendre — ça sèche vite' : 'Tu peux étendre — ça sèche bien',
      detail: `Humidité ${Math.round(rh)} %`,
    }
  }
  return { color: 'grey', icon: '☁️', text: 'Séchage lent (air humide)', detail: rh != null ? `Humidité ${Math.round(rh)} %` : undefined }
}
