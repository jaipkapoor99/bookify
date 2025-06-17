# This script runs a comprehensive check of the project for errors.
# It checks for linting errors, type errors, and test failures.

Write-Host "Starting project health check..." -ForegroundColor Green

# 1. Run the linter
Write-Host "`nStep 1: Running linter..."
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nLinting failed. Aborting check." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Linting passed successfully." -ForegroundColor Green
}

# 2. Run the TypeScript compiler to check for type errors
Write-Host "`nStep 2: Running TypeScript compiler..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nTypeScript build failed. Aborting check." -ForegroundColor Red
    exit 1
} else {
    Write-Host "TypeScript build passed successfully." -ForegroundColor Green
}

# 3. Run the test suite
Write-Host "`nStep 3: Running test suite..."
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nTests failed. Aborting check." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Tests passed successfully." -ForegroundColor Green
}

Write-Host "`n✅ All checks passed successfully! The project is in a good state." -ForegroundColor Green
exit 0 