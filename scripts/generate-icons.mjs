/**
 * Generates PWA icons using the Canvas API (Node >= 18 + built-in canvas fallback)
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install canvas  (one-time, not in main deps)
 *
 * Outputs:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-512.png
 */
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const pad = maskable ? size * 0.1 : 0

  // Background
  ctx.fillStyle = '#0d9488'
  if (maskable) {
    ctx.fillRect(0, 0, size, size)
  } else {
    const r = size * 0.2
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(size - r, 0)
    ctx.quadraticCurveTo(size, 0, size, r)
    ctx.lineTo(size, size - r)
    ctx.quadraticCurveTo(size, size, size - r, size)
    ctx.lineTo(r, size)
    ctx.quadraticCurveTo(0, size, 0, size - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()
  }

  // Dollar sign C$
  const fontSize = (size - pad * 2) * 0.45
  ctx.fillStyle = 'white'
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('C$', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192))
writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512))
writeFileSync(join(outDir, 'icon-maskable-512.png'), drawIcon(512, true))

console.log('Icons generated in public/icons/')
