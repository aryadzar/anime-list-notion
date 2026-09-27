# Script PowerShell untuk menjalankan Backend & Frontend Notion Tracker
Set-Location -Path $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Memulai Backend & Frontend Notion Tracker" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

bun run dev
