@echo off
title Notion Tracker - Dev Server
cd /d "%~dp0"

echo ==================================================
echo   Memulai Backend & Frontend Notion Tracker
echo ==================================================
echo.

bun run dev

pause
