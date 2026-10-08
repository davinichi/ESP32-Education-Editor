#requires -Version 5.1
<#
.SYNOPSIS
    Read-only repository backup with firmware v0.1.7, for Windows PowerShell 5.1.
.EXAMPLE
    .\scripts\backup_project.ps1 -BackupRoot F:\ESP32_Backup
#>
[CmdletBinding()]
param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$BackupRoot)
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$SourceRoot = 'C:\ESP32-Education-Editor'
$PagesRoot = 'C:\davinichi.github.io'
$ExpectedHash = '53255551385AC31A10B2C1B7E3F5BFD0350E8907EA7FB4C0CDD43FBFFC07F4B1'
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
Write-Host '============================================================'
Write-Host ' ESP32 Education Editor - Backup Tool'
Write-Host '============================================================'
Write-Result 'INFO' 'backup_project.ps1 - v1.0.0'
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
    $firmwareName = 'esp32_education_editor_firmware_v0_1_7'
    $files = @(
        (Join-Path $SourceRoot "firmware\esp32-education-editor\$firmwareName\$firmwareName.ino")
        (Join-Path $PagesRoot "firmware\firmware\$firmwareName.ino.merged.bin")
        (Join-Path $PagesRoot 'firmware\manifest.json')
        (Join-Path $PagesRoot 'firmware\SHA256SUMS.txt')
        (Join-Path $PagesRoot 'firmware\RELEASE_NOTES_firmware-v0.1.7.md')
    )
    foreach ($file in $files) {
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Required firmware file missing: $file" }
    }
    $date = Get-Date
    $name = 'ESP32_Education_Editor_Backup_' + $date.ToString('yyyy-MM-dd_HHmm')
    $finalDirectory = Join-Path $destination $name
    $candidate = $finalDirectory + '.INCOMPLETE'
    if ((Test-Path -LiteralPath $finalDirectory) -or (Test-Path -LiteralPath $candidate)) { throw "Backup destination already exists: $finalDirectory" }
    $null = New-Item -ItemType Directory -Path $destination -Force
    $null = New-Item -ItemType Directory -Path $candidate
    $BackupDirectory = $candidate
    $bundleDirectory = Join-Path $BackupDirectory 'repositories'
    $firmwareDirectory = Join-Path $BackupDirectory 'firmware-v0.1.7'
    $null = New-Item -ItemType Directory -Path $bundleDirectory, $firmwareDirectory
    foreach ($repo in @(@($SourceRoot, 'ESP32-Education-Editor'), @($PagesRoot, 'davinichi.github.io'))) {
        $bundleName = $repo[1] + '.bundle'
        $bundle = Join-Path $bundleDirectory $bundleName
        $null = Read-Git $repo[0] @('bundle', 'create', $bundle, '--all')
        Write-Result 'PASS' $bundleName
        $null = Read-Git $repo[0] @('bundle', 'verify', $bundle)
        Write-Result 'PASS' "$bundleName verify"
    }
    foreach ($file in $files) {
        Copy-Item -LiteralPath $file -Destination $firmwareDirectory
        Write-Result 'PASS' ([IO.Path]::GetFileName($file))
    }
    $binary = Join-Path $firmwareDirectory "$firmwareName.ino.merged.bin"
    if ((Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash -ine $ExpectedHash) { throw 'Firmware v0.1.7 SHA-256 does not match the official hash.' }
    $checksumLines = @(Get-Content -LiteralPath (Join-Path $firmwareDirectory 'SHA256SUMS.txt') | Where-Object {
        $_ -match ('^([0-9a-fA-F]{64})\s+\*?firmware/' + [regex]::Escape("$firmwareName.ino.merged.bin") + '$')
    })
    if ($checksumLines.Count -ne 1 -or ($checksumLines[0] -split '\s+')[0] -ine $ExpectedHash) { throw 'SHA256SUMS.txt does not contain the official v0.1.7 checksum.' }
    Write-Result 'PASS' 'Firmware SHA-256 and SHA256SUMS.txt'
    $info = @('Backup Tool Version: 1.0.0', "Backup date/time: $($date.ToString('o'))", "Computer name: $env:COMPUTERNAME") +
        @(Get-RepositoryInfo $SourceRoot 'Source') + @(Get-RepositoryInfo $PagesRoot 'Pages') +
        @('Firmware version: v0.1.7', "Backup destination: $finalDirectory")
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
        'Firmware v0.1.7 merged.bin is preserved directly without recompilation.'
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
