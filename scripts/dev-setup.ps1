#!/usr/bin/env pwsh

# Development Setup Script
# Sets up the development environment for new contributors

Write-Host "🚀 Setting up Bookify development environment..." -ForegroundColor Green

# Step 1: Check Node.js version
Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 20 or higher." -ForegroundColor Red
    Write-Host "💡 Download from: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

$nodeVersionNumber = $nodeVersion -replace 'v', ''
$majorVersion = [int]($nodeVersionNumber.Split('.')[0])

if ($majorVersion -lt 20) {
    Write-Host "⚠️ Node.js version $nodeVersion detected. Recommended: v20 or higher" -ForegroundColor Yellow
} else {
    Write-Host "✅ Node.js version $nodeVersion is compatible" -ForegroundColor Green
}

# Step 2: Check npm version
Write-Host "📋 Checking npm version..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "✅ npm version $npmVersion" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Step 4: Check environment variables
Write-Host "🔧 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️ .env.local file not found" -ForegroundColor Yellow
    Write-Host "💡 Create .env.local with your Supabase credentials:" -ForegroundColor Cyan
    Write-Host "   VITE_SUPABASE_URL=your_supabase_url" -ForegroundColor White
    Write-Host "   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor White
} else {
    Write-Host "✅ Environment file found" -ForegroundColor Green
}

# Step 5: Run initial health check
Write-Host "🏥 Running initial health check..." -ForegroundColor Yellow
npm run test:pre-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Some tests failed. This might be due to missing environment variables." -ForegroundColor Yellow
} else {
    Write-Host "✅ Initial health check passed" -ForegroundColor Green
}

# Step 6: Setup Git hooks (if .git exists)
if (Test-Path ".git") {
    Write-Host "🔗 Setting up Git hooks..." -ForegroundColor Yellow
    # Create pre-commit hook
    $preCommitHook = @"
#!/bin/sh
# Pre-commit hook to run linting and tests
echo "Running pre-commit checks..."
npm run lint
if [ `$? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
fi

npm run test:pre-dev
if [ `$? -ne 0 ]; then
    echo "❌ Tests failed. Please fix tests before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
"@
    
    if (-not (Test-Path ".git/hooks")) {
        New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
    }
    
    $preCommitHook | Out-File -FilePath ".git/hooks/pre-commit" -Encoding UTF8
    Write-Host "✅ Git hooks configured" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Not a Git repository, skipping Git hooks setup" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Configure your .env.local file with Supabase credentials" -ForegroundColor White
Write-Host "  2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "  3. Run 'npm run test:watch' for continuous testing" -ForegroundColor White
Write-Host "  4. Check out the README.md for more information" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ Available scripts:" -ForegroundColor Cyan
Write-Host "  - npm run dev          # Start development server" -ForegroundColor White
Write-Host "  - npm run test         # Run tests once" -ForegroundColor White
Write-Host "  - npm run test:watch   # Run tests in watch mode" -ForegroundColor White
Write-Host "  - npm run build        # Build for production" -ForegroundColor White
Write-Host "  - npm run lint         # Run linter" -ForegroundColor White
Write-Host "  - pwsh scripts/ci.ps1  # Run full CI pipeline locally" -ForegroundColor White 