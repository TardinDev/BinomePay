import { ImageResponse } from 'next/og'

export const alt = 'BinomePay — Échange de devises entre particuliers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'radial-gradient(ellipse 80% 80% at 30% 0%, #1a1a05 0%, #000 60%)',
        color: '#f5f5f5',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: '#EAB308' }} />
        <div style={{ fontSize: 40, fontWeight: 700, color: '#EAB308' }}>BinomePay</div>
      </div>
      <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
        Envoyez et recevez de l’argent sans intermédiaire.
      </div>
      <div style={{ fontSize: 30, color: '#a3a3a3', marginTop: 28, maxWidth: 820 }}>
        Le change de devises entre particuliers, sans frais cachés.
      </div>
    </div>,
    { ...size }
  )
}
