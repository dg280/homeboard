'use client'

// ── Marée du Bassin d'Arcachon ───────────────────────────────────────────────
// Décision 260927-02 : la marée suit le proche choisi. Ici, un proche dans le
// Bassin → marée officielle SHOM du port de référence Arcachon-Eyrac (Gujan-
// Mestras n'est pas un port SHOM : on n'invente aucun décalage).
// Source : vignette gratuite « Horaires de marées » du SHOM. Conditions
// d'utilisation détaillées non lues à ce jour → vignette derrière un
// interrupteur (NEXT_PUBLIC_SHOM_VIGNETTE=1), lien officiel sinon.

const VIGNETTE_SRC = 'https://services.data.shom.fr/hdm/vignette/petite/ARCACHON_EYRAC?locale=fr'
const PORT_URL = 'https://maree.shom.fr/harbor/ARCACHON_EYRAC'
const VIGNETTE_ON = process.env.NEXT_PUBLIC_SHOM_VIGNETTE !== '0'

// Boîte du Bassin (validée par coordonnées le 2026-10-11) (Cap Ferret → Arès → Audenge/Le Teich → Pilat),
// à valider sur carte. Témoin : Gujan-Mestras 44.638 / -1.068.
export function isInBassinArcachon(lat: number, lon: number): boolean {
  return lat >= 44.55 && lat <= 44.80 && lon >= -1.30 && lon <= -0.95
}

// Le script SHOM écrit son contenu par document.write() : il ne peut pas vivre
// dans le DOM de React, on le charge donc dans une iframe isolée (srcDoc).
const VIGNETTE_DOC =
  '<!doctype html><html><head><meta charset="utf-8"><base target="_blank"></head>' +
  '<body style="margin:0"><script src="' + VIGNETTE_SRC + '"></script></body></html>'

export default function TideBassin() {
  return (
    <div className="box" style={{ maxWidth: 900, margin: '0 auto 14px' }}>
      <div className="box-hdr"><h2>Marée · Bassin d&apos;Arcachon</h2></div>
      {VIGNETTE_ON ? (
        <iframe
          title="Horaires de marées du Shom — Arcachon (Jetée d'Eyrac)"
          srcDoc={VIGNETTE_DOC}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          style={{ width: '100%', maxWidth: 360, height: 300, border: 0, borderRadius: 8, background: '#fff', display: 'block' }}
        />
      ) : (
        <a href={PORT_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#7dd3fc', fontSize: '.85rem' }}>
          🌊 Horaires officiels du Shom — Arcachon (Jetée d&apos;Eyrac) →
        </a>
      )}
      <div style={{ fontSize: '.6rem', color: '#64748b', marginTop: 8 }}>
        Source : Shom, horaires officiels du jour (mise à jour en direct). Port de référence : Arcachon (Jetée d&apos;Eyrac) ; le fond du Bassin est en léger décalage.
      </div>
    </div>
  )
}
