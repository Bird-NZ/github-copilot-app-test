param(
  [string]$WslIp = "172.21.66.48",
  [int]$Port = 3210
)

Write-Host "Configuring LAN access for Mission Control on port $Port -> $WslIp:$Port"

netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$Port | Out-Null
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$Port connectaddress=$WslIp connectport=$Port

$ruleName = "Mission Control LAN $Port"
if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port | Out-Null
}

Write-Host "Done. Open from this PC: http://localhost:$Port"
Write-Host "Open from LAN devices: http://<windows-lan-ip>:$Port"
Write-Host "Check current portproxy rules with: netsh interface portproxy show v4tov4"
