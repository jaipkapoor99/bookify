#!/usr/bin/env pwsh

# Local CI Testing Script
# Mimics the GitHub Actions CI workflow for local testing

Write-Host "🚀 Starting Local CI Tests..." -ForegroundColor Green

# Step 1: Check if dependencies are installed
Write-Host "📥 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️ node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 2: Lint and format check
Write-Host "🔍 Running ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting failed" -ForegroundColor Red
    exit 1
}

# Step 3: TypeScript check
Write-Host "📝 Checking TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript check failed" -ForegroundColor Red
    exit 1
}

# Step 4: Format check
Write-Host "🎨 Checking code formatting..." -ForegroundColor Yellow
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Code formatting check failed" -ForegroundColor Red
    Write-Host "💡 Run 'npx prettier --write .' to fix formatting" -ForegroundColor Cyan
    exit 1
}

# Step 5: Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}

# Step 6: Build check
Write-Host "🏗️ Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 7: Security audit
Write-Host "🔒 Running security audit..." -ForegroundColor Yellow
npm audit --audit-level=moderate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Security vulnerabilities found" -ForegroundColor Yellow
    Write-Host "💡 Run 'npm audit fix' to fix automatically" -ForegroundColor Cyan
}

# Step 8: Bundle analysis
Write-Host "📊 Analyzing bundle size..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $bundleSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $bundleSizeMB = [math]::Round($bundleSize / 1MB, 2)
    Write-Host "📦 Total bundle size: $bundleSizeMB MB" -ForegroundColor Cyan
    
    # Check if bundle size is reasonable (under 5MB)
    if ($bundleSizeMB -gt 5) {
        Write-Host "⚠️ Bundle size is quite large (>5MB)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Bundle size looks good" -ForegroundColor Green
    }
}

Write-Host "🎉 All local CI checks passed!" -ForegroundColor Green
Write-Host "✅ Your code is ready for commit and push" -ForegroundColor Green 