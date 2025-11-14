# Auto-deploy script for Vercel
# This script monitors the remote repository and triggers a deployment when new commits are detected

param(
    [int]$CheckIntervalSeconds = 60,
    [string]$Branch = "main",
    [string]$TriggerFile = ".vercel-trigger"
)

Write-Host "🚀 Auto-Deploy Monitor Started" -ForegroundColor Green
Write-Host "📋 Monitoring branch: $Branch" -ForegroundColor Cyan
Write-Host "⏱️  Check interval: $CheckIntervalSeconds seconds" -ForegroundColor Cyan
Write-Host "📝 Trigger file: $TriggerFile" -ForegroundColor Cyan
Write-Host ""

# Get initial commit hash
git fetch origin $Branch 2>$null
$lastCommit = git rev-parse origin/$Branch

Write-Host "📌 Current remote commit: $lastCommit" -ForegroundColor Yellow
Write-Host "👀 Watching for changes..." -ForegroundColor Magenta
Write-Host ""

while ($true) {
    Start-Sleep -Seconds $CheckIntervalSeconds
    
    # Fetch latest changes
    git fetch origin $Branch 2>$null
    $currentCommit = git rev-parse origin/$Branch
    
    # Check if there are new commits
    if ($currentCommit -ne $lastCommit) {
        $commitCount = git rev-list --count "$lastCommit..$currentCommit"
        Write-Host "🔔 NEW COMMITS DETECTED!" -ForegroundColor Green
        Write-Host "📊 Commits: $commitCount" -ForegroundColor Yellow
        Write-Host "🔄 Previous: $($lastCommit.Substring(0,7))" -ForegroundColor Gray
        Write-Host "✨ Current:  $($currentCommit.Substring(0,7))" -ForegroundColor Gray
        Write-Host ""
        
        # Pull the latest changes
        Write-Host "📥 Pulling latest changes..." -ForegroundColor Cyan
        git pull origin $Branch
        
        # Add a newline to trigger file
        Write-Host "📝 Updating trigger file..." -ForegroundColor Cyan
        Add-Content -Path $TriggerFile -Value "`n"
        
        # Commit and push
        Write-Host "💾 Committing trigger..." -ForegroundColor Cyan
        git add $TriggerFile
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "chore: trigger deployment [$timestamp]"
        
        Write-Host "🚀 Pushing to trigger Vercel deployment..." -ForegroundColor Green
        git push origin $Branch
        
        Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Update last commit
        $lastCommit = $currentCommit
    }
    
    Write-Host "⏳ $(Get-Date -Format 'HH:mm:ss') - No new commits. Checking again in $CheckIntervalSeconds seconds..." -ForegroundColor Gray
}
