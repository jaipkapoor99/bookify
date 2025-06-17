# 🚀 Local GitHub Workflows Runner

This directory contains scripts to run all GitHub Actions workflows locally, ensuring your code is safe to push to the remote repository.

## 📋 Overview

The booking-platform repository has 5 main GitHub workflows:

1. **🔄 CI Workflow** (`ci.yml`) - Code quality, tests, build verification, security
2. **⚡ Performance Workflow** (`performance.yml`) - Bundle analysis, Lighthouse audits, Core Web Vitals
3. **🔄 Dependency Update** (`dependency-update.yml`) - Package updates, security fixes
4. **📦 Release Workflow** (`release.yml`) - Version management, changelog, GitHub releases
5. **🚀 Deploy Workflow** (`deploy.yml`) - Production deployment readiness

## 🛠️ Scripts Available

### Main Workflow Runner Scripts

| Script | Platform | Description |
|--------|----------|-------------|
| `run-all-workflows-locally.ps1` | Windows/PowerShell | Complete workflow simulation |
| `run-all-workflows-locally.sh` | Linux/macOS/Bash | Complete workflow simulation |

### Individual Workflow Scripts

| Script | Description |
|--------|-------------|
| `ci.ps1` | Existing CI script (linting, tests, build) |
| `performance.ps1` | Existing performance testing script |
| `health-check.ps1` | System health checks |
| `deploy.ps1` | Deployment utilities |
| `database-tools.ps1` | Database management |
| `dev-setup.ps1` | Development environment setup |
| `clean.ps1` | Clean build artifacts |

## 🚀 Quick Start

### Method 1: Using npm scripts (Recommended)

```bash
# Run all workflows (Windows/PowerShell)
npm run workflows

# Quick run (skip non-essential checks)
npm run workflows:quick

# Run all workflows (Linux/macOS/Bash)
npm run workflows:bash
```

### Method 2: Direct script execution

#### Windows (PowerShell)
```powershell
# Full run
.\scripts\run-all-workflows-locally.ps1

# Quick run
.\scripts\run-all-workflows-locally.ps1 -QuickRun

# Skip specific checks
.\scripts\run-all-workflows-locally.ps1 -SkipTests -SkipPerformance

# Run specific workflow only
.\scripts\run-all-workflows-locally.ps1 -WorkflowFilter "ci"
```

#### Linux/macOS (Bash)
```bash
# Full run
./scripts/run-all-workflows-locally.sh

# Quick run
./scripts/run-all-workflows-locally.sh --quick

# Skip specific checks
./scripts/run-all-workflows-locally.sh --skip-tests --skip-performance

# Run specific workflow only
./scripts/run-all-workflows-locally.sh --filter ci
```

## 📖 Detailed Usage

### PowerShell Script Options

| Parameter | Description |
|-----------|-------------|
| `-SkipTests` | Skip all test execution |
| `-SkipSecurity` | Skip security audits |
| `-SkipPerformance` | Skip performance testing |
| `-QuickRun` | Run only essential checks |
| `-WorkflowFilter <name>` | Run specific workflow: `ci`, `performance`, `dependencies`, `release`, `deploy` |

### Bash Script Options

| Option | Description |
|--------|-------------|
| `--skip-tests` | Skip all test execution |
| `--skip-security` | Skip security audits |
| `--skip-performance` | Skip performance testing |
| `--quick` | Run only essential checks |
| `--filter <name>` | Run specific workflow: `ci`, `performance`, `dependencies`, `release`, `deploy` |
| `--help` | Show help message |

## 🔍 What Each Workflow Checks

### 1. 🔄 CI Workflow
- **Dependencies**: Ensures `node_modules` is properly installed
- **Linting**: Runs ESLint for code quality
- **TypeScript**: Type checking with `tsc --noEmit`
- **Formatting**: Code formatting validation with Prettier
- **Tests**: Unit and integration tests with coverage
- **Build**: Production build verification
- **Security**: `npm audit` for vulnerabilities
- **Bundle Analysis**: Size analysis and optimization checks

### 2. ⚡ Performance Workflow
- **Bundle Size Analysis**: Detailed breakdown of JS/CSS files
- **Performance Budget**: Enforces size limits (2MB total, 1MB JS, 256KB CSS)
- **Lighthouse Audit**: Automated performance, accessibility, best practices, and SEO testing
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB measurements
- **Lazy Loading**: Checks for code splitting and lazy-loaded chunks
- **Asset Optimization**: Verifies build optimizations

#### 🔍 Running Lighthouse Locally

**Requirements**: Node.js >=18.20 for Lighthouse CI

**Scripts Available**:
- Windows: `.\scripts\performance.ps1` (includes automated Lighthouse)
- Linux/macOS: `./scripts/lighthouse-local.sh` (dedicated Lighthouse script)

**Manual Lighthouse Testing**:
1. Run `npm run build && npm run preview`
2. Open Chrome DevTools (F12)
3. Navigate to Lighthouse tab
4. Run Performance audit on http://localhost:4173

**Lighthouse CI Fallback** (if Node.js <18.20):
- Use browser-based Lighthouse testing
- Results should match CI thresholds: Performance >80%, Accessibility >90%

### 3. 🔄 Dependency Workflow
- **Outdated Packages**: Checks for available updates
- **Security Vulnerabilities**: Scans for known security issues
- **Update Readiness**: Validates if updates can be safely applied

### 4. 📦 Release Workflow
- **Version Management**: Current version validation
- **Changelog**: Ensures CHANGELOG.md exists and is updated
- **Git Status**: Verifies clean working directory
- **Tags**: Checks existing git tags
- **Release Readiness**: Validates all release prerequisites

### 5. 🚀 Deploy Workflow
- **Critical Tests**: Runs integration and critical path tests
- **Production Build**: Validates production-ready build
- **Artifact Validation**: Ensures all required files are present
- **Environment Check**: Validates configuration files
- **Deployment Readiness**: Complete pre-deployment verification

## 📊 Sample Output

```
🚀 LOCAL GITHUB WORKFLOWS RUNNER
================================================================================
Repository: booking-platform
Branch: optimization
Commit: a1b2c3d

🔄 WORKFLOW 1: CONTINUOUS INTEGRATION
================================================================================
🔍 Job 1: Code Quality & Linting
✅ ESLint passed
✅ TypeScript check passed
✅ Code formatting check passed

🧪 Job 2: Test Suite
✅ Unit tests passed (67 tests)
📊 Test coverage: 85%

🏗️ Job 3: Build Verification
✅ Build verification passed
📦 Total bundle size: 1.2MB

🔒 Job 4: Security Audit
✅ Security audit passed

✅ CI Workflow completed in 45s

📊 WORKFLOW EXECUTION SUMMARY
================================================================================
⏱️ Total execution time: 2m 15s
✅ Passed workflows: 5
❌ Failed workflows: 0

🎊 ALL WORKFLOWS PASSED! 🎊
✅ Your code is safe to push to remote repository

📋 Next steps:
  1. git add .
  2. git commit -m 'your message'
  3. git push
```

## 🔧 Troubleshooting

### Common Issues

1. **Node modules not found** → `npm ci`
2. **TypeScript errors** → `npm run type-check`
3. **Test failures** → `npm test`
4. **Build failures** → `npm run build`
5. **Performance budget exceeded** → Optimize bundle size
6. **Security vulnerabilities** → `npm audit fix`

## 🎯 Best Practices

1. **Run before committing**: Always validate changes locally
2. **Use quick mode during development**: `--quick` flag for rapid feedback
3. **Run full validation before PR**: Complete workflow execution
4. **Keep dependencies updated**: Regular `npm ci` and dependency checks

---

**📧 Questions?** Check the repository documentation or reach out to the development team.