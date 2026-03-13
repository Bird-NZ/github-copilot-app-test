param(
  [int]$Port = 3210
)

$ruleName = "Mission Control LAN $Port"
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$Port | Out-Null
Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule | Out-Null
Write-Host "Removed LAN exposure for Mission Control on port $Port"
