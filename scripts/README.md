# Auto-Deploy Script

This script automatically triggers Vercel deployments when other team members push to the repository.

## How It Works

1. The script monitors the remote repository for new commits
2. When a new commit is detected, it:
   - Pulls the latest changes
   - Adds a newline to `.vercel-trigger` file
   - Commits and pushes the change
   - This triggers a Vercel deployment under your account

## Usage

### Basic Usage (checks every 60 seconds)
```powershell
.\scripts\auto-deploy.ps1
```

### Custom Check Interval (checks every 30 seconds)
```powershell
.\scripts\auto-deploy.ps1 -CheckIntervalSeconds 30
```

### Monitor Different Branch
```powershell
.\scripts\auto-deploy.ps1 -Branch "develop"
```

### Full Options
```powershell
.\scripts\auto-deploy.ps1 -CheckIntervalSeconds 60 -Branch "main" -TriggerFile ".vercel-trigger"
```

## Parameters

- **CheckIntervalSeconds**: How often to check for new commits (default: 60)
- **Branch**: Which branch to monitor (default: "main")
- **TriggerFile**: File to modify for triggering deployment (default: ".vercel-trigger")

## Running as Background Process

To run the script in the background:

```powershell
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PWD\scripts\auto-deploy.ps1`"" -WindowStyle Hidden
```

## Stopping the Script

If running in foreground: Press `Ctrl+C`

If running in background:
```powershell
Get-Process powershell | Where-Object {$_.MainWindowTitle -like "*auto-deploy*"} | Stop-Process
```

## Requirements

- Git must be installed and configured
- You must have push access to the repository
- PowerShell 5.1 or later

## Notes

- The script runs indefinitely until manually stopped
- Make sure you're authenticated with GitHub (SSH keys or credential manager)
- The `.vercel-trigger` file will grow over time (you can clean it up periodically)
