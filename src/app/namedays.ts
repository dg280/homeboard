// Calendrier des fêtes de prénoms (saints) — prénoms COURANTS en France.
// Clé = prénom normalisé (minuscules, sans accent, 1er token) → 'MM-DD'.
// Couverture volontairement partielle mais fiable : un prénom absent n'affiche
// simplement pas de fête (pas de "fausse" bonne fête). Facile à compléter.
const NAMEDAYS: Record<string, string> = {
  genevieve: '01-03',
  sebastien: '01-20',
  agnes: '01-21',
  vincent: '01-22',
  blaise: '02-03',
  veronique: '02-04',
  agathe: '02-05',
  valentin: '02-14',
  mathilde: '03-14',
  joseph: '03-19',
  georges: '04-23',
  marc: '04-25',
  philippe: '05-03',
  yves: '05-19',
  sophie: '05-25',
  antoine: '06-13',
  herve: '06-17',
  jean: '06-24',
  pierre: '06-29',
  paul: '06-29',
  benoit: '07-11',
  madeleine: '07-22',
  brigitte: '07-23',
  jacques: '07-25',
  anne: '07-26',
  joachim: '07-26',
  nathalie: '07-27',
  dominique: '08-08',
  laurent: '08-10',
  claire: '08-11',
  marie: '08-15',
  helene: '08-18',
  bernard: '08-20',
  rose: '08-23',
  barthelemy: '08-24',
  louis: '08-25',
  monique: '08-27',
  augustin: '08-28',
  sabine: '08-29',
  matthieu: '09-21',
  maurice: '09-22',
  michel: '09-29',
  gabriel: '09-29',
  raphael: '09-29',
  therese: '10-01',
  gerard: '10-03',
  francois: '10-04',
  bruno: '10-06',
  denis: '10-09',
  luc: '10-18',
  simon: '10-28',
  jude: '10-28',
  hubert: '11-03',
  charles: '11-04',
  leon: '11-10',
  martin: '11-11',
  elisabeth: '11-17',
  cecile: '11-22',
  clement: '11-23',
  catherine: '11-25',
  andre: '11-30',
  barbara: '12-04',
  barbe: '12-04',
  nicolas: '12-06',
  lucie: '12-13',
  adele: '12-24',
  noel: '12-25',
  emmanuel: '12-25',
  etienne: '12-26',
  sylvestre: '12-31',
}

function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '') // retire les accents
    .split(/[\s-]+/)[0] // 1er token (gère "Jean-Pierre" → "jean")
}

// 'MM-DD' de la fête d'un prénom, ou null si inconnu
export function nameDayMMDD(name: string): string | null {
  return NAMEDAYS[normalize(name)] ?? null
}

// Est-ce la fête de ce prénom aujourd'hui ?
export function isNameDayToday(name: string): boolean {
  const md = nameDayMMDD(name)
  if (!md) return false
  const now = new Date()
  const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return md === todayMMDD
}
