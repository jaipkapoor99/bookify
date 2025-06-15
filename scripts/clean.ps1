#!/usr/bin/env pwsh

# Clean Script
# Removes build artifacts, caches, and temporary files

param(
    [switch]$Deep,
    [switch]$NodeModules,
    [switch]$All
)

Write-Host "🧹 Cleaning Bookify project..." -ForegroundColor Green

# Function to remove directory if it exists
function Remove-DirectoryIfExists {
    param($Path, $Description)
    
    if (Test-Path $Path) {
        Write-Host "🗑️ Removing $Description..." -ForegroundColor Yellow
        Remove-Item -Path $Path -Recurse -Force
        Write-Host "✅ Removed $Description" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ $Description not found, skipping" -ForegroundColor Cyan
    }
}

# Basic cleanup (always performed)
Write-Host "📁 Basic cleanup..." -ForegroundColor Yellow

# Remove build artifacts
Remove-DirectoryIfExists "dist" "build directory"
Remove-DirectoryIfExists ".vite" "Vite cache"

# Remove test coverage
Remove-DirectoryIfExists "coverage" "test coverage reports"

# Remove logs
Get-ChildItem -Path "." -Filter "*.log" | ForEach-Object {
    Write-Host "🗑️ Removing log file: $($_.Name)" -ForegroundColor Yellow
    Remove-Item $_.FullName -Force
}

# Remove temporary files
Get-ChildItem -Path "." -Filter "*.tmp" | ForEach-Object {
    Write-Host "🗑️ Removing temp file: $($_.Name)" -ForegroundColor Yellow
    Remove-Item $_.FullName -Force
}

# Deep cleanup (optional)
if ($Deep -or $All) {
    Write-Host "🔍 Deep cleanup..." -ForegroundColor Yellow
    
    # Remove TypeScript build info
    Remove-DirectoryIfExists ".tsbuildinfo" "TypeScript build info"
    
    # Remove ESLint cache
    if (Test-Path ".eslintcache") {
        Write-Host "🗑️ Removing ESLint cache..." -ForegroundColor Yellow
        Remove-Item ".eslintcache" -Force
        Write-Host "✅ Removed ESLint cache" -ForegroundColor Green
    }
    
    # Remove Prettier cache
    Remove-DirectoryIfExists ".prettiercache" "Prettier cache"
    
    # Remove OS-specific files
    Get-ChildItem -Path "." -Filter "Thumbs.db" -Recurse | ForEach-Object {
        Write-Host "🗑️ Removing Thumbs.db: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force
    }
    
    Get-ChildItem -Path "." -Filter ".DS_Store" -Recurse | ForEach-Object {
        Write-Host "🗑️ Removing .DS_Store: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force
    }
}

# Node modules cleanup (optional)
if ($NodeModules -or $All) {
    Write-Host "📦 Node modules cleanup..." -ForegroundColor Yellow
    Remove-DirectoryIfExists "node_modules" "node_modules directory"
    
    if (Test-Path "package-lock.json") {
        Write-Host "🗑️ Removing package-lock.json..." -ForegroundColor Yellow
        Remove-Item "package-lock.json" -Force
        Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
    }
    
    Write-Host "📥 Reinstalling dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies reinstalled successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to reinstall dependencies" -ForegroundColor Red
    }
}

# Show disk space saved
Write-Host ""
Write-Host "📊 Cleanup summary:" -ForegroundColor Cyan

$cleanedItems = @()
if (-not (Test-Path "dist")) { $cleanedItems += "Build artifacts" }
if (-not (Test-Path ".vite")) { $cleanedItems += "Vite cache" }
if (-not (Test-Path "coverage")) { $cleanedItems += "Coverage reports" }

if ($Deep -or $All) {
    if (-not (Test-Path ".eslintcache")) { $cleanedItems += "ESLint cache" }
}

if ($NodeModules -or $All) {
    $cleanedItems += "Node modules (reinstalled)"
}

if ($cleanedItems.Count -gt 0) {
    Write-Host "✅ Cleaned:" -ForegroundColor Green
    $cleanedItems | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor White
    }
} else {
    Write-Host "ℹ️ Nothing to clean" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Usage examples:" -ForegroundColor Cyan
Write-Host "  pwsh scripts/clean.ps1           # Basic cleanup" -ForegroundColor White
Write-Host "  pwsh scripts/clean.ps1 -Deep     # Deep cleanup (caches, temp files)" -ForegroundColor White
Write-Host "  pwsh scripts/clean.ps1 -NodeModules # Clean and reinstall node_modules" -ForegroundColor White
Write-Host "  pwsh scripts/clean.ps1 -All      # Complete cleanup (everything)" -ForegroundColor White 