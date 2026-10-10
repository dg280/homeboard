// Vérifie les 5 cas de la règle Linge. Lancer : npm run test:linge
import assert from 'node:assert/strict'
import { computeLinge, type LingeData } from '../src/lib/linge.ts'

const D = '2026-10-10'
const hours = Array.from({ length: 48 }, (_, i) => `${i < 24 ? D : '2026-10-11'}T${String(i % 24).padStart(2, '0')}:00`)
function mk(o: { now: string, rain15?: Record<string, number>, hourly?: Record<number, Partial<{ p: number, pp: number }>>, rh?: number, nightRh?: number, wind?: number, day?: boolean }): [LingeData, string] {
  const q: string[] = []
  const [h0, m0] = o.now.split(':').map(Number)
  for (let i = 0; i < 12; i++) { const t = h0 * 60 + m0 - (m0 % 15) + i * 15; q.push(`${D}T${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`) }
  return [{
    minutely_15: { time: q, precipitation: q.map(t => o.rain15?.[t.slice(11)] ?? 0) },
    hourly: {
      time: hours,
      precipitation: hours.map((_, i) => o.hourly?.[i]?.p ?? 0),
      precipitation_probability: hours.map((_, i) => o.hourly?.[i]?.pp ?? 0),
      relative_humidity_2m: hours.map((_, i) => (i >= 20 && i < 24 ? o.nightRh ?? 60 : o.rh ?? 60)),
      wind_speed_10m: hours.map(() => o.wind ?? 5),
      is_day: hours.map((_, i) => (o.day === false ? 0 : i >= 8 && i < 20 ? 1 : 0)),
    },
    daily: { time: [D, '2026-10-11'], sunset: [`${D}T19:40`, '2026-10-11T19:38'] },
  }, `${D}T${o.now}`]
}
const run = (o: Parameters<typeof mk>[0]) => computeLinge(...mk(o))

let r = run({ now: '14:10', rain15: { '15:30': 0.3 } })
assert.equal(r.color, 'red'); assert.equal(r.text, 'Rentre ton linge — pluie vers 15h30')
r = run({ now: '14:10', rain15: { '14:00': 0.2 } })
assert.equal(r.color, 'red'); assert.match(r.text, /il pleut/)
r = run({ now: '10:05', hourly: { 15: { pp: 70 } } })
assert.equal(r.color, 'amber'); assert.equal(r.text, 'Rentre-le avant 15h — pluie prévue')
r = run({ now: '14:10', nightRh: 95 })
assert.equal(r.color, 'amber'); assert.equal(r.text, 'Rentre-le avant la nuit (humidité)')
r = run({ now: '14:10', rh: 50 })
assert.equal(r.color, 'green'); assert.equal(r.text, 'Tu peux étendre — ça sèche bien')
r = run({ now: '14:10', rh: 50, wind: 15 })
assert.equal(r.text, 'Tu peux étendre — ça sèche vite')
r = run({ now: '14:10', rh: 80 })
assert.equal(r.color, 'grey'); assert.equal(r.text, 'Séchage lent (air humide)')
r = run({ now: '23:10', day: false })
assert.equal(r.color, 'grey'); assert.equal(r.text, 'Nuit — rien à signaler')
console.log('linge: 8 assertions OK (5 cas + variantes)')
