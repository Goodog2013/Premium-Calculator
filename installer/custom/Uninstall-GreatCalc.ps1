[CmdletBinding()]
param(
  [string]$InstallDir = '',
  [switch]$Silent
)

$ErrorActionPreference = 'Stop'

function Write-Info {
  param([string]$Message)
  if (-not $Silent) {
    Write-Host "[GreatCalc Uninstall] $Message"
  }
}

function Ensure-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)

  if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    return
  }

  Write-Info 'Requesting administrator permissions...'

  $currentArgs = @(
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    "`"$PSCommandPath`""
  )

  if ($InstallDir) {
    $currentArgs += @('-InstallDir', "`"$InstallDir`"")
  }

  if ($Silent) {
    $currentArgs += '-Silent'
  }

  $joined = $currentArgs -join ' '
  Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $joined | Out-Null
  exit 0
}

function Remove-Shortcut {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Force
  }
}

function Resolve-SafeInstallDir {
  param([string]$InputDir)

  if ($InputDir) {
    return $InputDir
  }

  return Split-Path -Parent $PSCommandPath
}

Ensure-Administrator

$targetDir = Resolve-SafeInstallDir -InputDir $InstallDir

if (-not (Test-Path -LiteralPath $targetDir)) {
  Write-Info "Install directory not found: $targetDir"
  exit 0
}

$fullPath = (Resolve-Path -LiteralPath $targetDir).Path
$programFiles = $env:ProgramFiles
$programFilesX86 = ${env:ProgramFiles(x86)}

$isSafe = $false
if ($programFiles -and $fullPath.StartsWith($programFiles, [System.StringComparison]::OrdinalIgnoreCase)) {
  $isSafe = $true
}
if (-not $isSafe -and $programFilesX86 -and $fullPath.StartsWith($programFilesX86, [System.StringComparison]::OrdinalIgnoreCase)) {
  $isSafe = $true
}
if (-not $isSafe -and $fullPath.ToLower().Contains('greatcalc')) {
  $isSafe = $true
}

if (-not $isSafe) {
  throw "Refusing to remove unexpected directory: $fullPath"
}

Write-Info "Uninstalling GreatCalc from $fullPath"

Get-Process -Name 'greatcalc' -ErrorAction SilentlyContinue | Stop-Process -Force

Remove-Shortcut -Path (Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs\GreatCalc.lnk')
Remove-Shortcut -Path (Join-Path $env:Public 'Desktop\GreatCalc.lnk')

$uninstallKey = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\GreatCalc'
if (Test-Path -LiteralPath $uninstallKey) {
  Remove-Item -LiteralPath $uninstallKey -Recurse -Force
}

Remove-Item -LiteralPath $fullPath -Recurse -Force

Write-Info 'Uninstall completed.'
