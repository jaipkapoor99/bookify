#!/usr/bin/env pwsh

# Local Performance Testing Script
# Mimics the GitHub Actions performance workflow

Write-Host "⚡ Starting Local Performance Tests..." -ForegroundColor Green

# Step 1: Build application
Write-Host "🏗️ Building application for performance testing..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 2: Bundle size analysis
Write-Host "📦 Analyzing bundle size..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "📊 Bundle Size Analysis:" -ForegroundColor Cyan
    Write-Host "| File | Size |" -ForegroundColor White
    Write-Host "|------|------|" -ForegroundColor White
    
    Get-ChildItem -Path "dist" -Recurse -Include "*.js", "*.css" | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 1)
        Write-Host "| $($_.Name) | ${size}KB |" -ForegroundColor White
    }
    
    # Total sizes
    $totalSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $jsSize = (Get-ChildItem -Path "dist" -Recurse -Include "*.js" | Measure-Object -Property Length -Sum).Sum
    $cssSize = (Get-ChildItem -Path "dist" -Recurse -Include "*.css" | Measure-Object -Property Length -Sum).Sum
    
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    $jsSizeKB = [math]::Round($jsSize / 1KB, 1)
    $cssSizeKB = [math]::Round($cssSize / 1KB, 1)
    
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "- Total Bundle: ${totalSizeMB}MB" -ForegroundColor White
    Write-Host "- JavaScript: ${jsSizeKB}KB" -ForegroundColor White
    Write-Host "- CSS: ${cssSizeKB}KB" -ForegroundColor White
    
    # Performance budget checks
    $maxBundleSize = 2 # 2MB
    $maxJsSize = 1024 # 1MB in KB
    $maxCssSize = 256 # 256KB
    
    Write-Host ""
    Write-Host "💰 Performance Budget Check:" -ForegroundColor Cyan
    
    if ($totalSizeMB -le $maxBundleSize) {
        Write-Host "✅ Total Bundle: ${totalSizeMB}MB (under ${maxBundleSize}MB limit)" -ForegroundColor Green
    } else {
        Write-Host "❌ Total Bundle: ${totalSizeMB}MB (exceeds ${maxBundleSize}MB limit)" -ForegroundColor Red
    }
    
    if ($jsSizeKB -le $maxJsSize) {
        Write-Host "✅ JavaScript: ${jsSizeKB}KB (under ${maxJsSize}KB limit)" -ForegroundColor Green
    } else {
        Write-Host "❌ JavaScript: ${jsSizeKB}KB (exceeds ${maxJsSize}KB limit)" -ForegroundColor Red
    }
    
    if ($cssSizeKB -le $maxCssSize) {
        Write-Host "✅ CSS: ${cssSizeKB}KB (under ${maxCssSize}KB limit)" -ForegroundColor Green
    } else {
        Write-Host "❌ CSS: ${cssSizeKB}KB (exceeds ${maxCssSize}KB limit)" -ForegroundColor Red
    }
}

# Step 3: Check for lazy loading files
Write-Host ""
Write-Host "🔍 Checking for lazy loading optimization..." -ForegroundColor Yellow
$lazyFiles = Get-ChildItem -Path "dist/assets" -Include "*HomePage*", "*EventDetail*", "*Booking*" -Recurse
if ($lazyFiles.Count -gt 0) {
    Write-Host "✅ Lazy loading detected - found $($lazyFiles.Count) lazy-loaded chunks" -ForegroundColor Green
    $lazyFiles | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️ No lazy loading chunks detected" -ForegroundColor Yellow
}

# Step 4: Start local server and run Lighthouse
Write-Host ""
Write-Host "🚀 Starting local server for Lighthouse testing..." -ForegroundColor Yellow

# Start the preview server
Write-Host "🌐 Starting Vite preview server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "preview" -NoNewWindow -PassThru | Out-Null

# Wait for server to be ready
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 30
do {
    Start-Sleep -Seconds 2
    $attempts++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4173" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is ready!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "⏳ Attempt $attempts/$maxAttempts : Server not ready yet..." -ForegroundColor Yellow
    }
} while ($attempts -lt $maxAttempts)

if ($attempts -ge $maxAttempts) {
    Write-Host "❌ Server failed to start after 60 seconds" -ForegroundColor Red
    exit 1
}

# Step 5: Install and run Lighthouse CI
Write-Host ""
Write-Host "🔍 Installing Lighthouse CI..." -ForegroundColor Yellow
npm install -g @lhci/cli
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Lighthouse CI" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Running Lighthouse audit..." -ForegroundColor Yellow
lhci autorun

Write-Host ""
Write-Host "📊 Lighthouse audit completed!" -ForegroundColor Green
Write-Host "📁 Results saved in .lighthouseci/ directory" -ForegroundColor Cyan

# Parse and display results if available
if (Test-Path ".lighthouseci") {
    $reportFiles = Get-ChildItem -Path ".lighthouseci" -Filter "*.json" | Select-Object -First 1
    if ($reportFiles) {
        Write-Host ""
        Write-Host "📊 Quick Results Summary:" -ForegroundColor Cyan
        try {
            $report = Get-Content $reportFiles.FullName | ConvertFrom-Json
            $performance = [math]::Round($report.categories.performance.score * 100, 1)
            $accessibility = [math]::Round($report.categories.accessibility.score * 100, 1)
            $bestPractices = [math]::Round($report.categories.'best-practices'.score * 100, 1)
            $seo = [math]::Round($report.categories.seo.score * 100, 1)
            
            Write-Host "| Category | Score | Status |" -ForegroundColor White
            Write-Host "|----------|-------|--------|" -ForegroundColor White
            Write-Host "| Performance | ${performance}% | $(if ($performance -ge 80) { '✅' } else { '❌' }) |" -ForegroundColor White
            Write-Host "| Accessibility | ${accessibility}% | $(if ($accessibility -ge 90) { '✅' } else { '❌' }) |" -ForegroundColor White
            Write-Host "| Best Practices | ${bestPractices}% | $(if ($bestPractices -ge 90) { '✅' } else { '❌' }) |" -ForegroundColor White
            Write-Host "| SEO | ${seo}% | $(if ($seo -ge 90) { '✅' } else { '❌' }) |" -ForegroundColor White
        } catch {
            Write-Host "⚠️ Could not parse Lighthouse results" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🎯 Performance Testing Complete!" -ForegroundColor Green
Write-Host "🌐 Server running at http://localhost:4173" -ForegroundColor Cyan
Write-Host "💡 Press Ctrl+C to stop the server when done" -ForegroundColor Yellow 