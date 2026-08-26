[CmdletBinding()]
param(
    [string] $Destination
)

$ErrorActionPreference = 'Stop'
$pluginRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

Push-Location -LiteralPath $pluginRoot
try {
    & node (Join-Path $PSScriptRoot 'build-packages.js')
    if ($LASTEXITCODE -ne 0) {
        throw "build-packages.js failed with exit code $LASTEXITCODE."
    }

    $manifestPath = Join-Path $pluginRoot 'dist\manifest.json'
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $wordpressOrgZip = Join-Path $pluginRoot ('dist\' + $manifest.packages.'wordpress-org'.file)
    $installZip = Join-Path $pluginRoot ('dist\' + $manifest.packages.install.file)

    if (-not [string]::IsNullOrWhiteSpace($Destination)) {
        $destinationPath = [System.IO.Path]::GetFullPath($Destination)
        $destinationDir = Split-Path -Parent $destinationPath
        if (-not (Test-Path -LiteralPath $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir | Out-Null
        }
        Copy-Item -LiteralPath $wordpressOrgZip -Destination $destinationPath -Force
        Write-Output ('Copied WordPress.org ZIP to {0}' -f $destinationPath)
    }

    Write-Output ('WordPress.org ZIP: {0}' -f $wordpressOrgZip)
    Write-Output ('Install ZIP: {0}' -f $installZip)
}
finally {
    Pop-Location
}
