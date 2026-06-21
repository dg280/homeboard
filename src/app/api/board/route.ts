import { NextResponse } from 'next/server'

// Toujours exécuté à la requête (lit l'état live de Telegram, jamais mis en cache au build)
export const dynamic = 'force-dynamic'

// Sync gratuite via Telegram : le board (sans photos) est stocké comme
// message ÉPINGLÉ d'un canal/groupe privé, lu/écrit par le bot. Zéro base,
// zéro nouveau compte. Le bot doit être ADMIN du canal (droit d'épingler).
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
// Canal DÉDIÉ au store (pas le chat famille) : pas de fallback sur TELEGRAM_CHAT_ID,
// pour ne jamais polluer le flux de messages avec le JSON du board.
const BOARD_CHAT = process.env.TELEGRAM_BOARD_CHAT_ID || ''
const TG = `https://api.telegram.org/bot${TG_TOKEN}`
const MARKER = 'HOMEBOARD_BOARD_V1'

function configured(): boolean { return Boolean(TG_TOKEN && BOARD_CHAT) }

async function getPinned(): Promise<{ message_id: number; text: string } | null> {
  const res = await fetch(`${TG}/getChat?chat_id=${encodeURIComponent(BOARD_CHAT)}`, { cache: 'no-store' })
  const data = await res.json()
  const p = data?.result?.pinned_message
  if (p && typeof p.text === 'string') return { message_id: p.message_id, text: p.text }
  return null
}

export async function GET() {
  if (!configured()) return NextResponse.json({ ok: false, reason: 'sync-off' })
  try {
    const pinned = await getPinned()
    if (!pinned || !pinned.text.startsWith(MARKER)) return NextResponse.json({ ok: true, board: null })
    const json = pinned.text.slice(MARKER.length).trim()
    return NextResponse.json({ ok: true, board: JSON.parse(json) })
  } catch {
    return NextResponse.json({ ok: false, reason: 'error' })
  }
}

export async function PUT(req: Request) {
  if (!configured()) return NextResponse.json({ ok: false, reason: 'sync-off' })
  let board: unknown
  try { board = (await req.json())?.board } catch { /* body invalide */ }
  if (!board || typeof board !== 'object') return NextResponse.json({ ok: false, reason: 'no-board' })

  const text = `${MARKER}\n${JSON.stringify(board)}`
  if (text.length > 4096) return NextResponse.json({ ok: false, reason: 'too-large' })

  try {
    const pinned = await getPinned()
    if (pinned && pinned.text.startsWith(MARKER)) {
      // Éditer le message épinglé existant
      const r = await fetch(`${TG}/editMessageText`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: BOARD_CHAT, message_id: pinned.message_id, text }),
      })
      const rd = await r.json()
      // "message is not modified" = contenu identique → considéré OK
      if (rd.ok || String(rd.description || '').includes('not modified')) return NextResponse.json({ ok: true })
      return NextResponse.json({ ok: false, reason: 'edit-failed' })
    }
    // Sinon : envoyer puis épingler
    const sent = await fetch(`${TG}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: BOARD_CHAT, text, disable_notification: true }),
    })
    const sd = await sent.json()
    if (!sd.ok) return NextResponse.json({ ok: false, reason: 'send-failed' })
    await fetch(`${TG}/pinChatMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: BOARD_CHAT, message_id: sd.result.message_id, disable_notification: true }),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, reason: 'error' })
  }
}
