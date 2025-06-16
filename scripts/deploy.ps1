#!/usr/bin/env pwsh

# Deployment Script
# Handles production builds and deployment preparation

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "preview", "analyze", "help")]
    [string]$Action = "help",
    
    [switch]$SkipTests,
    [switch]$SkipLint,
    [switch]$VerboseOutput
)

function Show-Help {
    Write-Host "🚀 Deployment Tools for Bookify" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: pwsh scripts/deploy.ps1 <action> [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  build     - Create production build with full validation" -ForegroundColor White
    Write-Host "  preview   - Build and start preview server" -ForegroundColor White
    Write-Host "  analyze   - Analyze bundle size and performance" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -SkipTests  - Skip running tests before build" -ForegroundColor White
    Write-Host "  -SkipLint   - Skip linting before build" -ForegroundColor White
    Write-Host "  -VerboseOutput - Show detailed output" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  pwsh scripts/deploy.ps1 build" -ForegroundColor White
    Write-Host "  pwsh scripts/deploy.ps1 preview" -ForegroundColor White
    Write-Host "  pwsh scripts/deploy.ps1 build -SkipTests" -ForegroundColor White
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm not found" -ForegroundColor Red
        return $false
    }
    
    # Check dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️ Dependencies not installed" -ForegroundColor Yellow
        Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    }
    
    return $true
}

function Invoke-PreBuildChecks {
    Write-Host "🔍 Running pre-build checks..." -ForegroundColor Yellow
    
    $success = $true
    
    # Linting
    if (-not $SkipLint) {
        Write-Host "📝 Running linter..." -ForegroundColor Yellow
        npm run lint
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Linting failed" -ForegroundColor Red
            $success = $false
        } else {
            Write-Host "✅ Linting passed" -ForegroundColor Green
        }
    } else {
        Write-Host "⏭️ Skipping linting" -ForegroundColor Cyan
    }
    
    # TypeScript check
    Write-Host "📝 Checking TypeScript..." -ForegroundColor Yellow
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ TypeScript check failed" -ForegroundColor Red
        $success = $false
    } else {
        Write-Host "✅ TypeScript check passed" -ForegroundColor Green
    }
    
    # Tests
    if (-not $SkipTests) {
        Write-Host "🧪 Running tests..." -ForegroundColor Yellow
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Tests failed" -ForegroundColor Red
            $success = $false
        } else {
            Write-Host "✅ Tests passed" -ForegroundColor Green
        }
    } else {
        Write-Host "⏭️ Skipping tests" -ForegroundColor Cyan
    }
    
    return $success
}

function Invoke-ProductionBuild {
    Write-Host "🏗️ Creating production build..." -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-Prerequisites)) {
        return $false
    }
    
    if (-not (Invoke-PreBuildChecks)) {
        Write-Host "❌ Pre-build checks failed. Aborting build." -ForegroundColor Red
        return $false
    }
    
    # Clean previous build
    if (Test-Path "dist") {
        Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
        Remove-Item -Path "dist" -Recurse -Force
    }
    
    # Build
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    $buildStart = Get-Date
    
    if ($VerboseOutput) {
        npm run build
    } else {
        npm run build 2>$null
    }
    
    $buildEnd = Get-Date
    $buildTime = ($buildEnd - $buildStart).TotalSeconds
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Build completed in $([math]::Round($buildTime, 2)) seconds" -ForegroundColor Green
    
    # Analyze build
    if (Test-Path "dist") {
        Write-Host ""
        Write-Host "📊 Build Analysis:" -ForegroundColor Cyan
        
        $totalSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
        $jsSize = (Get-ChildItem -Path "dist" -Recurse -Include "*.js" | Measure-Object -Property Length -Sum).Sum
        $cssSize = (Get-ChildItem -Path "dist" -Recurse -Include "*.css" | Measure-Object -Property Length -Sum).Sum
        $htmlSize = (Get-ChildItem -Path "dist" -Recurse -Include "*.html" | Measure-Object -Property Length -Sum).Sum
        
        $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
        $jsSizeKB = [math]::Round($jsSize / 1KB, 1)
        $cssSizeKB = [math]::Round($cssSize / 1KB, 1)
        $htmlSizeKB = [math]::Round($htmlSize / 1KB, 1)
        
        Write-Host "  📦 Total Size: ${totalSizeMB}MB" -ForegroundColor White
        Write-Host "  📜 JavaScript: ${jsSizeKB}KB" -ForegroundColor White
        Write-Host "  🎨 CSS: ${cssSizeKB}KB" -ForegroundColor White
        Write-Host "  📄 HTML: ${htmlSizeKB}KB" -ForegroundColor White
        
        # Check for lazy loading
        $lazyFiles = Get-ChildItem -Path "dist/assets" -Include "*HomePage*", "*EventDetail*", "*Booking*" -Recurse -ErrorAction SilentlyContinue
        if ($lazyFiles.Count -gt 0) {
            Write-Host "  ⚡ Lazy Loading: ✅ ($($lazyFiles.Count) chunks)" -ForegroundColor Green
        } else {
            Write-Host "  ⚡ Lazy Loading: ❌ (not detected)" -ForegroundColor Yellow
        }
        
        # Performance budget check
        Write-Host ""
        Write-Host "💰 Performance Budget:" -ForegroundColor Cyan
        if ($totalSizeMB -le 2) {
            Write-Host "  ✅ Total size within budget (${totalSizeMB}MB ≤ 2MB)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Total size exceeds budget (${totalSizeMB}MB > 2MB)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🎉 Production build ready!" -ForegroundColor Green
    Write-Host "📁 Build output: ./dist/" -ForegroundColor Cyan
    
    return $true
}

function Start-PreviewServer {
    Write-Host "🚀 Starting preview server..." -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-Path "dist")) {
        Write-Host "❌ No build found. Creating production build first..." -ForegroundColor Yellow
        if (-not (Invoke-ProductionBuild)) {
            return
        }
    }
    
    Write-Host "🌐 Starting preview server on http://localhost:4173" -ForegroundColor Cyan
    Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    npm run preview
}

function Invoke-BundleAnalysis {
    Write-Host "📊 Analyzing bundle..." -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-Path "dist")) {
        Write-Host "❌ No build found. Creating production build first..." -ForegroundColor Yellow
        if (-not (Invoke-ProductionBuild)) {
            return
        }
    }
    
    Write-Host "📈 Detailed Bundle Analysis:" -ForegroundColor Cyan
    Write-Host ""
    
    # List all files with sizes
    Write-Host "📁 File Breakdown:" -ForegroundColor Yellow
    Get-ChildItem -Path "dist" -Recurse -File | Sort-Object Length -Descending | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 1)
        $relativePath = $_.FullName.Replace((Get-Location).Path + "\dist\", "")
        Write-Host "  $relativePath - ${sizeKB}KB" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🔍 Optimization Suggestions:" -ForegroundColor Cyan
    
    # Check for large files
    $largeFiles = Get-ChildItem -Path "dist" -Recurse -File | Where-Object { $_.Length -gt 100KB }
    if ($largeFiles.Count -gt 0) {
        Write-Host "  ⚠️ Large files detected (>100KB):" -ForegroundColor Yellow
        $largeFiles | ForEach-Object {
            $sizeKB = [math]::Round($_.Length / 1KB, 1)
            Write-Host "    - $($_.Name) (${sizeKB}KB)" -ForegroundColor White
        }
    } else {
        Write-Host "  ✅ No unusually large files detected" -ForegroundColor Green
    }
    
    # Check for duplicate dependencies
    $jsFiles = Get-ChildItem -Path "dist/assets" -Include "*.js" -Recurse
    Write-Host "  📦 JavaScript chunks: $($jsFiles.Count)" -ForegroundColor White
    
    if ($jsFiles.Count -gt 10) {
        Write-Host "  ⚠️ Many JS chunks detected - consider bundle optimization" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Reasonable number of JS chunks" -ForegroundColor Green
    }
}

# Main script logic
switch ($Action.ToLower()) {
    "build" { 
        $success = Invoke-ProductionBuild
        if (-not $success) { exit 1 }
    }
    "preview" { Start-PreviewServer }
    "analyze" { Invoke-BundleAnalysis }
    "help" { Show-Help }
    default { 
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Show-Help 
    }
} 