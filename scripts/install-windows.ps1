<#
PowerShell installer for Tauri-generated Windows installer (MSI/EXE)
Place this script in the repo and run from an elevated PowerShell prompt:

# Example (run as Administrator):
# PowerShell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1

This script searches `src-tauri\target\release\bundle` for the first
*.msi or *.exe and attempts an elevated, mostly silent install.
#>

Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $scriptDir\.. | Out-Null

# If node_modules missing, run npm ci
if (-not (Test-Path -Path .\node_modules)) {
    Write-Host "node_modules not found — running npm ci (may take a while)..."
    npm ci
}

Write-Host "Building frontend and Tauri bundle..."
# npm run tauri:build will invoke the frontend build via beforeBuildCommand if configured
npm run tauri:build

$searchRoot = Join-Path (Get-Location) 'src-tauri\target\release\bundle'
$fullSearchRoot = Resolve-Path -Path $searchRoot -ErrorAction SilentlyContinue

if (-not $fullSearchRoot) {
    Write-Error "Bundle folder not found: $searchRoot"
    Pop-Location
    exit 1
}

Write-Host "Searching for installers under: $fullSearchRoot"

# Prefer MSI, then EXE
$installer = Get-ChildItem -Path $fullSearchRoot -Recurse -Include *.msi -File -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $installer) {
    $installer = Get-ChildItem -Path $fullSearchRoot -Recurse -Include *.exe -File -ErrorAction SilentlyContinue | Select-Object -First 1
}

if (-not $installer) {
    Write-Error "No .msi or .exe installer found under $fullSearchRoot"
    Pop-Location
    exit 1
}

$installerPath = $installer.FullName
Write-Host "Found installer: $installerPath"

try {
    if ($installerPath.ToLower().EndsWith('.msi')) {
        Write-Host "Running msiexec install (quiet)..."
        $args = "/i `"$installerPath`" /qn /norestart"
        Start-Process -FilePath "msiexec.exe" -ArgumentList $args -Verb RunAs -Wait
        Write-Host "MSI installer finished."
    }
    else {
        Write-Host "Installer is an EXE. Attempting silent install with common /S flag."
        $silentArgs = '/S'
        try {
            Start-Process -FilePath $installerPath -ArgumentList $silentArgs -Verb RunAs -Wait
            Write-Host "EXE installer finished (invoked with $silentArgs)."
        } catch {
            Write-Warning "Silent install failed or requires different flags. Running interactively instead."
            Start-Process -FilePath $installerPath -Verb RunAs -Wait
        }
    }
    Write-Host "Installation complete."
    Write-Host "You can run the application from the Start menu or by executing the installed binary."
} finally {
    Pop-Location
}

exit 0
