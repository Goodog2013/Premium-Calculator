import { access, cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const rootDir = process.cwd()
const releasesDir = resolve(rootDir, 'Releases')

const targets = [
  {
    label: 'web',
    source: resolve(rootDir, 'dist'),
    destination: resolve(releasesDir, 'web'),
  },
  {
    label: 'desktop',
    source: resolve(rootDir, 'src-tauri', 'target', 'release', 'bundle'),
    destination: resolve(releasesDir, 'desktop'),
  },
]

await mkdir(releasesDir, { recursive: true })

for (const target of targets) {
  try {
    await access(target.source)
    await rm(target.destination, { recursive: true, force: true })
    await cp(target.source, target.destination, { recursive: true, force: true })
    console.log(`[releases] copied ${target.label}: ${target.destination}`)
  } catch {
    console.log(`[releases] skipped ${target.label}: source not found (${target.source})`)
  }
}
