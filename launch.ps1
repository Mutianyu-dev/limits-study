$root = $PSScriptRoot
$node = "C:\Users\Le'novo\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
$ok = $false
try {
    $r = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:8787/api/health" -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ok = $true }
} catch { }
if (-not $ok) {
    Start-Process -FilePath $node -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden
    Start-Sleep -Seconds 2
}
Start-Process "http://127.0.0.1:8787"