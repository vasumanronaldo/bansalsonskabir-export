// Per-page OG image (docs/06). 1200×630, Bodoni title on obsidian with a gold
// hairline — consistent, no photography needed. Title via ?title=.
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

const OBSIDIAN = '#141311'
const PEARL = '#f7f5f1'
const GOLD = '#b08d57'
const STONE = '#8c8a85'

// Load Bodoni Moda as TTF via the old-user-agent trick (Google Fonts serves TTF
// to legacy UAs, which satori needs). Subsetted to the requested text.
async function bodoni(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@500&text=${encodeURIComponent(text)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 5.1)' } },
    ).then((r) => r.text())
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('title') || 'Bansal Sons Jewellers').slice(0, 90)
  const eyebrow = (searchParams.get('eyebrow') || 'Fine jewellery · Malviya Nagar · Since 1993').slice(0, 80)

  const font = await bodoni(title)

  const options: ConstructorParameters<typeof ImageResponse>[1] = { width: 1200, height: 630 }
  if (font) options.fonts = [{ name: 'Bodoni', data: font, style: 'normal', weight: 500 }]

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: OBSIDIAN, padding: '72px 80px' }}>
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, textTransform: 'uppercase', color: STONE }}>{eyebrow}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 96, height: 2, background: GOLD, marginBottom: 36 }} />
          <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.05, color: PEARL, ...(font ? { fontFamily: 'Bodoni' } : {}), maxWidth: 980 }}>{title}</div>
        </div>
      </div>
    ),
    options,
  )
}
