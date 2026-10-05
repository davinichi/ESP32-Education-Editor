#requires -Version 5.1
<#
.SYNOPSIS
    ESP32 Education Editor source preflight checker.

.DESCRIPTION
    Read-only checker for the ESP32 Education Editor repository.
    It does not modify Editor or Firmware source files.

    Main checks:
      - Git repository / branch / working tree state
      - git diff --check (unstaged and staged)
      - merge conflicts
      - tracked/untracked build artifacts
      - Scratch VM extension IDs and duplicate IDs
      - extension-manager.js registration
      - Scratch GUI extension card registration
      - extension icon presence and exact SVG duplicates
      - firmware folder/file/version consistency
      - Editor -> Firmware protocol command prefix coverage

.PARAMETER ProjectRoot
    Repository root. If omitted, the script tries the parent of the script
    directory and then the current directory.

.PARAMETER RequireClean
    Treat a dirty working tree as FAIL instead of WARNING.

.PARAMETER StrictSvgDuplicates
    Treat exact duplicate SVG files across extension folders as FAIL instead
    of WARNING.

.PARAMETER NoProtocolCheck
    Skip the Editor -> Firmware protocol prefix consistency check.

.PARAMETER ReportPath
    Optional text file path. A plain-text result report is written there.

.EXAMPLE
    .\scripts\check_source.ps1

.EXAMPLE
    .\scripts\check_source.ps1 -RequireClean

.EXAMPLE
    .\scripts\check_source.ps1 -ProjectRoot C:\ESP32-Education-Editor -RequireClean
#>

[CmdletBinding()]
param(
    [string]$ProjectRoot = '',
    [switch]$RequireClean,
    [switch]$StrictSvgDuplicates,
    [switch]$NoProtocolCheck,
    [string]$ReportPath = ''
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$script:ScriptVersion = '1.0.0'

$script:Results = New-Object System.Collections.Generic.List[object]
$script:ReportLines = New-Object System.Collections.Generic.List[string]

function Add-Result {
    param(
        [ValidateSet('PASS','WARNING','FAIL','INFO')]
        [string]$Status,
        [string]$Name,
        [string]$Detail = ''
    )

    $item = [PSCustomObject]@{
        Status = $Status
        Name   = $Name
        Detail = $Detail
    }
    $script:Results.Add($item)

    $line = if ([string]::IsNullOrWhiteSpace($Detail)) {
        '{0,-7} {1}' -f $Status, $Name
    } else {
        '{0,-7} {1} - {2}' -f $Status, $Name, $Detail
    }
    $script:ReportLines.Add($line)

    switch ($Status) {
        'PASS'    { Write-Host $line -ForegroundColor Green }
        'WARNING' { Write-Host $line -ForegroundColor Yellow }
        'FAIL'    { Write-Host $line -ForegroundColor Red }
        default   { Write-Host $line -ForegroundColor Cyan }
    }
}

function Invoke-Git {
    param([Parameter(Mandatory=$true)][string[]]$Arguments)

    $output = @(& git -C $script:ProjectRoot @Arguments 2>&1)
    $code = $LASTEXITCODE
    [PSCustomObject]@{
        ExitCode = $code
        Output   = $output
        Text     = (($output | ForEach-Object { [string]$_ }) -join [Environment]::NewLine)
    }
}

function Resolve-ProjectRoot {
    param([string]$RequestedRoot)

    $candidates = New-Object System.Collections.Generic.List[string]

    if (-not [string]::IsNullOrWhiteSpace($RequestedRoot)) {
        $candidates.Add($RequestedRoot)
    }

    if (-not [string]::IsNullOrWhiteSpace($PSScriptRoot)) {
        $candidates.Add((Split-Path -Parent $PSScriptRoot))
        $candidates.Add($PSScriptRoot)
    }

    $candidates.Add((Get-Location).Path)

    foreach ($candidate in $candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
        try {
            $full = [System.IO.Path]::GetFullPath($candidate)
        } catch {
            continue
        }

        if ((Test-Path (Join-Path $full '.git')) -and
            (Test-Path (Join-Path $full 'packages')) -and
            (Test-Path (Join-Path $full 'firmware'))) {
            return $full
        }
    }

    return $null
}

function Get-FirmwareVersionInfo {
    param([System.IO.DirectoryInfo]$Directory)

    $m = [regex]::Match($Directory.Name, 'v(?<maj>\d+)_(?<min>\d+)_(?<patch>\d+)(?<dev>_dev)?$')
    if (-not $m.Success) { return $null }

    $versionText = '{0}.{1}.{2}' -f $m.Groups['maj'].Value, $m.Groups['min'].Value, $m.Groups['patch'].Value
    $isDev = $m.Groups['dev'].Success

    [PSCustomObject]@{
        Directory   = $Directory
        Version     = [version]$versionText
        Display     = if ($isDev) { 'v' + $versionText + '-dev' } else { 'v' + $versionText }
        IsDev       = $isDev
    }
}

function Get-LatestFirmwareSource {
    param([string]$FirmwareRoot)

    $items = @()
    foreach ($dir in @(Get-ChildItem -Path $FirmwareRoot -Directory -ErrorAction SilentlyContinue)) {
        $info = Get-FirmwareVersionInfo -Directory $dir
        if ($null -eq $info) { continue }

        $ino = Get-ChildItem -Path $dir.FullName -Filter '*.ino' -File -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $ino) { continue }

        $items += [PSCustomObject]@{
            Version = $info.Version
            Display = $info.Display
            IsDev   = $info.IsDev
            File    = $ino
        }
    }

    if ($items.Count -eq 0) { return $null }

    return $items |
        Sort-Object @{Expression={$_.Version};Descending=$true}, @{Expression={$_.IsDev};Descending=$false} |
        Select-Object -First 1
}

function Normalize-ProtocolPrefix {
    param([string]$Payload)

    if ([string]::IsNullOrWhiteSpace($Payload)) { return $null }

    $prefix = $Payload
    $templatePos = $prefix.IndexOf('${')
    if ($templatePos -ge 0) {
        $prefix = $prefix.Substring(0, $templatePos)
    }

    $prefix = $prefix.Trim()
    if ($prefix.Length -lt 4) { return $null }
    if ($prefix.IndexOf(':') -lt 0) { return $null }
    return $prefix
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor White
Write-Host ' ESP32 Education Editor - Source Check' -ForegroundColor White
Write-Host '============================================================' -ForegroundColor White
Write-Host ''

# 1. PowerShell / Git / repository root
Add-Result -Status 'INFO' -Name 'check_source.ps1' -Detail ('v' + $script:ScriptVersion)
Add-Result -Status 'INFO' -Name 'PowerShell' -Detail $PSVersionTable.PSVersion.ToString()

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $gitCmd) {
    Add-Result -Status 'FAIL' -Name 'Git command' -Detail 'git.exe was not found in PATH.'
    $script:ProjectRoot = $null
} else {
    Add-Result -Status 'PASS' -Name 'Git command' -Detail $gitCmd.Source
    $script:ProjectRoot = Resolve-ProjectRoot -RequestedRoot $ProjectRoot
}

if ($null -eq $script:ProjectRoot) {
    Add-Result -Status 'FAIL' -Name 'Project root' -Detail 'ESP32-Education-Editor repository root could not be resolved.'
} else {
    Add-Result -Status 'PASS' -Name 'Project root' -Detail $script:ProjectRoot
}

if ($null -ne $script:ProjectRoot) {
    # 2. Git state
    $branch = Invoke-Git -Arguments @('rev-parse','--abbrev-ref','HEAD')
    if ($branch.ExitCode -eq 0) {
        Add-Result -Status 'INFO' -Name 'Current branch' -Detail $branch.Text.Trim()
    } else {
        Add-Result -Status 'FAIL' -Name 'Current branch' -Detail $branch.Text.Trim()
    }

    $status = Invoke-Git -Arguments @('status','--porcelain')
    if ($status.ExitCode -ne 0) {
        Add-Result -Status 'FAIL' -Name 'Working tree' -Detail $status.Text.Trim()
    } elseif ([string]::IsNullOrWhiteSpace($status.Text)) {
        Add-Result -Status 'PASS' -Name 'Working tree' -Detail 'clean'
    } else {
        $count = @($status.Output | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }).Count
        $state = if ($RequireClean) { 'FAIL' } else { 'WARNING' }
        Add-Result -Status $state -Name 'Working tree' -Detail ("{0} changed/untracked item(s)" -f $count)
    }

    $conflicts = Invoke-Git -Arguments @('diff','--name-only','--diff-filter=U')
    if ($conflicts.ExitCode -eq 0 -and [string]::IsNullOrWhiteSpace($conflicts.Text)) {
        Add-Result -Status 'PASS' -Name 'Merge conflicts' -Detail 'none'
    } else {
        Add-Result -Status 'FAIL' -Name 'Merge conflicts' -Detail $conflicts.Text.Trim()
    }

    $diffCheck = Invoke-Git -Arguments @('diff','--check')
    if ($diffCheck.ExitCode -eq 0) {
        if ([string]::IsNullOrWhiteSpace($diffCheck.Text)) {
            Add-Result -Status 'PASS' -Name 'git diff --check' -Detail 'unstaged changes OK'
        } else {
            Add-Result -Status 'WARNING' -Name 'git diff --check' -Detail $diffCheck.Text.Trim()
        }
    } else {
        Add-Result -Status 'FAIL' -Name 'git diff --check' -Detail $diffCheck.Text.Trim()
    }

    $cachedCheck = Invoke-Git -Arguments @('diff','--cached','--check')
    if ($cachedCheck.ExitCode -eq 0) {
        if ([string]::IsNullOrWhiteSpace($cachedCheck.Text)) {
            Add-Result -Status 'PASS' -Name 'git diff --cached --check' -Detail 'staged changes OK'
        } else {
            Add-Result -Status 'WARNING' -Name 'git diff --cached --check' -Detail $cachedCheck.Text.Trim()
        }
    } else {
        Add-Result -Status 'FAIL' -Name 'git diff --cached --check' -Detail $cachedCheck.Text.Trim()
    }

    # 3. Build/generated artifacts under firmware source tree
    $firmwareRoot = Join-Path $script:ProjectRoot 'firmware\esp32-education-editor'
    if (Test-Path $firmwareRoot) {
        $buildDirs = @(Get-ChildItem -Path $firmwareRoot -Directory -Recurse -Filter 'build' -ErrorAction SilentlyContinue)
        if ($buildDirs.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Firmware build folders' -Detail 'none in source tree'
        } else {
            $rel = @($buildDirs | ForEach-Object { $_.FullName.Substring($script:ProjectRoot.Length).TrimStart('\','/') })
            Add-Result -Status 'WARNING' -Name 'Firmware build folders' -Detail (($rel | Select-Object -First 5) -join ', ')
        }

        $tracked = Invoke-Git -Arguments @('ls-files','firmware/esp32-education-editor')
        if ($tracked.ExitCode -eq 0) {
            $badTracked = @($tracked.Output | Where-Object {
                $p = [string]$_
                ($p -match '(^|/)build(/|$)') -or ($p -match '\.(bin|elf|hex|map)$')
            })
            if ($badTracked.Count -eq 0) {
                Add-Result -Status 'PASS' -Name 'Tracked build artifacts' -Detail 'none'
            } else {
                Add-Result -Status 'FAIL' -Name 'Tracked build artifacts' -Detail (($badTracked | Select-Object -First 8) -join ', ')
            }
        } else {
            Add-Result -Status 'FAIL' -Name 'Tracked build artifacts' -Detail $tracked.Text.Trim()
        }
    } else {
        Add-Result -Status 'FAIL' -Name 'Firmware source root' -Detail $firmwareRoot
    }

    # 4. ESP32 Scratch extensions
    $vmExtRoot = Join-Path $script:ProjectRoot 'packages\scratch-vm\src\extensions'
    $managerPath = Join-Path $script:ProjectRoot 'packages\scratch-vm\src\extension-support\extension-manager.js'
    $guiIndexPath = Join-Path $script:ProjectRoot 'packages\scratch-gui\src\lib\libraries\extensions\index.jsx'
    $guiExtRoot = Join-Path $script:ProjectRoot 'packages\scratch-gui\src\lib\libraries\extensions'

    if ((Test-Path $vmExtRoot) -and (Test-Path $managerPath) -and (Test-Path $guiIndexPath)) {
        $managerText = Get-Content -Path $managerPath -Raw -Encoding UTF8
        $guiText = Get-Content -Path $guiIndexPath -Raw -Encoding UTF8

        $extensionRows = @()
        $extensionDirs = @(Get-ChildItem -Path $vmExtRoot -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like 'scratch3_esp32edu*' })

        foreach ($dir in $extensionDirs) {
            $indexJs = Join-Path $dir.FullName 'index.js'
            if (-not (Test-Path $indexJs)) { continue }

            $text = Get-Content -Path $indexJs -Raw -Encoding UTF8
            $idMatch = [regex]::Match($text, 'id\s*:\s*[''"](?<id>esp32edu[a-zA-Z0-9_-]+)[''"]')
            if (-not $idMatch.Success) {
                $extensionRows += [PSCustomObject]@{ Folder=$dir.Name; Id=$null; File=$indexJs }
                continue
            }

            $extensionRows += [PSCustomObject]@{
                Folder = $dir.Name
                Id     = $idMatch.Groups['id'].Value
                File   = $indexJs
            }
        }

        if ($extensionRows.Count -gt 0) {
            Add-Result -Status 'PASS' -Name 'ESP32 VM extensions' -Detail ("{0} extension(s) found" -f $extensionRows.Count)
        } else {
            Add-Result -Status 'FAIL' -Name 'ESP32 VM extensions' -Detail 'No scratch3_esp32edu* extension was found.'
        }

        $missingIds = @($extensionRows | Where-Object { [string]::IsNullOrWhiteSpace($_.Id) } | ForEach-Object { $_.Folder })
        if ($missingIds.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Extension IDs' -Detail 'all detected'
        } else {
            Add-Result -Status 'FAIL' -Name 'Extension IDs' -Detail ('Missing ID: ' + ($missingIds -join ', '))
        }

        $duplicateGroups = @($extensionRows | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Id) } | Group-Object Id | Where-Object { $_.Count -gt 1 })
        if ($duplicateGroups.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Duplicate extension IDs' -Detail 'none'
        } else {
            $dupText = @($duplicateGroups | ForEach-Object { $_.Name + ' x' + $_.Count }) -join ', '
            Add-Result -Status 'FAIL' -Name 'Duplicate extension IDs' -Detail $dupText
        }

        $managerMissing = @()
        $guiMissing = @()
        $iconMissing = @()

        foreach ($ext in @($extensionRows | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Id) })) {
            $managerPattern = [regex]::Escape($ext.Id) + '\s*:\s*\(\)\s*=>\s*require\([''"]\.\./extensions/' + [regex]::Escape($ext.Folder) + '[''"]\)'
            if (-not [regex]::IsMatch($managerText, $managerPattern)) {
                $managerMissing += $ext.Id
            }

            $guiPattern = 'extensionId\s*:\s*[''"]' + [regex]::Escape($ext.Id) + '[''"]'
            $hasGuiCard = [regex]::IsMatch($guiText, $guiPattern)
            if (-not $hasGuiCard) {
                $guiMissing += $ext.Id
            } else {
                $iconDir = Join-Path $guiExtRoot $ext.Id
                $icon = Join-Path $iconDir ($ext.Id + '.svg')
                $small = Join-Path $iconDir ($ext.Id + '-small.svg')
                if (-not (Test-Path $icon) -or -not (Test-Path $small)) {
                    $iconMissing += $ext.Id
                }
            }
        }

        if ($managerMissing.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Extension manager registration' -Detail 'all ESP32 extensions registered'
        } else {
            Add-Result -Status 'FAIL' -Name 'Extension manager registration' -Detail ('Missing: ' + ($managerMissing -join ', '))
        }

        if ($guiMissing.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'GUI extension cards' -Detail 'all ESP32 extensions registered'
        } else {
            Add-Result -Status 'FAIL' -Name 'GUI extension cards' -Detail ('Missing: ' + ($guiMissing -join ', '))
        }

        if ($iconMissing.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Extension icons' -Detail 'main/small SVG files present'
        } else {
            Add-Result -Status 'FAIL' -Name 'Extension icons' -Detail ('Missing icon file(s): ' + ($iconMissing -join ', '))
        }

        $svgFiles = @(Get-ChildItem -Path $guiExtRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like 'esp32edu*' } |
            ForEach-Object { Get-ChildItem -Path $_.FullName -Filter '*.svg' -File -ErrorAction SilentlyContinue })

        $svgHashes = @($svgFiles | ForEach-Object {
            [PSCustomObject]@{
                File = $_
                Hash = (Get-FileHash -Path $_.FullName -Algorithm SHA256).Hash
                Folder = $_.Directory.Name
            }
        })

        $duplicateSvgs = @($svgHashes | Group-Object Hash | Where-Object {
            $_.Count -gt 1 -and (@($_.Group | Select-Object -ExpandProperty Folder -Unique).Count -gt 1)
        })

        if ($duplicateSvgs.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Exact duplicate SVG icons' -Detail 'none across ESP32 extension folders'
        } else {
            $details = @($duplicateSvgs | ForEach-Object {
                (@($_.Group | ForEach-Object { $_.File.Name + '@' + $_.Folder }) -join ' = ')
            }) -join '; '
            $svgState = if ($StrictSvgDuplicates) { 'FAIL' } else { 'WARNING' }
            Add-Result -Status $svgState -Name 'Exact duplicate SVG icons' -Detail $details
        }
    } else {
        Add-Result -Status 'FAIL' -Name 'Editor extension structure' -Detail 'VM extension root, extension-manager.js, or GUI index.jsx is missing.'
        $extensionRows = @()
    }

    # 5. Firmware naming/version consistency
    if (Test-Path $firmwareRoot) {
        $firmwareDirs = @(Get-ChildItem -Path $firmwareRoot -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^esp32_education_editor_firmware_v' })
        $fwProblems = @()
        $fwValid = 0

        foreach ($dir in $firmwareDirs) {
            $info = Get-FirmwareVersionInfo -Directory $dir
            if ($null -eq $info) {
                $fwProblems += ($dir.Name + ': unrecognized version folder name')
                continue
            }

            $inoFiles = @(Get-ChildItem -Path $dir.FullName -Filter '*.ino' -File -ErrorAction SilentlyContinue)
            if ($inoFiles.Count -ne 1) {
                $fwProblems += ($dir.Name + ': expected exactly one .ino file, found ' + $inoFiles.Count)
                continue
            }

            $ino = $inoFiles[0]
            if ($ino.BaseName -ne $dir.Name) {
                $fwProblems += ($dir.Name + ': folder/file base name mismatch (' + $ino.Name + ')')
            }

            $text = Get-Content -Path $ino.FullName -Raw -Encoding UTF8
            $header = [regex]::Match($text, 'Common Firmware\s+(?<ver>v\d+\.\d+\.\d+(?:-dev)?)')
            if (-not $header.Success) {
                $fwProblems += ($dir.Name + ': firmware version header not found')
            } elseif ($header.Groups['ver'].Value -ne $info.Display) {
                $fwProblems += ($dir.Name + ': header=' + $header.Groups['ver'].Value + ', expected=' + $info.Display)
            }

            $fwValid++
        }

        if ($firmwareDirs.Count -eq 0) {
            Add-Result -Status 'FAIL' -Name 'Firmware sources' -Detail 'No versioned firmware folder found.'
        } elseif ($fwProblems.Count -eq 0) {
            Add-Result -Status 'PASS' -Name 'Firmware naming/version' -Detail ("{0} versioned source folder(s) checked" -f $fwValid)
        } else {
            Add-Result -Status 'FAIL' -Name 'Firmware naming/version' -Detail (($fwProblems | Select-Object -First 8) -join '; ')
        }

        $latestFirmware = Get-LatestFirmwareSource -FirmwareRoot $firmwareRoot
        if ($null -ne $latestFirmware) {
            Add-Result -Status 'INFO' -Name 'Latest firmware source' -Detail ($latestFirmware.Display + ' - ' + ($latestFirmware.File.FullName.Substring($script:ProjectRoot.Length) -replace '^[\\/]+',''))
        } else {
            Add-Result -Status 'FAIL' -Name 'Latest firmware source' -Detail 'Could not resolve a firmware source.'
        }
    } else {
        $latestFirmware = $null
    }

    # 6. Editor -> Firmware protocol prefix coverage
    if (-not $NoProtocolCheck) {
        if (($null -ne $latestFirmware) -and (Test-Path $vmExtRoot)) {
            $firmwareText = Get-Content -Path $latestFirmware.File.FullName -Raw -Encoding UTF8
            $prefixes = New-Object System.Collections.Generic.List[string]

            $jsFiles = @(Get-ChildItem -Path $vmExtRoot -Directory -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -like 'scratch3_esp32edu*' } |
                ForEach-Object { Get-ChildItem -Path $_.FullName -Filter 'index.js' -File -ErrorAction SilentlyContinue })

            foreach ($js in $jsFiles) {
                $jsText = Get-Content -Path $js.FullName -Raw -Encoding UTF8
                $matches = [regex]::Matches($jsText, 'sendLine\(\s*(?:`(?<bt>[^`]+)`|''(?<sq>[^'']+)''|"(?<dq>[^"]+)")\s*\)')
                foreach ($m in $matches) {
                    $payload = if ($m.Groups['bt'].Success) { $m.Groups['bt'].Value } elseif ($m.Groups['sq'].Success) { $m.Groups['sq'].Value } else { $m.Groups['dq'].Value }
                    $prefix = Normalize-ProtocolPrefix -Payload $payload
                    if (-not [string]::IsNullOrWhiteSpace($prefix)) {
                        if (-not $prefixes.Contains($prefix)) { $prefixes.Add($prefix) }
                    }
                }
            }

            $missingPrefixes = @($prefixes | Where-Object { -not $firmwareText.Contains($_) })
            if ($prefixes.Count -eq 0) {
                Add-Result -Status 'WARNING' -Name 'Editor/Firmware protocol' -Detail 'No sendLine protocol prefix could be extracted.'
            } elseif ($missingPrefixes.Count -eq 0) {
                Add-Result -Status 'PASS' -Name 'Editor/Firmware protocol' -Detail ("{0} command prefix(es) found in {1}" -f $prefixes.Count, $latestFirmware.Display)
            } else {
                Add-Result -Status 'FAIL' -Name 'Editor/Firmware protocol' -Detail ('Not found in ' + $latestFirmware.Display + ': ' + (($missingPrefixes | Select-Object -First 12) -join ', '))
            }
        } else {
            Add-Result -Status 'FAIL' -Name 'Editor/Firmware protocol' -Detail 'Required Editor or Firmware source was not found.'
        }
    } else {
        Add-Result -Status 'INFO' -Name 'Editor/Firmware protocol' -Detail 'skipped by -NoProtocolCheck'
    }
}

Write-Host ''
Write-Host '------------------------------------------------------------' -ForegroundColor White

$passCount = @($script:Results | Where-Object { $_.Status -eq 'PASS' }).Count
$warnCount = @($script:Results | Where-Object { $_.Status -eq 'WARNING' }).Count
$failCount = @($script:Results | Where-Object { $_.Status -eq 'FAIL' }).Count
$infoCount = @($script:Results | Where-Object { $_.Status -eq 'INFO' }).Count
$resultText = if ($failCount -eq 0) { 'PASS' } else { 'FAIL' }

$summary = 'Result: {0}  PASS: {1}  WARNING: {2}  FAIL: {3}  INFO: {4}' -f $resultText, $passCount, $warnCount, $failCount, $infoCount
if ($failCount -eq 0) {
    Write-Host $summary -ForegroundColor Green
} else {
    Write-Host $summary -ForegroundColor Red
}
Write-Host '------------------------------------------------------------' -ForegroundColor White

$script:ReportLines.Add('')
$script:ReportLines.Add($summary)

if (-not [string]::IsNullOrWhiteSpace($ReportPath)) {
    try {
        $reportFullPath = [System.IO.Path]::GetFullPath($ReportPath)
        $reportParent = Split-Path -Parent $reportFullPath
        if (-not [string]::IsNullOrWhiteSpace($reportParent) -and -not (Test-Path $reportParent)) {
            New-Item -ItemType Directory -Path $reportParent -Force | Out-Null
        }
        [System.IO.File]::WriteAllLines($reportFullPath, $script:ReportLines, (New-Object System.Text.UTF8Encoding($true)))
        Write-Host ('Report: ' + $reportFullPath) -ForegroundColor Cyan
    } catch {
        Write-Host ('WARNING  Report file could not be written - ' + $_.Exception.Message) -ForegroundColor Yellow
    }
}

if ($failCount -gt 0) {
    exit 1
}
exit 0
