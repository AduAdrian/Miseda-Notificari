# cPanel Git Deployment Guide for Notification App

## Overview
This guide explains how to deploy your notification app to misedainspectsrl.ro using cPanel's Git deployment feature.

## Prerequisites
- cPanel hosting account with Git Version Control enabled
- SSH access to your hosting account
- Your notification app repository on GitHub

## Step 1: Enable Git in cPanel

1. **Log into cPanel** for misedainspectsrl.ro
2. **Navigate to Git Version Control** (under Software/Services section)
3. **Click "Create" to add a new repository**

## Step 2: Configure Repository Settings

1. **Repository Path**: `/home/[username]/repositories/notification-app`
2. **Repository URL**: `https://github.com/[your-username]/[your-repo-name].git`
3. **Branch**: `master` (or `main` if that's your default)
4. **Document Root**: Check "Use document root as deployment path"

## Step 3: Set Up SSH Keys (Recommended for Security)

Instead of using passwords, set up SSH keys for secure authentication:

1. **Generate SSH key pair** in cPanel SSH Access:
   - Go to SSH Access → Manage SSH Keys
   - Click "Generate a New Key"
   - Use a descriptive name like "notification-app-deploy"

2. **Add public key to GitHub**:
   - Copy the public key from cPanel
   - Go to GitHub → Settings → SSH and GPG Keys
   - Add the new SSH key

3. **Update repository URL** to use SSH:
   - Change from HTTPS to: `git@github.com:[username]/[repo-name].git`

## Step 4: Configure Environment Variables

Create environment variables in cPanel for production:

1. **Go to Node.js Selector** in cPanel
2. **Select your app** and click "Setup Node.js App"
3. **Add environment variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_NAME=[your_database_name]
   DB_USER=[your_database_user]
   DB_PASS=[your_database_password]
   ```

## Step 5: Database Setup

1. **Create MySQL database** in cPanel → MySQL Databases
2. **Import database schema**:
   - Use phpMyAdmin or command line
   - Import from `server/database.sql`

## Step 6: Deploy the Application

1. **Initial deployment**:
   - In Git Version Control, click "Update from Remote" 
   - This will pull the latest code and run the `.cpanel.yml` deployment tasks

2. **Verify deployment**:
   - Check that files are copied to public_html
   - Verify Node.js app is configured in Node.js Selector

## Step 7: Configure Node.js App

1. **Go to Node.js Selector**
2. **Create new app**:
   - App root: `public_html`
   - Startup file: `server.js`
   - App mode: `Production`

## Automatic vs Manual Deployment

### Automatic Deployment (Recommended)
- **Enable**: Check "Enable automatic deployments" in Git settings
- **Benefit**: Updates automatically when you push to GitHub
- **Trigger**: Any push to the configured branch

### Manual Deployment
- **Process**: Click "Update from Remote" in cPanel Git interface
- **Use case**: When you want control over deployment timing

## Deployment Process Explanation

The `.cpanel.yml` file automates:
1. **Server setup**: Copies server files to public_html
2. **Dependencies**: Installs production npm packages
3. **Client build**: Builds React app and copies to public_html
4. **Cleanup**: Excludes development files from deployment

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data
3. **Enable SSH keys** instead of password authentication
4. **Regularly update dependencies** for security patches

## Immediate Testing Steps

### 1. Test Basic Hosting (First Step)
1. **Upload test file**: Upload the `index.html` from your repository root
2. **Visit**: https://misedainspectsrl.ro/index.html
3. **Expected**: Should see the "Notification App" landing page
4. **If 404 error**: Contact hosting provider to verify domain points to correct directory

### 2. Quick Deployment Test
```bash
# Commit and push the test page
git add index.html
git commit -m "Add temporary landing page for deployment testing"
git push origin master
```

### 3. Verify cPanel Git Setup
1. **Check Git Version Control** in cPanel
2. **Verify repository is connected** and pulling from correct branch
3. **Run manual deployment** by clicking "Update from Remote"
4. **Check deployment logs** for any errors

## Troubleshooting

### 404 Error (Current Issue):
- **Cause**: Application not yet deployed or incorrect document root
- **Solution 1**: Follow Step 1 above to test basic hosting
- **Solution 2**: Verify cPanel Git deployment is configured correctly
- **Solution 3**: Check if files are in public_html directory

### Common Issues:
- **Permission errors**: Check file permissions (755 for directories, 644 for files)
- **Module not found**: Ensure dependencies are listed in package.json
- **Database connection**: Verify environment variables and database credentials
- **Port conflicts**: Check that the assigned port matches your server configuration
- **Git deployment fails**: Verify SSH keys are set up correctly
- **Build errors**: Check Node.js version compatibility in cPanel Node.js Selector

### DNS and Domain Issues:
- **Domain not pointing to hosting**: Verify nameservers in domain registrar
- **SSL certificate missing**: Enable SSL/TLS in cPanel
- **Subdomain issues**: Configure subdomains in cPanel if needed

### Logs Location:
- **Application logs**: Check Node.js app logs in cPanel
- **Deployment logs**: Available in Git Version Control interface
- **Server logs**: Access via cPanel File Manager or SSH
- **Build logs**: Available in .cpanel.yml deployment output

## Support Resources
- [cPanel Git Documentation](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/)
- [Node.js App Management](https://docs.cpanel.net/cpanel/software/node-js-selector/)
- Contact your hosting provider for cPanel-specific support

## Quick Reference Commands

```bash
# Update repository manually (if needed)
git pull origin master

# Restart Node.js app (via cPanel interface)
# Go to Node.js Selector → Restart

# Check app status
# Monitor via Node.js Selector dashboard
```