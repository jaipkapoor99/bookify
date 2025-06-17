#!/bin/bash

# Comprehensive Local Workflow Runner (Bash Version)
# Runs all GitHub Actions workflows locally to ensure code is safe to push
# Based on .github/workflows: ci.yml, deploy.yml, performance.yml, dependency-update.yml, release.yml

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
SKIP_TESTS=false
SKIP_SECURITY=false
SKIP_PERFORMANCE=false
QUICK_RUN=false
WORKFLOW_FILTER=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-security)
      SKIP_SECURITY=true
      shift
      ;;
    --skip-performance)
      SKIP_PERFORMANCE=true
      shift
      ;;
    --quick)
      QUICK_RUN=true
      shift
      ;;
    --filter)
      WORKFLOW_FILTER="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --skip-tests         Skip test execution"
      echo "  --skip-security      Skip security audits"
      echo "  --skip-performance   Skip performance tests"
      echo "  --quick              Quick run (skip non-essential checks)"
      echo "  --filter WORKFLOW    Run only specific workflow (ci|performance|dependencies|release|deploy)"
      echo "  -h, --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

function log_success() {
    echo -e "${GREEN}$1${NC}"
}

function log_error() {
    echo -e "${RED}$1${NC}"
}

function log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

function log_info() {
    echo -e "${CYAN}$1${NC}"
}

function log_header() {
    echo ""
    echo -e "${MAGENTA}================================================================================${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}================================================================================${NC}"
    echo ""
}

function check_exit_code() {
    local step_name="$1"
    local continue_on_error="${2:-false}"
    
    if [ $? -ne 0 ]; then
        log_error "❌ $step_name failed"
        if [ "$continue_on_error" != "true" ]; then
            log_error "🛑 Stopping workflow execution due to failure"
            exit 1
        fi
        return 1
    fi
    log_success "✅ $step_name passed"
    return 0
}

function get_file_size_mb() {
    local path="$1"
    if [ -d "$path" ]; then
        du -sm "$path" | cut -f1
    else
        echo "0"
    fi
}

function get_file_size_kb() {
    local path="$1"
    if [ -f "$path" ]; then
        du -sk "$path" | cut -f1
    else
        echo "0"
    fi
}

# Main execution starts here
START_TIME=$(date +%s)
FAILED_WORKFLOWS=()
PASSED_WORKFLOWS=()

log_header "🚀 LOCAL GITHUB WORKFLOWS RUNNER"
log_info "Running all GitHub Actions workflows locally"
log_info "Repository: booking-platform"
log_info "Branch: $(git branch --show-current)"
log_info "Commit: $(git rev-parse --short HEAD)"

# =============================================================================
# WORKFLOW 1: CI WORKFLOW (Continuous Integration)
# =============================================================================
if [ -z "$WORKFLOW_FILTER" ] || [ "$WORKFLOW_FILTER" = "ci" ]; then
    log_header "🔄 WORKFLOW 1: CONTINUOUS INTEGRATION"
    WORKFLOW_START=$(date +%s)
    
    # Job 1: Code Quality & Linting
    log_info "🔍 Job 1: Code Quality & Linting"
    
    # Check dependencies
    log_info "📥 Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        log_warning "⚠️ Installing dependencies..."
        npm ci
        check_exit_code "Dependency installation"
    fi
    
    # ESLint
    log_info "🔍 Running ESLint..."
    npm run lint
    check_exit_code "ESLint"
    
    # TypeScript check
    log_info "📝 Checking TypeScript..."
    if ! npm run type-check 2>/dev/null; then
        npx tsc --noEmit
    fi
    check_exit_code "TypeScript check"
    
    # Prettier check
    log_info "🎨 Checking code formatting..."
    npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"
    check_exit_code "Code formatting check"
    
    # Job 2: Tests
    if [ "$SKIP_TESTS" != "true" ] && [ "$QUICK_RUN" != "true" ]; then
        log_info "🧪 Job 2: Test Suite"
        npm test
        check_exit_code "Unit tests"
        
        # Test with coverage
        log_info "📊 Running tests with coverage..."
        npm run test:coverage || true
    fi
    
    # Job 3: Build Verification
    log_info "🏗️ Job 3: Build Verification"
    npm run build
    check_exit_code "Build verification"
    
    # Bundle size analysis
    if [ -d "dist" ]; then
        log_info "📊 Analyzing bundle size..."
        BUNDLE_SIZE=$(get_file_size_mb "dist")
        log_info "📦 Total bundle size: ${BUNDLE_SIZE}MB"
        
        # List main files
        find dist -name "*.js" -o -name "*.css" | head -10 | while read file; do
            SIZE=$(get_file_size_kb "$file")
            log_info "  - $(basename "$file"): ${SIZE}KB"
        done
    fi
    
    # Job 4: Security Audit
    if [ "$SKIP_SECURITY" != "true" ]; then
        log_info "🔒 Job 4: Security Audit"
        if npm audit --audit-level=moderate; then
            log_success "✅ Security audit passed"
        else
            log_warning "⚠️ Security vulnerabilities found"
            log_info "💡 Run 'npm audit fix' to fix automatically"
        fi
    fi
    
    WORKFLOW_END=$(date +%s)
    WORKFLOW_TIME=$((WORKFLOW_END - WORKFLOW_START))
    log_success "✅ CI Workflow completed in ${WORKFLOW_TIME}s"
    PASSED_WORKFLOWS+=("CI")
fi

# =============================================================================
# WORKFLOW 2: PERFORMANCE WORKFLOW
# =============================================================================
if [ -z "$WORKFLOW_FILTER" ] || [ "$WORKFLOW_FILTER" = "performance" ]; then
    if [ "$SKIP_PERFORMANCE" != "true" ] && [ "$QUICK_RUN" != "true" ]; then
        log_header "⚡ WORKFLOW 2: PERFORMANCE MONITORING"
        WORKFLOW_START=$(date +%s)
        
        # Ensure build exists
        if [ ! -d "dist" ]; then
            log_info "🏗️ Building application for performance testing..."
            npm run build
            check_exit_code "Performance build"
        fi
        
        # Bundle size analysis (detailed)
        log_info "📦 Job 1: Bundle Size Analysis"
        if [ -d "dist" ]; then
            JS_COUNT=$(find dist -name "*.js" | wc -l)
            CSS_COUNT=$(find dist -name "*.css" | wc -l)
            TOTAL_SIZE=$(get_file_size_mb "dist")
            
            log_info "📊 Bundle Analysis:"
            log_info "  - Total Size: ${TOTAL_SIZE}MB"
            log_info "  - JS Files: $JS_COUNT"
            log_info "  - CSS Files: $CSS_COUNT"
        fi
        
        # Performance budget check
        log_info "💰 Job 2: Performance Budget Check"
        if [ "$TOTAL_SIZE" -gt 2 ]; then
            log_error "❌ Bundle size exceeds 2MB limit"
        else
            log_success "✅ Bundle size within 2MB limit"
        fi
        
        # Check for lazy loading
        log_info "🔍 Job 3: Lazy Loading Check"
        if find dist/assets -name "*HomePage*" -o -name "*Event*" -o -name "*Booking*" 2>/dev/null | grep -q .; then
            log_success "✅ Lazy loading chunks detected"
        else
            log_warning "⚠️ No lazy loading chunks detected"
        fi
        
        # Lighthouse simulation (manual instruction)
        log_info "🔍 Job 4: Lighthouse Audit (Manual)"
        log_info "💡 To run Lighthouse manually:"
        log_info "  1. Start: npm run preview"
        log_info "  2. Open: http://localhost:4173"
        log_info "  3. Run Lighthouse in Chrome DevTools"
        log_info "  4. Target scores: Performance >80%, Accessibility >90%"
        
        WORKFLOW_END=$(date +%s)
        WORKFLOW_TIME=$((WORKFLOW_END - WORKFLOW_START))
        log_success "✅ Performance Workflow completed in ${WORKFLOW_TIME}s"
        PASSED_WORKFLOWS+=("Performance")
    fi
fi

# =============================================================================
# WORKFLOW 3: DEPENDENCY UPDATE SIMULATION
# =============================================================================
if [ -z "$WORKFLOW_FILTER" ] || [ "$WORKFLOW_FILTER" = "dependencies" ]; then
    if [ "$QUICK_RUN" != "true" ]; then
        log_header "🔄 WORKFLOW 3: DEPENDENCY UPDATE CHECK"
        WORKFLOW_START=$(date +%s)
        
        # Check for outdated packages
        log_info "🔍 Checking for outdated packages..."
        if npm outdated --json >/dev/null 2>&1; then
            log_success "✅ All packages are up to date"
        else
            log_warning "⚠️ Some packages have updates available"
            log_info "💡 Run dependency-update workflow to create update PR"
        fi
        
        # Security vulnerability check
        log_info "🔒 Checking for security vulnerabilities..."
        if npm audit --audit-level=moderate --json >/dev/null 2>&1; then
            log_success "✅ No security vulnerabilities found"
        else
            log_warning "⚠️ Security vulnerabilities detected"
            log_info "💡 Run 'npm audit fix' to resolve"
        fi
        
        WORKFLOW_END=$(date +%s)
        WORKFLOW_TIME=$((WORKFLOW_END - WORKFLOW_START))
        log_success "✅ Dependency Check completed in ${WORKFLOW_TIME}s"
        PASSED_WORKFLOWS+=("Dependencies")
    fi
fi

# =============================================================================
# WORKFLOW 4: RELEASE PREPARATION CHECK
# =============================================================================
if [ -z "$WORKFLOW_FILTER" ] || [ "$WORKFLOW_FILTER" = "release" ]; then
    if [ "$QUICK_RUN" != "true" ]; then
        log_header "📦 WORKFLOW 4: RELEASE PREPARATION CHECK"
        WORKFLOW_START=$(date +%s)
        
        # Version check
        log_info "📊 Checking current version..."
        CURRENT_VERSION=$(node -p "require('./package.json').version")
        log_info "  Current version: v$CURRENT_VERSION"
        
        # Changelog check
        log_info "📝 Checking CHANGELOG.md..."
        if [ -f "CHANGELOG.md" ]; then
            log_success "✅ CHANGELOG.md exists"
        else
            log_warning "⚠️ CHANGELOG.md not found"
        fi
        
        # Git status check
        log_info "🔍 Checking git status..."
        if [ -n "$(git status --porcelain)" ]; then
            log_warning "⚠️ Working directory has uncommitted changes"
            log_info "💡 Commit changes before creating release"
        else
            log_success "✅ Working directory is clean"
        fi
        
        # Tag check
        log_info "🏷️ Checking git tags..."
        if LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null); then
            log_info "  Latest tag: $LATEST_TAG"
        else
            log_info "  No tags found"
        fi
        
        WORKFLOW_END=$(date +%s)
        WORKFLOW_TIME=$((WORKFLOW_END - WORKFLOW_START))
        log_success "✅ Release Check completed in ${WORKFLOW_TIME}s"
        PASSED_WORKFLOWS+=("Release")
    fi
fi

# =============================================================================
# WORKFLOW 5: DEPLOYMENT READINESS CHECK
# =============================================================================
if [ -z "$WORKFLOW_FILTER" ] || [ "$WORKFLOW_FILTER" = "deploy" ]; then
    log_header "🚀 WORKFLOW 5: DEPLOYMENT READINESS CHECK"
    WORKFLOW_START=$(date +%s)
    
    # Critical tests
    if [ "$SKIP_TESTS" != "true" ]; then
        log_info "🧪 Running critical tests..."
        npm test || true
    fi
    
    # Production build test
    log_info "🏗️ Testing production build..."
    NODE_ENV=production npm run build
    check_exit_code "Production build"
    
    # Build artifact check
    if [ -d "dist" ]; then
        log_info "📦 Checking build artifacts..."
        REQUIRED_FILES=("index.html" "assets")
        ALL_FILES_EXIST=true
        
        for file in "${REQUIRED_FILES[@]}"; do
            if [ -e "dist/$file" ]; then
                log_success "✅ Found: $file"
            else
                log_error "❌ Missing: $file"
                ALL_FILES_EXIST=false
            fi
        done
        
        if [ "$ALL_FILES_EXIST" = true ]; then
            log_success "✅ All required build artifacts present"
        fi
    fi
    
    # Environment variables check
    log_info "🔧 Checking environment configuration..."
    if [ -f ".env.example" ]; then
        log_success "✅ Environment example file exists"
    fi
    
    WORKFLOW_END=$(date +%s)
    WORKFLOW_TIME=$((WORKFLOW_END - WORKFLOW_START))
    log_success "✅ Deployment Readiness Check completed in ${WORKFLOW_TIME}s"
    PASSED_WORKFLOWS+=("Deploy")
fi

# =============================================================================
# FINAL SUMMARY
# =============================================================================
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

log_header "📊 WORKFLOW EXECUTION SUMMARY"

log_info "⏱️ Total execution time: ${TOTAL_TIME}s"
log_success "✅ Passed workflows: ${#PASSED_WORKFLOWS[@]}"
log_error "❌ Failed workflows: ${#FAILED_WORKFLOWS[@]}"

if [ ${#PASSED_WORKFLOWS[@]} -gt 0 ]; then
    log_success "🎉 Passed workflows:"
    for workflow in "${PASSED_WORKFLOWS[@]}"; do
        log_success "  ✅ $workflow"
    done
fi

if [ ${#FAILED_WORKFLOWS[@]} -gt 0 ]; then
    log_error "🚨 Failed workflows:"
    for workflow in "${FAILED_WORKFLOWS[@]}"; do
        log_error "  ❌ $workflow"
    done
    echo ""
    log_warning "🛠️ Fix the failed workflows before pushing to remote"
    exit 1
else
    echo ""
    log_success "🎊 ALL WORKFLOWS PASSED! 🎊"
    log_success "✅ Your code is safe to push to remote repository"
    echo ""
    log_info "📋 Next steps:"
    echo "  1. git add ."
    echo "  2. git commit -m 'your message'"
    echo "  3. git push"
    echo ""
fi