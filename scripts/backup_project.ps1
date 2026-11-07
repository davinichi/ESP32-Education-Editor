#requires -Version 5.1
<#
.SYNOPSIS
    Read-only repository backup with firmware v1.0.0 and v0.1.7 archives, for Windows PowerShell 5.1.
.EXAMPLE
    .\scripts\backup_project.ps1 -BackupRoot F:\ESP32_Backup
#>
[CmdletBinding()]
param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$BackupRoot)
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$SourceRoot = 'C:\ESP32-Education-Editor'
$PagesRoot = 'C:\davinichi.github.io'
$ExpectedHash = '7eeb0088ea8cb27d4a1d8c8874f68f9260c3282292e42b374065cf15fbe167da'
$LegacyHash = '53255551385ac31a10b2c1b7e3f5bfd0350e8907ea7fb4c0cdd43fbffc07f4b1'
$FirmwareName = 'esp32_education_editor_firmware_v1_0_0'
$BinaryPath = "firmware/$FirmwareName.ino.merged.bin"
$SourcePath = "firmware/esp32-education-editor/$FirmwareName"
# Git blob IDs of the complete sketch published at firmware-v1.0.0 (63dc35b6).
$SourceBlobs = @{
    'esp32_education_editor_firmware_v1_0_0.ino' = '1ccea6f63e93df1c04687deecad2646f8d933d31'
    'BME280Checked.h' = '74adfa4d18851b4d95de7b6b2c65e604c40203bf'
}
$Counts = @{ PASS = 0; WARNING = 0; FAIL = 0; INFO = 0 }
$BackupDirectory = $null

function Write-Result {
    param([ValidateSet('PASS', 'WARNING', 'FAIL', 'INFO')][string]$Level, [string]$Name)
    $Counts[$Level]++
    Write-Host ('{0,-7} {1}' -f $Level, $Name)
}
function Invoke-External {
    param([string]$Command, [string[]]$Arguments)
    # Successful native diagnostics on stderr must not become terminating errors in PS 5.1.
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& $Command @Arguments 2>&1)
        $code = $LASTEXITCODE
    } finally { $ErrorActionPreference = $previousPreference }
    if ($code -ne 0) { throw "$Command failed (exit $code)." }
    return ($output | ForEach-Object { "$_" })
}
function Read-Git {
    param([string]$Root, [string[]]$Arguments)
    return @(Invoke-External 'git' (@('-C', $Root) + $Arguments))
}
function Get-RepositoryInfo {
    param([string]$Root, [string]$Label)
    $branch = (Read-Git $Root @('branch', '--show-current')) -join ''
    if (-not $branch) { $branch = '(detached HEAD)' }
    $urls = @()
    foreach ($remote in @(Read-Git $Root @('remote'))) {
        $url = (Read-Git $Root @('remote', 'get-url', $remote)) -join ''
        # Keep only host/path, never userinfo, query credentials, or fragments.
        if ($url -match '^[a-zA-Z][a-zA-Z0-9+.-]*://') {
            $url = ($url -replace '^([a-zA-Z][a-zA-Z0-9+.-]*://)[^/]*@', '$1') -replace '[?#].*$', ''
        } elseif ($url -match '^[^/\\]+@[^:]+:') {
            $url = ($url -replace '^[^@]+@', '') -replace '[?#].*$', ''
        } else { $url = '[non-URL remote omitted]' }
        $urls += $url
    }
    return @("$Label repository path: $Root", "$Label branch: $branch",
        "$Label HEAD commit: $((Read-Git $Root @('rev-parse', 'HEAD')) -join '')",
        "$Label remote URL: $($urls -join '; ')")
}
function Get-OptionalVersion {
    param([string]$Label, [string]$Command, [string[]]$Arguments)
    try {
        $value = (Invoke-External $Command $Arguments) -join '; '
        return "$Label`: $value"
    } catch {
        Write-Result 'WARNING' "$Label unavailable"
        return "$Label`: unavailable"
    }
}
function Test-FirmwarePackage {
    param([string]$Root, [string]$Version, [string]$RelativeBinary, [string]$Hash)
    $manifest = Get-Content -LiteralPath (Join-Path $Root 'manifest.json') -Raw | ConvertFrom-Json
    if ($manifest.version -cne $Version -or @($manifest.builds).Count -ne 1) {
        throw "Manifest must select Firmware $Version with exactly one build."
    }
    $build = @($manifest.builds)[0]
    if ($build.chipFamily -cne 'ESP32' -or @($build.parts).Count -ne 1) {
        throw 'Manifest must contain one ESP32 merged image.'
    }
    $part = @($build.parts)[0]
    if ($part.path -cne $RelativeBinary -or $null -eq $part.offset -or $part.offset -ne 0) {
        throw "Manifest must reference $RelativeBinary at offset 0."
    }
    $binary = Join-Path $Root $RelativeBinary
    if ((Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash -ine $Hash) {
        throw "Firmware $Version SHA-256 does not match the official hash."
    }
    $lines = @(Get-Content -LiteralPath (Join-Path $Root 'SHA256SUMS.txt') | Where-Object {
        $_ -match ('^([0-9a-fA-F]{64})\s+\*?' + [regex]::Escape($RelativeBinary) + '$')
    })
    if ($lines.Count -ne 1 -or ($lines[0] -split '\s+')[0] -ine $Hash) {
        throw "SHA256SUMS.txt must contain exactly one official $Version checksum."
    }
}
Write-Host '============================================================'
Write-Host ' ESP32 Education Editor - Backup Tool'
Write-Host '============================================================'
Write-Result 'INFO' 'backup_project.ps1 - v1.1.0'
try {
    $dirty = $false
    foreach ($repo in @(@($SourceRoot, 'Source'), @($PagesRoot, 'Pages'))) {
        $top = (Read-Git $repo[0] @('rev-parse', '--show-toplevel')) -join ''
        if ([IO.Path]::GetFullPath($top).TrimEnd('\') -ine $repo[0].TrimEnd('\')) {
            throw "$($repo[1]) path is not the repository root."
        }
        $status = @(Read-Git $repo[0] @('status', '--porcelain', '--untracked-files=all'))
        if ($status.Count -gt 0) {
            Write-Result 'FAIL' "$($repo[1]) repository - working tree is not clean"
            $status | ForEach-Object { Write-Host $_ }
            $dirty = $true
        } else { Write-Result 'PASS' "$($repo[1]) repository - clean" }
    }
    if ($dirty) { throw 'Backup not started. Both repositories must be clean.' }
    $destination = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($BackupRoot)
    $destination = [IO.Path]::GetFullPath($destination)
    foreach ($root in @($SourceRoot, $PagesRoot)) {
        if ($destination.TrimEnd('\') -ieq $root -or $destination.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) {
            throw 'BackupRoot must be outside both repositories.'
        }
    }
    # A junction or symlink must not redirect output into a source repository.
    $ancestor = $destination
    while ($ancestor) {
        if (Test-Path -LiteralPath $ancestor) {
            $item = Get-Item -LiteralPath $ancestor -Force
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Reparse-point destination ancestor: $ancestor" }
        }
        $ancestor = [IO.Path]::GetDirectoryName($ancestor.TrimEnd('\'))
    }
    $legacyName = 'esp32_education_editor_firmware_v0_1_7'
    $installerRoot = Join-Path $PagesRoot 'firmware'
    $files = @(
        (Join-Path $SourceRoot "firmware\esp32-education-editor\$legacyName\$legacyName.ino")
        (Join-Path $PagesRoot "firmware\firmware\$legacyName.ino.merged.bin")
        (Join-Path $PagesRoot 'firmware\RELEASE_NOTES_firmware-v0.1.7.md')
    )
    foreach ($file in $files) {
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Required firmware file missing: $file" }
    }
    Test-FirmwarePackage $installerRoot '1.0.0' $BinaryPath $ExpectedHash
    foreach ($entry in $SourceBlobs.GetEnumerator()) {
        $path = "$SourcePath/$($entry.Key)"
        $blob = (Read-Git $SourceRoot @('rev-parse', "HEAD:$path")) -join ''
        if ($blob -cne $entry.Value) { throw "Firmware source differs from the published v1.0.0 source: $path" }
        if (-not (Test-Path -LiteralPath (Join-Path $SourceRoot $path) -PathType Leaf)) { throw "Required source missing: $path" }
    }
    $sourceFiles = @(Read-Git $SourceRoot @('ls-tree', '-r', '--name-only', 'HEAD', '--', $SourcePath))
    if ($sourceFiles.Count -ne $SourceBlobs.Count) { throw 'Firmware v1.0.0 sketch file set differs from the published source.' }
    $releaseNotes = Join-Path $installerRoot 'RELEASE_NOTES_firmware-v1.0.0.md'
    if (-not (Test-Path -LiteralPath $releaseNotes -PathType Leaf)) { throw "Required release notes missing: $releaseNotes" }
    Write-Result 'PASS' 'Published v1.0.0 source, manifest, binary and checksum'
    $date = Get-Date
    $name = 'ESP32_Education_Editor_Backup_' + $date.ToString('yyyy-MM-dd_HHmm')
    $finalDirectory = Join-Path $destination $name
    $candidate = $finalDirectory + '.INCOMPLETE'
    if ((Test-Path -LiteralPath $finalDirectory) -or (Test-Path -LiteralPath $candidate)) { throw "Backup destination already exists: $finalDirectory" }
    $null = New-Item -ItemType Directory -Path $destination -Force
    $null = New-Item -ItemType Directory -Path $candidate
    $BackupDirectory = $candidate
    $bundleDirectory = Join-Path $BackupDirectory 'repositories'
    $firmwareDirectory = Join-Path $BackupDirectory 'firmware-v1.0.0'
    $legacyDirectory = Join-Path $BackupDirectory 'firmware-v0.1.7'
    $null = New-Item -ItemType Directory -Path $bundleDirectory, $firmwareDirectory, $legacyDirectory
    foreach ($repo in @(@($SourceRoot, 'ESP32-Education-Editor'), @($PagesRoot, 'davinichi.github.io'))) {
        $bundleName = $repo[1] + '.bundle'
        $bundle = Join-Path $bundleDirectory $bundleName
        $null = Read-Git $repo[0] @('bundle', 'create', $bundle, '--all')
        Write-Result 'PASS' $bundleName
        $null = Read-Git $repo[0] @('bundle', 'verify', $bundle)
        Write-Result 'PASS' "$bundleName verify"
    }
    # Keep manifest-relative binary paths intact. Preserve historical binaries too,
    # so every entry in the original installer checksum file can be verified.
    $binaryDirectory = Join-Path $firmwareDirectory 'firmware'
    $sketchDirectory = Join-Path $firmwareDirectory "source\$FirmwareName"
    $null = New-Item -ItemType Directory -Path $binaryDirectory, $sketchDirectory
    foreach ($entry in $SourceBlobs.GetEnumerator()) {
        $source = Join-Path $SourceRoot "$SourcePath/$($entry.Key)"
        $target = Join-Path $sketchDirectory $entry.Key
        Copy-Item -LiteralPath $source -Destination $target
        # --path applies the same Git clean filters as the committed sketch (CRLF).
        $blob = (Read-Git $SourceRoot @('hash-object', "--path=$SourcePath/$($entry.Key)", $target)) -join ''
        if ($blob -cne $entry.Value) { throw "Copied firmware source differs from release: $target" }
    }
    foreach ($line in @(Get-Content -LiteralPath (Join-Path $installerRoot 'SHA256SUMS.txt'))) {
        if (-not $line.Trim()) { continue }
        if ($line -notmatch '^([0-9a-fA-F]{64})\s+\*?(firmware/[A-Za-z0-9_.-]+\.bin)$') {
            throw "Unsupported installer checksum entry: $line"
        }
        $checksumHash = $Matches[1]
        $relative = $Matches[2]
        $target = Join-Path $firmwareDirectory $relative
        if (Test-Path -LiteralPath $target) { throw "Duplicate installer checksum entry: $relative" }
        Copy-Item -LiteralPath (Join-Path $installerRoot $relative) -Destination $target
        if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ine $checksumHash) {
            throw "Installer binary checksum mismatch: $relative"
        }
    }
    foreach ($nameToCopy in @('manifest.json', 'SHA256SUMS.txt', 'RELEASE_NOTES_firmware-v1.0.0.md')) {
        Copy-Item -LiteralPath (Join-Path $installerRoot $nameToCopy) -Destination $firmwareDirectory
    }
    Test-FirmwarePackage $firmwareDirectory '1.0.0' $BinaryPath $ExpectedHash
    Write-Result 'PASS' 'Copied v1.0.0 package and historical installer binaries'
    foreach ($file in $files) {
        Copy-Item -LiteralPath $file -Destination $legacyDirectory
        Write-Result 'PASS' ([IO.Path]::GetFileName($file))
    }
    $binary = Join-Path $legacyDirectory "$legacyName.ino.merged.bin"
    if ((Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash -ine $LegacyHash) { throw 'Firmware v0.1.7 SHA-256 does not match the official hash.' }
    "$LegacyHash  $legacyName.ino.merged.bin" | Set-Content -LiteralPath (Join-Path $legacyDirectory 'SHA256SUMS.txt') -Encoding UTF8
    'Historical archive only. No current manifest is included. Flash this merged image at offset 0 only when intentionally restoring v0.1.7.' |
        Set-Content -LiteralPath (Join-Path $legacyDirectory 'ARCHIVE_README.txt') -Encoding UTF8
    Write-Result 'PASS' 'Historical v0.1.7 archive and checksum'
    $info = @('Backup Tool Version: 1.1.0', "Backup date/time: $($date.ToString('o'))", "Computer name: $env:COMPUTERNAME") +
        @(Get-RepositoryInfo $SourceRoot 'Source') + @(Get-RepositoryInfo $PagesRoot 'Pages') +
        @('Firmware version: v1.0.0', 'Firmware release date: 2026-10-20',
          "Firmware official SHA-256: $ExpectedHash", 'Historical firmware archive: v0.1.7', "Backup destination: $finalDirectory")
    $info | Set-Content -LiteralPath (Join-Path $BackupDirectory 'BACKUP_INFO.txt') -Encoding UTF8
    Write-Result 'PASS' 'BACKUP_INFO.txt'
    $environment = @("PowerShell version: $($PSVersionTable.PSVersion)")
    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $environment += "Windows version: $($os.Caption) $($os.Version) (build $($os.BuildNumber))"
    } catch {
        $environment += 'Windows version: unavailable'
        Write-Result 'WARNING' 'Windows version unavailable'
    }
    $environment += Get-OptionalVersion 'Git version' 'git' @('--version')
    $environment += Get-OptionalVersion 'Node.js version' 'node' @('--version')
    $environment += Get-OptionalVersion 'npm version' 'npm.cmd' @('--version')
    $cli = 'C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe'
    if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) {
        $command = Get-Command arduino-cli.exe -ErrorAction SilentlyContinue
        if ($command) { $cli = $command.Source } else { $cli = $null }
    }
    if ($cli) {
        $environment += "Arduino CLI path: $cli"
        $environment += Get-OptionalVersion 'Arduino CLI version' $cli @('version')
        try {
            $cores = @(Invoke-External $cli @('core', 'list'))
            $esp32 = @($cores | Where-Object { $_ -match '^esp32:esp32\s+' })
            if ($esp32.Count -eq 0) { throw 'ESP32 Arduino Core not found' }
            $version = ($esp32[0] -split '\s+')[1]
            $environment += "Installed ESP32 Arduino Core version: esp32:esp32 $version"
            if ($version -ne '3.2.1') { Write-Result 'WARNING' "ESP32 Arduino Core is $version; verified version is 3.2.1" }
        } catch {
            $environment += 'Installed ESP32 Arduino Core version: unavailable'
            Write-Result 'WARNING' 'Installed ESP32 Arduino Core version unavailable'
        }
    } else {
        $environment += @('Arduino CLI path: unavailable', 'Arduino CLI version: unavailable', 'Installed ESP32 Arduino Core version: unavailable')
        Write-Result 'WARNING' 'Arduino CLI and ESP32 Arduino Core information unavailable'
    }
    $environment | Set-Content -LiteralPath (Join-Path $BackupDirectory 'ENVIRONMENT.txt') -Encoding UTF8
    Write-Result 'PASS' 'ENVIRONMENT.txt'
    $guide = @(
        'Restore into destinations that do not already exist. From the repositories folder:'
        'git clone ESP32-Education-Editor.bundle C:\ESP32-Education-Editor'
        'git clone davinichi.github.io.bundle C:\davinichi.github.io'
        ''
        'Bundles contain committed history and refs, not uncommitted or ignored files,'
        'node_modules, Git configuration, credentials, or external toolchains.'
        'Refer to BACKUP_INFO.txt for original branches and HEAD commits. Select the'
        'original branch or detached commit explicitly if clone selects another branch.'
        'Restore remote URLs separately with your own credentials. Clone uses the bundle as origin.'
        'Rebuild Node.js, npm, Arduino CLI, and ESP32 Arduino Core 3.2.1 separately,'
        'using ENVIRONMENT.txt as a reference. Dependencies are not included in bundles.'
        'Firmware v1.0.0 merged.bin is preserved directly without recompilation.'
        'The v1.0.0 source sketch includes BME280Checked.h; keep the entire source sketch folder.'
        'Keep firmware-v1.0.0/manifest.json beside its firmware/ subfolder; do not flatten paths.'
        'The firmware-v1.0.0 package is firmware data, not the complete browser Installer UI.'
        'Restore the Installer UI from the Pages bundle, then verify its manifest and binary.'
        'firmware-v0.1.7 is a historical archive without a current manifest; do not mix versions.'
        'Verify each relative path in BACKUP_SHA256SUMS.txt with Get-FileHash -Algorithm SHA256.'
        'Do not use a folder ending in .INCOMPLETE; that backup did not finish.'
    )
    $guide | Set-Content -LiteralPath (Join-Path $BackupDirectory 'RESTORE_GUIDE.txt') -Encoding UTF8
    Write-Result 'PASS' 'RESTORE_GUIDE.txt'
    foreach ($root in @($SourceRoot, $PagesRoot)) {
        if (@(Read-Git $root @('status', '--porcelain', '--untracked-files=all')).Count -gt 0) { throw "Repository changed during backup: $root" }
    }
    $hashes = @(Get-ChildItem -LiteralPath $BackupDirectory -File -Recurse | Sort-Object FullName | ForEach-Object {
        $relative = $_.FullName.Substring($BackupDirectory.Length + 1).Replace('\', '/')
        '{0}  {1}' -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash, $relative
    })
    $hashes | Set-Content -LiteralPath (Join-Path $BackupDirectory 'BACKUP_SHA256SUMS.txt') -Encoding UTF8
    Write-Result 'PASS' 'Backup checksums'
    Rename-Item -LiteralPath $BackupDirectory -NewName $name
    $BackupDirectory = $null
    Write-Result 'INFO' "Backup destination: $finalDirectory"
} catch {
    Write-Result 'FAIL' $_.Exception.Message
    if ($BackupDirectory) { Write-Result 'WARNING' "Unfinished backup retained: $BackupDirectory" }
}
Write-Host '============================================================'
if ($Counts.FAIL -eq 0) { Write-Host ' Backup completed successfully.' }
else { Write-Host ' Backup failed.' }
Write-Host (' PASS: {0}  WARNING: {1}  FAIL: {2}' -f $Counts.PASS, $Counts.WARNING, $Counts.FAIL)
Write-Host '============================================================'
if ($Counts.FAIL -gt 0) { exit 1 }
exit 0
