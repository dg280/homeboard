import { NextResponse } from 'next/server'

// Vérification de licence Gumroad côté serveur (évite CORS + garde le product_id privé).
// Zéro infra : simple fonction serverless. product_id fourni par Gumroad à la création du produit.
const PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID || ''

export async function POST(req: Request) {
  if (!PRODUCT_ID) {
    return NextResponse.json({ valid: false, message: 'Premium pas encore activé' })
  }

  let key = ''
  try { key = String((await req.json())?.key ?? '').trim() } catch { /* body invalide */ }
  if (!key) return NextResponse.json({ valid: false, message: 'Clé manquante' })

  try {
    const body = new URLSearchParams({
      product_id: PRODUCT_ID,
      license_key: key,
      increment_uses_count: 'false', // ne pas consommer une "utilisation" à chaque vérif
    })
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
    const data = await res.json()
    const p = data?.purchase
    const valid = Boolean(data?.success) && !p?.refunded && !p?.chargebacked && !p?.disputed
    return NextResponse.json({ valid, message: valid ? 'OK' : 'Clé invalide ou remboursée' })
  } catch {
    return NextResponse.json({ valid: false, message: 'Vérification impossible, réessaie' })
  }
}
