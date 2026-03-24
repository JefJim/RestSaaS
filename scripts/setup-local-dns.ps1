# Local DNS Setup Helper (TableHive)
# This script adds local subdomain entries to your Windows hosts file.
# MUST BE RUN AS ADMINISTRATOR.

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entries = @(
    "127.0.0.1 myplatform.localhost",
    "127.0.0.1 pizzaluna.localhost",
    "127.0.0.1 sushitime.localhost"
)

Write-Host "--- TableHive Local DNS Helper ---" -ForegroundColor Cyan

foreach ($entry in $entries) {
    if (Get-Content $hostsPath | Select-String -Pattern $entry) {
        Write-Host "Already exists: $entry" -ForegroundColor DarkGray
    } else {
        Write-Host "Adding entry: $entry" -ForegroundColor Yellow
        Add-Content $hostsPath "`n$entry"
    }
}

Write-Host "`nLocal DNS setup complete! You can now test:" -ForegroundColor Green
Write-Host "  - http://pizzaluna.localhost:3000/menu"
Write-Host "  - http://sushitime.localhost:3000/menu"
