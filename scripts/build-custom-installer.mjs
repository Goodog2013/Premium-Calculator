import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve, basename } from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = process.cwd()
const tauriConfigPath = resolve(rootDir, 'src-tauri', 'tauri.conf.json')
const templateDir = resolve(rootDir, 'installer', 'custom')
const releaseExePath = resolve(rootDir, 'src-tauri', 'target', 'release', 'greatcalc.exe')
const releasesRoot = resolve(rootDir, 'Releases', 'custom-installer')

const tauriConfig = JSON.parse(await readFile(tauriConfigPath, 'utf8'))
const productName = tauriConfig.productName ?? 'GreatCalc'
const version = tauriConfig.version ?? '0.0.0'

try {
  await access(releaseExePath)
} catch {
  throw new Error(
    `Desktop binary not found at ${releaseExePath}. Run \"npm run build:desktop\" first.`,
  )
}

const packageFolderName = `${productName}_${version}_custom-installer`
const packageDir = resolve(releasesRoot, packageFolderName)
const payloadDir = resolve(packageDir, 'payload')
const zipPath = resolve(releasesRoot, `${packageFolderName}.zip`)

await mkdir(releasesRoot, { recursive: true })
await rm(packageDir, { recursive: true, force: true })
await rm(zipPath, { force: true })

await cp(templateDir, packageDir, { recursive: true, force: true })
await mkdir(payloadDir, { recursive: true })
await cp(releaseExePath, resolve(payloadDir, basename(releaseExePath)), { force: true })
await writeFile(resolve(packageDir, 'VERSION.txt'), `${version}\n`, 'utf8')

const notes = [
  `${productName} Custom Installer Package`,
  `Version: ${version}`,
  '',
  'This installer is implemented from scratch for this project (PowerShell-based),',
  'without Inno Setup.',
  '',
  'Usage:',
  '1. Open package folder.',
  '2. Run Run-Installer.cmd (or Install-GreatCalc.ps1).',
  '3. Approve UAC prompt.',
  '',
  'Uninstall:',
  '- Run "Uninstall-GreatCalc.cmd" from installation directory,',
  '  or use Apps & Features entry "GreatCalc".',
  '',
].join('\n')

await writeFile(resolve(packageDir, 'INSTALLER-NOTES.txt'), notes, 'utf8')

const compressionCommand = [
  `$src = '${packageDir.replace(/'/g, "''")}\\*'`,
  `$dst = '${zipPath.replace(/'/g, "''")}'`,
  'Compress-Archive -Path $src -DestinationPath $dst -Force',
].join('; ')

const compression = spawnSync(
  'powershell',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', compressionCommand],
  { stdio: 'inherit' },
)

if (compression.status !== 0) {
  throw new Error('Failed to create custom installer zip package')
}

console.log(`[custom-installer] package dir: ${packageDir}`)
console.log(`[custom-installer] zip: ${zipPath}`)
