#!/bin/bash

# Auto-deploy script for Vercel
# This script monitors the remote repository and triggers a deployment when new commits are detected

# Configuration
CHECK_INTERVAL=${1:-60}  # Default: check every 60 seconds
BRANCH=${2:-main}         # Default: main branch
TRIGGER_FILE=".vercel-trigger"
REPO_PATH=${3:-$(pwd)}    # Default: current directory

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
GRAY='\033[0;37m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Auto-Deploy Monitor Started${NC}"
echo -e "${CYAN}📋 Monitoring branch: $BRANCH${NC}"
echo -e "${CYAN}⏱️  Check interval: $CHECK_INTERVAL seconds${NC}"
echo -e "${CYAN}📝 Trigger file: $TRIGGER_FILE${NC}"
echo -e "${CYAN}📂 Repository path: $REPO_PATH${NC}"
echo ""

cd "$REPO_PATH" || exit 1

# Get initial commit hash
git fetch origin "$BRANCH" 2>/dev/null
LAST_COMMIT=$(git rev-parse origin/"$BRANCH")

echo -e "${YELLOW}📌 Current remote commit: $LAST_COMMIT${NC}"
echo -e "${MAGENTA}👀 Watching for changes...${NC}"
echo ""

while true; do
    sleep "$CHECK_INTERVAL"
    
    # Fetch latest changes
    git fetch origin "$BRANCH" 2>/dev/null
    CURRENT_COMMIT=$(git rev-parse origin/"$BRANCH")
    
    # Check if there are new commits
    if [ "$CURRENT_COMMIT" != "$LAST_COMMIT" ]; then
        COMMIT_COUNT=$(git rev-list --count "$LAST_COMMIT".."$CURRENT_COMMIT")
        echo -e "${GREEN}🔔 NEW COMMITS DETECTED!${NC}"
        echo -e "${YELLOW}📊 Commits: $COMMIT_COUNT${NC}"
        echo -e "${GRAY}🔄 Previous: ${LAST_COMMIT:0:7}${NC}"
        echo -e "${GRAY}✨ Current:  ${CURRENT_COMMIT:0:7}${NC}"
        echo ""
        
        # Pull the latest changes
        echo -e "${CYAN}📥 Pulling latest changes...${NC}"
        if git pull origin "$BRANCH"; then
            # Add a newline to trigger file
            echo -e "${CYAN}📝 Updating trigger file...${NC}"
            echo "" >> "$TRIGGER_FILE"
            
            # Commit and push
            echo -e "${CYAN}💾 Committing trigger...${NC}"
            git add "$TRIGGER_FILE"
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
            git commit -m "chore: trigger deployment [$TIMESTAMP]"
            
            echo -e "${GREEN}🚀 Pushing to trigger Vercel deployment...${NC}"
            if git push origin "$BRANCH"; then
                echo -e "${GREEN}✅ Deployment triggered successfully!${NC}"
            else
                echo -e "${RED}❌ Failed to push changes${NC}"
            fi
            echo ""
        else
            echo -e "${RED}❌ Failed to pull changes${NC}"
            echo ""
        fi
        
        # Update last commit
        LAST_COMMIT=$CURRENT_COMMIT
    fi
    
    echo -e "${GRAY}⏳ $(date '+%H:%M:%S') - No new commits. Checking again in $CHECK_INTERVAL seconds...${NC}"
done
