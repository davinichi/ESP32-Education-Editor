<#
.SYNOPSIS
  ESP32 Education Editor build verification script.

.DESCRIPTION
  Verifies the existing Editor and Firmware without intentionally modifying
  tracked source files.

  Checks performed:
    1. scripts/check_source.ps1
    2. Node.js and npm availability
    3. scratch-vm production build
    4. scratch-gui production build (build:dist)
    5. Arduino CLI availability
    6. Espressif ESP32 core availability
    7. Latest versioned firmware compile to a temporary folder
    8. Git working tree is unchanged by the build checks

  Full repository lint is intentionally not used in Ver.1 because the current
  Windows checkout contains baseline CRLF/style findings unrelated to the
  ESP32 Education Editor additions.

.PARAMETER RequireClean
  Passes -RequireClean to check_source.ps1. Use this for release checks.

.PARAMETER KeepTemp
  Keeps the temporary Arduino build/output folder for inspection.

.EXAMPLE
  .\scripts\test_build.ps1

.EXAMPLE
  .\scripts\test_build.ps1 -RequireClean
#>

[CmdletBinding()]
param(
    [switch]$RequireClean,
    [switch]$KeepTemp
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$ScriptVersion = '1.0.0'
$PassCount = 0
$WarningCount = 0
$FailCount = 0
$InfoCount = 0

function Write-Result {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('PASS', 'WARNING', 'FAIL', 'INFO')]
        [string]$Level,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [string]$Detail = ''
    )

    switch ($Level) {
        'PASS'    { $script:PassCount++ }
        'WARNING' { $script:WarningCount++ }
        'FAIL'    { $script:FailCount++ }
        'INFO'    { $script:InfoCount++ }
    }

    if ([string]::IsNullOrWhiteSpace($Detail)) {
        Write-Host ('{0,-7} {1}' -f $Level, $Name)
    }
    else {
        Write-Host ('{0,-7} {1} - {2}' -f $Level, $Name, $Detail)
    }
}

function Invoke-External {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [string[]]$Arguments = @()
    )

    $oldErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = @(& $FilePath @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldErrorActionPreference
    }

    if ($null -eq $exitCode) {
        $exitCode = 0
    }

    return [PSCustomObject]@{
        ExitCode = [int]$exitCode
        Output   = $output
    }
}

function Show-FailureTail {
    param(
        [object[]]$Output,
        [int]$Lines = 30
    )

    if ($null -eq $Output -or $Output.Count -eq 0) {
        return
    }

    Write-Host ''
    Write-Host '---- command output (tail) ----'
    $Output | Select-Object -Last $Lines | ForEach-Object { Write-Host $_ }
    Write-Host '-------------------------------'
}

function Report-KnownWarnings {
    param(
        [string]$Name,
        [object[]]$Output
    )

    if ($null -eq $Output -or $Output.Count -eq 0) {
        return
    }

    $warningLines = @(
        $Output | Where-Object {
            $line = [string]$_
            $line -match '(?i)warning' -or
            $line -match '(?i)Browserslist' -or
            $line -match '(?i)asset size limit' -or
            $line -match '(?i)entrypoint size limit' -or
            $line -match '(?i)performance recommendation' -or
            $line -match '(?i)canvas.*(not found|unresolved|resolve)'
        }
    )

    if ($warningLines.Count -gt 0) {
        Write-Result 'WARNING' $Name ("{0} warning-related line(s); build exit code was 0" -f $warningLines.Count)
    }
}

function Get-NpmPath {
    $npmCmd = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue
    if ($null -ne $npmCmd) {
        return $npmCmd.Source
    }

    $npmAny = Get-Command 'npm' -ErrorAction SilentlyContinue
    if ($null -ne $npmAny) {
        return $npmAny.Source
    }

    return $null
}

function Get-ArduinoCliPath {
    $cli = Get-Command 'arduino-cli.exe' -ErrorAction SilentlyContinue
    if ($null -eq $cli) {
        $cli = Get-Command 'arduino-cli' -ErrorAction SilentlyContinue
    }
    if ($null -ne $cli) {
        return $cli.Source
    }

    $knownPath = 'C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe'
    if (Test-Path -LiteralPath $knownPath -PathType Leaf) {
        return $knownPath
    }

    return $null
}

function Get-LatestFirmware {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FirmwareBase
    )

    if (-not (Test-Path -LiteralPath $FirmwareBase -PathType Container)) {
        return $null
    }

    $items = @()
    foreach ($dir in Get-ChildItem -LiteralPath $FirmwareBase -Directory -ErrorAction SilentlyContinue) {
        if ($dir.Name -match '^esp32_education_editor_firmware_v(\d+)_(\d+)_(\d+)$') {
            $version = New-Object -TypeName System.Version -ArgumentList ([int]$Matches[1]), ([int]$Matches[2]), ([int]$Matches[3])
            $inoPath = Join-Path $dir.FullName ($dir.Name + '.ino')
            if (Test-Path -LiteralPath $inoPath -PathType Leaf) {
                $items += [PSCustomObject]@{
                    Version = $version
                    Folder  = $dir.FullName
                    Ino     = $inoPath
                }
            }
        }
    }

    if ($items.Count -eq 0) {
        return $null
    }

    return $items | Sort-Object Version -Descending | Select-Object -First 1
}

Write-Host '============================================================'
Write-Host ' ESP32 Education Editor - Build Test'
Write-Host '============================================================'
Write-Host ''
Write-Result 'INFO' 'test_build.ps1' ("v{0}" -f $ScriptVersion)
Write-Result 'INFO' 'PowerShell' $PSVersionTable.PSVersion.ToString()

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Write-Result 'INFO' 'Project root' $ProjectRoot

Push-Location $ProjectRoot

$tempRoot = $null
$initialGitStatus = $null

try {
    # Capture the initial Git state so build checks can prove they did not alter it.
    $git = Get-Command 'git.exe' -ErrorAction SilentlyContinue
    if ($null -eq $git) {
        $git = Get-Command 'git' -ErrorAction SilentlyContinue
    }

    if ($null -ne $git) {
        $gitStatusBefore = Invoke-External -FilePath $git.Source -Arguments @('status', '--porcelain=v1', '--untracked-files=all')
        if ($gitStatusBefore.ExitCode -eq 0) {
            $initialGitStatus = ($gitStatusBefore.Output | ForEach-Object { [string]$_ }) -join "`n"
        }
    }

    # 1. Source check
    $checkSource = Join-Path $ProjectRoot 'scripts\check_source.ps1'
    if (-not (Test-Path -LiteralPath $checkSource -PathType Leaf)) {
        Write-Result 'FAIL' 'Source check' 'scripts\check_source.ps1 not found'
    }
    else {
        $sourceArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $checkSource)
        if ($RequireClean) {
            $sourceArgs += '-RequireClean'
        }

        $sourceResult = Invoke-External -FilePath 'powershell.exe' -Arguments $sourceArgs
        if ($sourceResult.ExitCode -eq 0) {
            Write-Result 'PASS' 'Source check' 'check_source.ps1 passed'
        }
        else {
            Write-Result 'FAIL' 'Source check' ("exit code {0}" -f $sourceResult.ExitCode)
            Show-FailureTail -Output $sourceResult.Output
        }
    }

    # 2. Node.js and npm
    $node = Get-Command 'node.exe' -ErrorAction SilentlyContinue
    if ($null -eq $node) {
        $node = Get-Command 'node' -ErrorAction SilentlyContinue
    }

    if ($null -eq $node) {
        Write-Result 'FAIL' 'Node.js' 'not found in PATH'
    }
    else {
        $nodeVersion = Invoke-External -FilePath $node.Source -Arguments @('--version')
        if ($nodeVersion.ExitCode -eq 0) {
            $nodeText = (($nodeVersion.Output | Select-Object -First 1) -as [string]).Trim()
            Write-Result 'PASS' 'Node.js' $nodeText
        }
        else {
            Write-Result 'FAIL' 'Node.js' ("exit code {0}" -f $nodeVersion.ExitCode)
        }
    }

    $npmPath = Get-NpmPath
    if ([string]::IsNullOrWhiteSpace($npmPath)) {
        Write-Result 'FAIL' 'npm' 'not found in PATH'
    }
    else {
        $npmVersion = Invoke-External -FilePath $npmPath -Arguments @('--version')
        if ($npmVersion.ExitCode -eq 0) {
            $npmText = (($npmVersion.Output | Select-Object -First 1) -as [string]).Trim()
            Write-Result 'PASS' 'npm' $npmText
        }
        else {
            Write-Result 'FAIL' 'npm' ("exit code {0}" -f $npmVersion.ExitCode)
        }
    }

    # 3. scratch-vm production build
    if (-not [string]::IsNullOrWhiteSpace($npmPath)) {
        $vmBuild = Invoke-External -FilePath $npmPath -Arguments @('--workspace', '@scratch/scratch-vm', 'run', 'build')
        if ($vmBuild.ExitCode -eq 0) {
            Write-Result 'PASS' 'scratch-vm build' 'production build completed'
            Report-KnownWarnings -Name 'scratch-vm build warnings' -Output $vmBuild.Output
        }
        else {
            Write-Result 'FAIL' 'scratch-vm build' ("exit code {0}" -f $vmBuild.ExitCode)
            Show-FailureTail -Output $vmBuild.Output
        }

        # 4. scratch-gui production dist build
        $guiBuild = Invoke-External -FilePath $npmPath -Arguments @('--workspace', '@scratch/scratch-gui', 'run', 'build:dist')
        if ($guiBuild.ExitCode -eq 0) {
            Write-Result 'PASS' 'scratch-gui build' 'build:dist completed'
            Report-KnownWarnings -Name 'scratch-gui build warnings' -Output $guiBuild.Output
        }
        else {
            Write-Result 'FAIL' 'scratch-gui build' ("exit code {0}" -f $guiBuild.ExitCode)
            Show-FailureTail -Output $guiBuild.Output
        }
    }

    # 5. Arduino CLI
    $arduinoCli = Get-ArduinoCliPath
    if ([string]::IsNullOrWhiteSpace($arduinoCli)) {
        Write-Result 'FAIL' 'Arduino CLI' 'arduino-cli not found'
    }
    else {
        $cliVersion = Invoke-External -FilePath $arduinoCli -Arguments @('version')
        if ($cliVersion.ExitCode -eq 0) {
            $cliText = (($cliVersion.Output | Select-Object -First 1) -as [string]).Trim()
            Write-Result 'PASS' 'Arduino CLI' $cliText
        }
        else {
            Write-Result 'FAIL' 'Arduino CLI' ("exit code {0}" -f $cliVersion.ExitCode)
        }
    }

    # 6. ESP32 core
    $esp32CoreAvailable = $false
    if (-not [string]::IsNullOrWhiteSpace($arduinoCli)) {
        $coreList = Invoke-External -FilePath $arduinoCli -Arguments @('core', 'list')
        if ($coreList.ExitCode -eq 0) {
            $coreLine = $coreList.Output | Where-Object { [string]$_ -match '^esp32:esp32\s+' } | Select-Object -First 1
            if ($null -ne $coreLine) {
                $esp32CoreAvailable = $true
                Write-Result 'PASS' 'ESP32 core' ([string]$coreLine).Trim()
            }
            else {
                Write-Result 'FAIL' 'ESP32 core' 'esp32:esp32 is not installed'
            }
        }
        else {
            Write-Result 'FAIL' 'ESP32 core' ("arduino-cli core list exit code {0}" -f $coreList.ExitCode)
        }
    }

    # 7. Compile the latest formal firmware to a temporary directory.
    $firmwareBase = Join-Path $ProjectRoot 'firmware\esp32-education-editor'
    $latestFirmware = Get-LatestFirmware -FirmwareBase $firmwareBase

    if ($null -eq $latestFirmware) {
        Write-Result 'FAIL' 'Firmware source' 'no formal versioned firmware folder found'
    }
    else {
        Write-Result 'INFO' 'Latest firmware' ("v{0} - {1}" -f $latestFirmware.Version, $latestFirmware.Folder)

        if (-not [string]::IsNullOrWhiteSpace($arduinoCli) -and $esp32CoreAvailable) {
            $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('esp32-education-editor-build-' + [Guid]::NewGuid().ToString('N'))
            $buildPath = Join-Path $tempRoot 'build'
            $outputPath = Join-Path $tempRoot 'output'
            New-Item -ItemType Directory -Path $buildPath -Force | Out-Null
            New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

            $compileArgs = @(
                'compile',
                '--fqbn', 'esp32:esp32:esp32',
                '--build-path', $buildPath,
                '--output-dir', $outputPath,
                $latestFirmware.Folder
            )

            $compileResult = Invoke-External -FilePath $arduinoCli -Arguments $compileArgs
            if ($compileResult.ExitCode -eq 0) {
                $binFiles = @(Get-ChildItem -LiteralPath $outputPath -Filter '*.bin' -File -ErrorAction SilentlyContinue)
                if ($binFiles.Count -gt 0) {
                    Write-Result 'PASS' 'Firmware compile' ("v{0}, FQBN esp32:esp32:esp32, {1} bin file(s)" -f $latestFirmware.Version, $binFiles.Count)
                }
                else {
                    Write-Result 'WARNING' 'Firmware compile output' 'compile passed but no .bin was found in output directory'
                }
                Report-KnownWarnings -Name 'Firmware compile warnings' -Output $compileResult.Output
            }
            else {
                Write-Result 'FAIL' 'Firmware compile' ("exit code {0}" -f $compileResult.ExitCode)
                Show-FailureTail -Output $compileResult.Output -Lines 40
            }
        }
    }

    # 8. Ensure the build/test process did not change the Git working tree.
    if ($null -eq $git) {
        Write-Result 'WARNING' 'Git working tree' 'git not available; final state could not be compared'
    }
    else {
        $gitStatusAfter = Invoke-External -FilePath $git.Source -Arguments @('status', '--porcelain=v1', '--untracked-files=all')
        if ($gitStatusAfter.ExitCode -ne 0) {
            Write-Result 'FAIL' 'Git working tree' ("git status exit code {0}" -f $gitStatusAfter.ExitCode)
        }
        else {
            $finalGitStatus = ($gitStatusAfter.Output | ForEach-Object { [string]$_ }) -join "`n"
            if ($initialGitStatus -eq $finalGitStatus) {
                if ([string]::IsNullOrWhiteSpace($finalGitStatus)) {
                    Write-Result 'PASS' 'Git working tree' 'clean and unchanged'
                }
                else {
                    Write-Result 'PASS' 'Git working tree' 'unchanged from test start'
                }
            }
            else {
                Write-Result 'FAIL' 'Git working tree' 'build/test changed tracked or untracked Git-visible files'
                Write-Host ''
                Write-Host '---- git status after build ----'
                if ([string]::IsNullOrWhiteSpace($finalGitStatus)) {
                    Write-Host '(clean)'
                }
                else {
                    Write-Host $finalGitStatus
                }
                Write-Host '--------------------------------'
            }
        }
    }
}
catch {
    Write-Result 'FAIL' 'Unexpected error' $_.Exception.Message
}
finally {
    if ($null -ne $tempRoot -and (Test-Path -LiteralPath $tempRoot)) {
        if ($KeepTemp) {
            Write-Result 'INFO' 'Temporary build files' $tempRoot
        }
        else {
            try {
                Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction Stop
                Write-Result 'INFO' 'Temporary build files' 'removed'
            }
            catch {
                Write-Result 'WARNING' 'Temporary build cleanup' $_.Exception.Message
            }
        }
    }

    Pop-Location
}

Write-Host ''
Write-Host '------------------------------------------------------------'
if ($FailCount -eq 0) {
    Write-Host ("Result: PASS  PASS: {0}  WARNING: {1}  FAIL: {2}  INFO: {3}" -f $PassCount, $WarningCount, $FailCount, $InfoCount)
}
else {
    Write-Host ("Result: FAIL  PASS: {0}  WARNING: {1}  FAIL: {2}  INFO: {3}" -f $PassCount, $WarningCount, $FailCount, $InfoCount)
}
Write-Host '------------------------------------------------------------'

if ($FailCount -gt 0) {
    exit 1
}

exit 0
