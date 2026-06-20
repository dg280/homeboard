'use client'
import { useEffect, useState, useCallback, useRef } from 'react'

// ── Villes ───────────────────────────────────────────────────────────────────
const CITIES: Record<string, { lat: number; lon: number; label: string }> = {
  'gujan-mestras':       { lat: 44.6367, lon: -1.0667, label: 'Gujan-Mestras' },
  'nailloux':            { lat: 43.3567, lon: 1.6231,  label: 'Nailloux' },
  'paimpol':             { lat: 48.7811, lon: -3.0453, label: 'Paimpol' },
  'savigny-le-temple':   { lat: 48.5847, lon: 2.5828,  label: 'Savigny-le-Temple' },
  'nice':                { lat: 43.7102, lon: 7.2620,  label: 'Nice' },
  'montpellier':         { lat: 43.6108, lon: 3.8767,  label: 'Montpellier' },
  'saint-romain-de-lerps': { lat: 44.9333, lon: 4.7833, label: 'Saint-Romain-de-Lerps' },
  'marseille':           { lat: 43.2965, lon: 5.3698,  label: 'Marseille' },
  'clairac':             { lat: 44.3569, lon: 0.3781,  label: 'Clairac' },
}

// ── Helpers météo ────────────────────────────────────────────────────────────
const WMO: Record<number, string> = {
  0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',
  51:'🌦',53:'🌦',55:'🌧',61:'🌧',63:'🌧',65:'🌧',
  71:'🌨',73:'🌨',75:'❄️',77:'🌨',80:'🌦',81:'🌧',82:'⛈',
  85:'🌨',86:'❄️',95:'⛈',96:'⛈',99:'⛈'
}
const WMO_LBL: Record<number, string> = {
  0:'Ensoleillé',1:'Peu nuageux',2:'Partiellement nuageux',3:'Couvert',
  45:'Brouillard',48:'Brouillard givrant',51:'Bruine légère',53:'Bruine',55:'Bruine dense',
  61:'Pluie légère',63:'Pluie',65:'Pluie forte',71:'Neige légère',73:'Neige',75:'Neige forte',
  80:'Averses',81:'Averses fortes',82:'Violentes averses',95:'Orage',96:'Orage grêle',99:'Orage violent'
}
const DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

const COMFORT: Record<string, { bg: string; pill: string; color: string; bar: string; lbl: string }> = {
  froid:      { bg: 'linear-gradient(135deg,#0a1e3d,#1a3a6f)', pill: '#0f2850', color: '#38bdf8', bar: '#38bdf8', lbl: 'Froid' },
  frais:      { bg: 'linear-gradient(135deg,#0a2535,#16405a)', pill: '#0e3048', color: '#7dd3fc', bar: '#7dd3fc', lbl: 'Frais' },
  ideal:      { bg: 'linear-gradient(135deg,#0a2a18,#1a4a2f)', pill: '#0f3520', color: '#4ade80', bar: '#4ade80', lbl: 'Idéal' },
  chaud:      { bg: 'linear-gradient(135deg,#2e1a04,#4a3010)', pill: '#3a220a', color: '#fbbf24', bar: '#fbbf24', lbl: 'Chaud' },
  tres_chaud: { bg: 'linear-gradient(135deg,#3a0e04,#5a1a0a)', pill: '#481208', color: '#f97316', bar: '#f97316', lbl: 'Très chaud' },
}

function comfortFromTemp(tmin: number, tmax: number): string {
  const tm = tmin + 0.7 * (tmax - tmin)
  if (tm < 7) return 'froid'
  if (tm < 17) return 'frais'
  if (tm < 22) return 'ideal'
  if (tm < 27) return 'chaud'
  return 'tres_chaud'
}

interface ClothingItem { e: string; l: string }
interface ClothingResult { items: ClothingItem[]; comfort: string; reason: string }

function clothingAdvice(tmin: number, tmax: number, precip: number, wind_ms: number, wc: number, uv = 0): ClothingResult {
  const tm = tmin + 0.7 * (tmax - tmin), w = wind_ms * 3.6
  let comfort: string, items: ClothingItem[] = [], base: string
  const rainCodes = [51,53,55,61,63,65,80,81,82,95,96,99]
  const wet = rainCodes.includes(wc)

  if (tm < 0)       { comfort = 'froid';      items = [{e:'🧥',l:'Manteau chaud'},{e:'🧥',l:'Pull thermique'},{e:'🧤',l:'Gants'}]; base = `${Math.round(tm)}° ressenti → grand froid` }
  else if (tm < 7)  { comfort = 'froid';      items = [{e:'🧥',l:'Manteau'},{e:'🧥',l:'Pull chaud'}]; base = `${Math.round(tm)}° ressenti → manteau nécessaire` }
  else if (tm < 12) { comfort = 'frais';      items = [{e:'🧥',l:'Veste chaude'},{e:'🧥',l:'Pull léger dessous'}]; base = `${Math.round(tm)}° ressenti → veste chaude suffisante` }
  else if (tm < 17) { comfort = 'frais';      items = [{e:'🧥',l:'Veste légère'},{e:'👕',l:'T-shirt ou chemise'}]; base = `${Math.round(tm)}° ressenti → veste légère suffisante` }
  else if (tm < 22) { comfort = 'ideal';      items = [{e:'👕',l:'T-shirt'}]; base = `${Math.round(tm)}° ressenti → agréable, t-shirt suffit` }
  else if (tm < 27) { comfort = 'chaud';      items = [{e:'👕',l:'T-shirt léger'}]; base = `${Math.round(tm)}° ressenti → chaud` }
  else              { comfort = 'tres_chaud'; items = [{e:'👕',l:'Tenue très légère'}]; base = `${Math.round(tm)}° ressenti → très chaud` }

  const ji = items.findIndex(x => x.l.includes('Veste') || x.l.includes('Manteau'))
  if (precip >= 80 || (wet && precip >= 50)) {
    if (ji >= 0) items[ji] = {e:'🌂',l:'Imperméable'}; else items.push({e:'🌂',l:'Imperméable'})
    base += ' + pluie → imperméable indispensable'
  } else if (precip >= 50) {
    if (ji >= 0) items[ji] = {e:'☂️',l:'Imperméable recommandé'}; else items.push({e:'☂️',l:'Imperméable recommandé'})
    base += ' + risque pluie → imperméable conseillé'
  } else if (precip >= 20 && ji < 0) {
    items.push({e:'🧥',l:'Coupe-pluie léger'}); base += ' + risque pluie → coupe-pluie conseillé'
  }

  const hasOuter = items.some(x => x.l.includes('Manteau') || x.l.includes('Imperméable') || x.l.includes('Veste chaude') || x.l.includes('coupe'))
  if (w > 35 && tm >= 10 && tm < 22 && !hasOuter) { items.push({e:'🧥',l:'Coupe-vent'}); base += ` + vent ${Math.round(w)}km/h → coupe-vent utile` }

  if (tm < 5) items.push({e:'🧣',l:'Écharpe'})
  else if (tm < 9 && w > 40) { items.push({e:'🧣',l:'Écharpe conseillée'}); base += ' + vent froid → écharpe' }

  if (uv >= 8)      { items.push({e:'🧴',l:'Crème solaire indispensable'},{e:'🧢',l:'Chapeau obligatoire'}); base += ` + UV ${Math.round(uv)} très élevé` }
  else if (uv >= 6) { items.push({e:'🧴',l:'Crème solaire'}); base += ` + UV ${Math.round(uv)} élevé → protection` }
  else if (uv >= 3) { items.push({e:'🧴',l:'Crème solaire conseillée'}); base += ` + UV ${Math.round(uv)} modéré` }

  if (tm < 5) items.push({e:'👟',l:'Chaussures chaudes'})
  else if (precip >= 30 || wet) items.push({e:'👟',l:'Chaussures imperméables'})
  else if (tm >= 20) items.push({e:'🩴',l:'Sandales ou baskets'})
  else items.push({e:'👟',l:'Baskets'})

  if (items.length > 4) { const last = items[items.length - 1]; items = [...items.slice(0, 3), last] }
  return { items, comfort, reason: base + ` | min ${Math.round(tmin)}° max ${Math.round(tmax)}°` }
}

function uvLabel(uv: number | null) {
  if (uv == null) return { lbl: '--', col: '#64748b', tip: 'Données indisponibles' }
  const v = Math.round(uv)
  if (uv < 1) return { lbl: `${v} Nul`, col: '#4ade80', tip: 'Aucune protection nécessaire' }
  if (uv < 3) return { lbl: `${v} Faible`, col: '#86efac', tip: 'Protection non nécessaire' }
  if (uv < 6) return { lbl: `${v} Modéré`, col: '#fbbf24', tip: 'Crème FPS 30+ conseillée' }
  if (uv < 8) return { lbl: `${v} Élevé`, col: '#f97316', tip: 'Crème FPS 50+, chapeau, lunettes' }
  if (uv < 11) return { lbl: `${v} Très élevé`, col: '#ef4444', tip: 'Protection maximale — éviter 12h-16h' }
  return { lbl: `${v} Extrême`, col: '#a855f7', tip: "Rester à l'ombre — danger" }
}

function aqInfo(aqi: number | null) {
  if (aqi == null) return { lbl: 'N/A', col: '#64748b', act: 'Données indisponibles' }
  if (aqi <= 20) return { lbl: 'Excellent', col: '#4ade80', act: 'Idéal sport & vélo' }
  if (aqi <= 40) return { lbl: 'Bon', col: '#86efac', act: 'Activités sans restriction' }
  if (aqi <= 60) return { lbl: 'Modéré', col: '#fbbf24', act: 'Sport léger OK' }
  if (aqi <= 80) return { lbl: 'Mauvais', col: '#f97316', act: 'Limiter les sorties' }
  return { lbl: 'Très mauvais', col: '#ef4444', act: 'Éviter toute activité extérieure' }
}

// ── Types API ────────────────────────────────────────────────────────────────
interface DailyData {
  time: string[]; weathercode: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]
  precipitation_sum?: number[]; precipitation_probability_max?: number[]
  windspeed_10m_max: number[]; apparent_temperature_max?: number[]; apparent_temperature_min?: number[]
  uv_index_max?: number[]
}
interface HourlyData {
  temperature_2m: number[]; precipitation?: number[]; precipitation_probability?: number[]
  windspeed_10m: number[]
}
interface AqHourly {
  european_aqi: (number | null)[]; pm2_5: (number | null)[]
  nitrogen_dioxide: (number | null)[]; ozone: (number | null)[]
}
interface TgMessage {
  id: number; text?: string; from: string; date: number
  photo?: string; audio?: string; caption?: string
}
interface GeoResult {
  id: number; name: string; latitude: number; longitude: number
  country?: string; admin1?: string
}
type Place = { key: string; lat: number; lon: number; label: string }
// Un "proche" = une personne aimée + la ville où elle vit
type Proche = { id: string; name: string; lat: number; lon: number; city: string }

// ── Persistance & partage ─────────────────────────────────────────────────────
const LS_PROCHES = 'homeboard.proches'
const LS_SELECTED = 'homeboard.selected'
const LS_LICENSE = 'homeboard.license'

// Monétisation : gratuit = 3 proches, Premium (achat unique Gumroad) = illimité
const FREE_MAX = 3
const GUMROAD_URL = process.env.NEXT_PUBLIC_GUMROAD_URL || ''

let idCounter = 0
function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  idCounter += 1
  return `p${idCounter}-${Date.now()}`
}

// Seed initial déterministe (depuis les villes historiques) — pas de hasard au 1er rendu (SSR-safe)
function seedProches(): Proche[] {
  return Object.entries(CITIES).map(([slug, v]) => ({ id: `seed-${slug}`, name: v.label, lat: v.lat, lon: v.lon, city: v.label }))
}

// Encodage UTF-8 → base64url, pour un lien = un tableau prêt à coller
function encodeBoard(proches: Proche[], selId: string): string {
  const idx = Math.max(0, proches.findIndex(p => p.id === selId))
  const payload = { p: proches.map(p => [p.name, p.lat, p.lon, p.city]), s: idx }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function decodeBoard(str: string): { proches: Proche[]; selectedId: string } | null {
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    if (!Array.isArray(payload.p) || payload.p.length === 0) return null
    const proches: Proche[] = payload.p.map((t: [string, number, number, string]) =>
      ({ id: newId(), name: t[0], lat: t[1], lon: t[2], city: t[3] }))
    const selectedId = proches[payload.s]?.id ?? proches[0].id
    return { proches, selectedId }
  } catch { return null }
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function Home() {
  const [proches, setProches] = useState<Proche[]>(seedProches)
  const [selectedId, setSelectedId] = useState<string>('seed-gujan-mestras')
  const [pending, setPending] = useState<Proche | null>(null) // ville choisie en attente d'un prénom
  const [addName, setAddName] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [da, setDa] = useState<DailyData | null>(null)
  const [de, setDe] = useState<DailyData | null>(null)
  const [aromeH, setAromeH] = useState<HourlyData | null>(null)
  const [ecmwfH, setEcmwfH] = useState<HourlyData | null>(null)
  const [aqH, setAqH] = useState<AqHourly | null>(null)
  const [modal, setModal] = useState<{ title: string; html: string } | null>(null)
  const [messages, setMessages] = useState<TgMessage[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [paywall, setPaywall] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [keyError, setKeyError] = useState('')

  const selected = proches.find(p => p.id === selectedId) ?? proches[0] ?? null
  const placeRef = useRef(selected?.id ?? '')

  useEffect(() => { placeRef.current = selected?.id ?? '' }, [selected])

  const loadForecast = useCallback(async (p: Place) => {
    setLoading(true)
    const c = p
    const base = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&wind_speed_unit=ms&timezone=Europe%2FParis&forecast_days=7`
    try {
      const [ra, re, qa, uvr] = await Promise.all([
        fetch(base + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,apparent_temperature_max,apparent_temperature_min&hourly=temperature_2m,precipitation,windspeed_10m&models=meteofrance_seamless').then(r => r.json()),
        fetch(base + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&hourly=temperature_2m,precipitation_probability,precipitation,windspeed_10m&models=ecmwf_ifs025').then(r => r.json()),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}&hourly=european_aqi,pm2_5,nitrogen_dioxide,ozone&timezone=Europe%2FParis&forecast_days=2`).then(r => r.json()),
        // UV : le modèle Météo-France ne fournit pas uv_index_max → appel séparé sur le modèle par défaut (CAMS/ECMWF)
        fetch(base + '&daily=uv_index_max').then(r => r.json()),
      ])
      if (placeRef.current !== p.key) return
      setDa({ ...ra.daily, uv_index_max: uvr.daily?.uv_index_max }); setDe(re.daily)
      setAromeH(ra.hourly); setEcmwfH(re.hourly)
      setAqH(qa.hourly ?? null)
    } catch { /* silently fail */ }
    setLoading(false)
  }, [])

  // Charger messages Telegram
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) setMessages(await res.json())
    } catch { /* */ }
  }, [])

  // Charger la météo au changement de proche + auto-refresh toutes les 10 min
  // (écran mural : sinon le matin on voit les prévisions de la veille)
  useEffect(() => {
    if (!selected) { setLoading(false); return }
    const p: Place = { key: selected.id, lat: selected.lat, lon: selected.lon, label: selected.name }
    loadForecast(p)
    const iv = setInterval(() => loadForecast(p), 600000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.lat, selected?.lon, loadForecast])

  useEffect(() => {
    loadMessages()
    const iv = setInterval(loadMessages, 30000)
    return () => clearInterval(iv)
  }, [loadMessages])

  // Wake Lock : empêcher la mise en veille de l'écran (usage mural)
  // Réacquis quand l'onglet redevient visible (le verrou saute en arrière-plan)
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinel> } }
    if (!nav.wakeLock) return
    const acquire = async () => {
      try {
        lock = await nav.wakeLock!.request('screen')
      } catch { /* refusé (onglet caché, batterie faible…) */ }
    }
    const onVisible = () => { if (document.visibilityState === 'visible' && !cancelled) acquire() }
    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [])

  // Recherche de ville (geocoding Open-Meteo, sans clé) — debounce 350ms
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); setSearching(false); return }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=fr&format=json`).then(r => r.json())
        setResults(Array.isArray(r.results) ? r.results : [])
      } catch { setResults([]) }
      setSearching(false)
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  // Choisir une ville dans la recherche → ouvre le formulaire "prénom"
  // Gate Premium : au-delà de FREE_MAX proches, on propose le déblocage
  function pickResult(r: GeoResult) {
    if (!isPremium && proches.length >= FREE_MAX) {
      setPaywall(true); setQuery(''); setResults([])
      return
    }
    const city = r.admin1 && r.admin1 !== r.name ? `${r.name} (${r.admin1})` : r.name
    setPending({ id: newId(), name: '', lat: r.latitude, lon: r.longitude, city })
    setAddName(r.name)
    setQuery(''); setResults([])
  }

  async function verifyKey() {
    const key = keyInput.trim()
    if (!key || verifying) return
    setVerifying(true); setKeyError('')
    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()
      if (data.valid) {
        try { localStorage.setItem(LS_LICENSE, key) } catch { /* */ }
        setIsPremium(true); setPaywall(false); setKeyInput('')
      } else {
        setKeyError(data.message || 'Clé invalide')
      }
    } catch { setKeyError('Vérification impossible, réessaie') }
    setVerifying(false)
  }
  function confirmAdd() {
    if (!pending) return
    const name = addName.trim() || pending.city
    const proche = { ...pending, name }
    setProches(prev => [...prev, proche])
    setSelectedId(proche.id)
    setPending(null); setAddName('')
  }
  function removeProche(id: string) {
    setProches(prev => {
      const next = prev.filter(p => p.id !== id)
      if (id === selectedId) setSelectedId(next[0]?.id ?? '')
      return next
    })
  }
  async function shareBoard() {
    if (proches.length === 0) return
    const url = `${window.location.origin}${window.location.pathname}#b=${encodeBoard(proches, selectedId)}`
    try {
      await navigator.clipboard.writeText(url)
      setShareMsg('Lien copié ✓')
    } catch {
      window.location.hash = `b=${encodeBoard(proches, selectedId)}`
      setShareMsg('Lien dans la barre d\'adresse')
    }
    setTimeout(() => setShareMsg(''), 2500)
  }

  // Hydratation au montage : lien partagé (#b=...) prioritaire, sinon localStorage, sinon seed
  const hydrated = useRef(false)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const shared = hash.startsWith('b=') ? decodeBoard(hash.slice(2)) : null
    if (shared) {
      setProches(shared.proches); setSelectedId(shared.selectedId)
      history.replaceState(null, '', window.location.pathname + window.location.search)
    } else {
      try {
        const raw = localStorage.getItem(LS_PROCHES)
        if (raw) {
          const saved: Proche[] = JSON.parse(raw)
          if (Array.isArray(saved) && saved.length > 0) {
            setProches(saved)
            const sel = localStorage.getItem(LS_SELECTED)
            setSelectedId(sel && saved.some(p => p.id === sel) ? sel : saved[0].id)
          }
        }
      } catch { /* localStorage indisponible */ }
    }
    try { if (localStorage.getItem(LS_LICENSE)) setIsPremium(true) } catch { /* */ }
    hydrated.current = true
  }, [])

  // Persistance (après hydratation, pour ne pas écraser avec le seed)
  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(LS_PROCHES, JSON.stringify(proches))
      localStorage.setItem(LS_SELECTED, selectedId)
    } catch { /* localStorage indisponible */ }
  }, [proches, selectedId])

  // AQI helpers
  const nowH = new Date().getHours()
  const aqToday = aqH ? {
    aqi: aqH.european_aqi[nowH] ?? null,
    pm25: aqH.pm2_5[nowH] ?? null,
    no2: aqH.nitrogen_dioxide[nowH] ?? null,
    o3: aqH.ozone[nowH] ?? null,
  } : { aqi: null, pm25: null, no2: null, o3: null }
  const aqTomorrowAqi = aqH ? Math.max(...aqH.european_aqi.slice(24, 48).filter((v): v is number => v != null), 0) || null : null
  const aqTomorrow = { aqi: aqTomorrowAqi, pm25: null as number | null, no2: null as number | null, o3: null as number | null }

  function showHourly(dayIdx: number, dateStr: string) {
    const useArome = dayIdx < 3
    const h = useArome ? aromeH : ecmwfH
    if (!h || !da || !de) return
    const off = dayIdx * 24
    let rows = '<table style="width:100%;border-collapse:collapse"><tr style="color:#64748b;font-size:.6rem"><th style="text-align:left;padding:3px 6px">Heure</th><th>Temp</th><th>' + (useArome ? 'Pluie' : 'Prob') + '</th><th>Vent</th></tr>'
    for (let i = 0; i < 24; i++) {
      const idx = off + i
      const t = h.temperature_2m?.[idx] != null ? Math.round(h.temperature_2m[idx]) + '°' : '--'
      let rain: string, rainCol: string
      if (useArome) {
        const p = h.precipitation?.[idx] ?? 0
        rain = p < 0.1 ? 'Sec' : p.toFixed(1) + 'mm'
        rainCol = p >= 1 ? '#f97316' : p >= 0.1 ? '#fbbf24' : '#4ade80'
      } else {
        const p = h.precipitation_probability?.[idx] ?? 0
        rain = p + '%'
        rainCol = p >= 70 ? '#f97316' : p >= 40 ? '#fbbf24' : '#4ade80'
      }
      const w = h.windspeed_10m?.[idx] != null ? Math.round(h.windspeed_10m[idx]) + 'm/s' : '--'
      rows += `<tr style="border-top:1px solid #1e293b"><td style="padding:3px 6px;color:#64748b">${String(i).padStart(2, '0')}h</td><td style="text-align:center;color:#f97316">${t}</td><td style="text-align:center;color:${rainCol}">${rain}</td><td style="text-align:center;color:#94a3b8">${w}</td></tr>`
    }
    rows += '</table>'

    // Tenue du jour
    const src = useArome ? da : de
    const tmin = (useArome ? da.apparent_temperature_min?.[dayIdx] : src.temperature_2m_min[dayIdx]) ?? 10
    const tmax = (useArome ? da.apparent_temperature_max?.[dayIdx] : src.temperature_2m_max[dayIdx]) ?? 15
    const wc = src.weathercode[dayIdx] ?? 0
    const precip = (useArome ? da.precipitation_probability_max?.[dayIdx] : de.precipitation_probability_max?.[dayIdx]) ?? 0
    const wind = src.windspeed_10m_max[dayIdx] ?? 0
    const uv = da.uv_index_max?.[dayIdx] ?? 0
    const adv = clothingAdvice(tmin, tmax, precip, wind, wc, uv)
    const mcfg = COMFORT[adv.comfort] || COMFORT.ideal
    const TIER_LBL: Record<string, string> = { tres_chaud: 'Très chaud', chaud: 'Chaud', ideal: 'Idéal', frais: 'Frais', froid: 'Froid' }
    const outfitHtml = `<div style="margin-top:14px;padding:12px;border-radius:10px;background:${mcfg.bg};border:1px solid ${mcfg.bar}40">
      <div style="font-size:.7rem;color:${mcfg.color};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Comment s'habiller</div>
      <div style="font-size:.8rem;color:#e2e8f0;margin-bottom:6px">Ressenti ${Math.round(tmin)}° / ${Math.round(tmax)}° — <span style="color:${mcfg.color}">${TIER_LBL[adv.comfort] || adv.comfort}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${adv.items.map(it => `<span style="background:#0f172a;border:1px solid #334155;border-radius:20px;padding:4px 10px;font-size:.78rem">${it.e} ${it.l}</span>`).join('')}</div>
      ${adv.reason ? `<div style="margin-top:8px;font-size:.72rem;color:#64748b">${adv.reason}</div>` : ''}
    </div>`

    setModal({ title: `${dateStr} — détail`, html: rows + outfitHtml })
  }

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0f172a;color:#e2e8f0;font-family:'Segoe UI',sans-serif;padding:16px;min-height:100vh}
        h1{text-align:center;font-size:1.25rem;color:#38bdf8;letter-spacing:2px;margin-bottom:4px}
        .sub{text-align:center;color:#64748b;font-size:.75rem;margin-bottom:16px;letter-spacing:1px}
        .box{background:#1e293b;border-radius:14px;padding:14px;border:1px solid #334155;max-width:900px;margin:0 auto 14px}
        .box-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
        .box-hdr h2{font-size:.7rem;color:#94a3b8;letter-spacing:1px;text-transform:uppercase}
        .outfit-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        @media(max-width:520px){.outfit-grid{grid-template-columns:1fr}}
        .fc-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
        .fc-day{border:1px solid #334155;border-radius:10px;padding:10px 12px;text-align:center;min-width:90px;flex:1;cursor:pointer;transition:transform .15s}
        .fc-day:hover{transform:translateY(-2px)}
        .fc-day .day{font-size:.65rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .fc-day .ico{font-size:1.6rem;margin:4px 0}
        .fc-day .temps{font-size:.8rem;font-weight:600}
        .tmax{color:#f97316}.tmin{color:#38bdf8}
        .fc-day .rain{font-size:.75rem;font-weight:700;margin-top:5px}
        .fc-day .wind{font-size:.6rem;color:#64748b;margin-top:2px}
        footer{text-align:center;color:#475569;font-size:.65rem;margin-top:20px}
        .search-wrap{position:relative;max-width:360px;margin:0 auto 12px}
        .search-input{width:100%;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:10px;padding:10px 14px;font-size:.85rem;outline:none;transition:.2s}
        .search-input:focus{border-color:#38bdf8}
        .search-input::placeholder{color:#64748b}
        .search-results{position:absolute;top:100%;left:0;right:0;margin-top:4px;background:#1e293b;border:1px solid #334155;border-radius:10px;overflow:hidden;z-index:50;box-shadow:0 8px 24px rgba(0,0,0,.4)}
        .search-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 14px;font-size:.8rem;color:#e2e8f0;cursor:pointer;border-top:1px solid #0f172a}
        .search-item:first-child{border-top:none}
        .search-item:hover{background:#38bdf8;color:#0f172a}
        .search-item.muted{color:#64748b;cursor:default}
        .search-item.muted:hover{background:#1e293b;color:#64748b}
        .search-country{font-size:.65rem;color:#64748b}
        .search-item:hover .search-country{color:#0f172a}
        .city-sel{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:8px}
        .city-btn{display:inline-flex;align-items:center;gap:6px;background:#1e293b;border:1px solid #334155;color:#94a3b8;border-radius:8px;padding:6px 10px 6px 14px;font-size:.72rem;cursor:pointer;transition:.2s}
        .city-btn:hover,.city-btn.active{background:#38bdf8;color:#0f172a;font-weight:700;border-color:#38bdf8}
        .city-btn .pc-city{font-size:.6rem;opacity:.7;font-weight:400}
        .pc-del{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;font-size:.7rem;line-height:1;color:#64748b;background:rgba(148,163,184,.15)}
        .city-btn.active .pc-del{color:#0f172a;background:rgba(15,23,42,.25)}
        .pc-del:hover{background:#ef4444;color:#fff}
        .board-bar{display:flex;gap:8px;justify-content:center;align-items:center;margin-bottom:16px;flex-wrap:wrap}
        .board-act{background:none;border:1px solid #334155;color:#64748b;border-radius:8px;padding:5px 12px;font-size:.65rem;cursor:pointer;transition:.2s}
        .board-act:hover{border-color:#38bdf8;color:#38bdf8}
        .board-msg{font-size:.65rem;color:#4ade80}
        .add-form{max-width:360px;margin:0 auto 10px;background:#1e293b;border:1px solid #38bdf8;border-radius:10px;padding:8px}
        .add-form .city{font-size:.65rem;color:#94a3b8;margin:0 2px 6px}
        .add-row{display:flex;gap:6px}
        .add-input{flex:1;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:8px;padding:8px 10px;font-size:.8rem;outline:none}
        .add-input:focus{border-color:#38bdf8}
        .add-btn{background:#38bdf8;border:none;color:#0f172a;font-weight:700;border-radius:8px;padding:0 12px;font-size:.75rem;cursor:pointer}
        .add-cancel{background:none;border:1px solid #334155;color:#64748b;border-radius:8px;padding:0 10px;font-size:.9rem;cursor:pointer}
        .premium-badge{font-size:.6rem;font-weight:700;color:#fbbf24;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.35);border-radius:20px;padding:3px 10px;letter-spacing:.5px}
        .pw-buy{display:block;text-align:center;background:linear-gradient(135deg,#fbbf24,#f97316);color:#1a1006;font-weight:800;border:none;border-radius:10px;padding:12px;font-size:.9rem;cursor:pointer;text-decoration:none;margin-bottom:14px}
        .pw-feat{display:flex;align-items:center;gap:8px;font-size:.8rem;color:#cbd5e1;margin:7px 0}
        .pw-sep{display:flex;align-items:center;gap:8px;color:#475569;font-size:.6rem;text-transform:uppercase;letter-spacing:1px;margin:16px 0 10px}
        .pw-sep::before,.pw-sep::after{content:"";flex:1;height:1px;background:#334155}
        .pw-key{display:flex;gap:6px}
        .pw-key input{flex:1;background:#0f172a;border:1px solid #334155;color:#e2e8f0;border-radius:8px;padding:9px 11px;font-size:.8rem;outline:none}
        .pw-key input:focus{border-color:#38bdf8}
        .pw-key button{background:#1e293b;border:1px solid #38bdf8;color:#38bdf8;border-radius:8px;padding:0 14px;font-size:.78rem;font-weight:600;cursor:pointer}
        .pw-err{color:#f87171;font-size:.72rem;margin-top:8px}
        .msg-card{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:12px;margin-bottom:8px}
        .msg-author{font-size:.65rem;color:#38bdf8;font-weight:600;margin-bottom:4px}
        .msg-text{font-size:.85rem;color:#e2e8f0;line-height:1.4}
        .msg-date{font-size:.55rem;color:#475569;margin-top:4px}
        .msg-media{max-width:100%;border-radius:8px;margin-top:8px}
        .loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;gap:16px}
        .spin{width:36px;height:36px;border:3px solid #1e293b;border-top-color:#38bdf8;border-radius:50%;animation:sp .8s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}
      `}</style>

      <h1>HOMEBOARD</h1>
      <div className="sub">📍 {selected ? (selected.name === selected.city ? selected.city : `${selected.name} · ${selected.city}`) : 'Aucun proche'}</div>

      {/* Ajouter un proche : rechercher une ville */}
      <div className="search-wrap">
        <input
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Ajouter un proche : chercher sa ville..."
          autoComplete="off"
          spellCheck={false}
        />
        {(results.length > 0 || (searching && query.trim().length >= 2)) && (
          <div className="search-results">
            {results.length === 0 && searching && <div className="search-item muted">Recherche…</div>}
            {results.map(r => (
              <div key={r.id} className="search-item" onClick={() => pickResult(r)}>
                <span className="search-name">{r.name}{r.admin1 && r.admin1 !== r.name ? `, ${r.admin1}` : ''}</span>
                {r.country && <span className="search-country">{r.country}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire : prénom du proche pour la ville choisie */}
      {pending && (
        <div className="add-form">
          <div className="city">📍 {pending.city}</div>
          <div className="add-row">
            <input
              className="add-input"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') { setPending(null); setAddName('') } }}
              placeholder="Prénom (ex : Mamie)"
              autoFocus
            />
            <button className="add-btn" onClick={confirmAdd}>Ajouter</button>
            <button className="add-cancel" onClick={() => { setPending(null); setAddName('') }}>✕</button>
          </div>
        </div>
      )}

      {/* Mur des proches */}
      <div className="city-sel">
        {proches.map(p => (
          <button
            key={p.id}
            className={`city-btn ${selectedId === p.id ? 'active' : ''}`}
            onClick={() => setSelectedId(p.id)}
            title={p.city}
          >
            <span>{p.name}{p.name !== p.city && <span className="pc-city"> · {p.city}</span>}</span>
            <span
              className="pc-del"
              role="button"
              aria-label={`Retirer ${p.name}`}
              onClick={e => { e.stopPropagation(); removeProche(p.id) }}
            >✕</span>
          </button>
        ))}
      </div>
      <div className="board-bar">
        {proches.length > 0 && <button className="board-act" onClick={shareBoard}>🔗 Partager ce tableau</button>}
        {isPremium
          ? <span className="premium-badge">✨ Premium</span>
          : <button className="board-act" onClick={() => setPaywall(true)}>✨ Passer en illimité</button>}
        {shareMsg && <span className="board-msg">{shareMsg}</span>}
      </div>

      {/* Messages importants */}
      {messages.length > 0 && (
        <div className="box" style={{ maxWidth: 900, margin: '0 auto 14px' }}>
          <div className="box-hdr"><h2>📢 Messages importants</h2><span style={{ fontSize: '.55rem', color: '#475569' }}>via Telegram</span></div>
          {messages.slice(0, 3).map(msg => (
            <div key={msg.id} className="msg-card">
              <div className="msg-author">👤 {msg.from}</div>
              {msg.text && <div className="msg-text">{msg.text}</div>}
              {msg.caption && <div className="msg-text">{msg.caption}</div>}
              {msg.photo && <img className="msg-media" src={msg.photo} alt="photo" />}
              {msg.audio && <audio controls src={msg.audio} style={{ width: '100%', marginTop: 8 }} />}
              <div className="msg-date">{new Date(msg.date * 1000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</div>
            </div>
          ))}
        </div>
      )}

      {!selected ? (
        <div className="loader"><p style={{ color: '#64748b', fontSize: '.85rem' }}>Aucun proche. Cherche une ville ci-dessus pour ajouter quelqu&apos;un. 👆</p></div>
      ) : loading ? (
        <div className="loader"><div className="spin" /><p style={{ color: '#64748b', fontSize: '.8rem' }}>Chargement météo {selected.name}...</p></div>
      ) : da && de ? (
        <>
          {/* Comment s'habiller */}
          <div className="box" style={{ maxWidth: 900, margin: '0 auto 14px' }}>
            <div className="box-hdr"><h2>Comment s&apos;habiller</h2></div>
            <div className="outfit-grid">
              {[0, 1].map(idx => {
                const uv = da.uv_index_max?.[idx] ?? 0
                const aqd = idx === 0 ? aqToday : aqTomorrow
                const adv = clothingAdvice(
                  da.apparent_temperature_min?.[idx] ?? da.temperature_2m_min[idx],
                  da.apparent_temperature_max?.[idx] ?? da.temperature_2m_max[idx],
                  de.precipitation_probability_max?.[idx] ?? 0,
                  da.windspeed_10m_max[idx], da.weathercode[idx], uv
                )
                const cfg = COMFORT[adv.comfort] || COMFORT.ideal
                const ai = aqInfo(aqd.aqi)
                const uvU = uvLabel(uv)
                const dt = new Date()
                if (idx === 1) dt.setDate(dt.getDate() + 1)
                const label = (idx === 0 ? "Aujourd'hui" : 'Demain') + ' ' + dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                return (
                  <div key={idx} style={{ background: cfg.bg, borderRadius: 10, padding: 10, cursor: 'pointer', border: `1px solid ${cfg.bar}` }}
                    onClick={() => showHourly(idx, label)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '.6rem', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>{idx === 0 ? "Aujourd'hui" : 'Demain'}</span>
                      <span style={{ fontSize: '.6rem', fontWeight: 700, borderRadius: 6, padding: '2px 8px', background: cfg.pill, color: cfg.color }}>{cfg.lbl}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', minWidth: 54 }}>
                        <div style={{ fontSize: '.45rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>ressenti</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1, color: cfg.color }}>{Math.round(da.apparent_temperature_max?.[idx] ?? da.temperature_2m_max[idx])}°</div>
                        <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#38bdf8' }}>{Math.round(da.apparent_temperature_min?.[idx] ?? da.temperature_2m_min[idx])}°</div>
                        <div style={{ fontSize: '.5rem', color: '#475569', marginTop: 2 }}>réel {Math.round(da.temperature_2m_min[idx])}°/{Math.round(da.temperature_2m_max[idx])}°</div>
                        <div style={{ fontSize: '1.4rem', marginTop: 3 }}>{WMO[da.weathercode[idx]] || '🌡'}</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {adv.items.map((it, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: '.95rem' }}>{it.e}</span>
                            <span style={{ fontSize: '.68rem', color: '#e2e8f0', fontWeight: 500 }}>{it.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,.1)' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'baseline' }}>
                        <span style={{ color: ai.col, fontWeight: 700, fontSize: '.65rem' }}>IEA {aqd.aqi != null ? Math.round(aqd.aqi) : '--'} {ai.lbl}</span>
                        {aqd.pm25 != null && <span style={{ color: '#475569', fontSize: '.55rem' }}>PM2.5 {Math.round(aqd.pm25)}µg</span>}
                      </div>
                      <div style={{ fontSize: '.6rem', color: '#94a3b8', marginTop: 2 }}>🏃 {ai.act}</div>
                      <div style={{ fontSize: '.6rem', color: uvU.col, marginTop: 2 }}>☀️ UV {uvU.lbl} — {uvU.tip}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 5, fontSize: '.5rem', color: '#334155', textAlign: 'right' }}>ℹ Appuyer sur un jour pour le détail</div>
          </div>

          {/* Prévisions 7 jours */}
          <div className="box" style={{ maxWidth: 900, margin: '0 auto 14px' }}>
            <div className="box-hdr"><h2>Prévisions 7j — AROME J1-3 / ECMWF J4-7</h2></div>
            <div className="fc-row">
              {da.time.map((t, i) => {
                const useArome = i < 3
                const src = useArome ? da : de
                const dt = new Date(t)
                const wc = src.weathercode[i]
                const tmax = Math.round(src.temperature_2m_max[i])
                const tmin = Math.round(src.temperature_2m_min[i])
                const atmin = (useArome ? da.apparent_temperature_min?.[i] : tmin) ?? tmin
                const atmax = (useArome ? da.apparent_temperature_max?.[i] : tmax) ?? tmax
                const dayComfort = comfortFromTemp(atmin, atmax)
                const dcfg = COMFORT[dayComfort] || COMFORT.ideal

                let rainHtml: string, borderColor: string
                if (useArome) {
                  const s = da.precipitation_sum?.[i] ?? 0
                  if (s < 0.1) { rainHtml = `<div class="rain" style="color:#4ade80">☀</div>`; borderColor = '#166534' }
                  else if (s < 1) { rainHtml = `<div class="rain" style="color:#fbbf24">${s.toFixed(1)}mm</div>`; borderColor = '#713f12' }
                  else if (s < 5) { rainHtml = `<div class="rain" style="color:#f97316">${s.toFixed(1)}mm</div>`; borderColor = '#7c2d12' }
                  else { rainHtml = `<div class="rain" style="color:#ef4444">${s.toFixed(1)}mm</div>`; borderColor = '#7f1d1d' }
                } else {
                  const p = de.precipitation_probability_max?.[i] ?? 0
                  if (p < 20) { rainHtml = `<div class="rain" style="color:#4ade80">${p}%</div>`; borderColor = '#166534' }
                  else if (p < 50) { rainHtml = `<div class="rain" style="color:#fbbf24">${p}%</div>`; borderColor = '#713f12' }
                  else if (p < 75) { rainHtml = `<div class="rain" style="color:#f97316">${p}%</div>`; borderColor = '#7c2d12' }
                  else { rainHtml = `<div class="rain" style="color:#ef4444">${p}%</div>`; borderColor = '#7f1d1d' }
                }
                const ws = src.windspeed_10m_max[i]
                const wsStr = ws != null ? Math.round(ws) + 'm/s' : '--'
                const uvv = da.uv_index_max?.[i] ?? null
                const uvU = uvLabel(uvv)
                const tag = useArome ? '<span style="font-size:.5rem;color:#38bdf8">AROME</span>' : '<span style="font-size:.5rem;color:#a78bfa">ECMWF</span>'
                const label = DAYS[dt.getDay()] + ' ' + dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })

                return (
                  <div key={i} className="fc-day"
                    style={{ borderLeft: `3px solid ${borderColor}`, background: dcfg.bg }}
                    onClick={() => showHourly(i, label)}>
                    <div className="day" style={{ color: dcfg.color }}>{DAYS[dt.getDay()]}</div>
                    <span dangerouslySetInnerHTML={{ __html: tag }} />
                    <div className="ico">{WMO[wc] || '🌡'}</div>
                    <div className="temps"><span className="tmax">{tmax}°</span> / <span className="tmin">{tmin}°</span></div>
                    <div dangerouslySetInnerHTML={{ __html: rainHtml }} />
                    <div className="wind">💨 {wsStr}</div>
                    {uvv != null && <div style={{ fontSize: '.55rem', marginTop: 3, color: uvU.col }}>UV {Math.round(uvv)}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="loader"><p style={{ color: '#f87171' }}>Impossible de charger les prévisions</p></div>
      )}

      <footer>Données Open-Meteo · Météo-France AROME · ECMWF · Air Quality</footer>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200, overflowY: 'auto', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#1e293b', borderRadius: 14, maxWidth: 440, margin: '0 auto', padding: 18, position: 'relative', border: '1px solid #334155' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <h3 style={{ color: '#38bdf8', fontSize: '.85rem', letterSpacing: 1, marginBottom: 12 }}>{modal.title}</h3>
            <div style={{ fontSize: '.72rem' }} dangerouslySetInnerHTML={{ __html: modal.html }} />
          </div>
        </div>
      )}

      {/* Paywall Premium */}
      {paywall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 300, overflowY: 'auto', padding: 16 }} onClick={() => { setPaywall(false); setKeyError('') }}>
          <div style={{ background: '#1e293b', borderRadius: 16, maxWidth: 380, margin: '6vh auto 0', padding: 22, position: 'relative', border: '1px solid #fbbf2455' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setPaywall(false); setKeyError('') }} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <h3 style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: 4 }}>✨ Homeboard Premium</h3>
            <p style={{ color: '#94a3b8', fontSize: '.78rem', marginBottom: 16 }}>Tes 3 premiers proches sont gratuits. Passe en illimité pour suivre toute la famille — paiement unique, à vie.</p>

            <div className="pw-feat">👨‍👩‍👧‍👦 Proches <strong>illimités</strong></div>
            <div className="pw-feat">🔗 Tableau partageable par lien</div>
            <div className="pw-feat">💛 Tu soutiens un projet indé</div>

            {GUMROAD_URL
              ? <a className="pw-buy" href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16 }}>Débloquer — 19€ à vie</a>
              : <div style={{ marginTop: 16, textAlign: 'center', color: '#64748b', fontSize: '.78rem', padding: '12px', border: '1px dashed #334155', borderRadius: 10 }}>Premium bientôt disponible 🔜</div>}

            <div className="pw-sep">déjà acheté&nbsp;?</div>
            <div className="pw-key">
              <input
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') verifyKey() }}
                placeholder="Colle ta clé de licence"
                autoComplete="off"
              />
              <button onClick={verifyKey} disabled={verifying}>{verifying ? '…' : 'Activer'}</button>
            </div>
            {keyError && <div className="pw-err">{keyError}</div>}
          </div>
        </div>
      )}
    </>
  )
}
