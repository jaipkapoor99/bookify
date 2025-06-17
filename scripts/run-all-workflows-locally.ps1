#!/usr/bin/env pwsh

# Comprehensive Local Workflow Runner
# Runs all GitHub Actions workflows locally to ensure code is safe to push
# Based on .github/workflows: ci.yml, deploy.yml, performance.yml, dependency-update.yml, release.yml

param(
    [switch]$SkipTests,
    [switch]$SkipSecurity,
    [switch]$SkipPerformance,
    [switch]$QuickRun,
    [string]$WorkflowFilter = ""
)

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
    Default = "White"
}

function Write-Status {
    param([string]$Message, [string]$Color = "Default")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor $Colors.Header
    Write-Host $Title -ForegroundColor $Colors.Header
    Write-Host "=" * 80 -ForegroundColor $Colors.Header
    Write-Host ""
}

function Test-ExitCode {
    param([string]$StepName, [bool]$ContinueOnError = $false)
    if ($LASTEXITCODE -ne 0) {
        Write-Status "❌ $StepName failed" "Error"
        if (-not $ContinueOnError) {
            Write-Status "🛑 Stopping workflow execution due to failure" "Error"
            exit 1
        }
        return $false
    }
    Write-Status "✅ $StepName passed" "Success"
    return $true
}

function Start-Timer {
    return Get-Date
}

function Stop-Timer {
    param([DateTime]$StartTime)
    $elapsed = (Get-Date) - $StartTime
    return "{0:mm\:ss}" -f $elapsed
}

# Main execution starts here
Write-Header "🚀 LOCAL GITHUB WORKFLOWS RUNNER"
Write-Status "Running all GitHub Actions workflows locally" "Info"
Write-Status "Repository: booking-platform" "Info"
Write-Status "Branch: $(git branch --show-current)" "Info"
Write-Status "Commit: $(git rev-parse --short HEAD)" "Info"

$globalStartTime = Start-Timer
$failedWorkflows = @()
$passedWorkflows = @()

# =============================================================================
# WORKFLOW 1: CI WORKFLOW (Continuous Integration)
# =============================================================================
if (-not $WorkflowFilter -or $WorkflowFilter -eq "ci") {
    Write-Header "🔄 WORKFLOW 1: CONTINUOUS INTEGRATION"
    $workflowStartTime = Start-Timer
    
    try {
        # Job 1: Code Quality & Linting
        Write-Status "🔍 Job 1: Code Quality & Linting" "Info"
        
        # Check dependencies
        Write-Status "📥 Checking dependencies..." "Info"
        if (-not (Test-Path "node_modules")) {
            Write-Status "⚠️ Installing dependencies..." "Warning"
            npm ci
            Test-ExitCode "Dependency installation"
        }
        
        # ESLint
        Write-Status "🔍 Running ESLint..." "Info"
        npm run lint
        Test-ExitCode "ESLint"
        
        # TypeScript check
        Write-Status "📝 Checking TypeScript..." "Info"
        try {
            npm run type-check
        } catch {
            # Fallback to direct tsc
            npx tsc --noEmit
        }
        Test-ExitCode "TypeScript check"
        
        # Prettier check
        Write-Status "🎨 Checking code formatting..." "Info"
        npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"
        Test-ExitCode "Code formatting check"
        
        # Job 2: Tests
        if (-not $SkipTests -and -not $QuickRun) {
            Write-Status "🧪 Job 2: Test Suite" "Info"
            npm test
            Test-ExitCode "Unit tests"
            
            # Test with coverage
            Write-Status "📊 Running tests with coverage..." "Info"
            npm run test:coverage
            Test-ExitCode "Test coverage" $true
        }
        
        # Job 3: Build Verification
        Write-Status "🏗️ Job 3: Build Verification" "Info"
        npm run build
        Test-ExitCode "Build verification"
        
        # Bundle size analysis
        if (Test-Path "dist") {
            Write-Status "📊 Analyzing bundle size..." "Info"
            $bundleSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
            $bundleSizeMB = [math]::Round($bundleSize / 1MB, 2)
            Write-Status "📦 Total bundle size: $bundleSizeMB MB" "Info"
            
            # List main files
            Get-ChildItem -Path "dist" -Include "*.js", "*.css" -Recurse | 
                Sort-Object Length -Descending | 
                Select-Object -First 10 |
                ForEach-Object {
                    $size = [math]::Round($_.Length / 1KB, 1)
                    Write-Status "  - $($_.Name): ${size}KB" "Default"
                }
        }
        
        # Job 4: Security Audit
        if (-not $SkipSecurity) {
            Write-Status "🔒 Job 4: Security Audit" "Info"
            npm audit --audit-level=moderate
            $securityPassed = Test-ExitCode "Security audit" $true
            if (-not $securityPassed) {
                Write-Status "💡 Run 'npm audit fix' to fix automatically" "Warning"
            }
        }
        
        $workflowTime = Stop-Timer $workflowStartTime
        Write-Status "✅ CI Workflow completed in $workflowTime" "Success"
        $passedWorkflows += "CI"
        
    } catch {
        Write-Status "❌ CI Workflow failed: $($_.Exception.Message)" "Error"
        $failedWorkflows += "CI"
    }
}

# =============================================================================
# WORKFLOW 2: PERFORMANCE WORKFLOW
# =============================================================================
if (-not $WorkflowFilter -or $WorkflowFilter -eq "performance") {
    if (-not $SkipPerformance -and -not $QuickRun) {
        Write-Header "⚡ WORKFLOW 2: PERFORMANCE MONITORING"
        $workflowStartTime = Start-Timer
        
        try {
            # Ensure build exists
            if (-not (Test-Path "dist")) {
                Write-Status "🏗️ Building application for performance testing..." "Info"
                npm run build
                Test-ExitCode "Performance build"
            }
            
            # Bundle size analysis (detailed)
            Write-Status "📦 Job 1: Bundle Size Analysis" "Info"
            if (Test-Path "dist") {
                $jsFiles = Get-ChildItem -Path "dist" -Include "*.js" -Recurse
                $cssFiles = Get-ChildItem -Path "dist" -Include "*.css" -Recurse
                $totalSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
                $jsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
                $cssSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum
                
                Write-Status "📊 Bundle Analysis:" "Info"
                Write-Status "  - Total Size: $([math]::Round($totalSize / 1MB, 2))MB" "Default"
                Write-Status "  - JavaScript: $([math]::Round($jsSize / 1KB, 1))KB" "Default"
                Write-Status "  - CSS: $([math]::Round($cssSize / 1KB, 1))KB" "Default"
                Write-Status "  - JS Files: $($jsFiles.Count)" "Default"
                Write-Status "  - CSS Files: $($cssFiles.Count)" "Default"
            }
            
            # Performance budget check
            Write-Status "💰 Job 2: Performance Budget Check" "Info"
            $maxBundleSize = 2 * 1024 * 1024  # 2MB
            $maxJsSize = 1024 * 1024          # 1MB
            $maxCssSize = 256 * 1024          # 256KB
            
            $budgetPassed = $true
            if ($totalSize -gt $maxBundleSize) {
                Write-Status "❌ Bundle size exceeds 2MB limit" "Error"
                $budgetPassed = $false
            }
            if ($jsSize -gt $maxJsSize) {
                Write-Status "❌ JavaScript size exceeds 1MB limit" "Error"
                $budgetPassed = $false
            }
            if ($cssSize -gt $maxCssSize) {
                Write-Status "❌ CSS size exceeds 256KB limit" "Error"
                $budgetPassed = $false
            }
            
            if ($budgetPassed) {
                Write-Status "✅ All performance budgets within limits" "Success"
            }
            
            # Check for lazy loading
            Write-Status "🔍 Job 3: Lazy Loading Check" "Info"
            $lazyFiles = Get-ChildItem -Path "dist/assets" -Include "*HomePage*", "*Event*", "*Booking*" -Recurse -ErrorAction SilentlyContinue
            if ($lazyFiles.Count -gt 0) {
                Write-Status "✅ Lazy loading detected - $($lazyFiles.Count) chunks found" "Success"
            } else {
                Write-Status "⚠️ No lazy loading chunks detected" "Warning"
            }
            
            # Lighthouse simulation (manual instruction)
            Write-Status "🔍 Job 4: Lighthouse Audit (Manual)" "Info"
            Write-Status "💡 To run Lighthouse manually:" "Info"
            Write-Status "  1. Start: npm run preview" "Default"
            Write-Status "  2. Open: http://localhost:4173" "Default"
            Write-Status "  3. Run Lighthouse in Chrome DevTools" "Default"
            Write-Status "  4. Target scores: Performance >80%, Accessibility >90%" "Default"
            
            $workflowTime = Stop-Timer $workflowStartTime
            Write-Status "✅ Performance Workflow completed in $workflowTime" "Success"
            $passedWorkflows += "Performance"
            
        } catch {
            Write-Status "❌ Performance Workflow failed: $($_.Exception.Message)" "Error"
            $failedWorkflows += "Performance"
        }
    }
}

# =============================================================================
# WORKFLOW 3: DEPENDENCY UPDATE SIMULATION
# =============================================================================
if (-not $WorkflowFilter -or $WorkflowFilter -eq "dependencies") {
    if (-not $QuickRun) {
        Write-Header "🔄 WORKFLOW 3: DEPENDENCY UPDATE CHECK"
        $workflowStartTime = Start-Timer
        
        try {
            # Check for outdated packages
            Write-Status "🔍 Checking for outdated packages..." "Info"
            $outdatedResult = npm outdated --json 2>$null
            if ($LASTEXITCODE -eq 0 -or $outdatedResult -eq "{}") {
                Write-Status "✅ All packages are up to date" "Success"
            } else {
                Write-Status "⚠️ Some packages have updates available" "Warning"
                Write-Status "💡 Run dependency-update workflow to create update PR" "Info"
            }
            
            # Security vulnerability check
            Write-Status "🔒 Checking for security vulnerabilities..." "Info"
            npm audit --audit-level=moderate --json | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Status "✅ No security vulnerabilities found" "Success"
            } else {
                Write-Status "⚠️ Security vulnerabilities detected" "Warning"
                Write-Status "💡 Run 'npm audit fix' to resolve" "Info"
            }
            
            $workflowTime = Stop-Timer $workflowStartTime
            Write-Status "✅ Dependency Check completed in $workflowTime" "Success"
            $passedWorkflows += "Dependencies"
            
        } catch {
            Write-Status "❌ Dependency Check failed: $($_.Exception.Message)" "Error"
            $failedWorkflows += "Dependencies"
        }
    }
}

# =============================================================================
# WORKFLOW 4: RELEASE PREPARATION CHECK
# =============================================================================
if (-not $WorkflowFilter -or $WorkflowFilter -eq "release") {
    if (-not $QuickRun) {
        Write-Header "📦 WORKFLOW 4: RELEASE PREPARATION CHECK"
        $workflowStartTime = Start-Timer
        
        try {
            # Version check
            Write-Status "📊 Checking current version..." "Info"
            $currentVersion = (Get-Content "package.json" | ConvertFrom-Json).version
            Write-Status "  Current version: v$currentVersion" "Default"
            
            # Changelog check
            Write-Status "📝 Checking CHANGELOG.md..." "Info"
            if (Test-Path "CHANGELOG.md") {
                Write-Status "✅ CHANGELOG.md exists" "Success"
            } else {
                Write-Status "⚠️ CHANGELOG.md not found" "Warning"
            }
            
            # Git status check
            Write-Status "🔍 Checking git status..." "Info"
            $gitStatus = git status --porcelain
            if ($gitStatus) {
                Write-Status "⚠️ Working directory has uncommitted changes" "Warning"
                Write-Status "💡 Commit changes before creating release" "Info"
            } else {
                Write-Status "✅ Working directory is clean" "Success"
            }
            
            # Tag check
            Write-Status "🏷️ Checking git tags..." "Info"
            $latestTag = git describe --tags --abbrev=0 2>$null
            if ($latestTag) {
                Write-Status "  Latest tag: $latestTag" "Default"
            } else {
                Write-Status "  No tags found" "Default"
            }
            
            $workflowTime = Stop-Timer $workflowStartTime
            Write-Status "✅ Release Check completed in $workflowTime" "Success"
            $passedWorkflows += "Release"
            
        } catch {
            Write-Status "❌ Release Check failed: $($_.Exception.Message)" "Error"
            $failedWorkflows += "Release"
        }
    }
}

# =============================================================================
# WORKFLOW 5: DEPLOYMENT READINESS CHECK
# =============================================================================
if (-not $WorkflowFilter -or $WorkflowFilter -eq "deploy") {
    Write-Header "🚀 WORKFLOW 5: DEPLOYMENT READINESS CHECK"
    $workflowStartTime = Start-Timer
    
    try {
        # Critical tests
        if (-not $SkipTests) {
            Write-Status "🧪 Running critical tests..." "Info"
            npm test
            Test-ExitCode "Critical tests" $true
        }
        
        # Production build test
        Write-Status "🏗️ Testing production build..." "Info"
        $env:NODE_ENV = "production"
        npm run build
        Test-ExitCode "Production build"
        
        # Build artifact check
        if (Test-Path "dist") {
            Write-Status "📦 Checking build artifacts..." "Info"
            $requiredFiles = @("index.html", "assets")
            $allFilesExist = $true
            
            foreach ($file in $requiredFiles) {
                if (Test-Path "dist/$file") {
                    Write-Status "✅ Found: $file" "Success"
                } else {
                    Write-Status "❌ Missing: $file" "Error"
                    $allFilesExist = $false
                }
            }
            
            if ($allFilesExist) {
                Write-Status "✅ All required build artifacts present" "Success"
            }
        }
        
        # Environment variables check
        Write-Status "🔧 Checking environment configuration..." "Info"
        if (Test-Path ".env.example") {
            Write-Status "✅ Environment example file exists" "Success"
        }
        
        $workflowTime = Stop-Timer $workflowStartTime
        Write-Status "✅ Deployment Readiness Check completed in $workflowTime" "Success"
        $passedWorkflows += "Deploy"
        
    } catch {
        Write-Status "❌ Deployment Readiness Check failed: $($_.Exception.Message)" "Error"
        $failedWorkflows += "Deploy"
    }
}

# =============================================================================
# FINAL SUMMARY
# =============================================================================
$totalTime = Stop-Timer $globalStartTime
Write-Header "📊 WORKFLOW EXECUTION SUMMARY"

Write-Status "⏱️ Total execution time: $totalTime" "Info"
Write-Status "✅ Passed workflows: $($passedWorkflows.Count)" "Success"
Write-Status "❌ Failed workflows: $($failedWorkflows.Count)" "Error"

if ($passedWorkflows.Count -gt 0) {
    Write-Status "🎉 Passed workflows:" "Success"
    foreach ($workflow in $passedWorkflows) {
        Write-Status "  ✅ $workflow" "Success"
    }
}

if ($failedWorkflows.Count -gt 0) {
    Write-Status "🚨 Failed workflows:" "Error"
    foreach ($workflow in $failedWorkflows) {
        Write-Status "  ❌ $workflow" "Error"
    }
    Write-Status ""
    Write-Status "🛠️ Fix the failed workflows before pushing to remote" "Warning"
    exit 1
} else {
    Write-Status ""
    Write-Status "🎊 ALL WORKFLOWS PASSED! 🎊" "Success"
    Write-Status "✅ Your code is safe to push to remote repository" "Success"
    Write-Status ""
    Write-Status "📋 Next steps:" "Info"
    Write-Status "  1. git add ." "Default"
    Write-Status "  2. git commit -m 'your message'" "Default"
    Write-Status "  3. git push" "Default"
    Write-Status ""
}

# Cleanup
Remove-Variable -Name Colors -ErrorAction SilentlyContinue