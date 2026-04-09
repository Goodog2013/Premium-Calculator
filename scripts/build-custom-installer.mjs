import { access, copyFile, mkdir, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = process.cwd()
const tauriConfigPath = resolve(rootDir, 'src-tauri', 'tauri.conf.json')
const desktopExePath = resolve(rootDir, 'src-tauri', 'target', 'release', 'greatcalc.exe')
const installerProjectDir = resolve(rootDir, 'installer', 'gui-installer', 'GreatCalcInstaller')
const installerProjectPath = resolve(installerProjectDir, 'GreatCalcInstaller.csproj')
const payloadPath = resolve(installerProjectDir, 'Payload', 'greatcalc.exe')
const publishDir = resolve(installerProjectDir, 'bin', 'Release', 'net8.0-windows', 'win-x64', 'publish')
const publishedInstallerExe = resolve(publishDir, 'GreatCalcInstaller.exe')
const releasesDir = resolve(rootDir, 'Releases', 'custom-installer')
const portableReleasesDir = resolve(rootDir, 'Releases', 'portable')
const portableStageDir = resolve(portableReleasesDir, 'stage')
const licensePath = resolve(rootDir, 'LICENSE')

const tauriConfig = JSON.parse(await readFile(tauriConfigPath, 'utf8'))
const productName = tauriConfig.productName ?? 'GreatCalc'
const version = tauriConfig.version ?? '0.0.0'
const fileVersion = version
  .split('.')
  .map((item) => item.trim())
  .filter((item) => item.length > 0)
  .concat(['0', '0', '0', '0'])
  .slice(0, 4)
  .join('.')

try {
  await access(desktopExePath)
} catch {
  throw new Error(`Desktop binary not found at ${desktopExePath}. Run \"npm run build:desktop\" first.`)
}

await mkdir(resolve(installerProjectDir, 'Payload'), { recursive: true })
await copyFile(desktopExePath, payloadPath)

const publishArgs = [
  'publish',
  installerProjectPath,
  '-c',
  'Release',
  '-r',
  'win-x64',
  '--self-contained',
  'true',
  '/p:PublishSingleFile=true',
  '/p:IncludeNativeLibrariesForSelfExtract=true',
  '/p:EnableCompressionInSingleFile=true',
  `/p:Version=${version}`,
  `/p:FileVersion=${fileVersion}`,
  `/p:AssemblyVersion=${fileVersion}`,
]

const publishRun = spawnSync('dotnet', publishArgs, {
  cwd: rootDir,
  stdio: 'inherit',
})

if (publishRun.status !== 0) {
  throw new Error('Failed to publish custom installer project')
}

try {
  await access(publishedInstallerExe)
} catch {
  throw new Error(`Published installer EXE not found: ${publishedInstallerExe}`)
}

await rm(releasesDir, { recursive: true, force: true })
await rm(portableStageDir, { recursive: true, force: true })
await mkdir(releasesDir, { recursive: true })
await mkdir(portableStageDir, { recursive: true })

const installerFileName = `${productName}_${version}_custom-installer.exe`
const installerOutputPath = resolve(releasesDir, installerFileName)
const portableExePath = resolve(portableStageDir, `${productName}.exe`)
const portableLicensePath = resolve(portableStageDir, 'LICENSE.txt')
const portableZipPath = resolve(portableReleasesDir, `${productName}_${version}_portable.zip`)

await rm(portableZipPath, { force: true })

await copyFile(publishedInstallerExe, installerOutputPath)
await copyFile(desktopExePath, portableExePath)
await copyFile(licensePath, portableLicensePath)

const zipRun = spawnSync(
  'powershell',
  [
    '-NoProfile',
    '-Command',
    `Compress-Archive -Path \"${portableStageDir}\\*\" -DestinationPath \"${portableZipPath}\" -Force`,
  ],
  {
    cwd: rootDir,
    stdio: 'inherit',
  },
)

if (zipRun.status !== 0) {
  throw new Error('Failed to create portable ZIP package')
}

await rm(portableStageDir, { recursive: true, force: true })

console.log(`[custom-installer] exe: ${installerOutputPath}`)
console.log(`[portable] zip: ${portableZipPath}`)
