[CmdletBinding()]
param(
  [string]$InstallDir = "$env:ProgramFiles\GreatCalc",
  [switch]$NoDesktopShortcut,
  [switch]$Silent
)

$ErrorActionPreference = 'Stop'

function Write-Info {
  param([string]$Message)
  if (-not $Silent) {
    Write-Host "[GreatCalc Installer] $Message"
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
    "`"$PSCommandPath`"",
    '-InstallDir',
    "`"$InstallDir`""
  )

  if ($NoDesktopShortcut) {
    $currentArgs += '-NoDesktopShortcut'
  }

  if ($Silent) {
    $currentArgs += '-Silent'
  }

  $joined = $currentArgs -join ' '
  Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $joined | Out-Null
  exit 0
}

function New-Shortcut {
  param(
    [Parameter(Mandatory = $true)] [string]$Path,
    [Parameter(Mandatory = $true)] [string]$Target,
    [Parameter(Mandatory = $true)] [string]$WorkingDirectory,
    [Parameter(Mandatory = $true)] [string]$Description
  )

  $directory = Split-Path -Parent $Path
  New-Item -ItemType Directory -Path $directory -Force | Out-Null

  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($Path)
  $shortcut.TargetPath = $Target
  $shortcut.WorkingDirectory = $WorkingDirectory
  $shortcut.Description = $Description
  $shortcut.IconLocation = "$Target,0"
  $shortcut.Save()
}

function Register-UninstallEntry {
  param(
    [Parameter(Mandatory = $true)] [string]$InstallLocation,
    [Parameter(Mandatory = $true)] [string]$DisplayVersion
  )

  $uninstallKey = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\GreatCalc'
  New-Item -Path $uninstallKey -Force | Out-Null

  $uninstallCommand = "`"$InstallLocation\Uninstall-GreatCalc.cmd`""

  New-ItemProperty -Path $uninstallKey -Name 'DisplayName' -PropertyType String -Value 'GreatCalc' -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'DisplayVersion' -PropertyType String -Value $DisplayVersion -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'Publisher' -PropertyType String -Value 'GreatCalc Team' -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'InstallLocation' -PropertyType String -Value $InstallLocation -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'DisplayIcon' -PropertyType String -Value "$InstallLocation\greatcalc.exe" -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'UninstallString' -PropertyType String -Value $uninstallCommand -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'QuietUninstallString' -PropertyType String -Value "$uninstallCommand -Silent" -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'NoModify' -PropertyType DWord -Value 1 -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'NoRepair' -PropertyType DWord -Value 1 -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name 'InstallDate' -PropertyType String -Value (Get-Date -Format 'yyyyMMdd') -Force | Out-Null
}

Ensure-Administrator

$scriptRoot = Split-Path -Parent $PSCommandPath
$payloadExe = Join-Path $scriptRoot 'payload\greatcalc.exe'
$uninstallScriptSource = Join-Path $scriptRoot 'Uninstall-GreatCalc.ps1'

if (-not (Test-Path -LiteralPath $payloadExe)) {
  throw "Payload binary not found: $payloadExe"
}

if (-not (Test-Path -LiteralPath $uninstallScriptSource)) {
  throw "Uninstall script not found: $uninstallScriptSource"
}

$versionFile = Join-Path $scriptRoot 'VERSION.txt'
$version = if (Test-Path -LiteralPath $versionFile) {
  (Get-Content -LiteralPath $versionFile -Raw).Trim()
} else {
  '0.0.0'
}

Write-Info "Installing GreatCalc v$version to $InstallDir"

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

Get-Process -Name 'greatcalc' -ErrorAction SilentlyContinue | Stop-Process -Force

Copy-Item -LiteralPath $payloadExe -Destination (Join-Path $InstallDir 'greatcalc.exe') -Force
Copy-Item -LiteralPath $uninstallScriptSource -Destination (Join-Path $InstallDir 'Uninstall-GreatCalc.ps1') -Force

$uninstallCmdPath = Join-Path $InstallDir 'Uninstall-GreatCalc.cmd'
$uninstallCmdContent = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `"%~dp0Uninstall-GreatCalc.ps1`" %*`r`n"
Set-Content -LiteralPath $uninstallCmdPath -Value $uninstallCmdContent -Encoding ASCII

$appExe = Join-Path $InstallDir 'greatcalc.exe'
$startMenuShortcut = Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs\GreatCalc.lnk'
New-Shortcut -Path $startMenuShortcut -Target $appExe -WorkingDirectory $InstallDir -Description 'GreatCalc premium calculator'

if (-not $NoDesktopShortcut) {
  $desktopShortcut = Join-Path $env:Public 'Desktop\GreatCalc.lnk'
  New-Shortcut -Path $desktopShortcut -Target $appExe -WorkingDirectory $InstallDir -Description 'GreatCalc premium calculator'
}

Register-UninstallEntry -InstallLocation $InstallDir -DisplayVersion $version

Write-Info 'Installation completed successfully.'

if (-not $Silent) {
  Write-Host 'You can launch GreatCalc from Start Menu.'
}
