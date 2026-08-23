[CmdletBinding()]
param(
    [string] $Destination
)

$ErrorActionPreference = 'Stop'
$pluginRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$pluginName = Split-Path -Leaf $pluginRoot

if ([string]::IsNullOrWhiteSpace($Destination)) {
    $Destination = Join-Path (Split-Path -Parent $pluginRoot) ($pluginName + '.zip')
}
$destinationPath = [System.IO.Path]::GetFullPath($Destination)
$temporaryParent = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$temporaryRoot = Join-Path $temporaryParent ('expert-wage-calculator-package-' + [guid]::NewGuid().ToString('N'))
$stagedPlugin = Join-Path $temporaryRoot $pluginName

$directories = @('assets', 'includes', 'languages', 'templates')
$files = @(
    'expert-wage-calculator.php',
    'readme.txt',
    'uninstall.php',
    'LICENSE'
)

New-Item -ItemType Directory -Path $stagedPlugin | Out-Null

try {
    foreach ($directory in $directories) {
        Copy-Item -LiteralPath (Join-Path $pluginRoot $directory) -Destination $stagedPlugin -Recurse
    }
    foreach ($file in $files) {
        Copy-Item -LiteralPath (Join-Path $pluginRoot $file) -Destination $stagedPlugin
    }

    if (Test-Path -LiteralPath $destinationPath) {
        Remove-Item -LiteralPath $destinationPath
    }
    Compress-Archive -LiteralPath $stagedPlugin -DestinationPath $destinationPath

    $archive = Get-Item -LiteralPath $destinationPath
    Write-Output ('Created {0} ({1} bytes)' -f $archive.FullName, $archive.Length)
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        $resolvedTemporaryRoot = (Resolve-Path -LiteralPath $temporaryRoot).Path
        if (-not $resolvedTemporaryRoot.StartsWith($temporaryParent, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw 'Refusing to remove a temporary directory outside the system temporary path.'
        }
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse
    }
}
