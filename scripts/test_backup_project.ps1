#requires -Version 5.1
# Run with Windows PowerShell: .\scripts\test_backup_project.ps1
$ErrorActionPreference = 'Stop'
$tokens = $null
$parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile(
    (Join-Path $PSScriptRoot 'backup_project.ps1'), [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count) { throw ($parseErrors | Out-String) }
# Load only the validator; never execute the backup against real repositories.
$function = $ast.Find({ param($node)
    $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and
    $node.Name -eq 'Test-FirmwarePackage'
}, $true)
if (-not $function) { throw 'Test-FirmwarePackage validator is missing.' }
. ([scriptblock]::Create($function.Extent.Text))
$root = Join-Path ([IO.Path]::GetTempPath()) ('backup-test-' + [guid]::NewGuid())
$name = 'esp32_education_editor_firmware_v1_0_0.ino.merged.bin'
$relative = 'firmware/' + $name
$passed = 0
function Save-Manifest {
    param($Version = '1.0.0', $Path = $relative, $Offset = 0, $Chip = 'ESP32')
    @{ version = $Version; builds = @(@{ chipFamily = $Chip; parts = @(@{ path = $Path; offset = $Offset }) }) } |
        ConvertTo-Json -Depth 6 | Set-Content (Join-Path $root 'manifest.json') -Encoding UTF8
}
function Assert-Rejected {
    param([string]$Label)
    $rejected = $false
    try { Test-FirmwarePackage $root '1.0.0' $relative $hash } catch { $rejected = $true }
    if (-not $rejected) { throw "Unexpected acceptance: $Label" }
    $script:passed++
    Write-Host "PASS reject $Label"
}
try {
    $null = New-Item -ItemType Directory (Join-Path $root 'firmware')
    $binary = Join-Path $root $relative
    [IO.File]::WriteAllBytes($binary, [byte[]](1, 2, 3, 4))
    $hash = (Get-FileHash $binary -Algorithm SHA256).Hash
    $checksum = Join-Path $root 'SHA256SUMS.txt'
    "$hash  $relative" | Set-Content $checksum
    Save-Manifest
    Test-FirmwarePackage $root '1.0.0' $relative $hash
    $passed++
    Write-Host 'PASS matching package'
    Save-Manifest -Version '0.1.7'; Assert-Rejected 'old manifest version'
    Save-Manifest -Path 'firmware/esp32_education_editor_firmware_v0_1_7.ino.merged.bin'; Assert-Rejected 'old binary reference'
    Save-Manifest -Path '../outside.bin'; Assert-Rejected 'path traversal'
    Save-Manifest -Offset 4096; Assert-Rejected 'nonzero offset'
    Save-Manifest -Chip 'ESP32-S3'; Assert-Rejected 'wrong chip'
    Save-Manifest
    [IO.File]::WriteAllBytes($binary, [byte[]](4, 3, 2, 1))
    Assert-Rejected 'corrupt binary'
    [IO.File]::WriteAllBytes($binary, [byte[]](1, 2, 3, 4))
    (('0' * 64) + "  $relative") | Set-Content $checksum
    Assert-Rejected 'wrong checksum'
    @("$hash  $relative", "$hash  $relative") | Set-Content $checksum
    Assert-Rejected 'duplicate checksum'
    "$hash  firmware/other.bin" | Set-Content $checksum
    Assert-Rejected 'missing checksum entry'
    "$hash  $relative" | Set-Content $checksum
    '{invalid' | Set-Content (Join-Path $root 'manifest.json')
    Assert-Rejected 'invalid JSON'
    Save-Manifest
    Remove-Item $binary
    Assert-Rejected 'missing binary'
    Write-Host "PASS: $passed"
} finally {
    if (Test-Path $root) { Remove-Item -LiteralPath $root -Recurse -Force }
}
