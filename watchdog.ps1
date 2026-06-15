param(
  [int]$CheckIntervalSeconds = 15,
  [string]$ApiUrl = "http://localhost:3000/health",
  [string]$WebUrl = "http://localhost:5173"
)

$Script:ApiJob = $null
$Script:WebJob = $null

function Start-Api {
  $Script:ApiJob = Start-Job -Name "api" -ScriptBlock {
    Set-Location -LiteralPath $using:PWD
    pnpm --filter api dev 2>&1
  }
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] API запущен (Job ID: $($Script:ApiJob.Id))" -ForegroundColor Green
}

function Start-Web {
  $Script:WebJob = Start-Job -Name "web" -ScriptBlock {
    Set-Location -LiteralPath $using:PWD
    pnpm --filter web dev 2>&1
  }
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Web запущен (Job ID: $($Script:WebJob.Id))" -ForegroundColor Green
}

function Check-JobHealth {
  param($Job, $Name, $Url, $StartAction)

  $jobState = $null
  try { $jobState = $Job.State } catch { $jobState = "Stopped" }

  $httpOk = $false
  try {
    $req = [System.Net.HttpWebRequest]::Create($Url)
    $req.Timeout = 5000
    $resp = $req.GetResponse()
    if ($resp.StatusCode -eq 200) { $httpOk = $true }
    $resp.Close()
  } catch { $httpOk = $false }

  if ($jobState -ne "Running" -or -not $httpOk) {
    $reason = if ($jobState -ne "Running") { "процесс остановлен ($jobState)" } else { "не отвечает по HTTP" }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Name упал: $reason" -ForegroundColor Red

    if ($Job -and $Job.State -eq "Running") {
      try { Stop-Job $Job -ErrorAction SilentlyContinue } catch {}
    }
    & $StartAction
  } else {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Name работает" -ForegroundColor Gray
  }
}

Write-Host "=== Watchdog запущен ===" -ForegroundColor Cyan
Write-Host "Проверка каждые $CheckIntervalSeconds сек" -ForegroundColor Cyan
Write-Host ""

Start-Api
Start-Web

# Дать время на запуск
Start-Sleep -Seconds 10

while ($true) {
  Write-Host ""
  Write-Host "--- Проверка $(Get-Date -Format 'HH:mm:ss') ---" -ForegroundColor Yellow
  Check-JobHealth -Job $Script:ApiJob -Name "API" -Url $ApiUrl -StartAction (Get-Command Start-Api)
  Check-JobHealth -Job $Script:WebJob -Name "Web" -Url $WebUrl -StartAction (Get-Command Start-Web)
  Start-Sleep -Seconds $CheckIntervalSeconds
}
