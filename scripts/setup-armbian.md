# Setting Up Auto-Deploy on Armbian Server

## Step 1: Transfer Files to Server

```bash
# From your local machine, copy the script to your server
scp scripts/auto-deploy.sh user@your-server-ip:/home/user/
scp .vercel-trigger user@your-server-ip:/path/to/repo/
```

## Step 2: Setup Repository on Server

```bash
# SSH into your Armbian server
ssh user@your-server-ip

# Clone the repository if not already done
cd /home/user
git clone https://github.com/IrfanUnisg/Bloem.git
cd Bloem

# Copy the script to the scripts folder
mv ~/auto-deploy.sh scripts/
chmod +x scripts/auto-deploy.sh
```

## Step 3: Configure Git Credentials

### Option A: SSH Keys (Recommended)
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub

# Add the key to GitHub:
# Go to GitHub → Settings → SSH and GPG keys → New SSH key
# Paste the key and save
```

### Option B: Personal Access Token
```bash
# Configure git to use credential helper
git config --global credential.helper store

# First push will ask for credentials
# Username: your-github-username
# Password: your-personal-access-token (not your password!)
```

## Step 4: Test the Script

```bash
cd /home/user/Bloem
./scripts/auto-deploy.sh
```

## Step 5: Run as Background Service with systemd

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/auto-deploy.service
```

Add this content:

```ini
[Unit]
Description=Auto-Deploy Monitor for Bloem
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/user/Bloem
ExecStart=/bin/bash /home/user/Bloem/scripts/auto-deploy.sh 60 main
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable auto-deploy.service

# Start the service
sudo systemctl start auto-deploy.service

# Check status
sudo systemctl status auto-deploy.service

# View logs
sudo journalctl -u auto-deploy.service -f
```

## Step 6: Management Commands

```bash
# Stop the service
sudo systemctl stop auto-deploy.service

# Restart the service
sudo systemctl restart auto-deploy.service

# Disable autostart
sudo systemctl disable auto-deploy.service

# View real-time logs
sudo journalctl -u auto-deploy.service -f

# View last 100 lines
sudo journalctl -u auto-deploy.service -n 100
```

## Alternative: Using Screen (Simpler)

If you don't want to use systemd:

```bash
# Install screen
sudo apt-get update
sudo apt-get install screen

# Start a new screen session
screen -S auto-deploy

# Run the script
cd /home/user/Bloem
./scripts/auto-deploy.sh

# Detach from screen: Press Ctrl+A then D

# Reattach later
screen -r auto-deploy

# Kill the screen session
screen -X -S auto-deploy quit
```

## Alternative: Using nohup (Simplest)

```bash
cd /home/user/Bloem
nohup ./scripts/auto-deploy.sh > auto-deploy.log 2>&1 &

# View logs
tail -f auto-deploy.log

# Stop the process
ps aux | grep auto-deploy.sh
kill <PID>
```

## Configuration Options

The script accepts parameters:

```bash
# Syntax: ./auto-deploy.sh [CHECK_INTERVAL] [BRANCH] [REPO_PATH]

# Check every 30 seconds
./scripts/auto-deploy.sh 30

# Monitor develop branch
./scripts/auto-deploy.sh 60 develop

# Custom repo path
./scripts/auto-deploy.sh 60 main /path/to/repo
```

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/auto-deploy.sh
```

### Git Authentication Issues
```bash
# Test git access
git pull origin main

# If fails, reconfigure credentials
git config --global credential.helper store
```

### Service Won't Start
```bash
# Check service status
sudo systemctl status auto-deploy.service

# Check logs
sudo journalctl -u auto-deploy.service -n 50

# Check file permissions
ls -la /home/user/Bloem/scripts/auto-deploy.sh
```

## Security Notes

1. **Use SSH keys** instead of passwords for better security
2. **Limit SSH access** to your server (use SSH keys, disable password auth)
3. **Consider firewall rules** to protect your server
4. **Regular updates**: Keep your Armbian system updated
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

## Monitoring

Check that it's working:

```bash
# View service logs
sudo journalctl -u auto-deploy.service -f

# Check last 20 commits
git log --oneline -20

# Check if trigger file is being updated
git log --follow .vercel-trigger
```
