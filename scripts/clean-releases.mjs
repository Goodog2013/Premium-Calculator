import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const releasesDir = resolve(process.cwd(), 'Releases')
const keepFile = resolve(releasesDir, '.gitkeep')

await rm(releasesDir, { recursive: true, force: true })
await mkdir(releasesDir, { recursive: true })
await writeFile(keepFile, '')

console.log(`[releases] prepared ${releasesDir}`)
