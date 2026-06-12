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
        background: '#000000',
        color: '#f5f5f5',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <div style={{ width: 24, height: 24, borderRadius: 999, background: '#EAB308' }} />
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>
          <span style={{ color: '#f5f5f5' }}>Binome</span>
          <span style={{ color: '#EAB308' }}>Pay</span>
        </div>
      </div>
      <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
        Envoyez et recevez de l’argent sans intermédiaire.
      </div>
      <div style={{ fontSize: 30, color: '#a3a3a3', marginTop: 28, maxWidth: 820 }}>
        Le change de devises entre particuliers, sans frais cachés.
      </div>
      <div style={{ width: 120, height: 6, background: '#EAB308', marginTop: 48 }} />
    </div>,
    { ...size }
  )
}
