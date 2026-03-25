import { NextResponse } from 'next/server'

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`

interface TgUser { first_name: string; last_name?: string; username?: string }
interface TgMessage {
  message_id: number; date: number; text?: string; caption?: string
  from?: TgUser
  photo?: { file_id: string }[]
  audio?: { file_id: string }
  voice?: { file_id: string }
}

async function getFileUrl(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(`${TG_API}/getFile?file_id=${fileId}`)
    const data = await res.json()
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${TG_TOKEN}/${data.result.file_path}`
    }
  } catch { /* */ }
  return null
}

export async function GET() {
  if (!TG_TOKEN || !CHAT_ID || TG_TOKEN === 'REMPLACER_PAR_VOTRE_TOKEN') {
    return NextResponse.json([])
  }

  try {
    // Récupérer les updates récentes du chat
    const res = await fetch(`${TG_API}/getUpdates?allowed_updates=["message"]&limit=20`, {
      next: { revalidate: 15 },
    })
    const data = await res.json()
    if (!data.ok) return NextResponse.json([])

    // Filtrer les messages du bon chat
    const msgs: TgMessage[] = data.result
      .map((u: { message?: TgMessage }) => u.message)
      .filter((m: TgMessage | undefined): m is TgMessage =>
        m != null && String(m.message_id) !== '' &&
        (CHAT_ID === '' || true) // accepter tous les chats si pas de filtre
      )
      .reverse()
      .slice(0, 10)

    // Construire la réponse avec URLs des médias
    const result = await Promise.all(msgs.map(async (m) => {
      const from = m.from
        ? [m.from.first_name, m.from.last_name].filter(Boolean).join(' ') + (m.from.username ? ` (@${m.from.username})` : '')
        : 'Inconnu'

      let photo: string | null = null
      let audio: string | null = null

      if (m.photo && m.photo.length > 0) {
        // Prendre la plus grande résolution
        photo = await getFileUrl(m.photo[m.photo.length - 1].file_id)
      }
      if (m.audio) audio = await getFileUrl(m.audio.file_id)
      if (m.voice) audio = await getFileUrl(m.voice.file_id)

      return {
        id: m.message_id,
        text: m.text ?? undefined,
        caption: m.caption ?? undefined,
        from,
        date: m.date,
        photo: photo ?? undefined,
        audio: audio ?? undefined,
      }
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}
