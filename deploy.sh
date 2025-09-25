#!/bin/bash

# Miseda Inspect SRL - Notification App Deployment Script
# Auto-deploy script pentru repository separat cu build folder deploy

echo "🚀 Starting deployment for Miseda-Notificari..."

# Paths
REPO_DIR="/home/misedain/repositories/Miseda-Notificari"
PUBLIC_HTML="/home/misedain/public_html"
BUILD_DIR="$REPO_DIR/client/build"
SERVER_DIR="$REPO_DIR/server"

# Check if repository exists
if [ ! -d "$REPO_DIR" ]; then
    echo "❌ Repository directory not found: $REPO_DIR"
    exit 1
fi

# Navigate to repository
cd $REPO_DIR
echo "📁 Changed to repository directory: $REPO_DIR"

# Pull latest changes
echo "📡 Pulling latest changes from master..."
git pull origin master

# Check if Node.js build directory exists
if [ -d "$BUILD_DIR" ]; then
    echo "✅ Build directory found: $BUILD_DIR"
    
    # Clean public_html (preserve .htaccess and other important files)
    echo "🧹 Cleaning public_html directory..."
    find $PUBLIC_HTML -mindepth 1 \
        ! -name '.htaccess' \
        ! -name '.well-known' \
        ! -name 'cgi-bin' \
        ! -name '_errors' \
        ! -name 'cpanel-logs' \
        -delete
    
    # Copy build folder contents to public_html
    echo "📦 Copying build files to public_html..."
    cp -r $BUILD_DIR/* $PUBLIC_HTML/
    
    # Copy server files if needed (for API endpoints)
    if [ -d "$SERVER_DIR" ]; then
        echo "🖥️ Copying server files..."
        cp -r $SERVER_DIR/* $PUBLIC_HTML/
        
        # Copy package.json for dependencies
        if [ -f "$REPO_DIR/package.json" ]; then
            cp $REPO_DIR/package.json $PUBLIC_HTML/
        fi
        
        # Install production dependencies
        cd $PUBLIC_HTML
        if [ -f "package.json" ]; then
            echo "📦 Installing production dependencies..."
            npm install --production --silent
        fi
    fi
    
    # Set proper permissions
    echo "🔧 Setting permissions..."
    chmod -R 755 $PUBLIC_HTML
    find $PUBLIC_HTML -type f -name "*.js" -exec chmod 644 {} \;
    find $PUBLIC_HTML -type f -name "*.css" -exec chmod 644 {} \;
    find $PUBLIC_HTML -type f -name "*.html" -exec chmod 644 {} \;
    
    echo "✅ Deployment complete!"
    echo "🌐 Website available at: https://misedainspectsrl.ro"
    
    # Log deployment
    echo "$(date): Deployment successful" >> /home/misedain/deploy.log
    
else
    echo "❌ Build directory not found: $BUILD_DIR"
    echo "💡 Make sure to build your React app first with 'npm run build'"
    exit 1
fi

echo "🎉 Miseda-Notificari deployment finished successfully!"