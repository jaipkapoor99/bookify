#!/usr/bin/env pwsh

# Database Tools Script
# Provides utilities for Supabase database management

param(
    [Parameter(Position=0)]
    [ValidateSet("status", "reset", "migrate", "seed", "backup", "restore", "logs", "help")]
    [string]$Action = "help",
    
    [string]$BackupFile,
    [switch]$Force
)

function Show-Help {
    Write-Host "🗄️ Database Tools for Bookify" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: pwsh scripts/database-tools.ps1 <action> [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  status    - Show database status and connection info" -ForegroundColor White
    Write-Host "  reset     - Reset database (WARNING: destroys all data)" -ForegroundColor White
    Write-Host "  migrate   - Run pending migrations" -ForegroundColor White
    Write-Host "  seed      - Seed database with sample data" -ForegroundColor White
    Write-Host "  backup    - Create database backup" -ForegroundColor White
    Write-Host "  restore   - Restore from backup file" -ForegroundColor White
    Write-Host "  logs      - Show recent database logs" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -BackupFile <file>  - Specify backup file for restore" -ForegroundColor White
    Write-Host "  -Force              - Skip confirmation prompts" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  pwsh scripts/database-tools.ps1 status" -ForegroundColor White
    Write-Host "  pwsh scripts/database-tools.ps1 backup" -ForegroundColor White
    Write-Host "  pwsh scripts/database-tools.ps1 restore -BackupFile backup.sql" -ForegroundColor White
}

function Test-SupabaseInstalled {
    try {
        $version = supabase --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Supabase CLI version: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        # Supabase not found
    }
    
    Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
    Write-Host "💡 Install with: npm install -g supabase" -ForegroundColor Cyan
    Write-Host "💡 Or download from: https://supabase.com/docs/guides/cli" -ForegroundColor Cyan
    return $false
}

function Show-DatabaseStatus {
    Write-Host "🗄️ Database Status" -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    Write-Host "📊 Checking Supabase status..." -ForegroundColor Yellow
    supabase status
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🔗 Connection Info:" -ForegroundColor Cyan
        Write-Host "  Local API URL: http://localhost:54321" -ForegroundColor White
        Write-Host "  Local DB URL: postgresql://postgres:postgres@localhost:54322/postgres" -ForegroundColor White
        Write-Host "  Studio URL: http://localhost:54323" -ForegroundColor White
    } else {
        Write-Host "⚠️ Supabase is not running locally" -ForegroundColor Yellow
        Write-Host "💡 Start with: supabase start" -ForegroundColor Cyan
    }
}

function Reset-Database {
    Write-Host "🗄️ Database Reset" -ForegroundColor Red
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    if (-not $Force) {
        Write-Host "⚠️ WARNING: This will destroy ALL data in the database!" -ForegroundColor Red
        $confirmation = Read-Host "Type 'RESET' to confirm"
        if ($confirmation -ne "RESET") {
            Write-Host "❌ Reset cancelled" -ForegroundColor Yellow
            return
        }
    }
    
    Write-Host "🔄 Resetting database..." -ForegroundColor Yellow
    supabase db reset
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database reset successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database reset failed" -ForegroundColor Red
    }
}

function Run-Migrations {
    Write-Host "🗄️ Running Migrations" -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    Write-Host "📝 Checking for pending migrations..." -ForegroundColor Yellow
    
    # Check if migrations directory exists
    if (-not (Test-Path "supabase/migrations")) {
        Write-Host "❌ No migrations directory found" -ForegroundColor Red
        return
    }
    
    $migrationFiles = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql"
    Write-Host "📁 Found $($migrationFiles.Count) migration files" -ForegroundColor Cyan
    
    Write-Host "🔄 Applying migrations..." -ForegroundColor Yellow
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations applied successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed" -ForegroundColor Red
    }
}

function Seed-Database {
    Write-Host "🗄️ Seeding Database" -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    # Check if seed file exists
    if (Test-Path "supabase/seed.sql") {
        Write-Host "🌱 Running seed.sql..." -ForegroundColor Yellow
        supabase db reset --seed
    } elseif (Test-Path "populate_database_safe.sql") {
        Write-Host "🌱 Running populate_database_safe.sql..." -ForegroundColor Yellow
        # Execute the populate script
        $env:PGPASSWORD = "postgres"
        psql -h localhost -p 54322 -U postgres -d postgres -f "populate_database_safe.sql"
    } else {
        Write-Host "❌ No seed file found" -ForegroundColor Red
        Write-Host "💡 Expected: supabase/seed.sql or populate_database_safe.sql" -ForegroundColor Cyan
        return
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database seeding failed" -ForegroundColor Red
    }
}

function Backup-Database {
    Write-Host "🗄️ Creating Database Backup" -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"
    
    Write-Host "💾 Creating backup: $backupFile" -ForegroundColor Yellow
    
    # Create backup using pg_dump
    $env:PGPASSWORD = "postgres"
    pg_dump -h localhost -p 54322 -U postgres -d postgres --clean --if-exists > $backupFile
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
        $fileSize = [math]::Round((Get-Item $backupFile).Length / 1KB, 2)
        Write-Host "✅ Backup created successfully: $backupFile ($fileSize KB)" -ForegroundColor Green
    } else {
        Write-Host "❌ Backup failed" -ForegroundColor Red
    }
}

function Restore-Database {
    Write-Host "🗄️ Restoring Database" -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    if (-not $BackupFile) {
        Write-Host "❌ No backup file specified" -ForegroundColor Red
        Write-Host "💡 Use: -BackupFile <filename>" -ForegroundColor Cyan
        return
    }
    
    if (-not (Test-Path $BackupFile)) {
        Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red
        return
    }
    
    if (-not $Force) {
        Write-Host "⚠️ WARNING: This will replace ALL current data!" -ForegroundColor Red
        $confirmation = Read-Host "Type 'RESTORE' to confirm"
        if ($confirmation -ne "RESTORE") {
            Write-Host "❌ Restore cancelled" -ForegroundColor Yellow
            return
        }
    }
    
    Write-Host "🔄 Restoring from: $BackupFile" -ForegroundColor Yellow
    
    # Restore using psql
    $env:PGPASSWORD = "postgres"
    psql -h localhost -p 54322 -U postgres -d postgres -f $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database restored successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database restore failed" -ForegroundColor Red
    }
}

function Show-DatabaseLogs {
    Write-Host "🗄️ Database Logs" -ForegroundColor Green
    Write-Host ""
    
    if (-not (Test-SupabaseInstalled)) {
        return
    }
    
    Write-Host "📋 Recent database logs:" -ForegroundColor Yellow
    supabase logs db
}

# Main script logic
switch ($Action.ToLower()) {
    "status" { Show-DatabaseStatus }
    "reset" { Reset-Database }
    "migrate" { Run-Migrations }
    "seed" { Seed-Database }
    "backup" { Backup-Database }
    "restore" { Restore-Database }
    "logs" { Show-DatabaseLogs }
    "help" { Show-Help }
    default { 
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Show-Help 
    }
} 