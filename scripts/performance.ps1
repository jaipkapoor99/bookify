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

# Step 4: Start local server for testing
Write-Host ""
Write-Host "🚀 Starting local server for performance testing..." -ForegroundColor Yellow
Write-Host "💡 You can now run Lighthouse manually on http://localhost:3000" -ForegroundColor Cyan
Write-Host "💡 Or use browser dev tools to check Core Web Vitals" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Manual Performance Checklist:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:3000 in Chrome" -ForegroundColor White
Write-Host "  2. Open DevTools (F12)" -ForegroundColor White
Write-Host "  3. Go to Lighthouse tab" -ForegroundColor White
Write-Host "  4. Run Performance audit" -ForegroundColor White
Write-Host "  5. Check Core Web Vitals in Performance tab" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Target Metrics:" -ForegroundColor Cyan
Write-Host "  - Performance Score: >80%" -ForegroundColor White
Write-Host "  - LCP (Largest Contentful Paint): <2.5s" -ForegroundColor White
Write-Host "  - FID (First Input Delay): <100ms" -ForegroundColor White
Write-Host "  - CLS (Cumulative Layout Shift): <0.1" -ForegroundColor White
Write-Host ""

# Start the server in background
Write-Host "🚀 Starting server..." -ForegroundColor Yellow
Start-Job -ScriptBlock { 
    Set-Location "C:\Coding\booking-platform"
    npx serve -s dist -p 3000 
} -Name "BookifyServer" | Out-Null

Start-Sleep -Seconds 3
Write-Host "🌐 Server started at http://localhost:3000" -ForegroundColor Green
Write-Host "💡 To stop the server later, run: Get-Job -Name 'BookifyServer' | Stop-Job" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 