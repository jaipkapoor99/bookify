# 🛠️ Bookify Scripts

This directory contains all the utility scripts for the Bookify project. These scripts help with development, testing, deployment, and maintenance tasks.

## 📋 Available Scripts

### 🚀 **Development & Setup**

#### `dev-setup.ps1`

Sets up the development environment for new contributors.

```powershell
pwsh scripts/dev-setup.ps1
```

**Features:**

- Checks Node.js and npm versions
- Installs dependencies
- Validates environment configuration
- Sets up Git hooks
- Runs initial health check

---

### 🔍 **Testing & Quality Assurance**

#### `ci.ps1` (formerly `local-ci-test.ps1`)

Runs the complete CI pipeline locally, mimicking GitHub Actions.

```powershell
pwsh scripts/ci.ps1
```

**Includes:**

- ✅ Dependency check
- 🔍 ESLint linting
- 📝 TypeScript compilation
- 🎨 Prettier formatting check
- 🧪 Test suite execution
- 🏗️ Production build
- 🔒 Security audit
- 📊 Bundle size analysis

#### `health-check.ps1` (formerly `check-project.ps1`)

Quick project health check with essential validations.

```powershell
pwsh scripts/health-check.ps1
```

**Checks:**

- Linting errors
- TypeScript compilation
- Test failures

#### `performance.ps1` (formerly `local-performance-test.ps1`)

Comprehensive performance testing and analysis.

```powershell
pwsh scripts/performance.ps1
```

**Features:**

- 📦 Bundle size analysis
- 💰 Performance budget validation
- ⚡ Lazy loading detection
- 🚀 Local server for manual testing
- 📊 Detailed metrics reporting

---

### 🚀 **Deployment & Build**

#### `deploy.ps1`

Production build and deployment preparation.

```powershell
# Full production build with validation
pwsh scripts/deploy.ps1 build

# Build and start preview server
pwsh scripts/deploy.ps1 preview

# Analyze bundle size and performance
pwsh scripts/deploy.ps1 analyze

# Skip tests for faster builds
pwsh scripts/deploy.ps1 build -SkipTests

# Skip linting for faster builds
pwsh scripts/deploy.ps1 build -SkipLint
```

**Actions:**

- `build` - Full production build with validation
- `preview` - Build and start preview server
- `analyze` - Detailed bundle analysis
- `help` - Show usage information

---

### 🗄️ **Database Management**

#### `database-tools.ps1`

Comprehensive Supabase database management utilities.

```powershell
# Show database status
pwsh scripts/database-tools.ps1 status

# Create database backup
pwsh scripts/database-tools.ps1 backup

# Reset database (WARNING: destroys data)
pwsh scripts/database-tools.ps1 reset

# Run migrations
pwsh scripts/database-tools.ps1 migrate

# Seed with sample data
pwsh scripts/database-tools.ps1 seed

# Restore from backup
pwsh scripts/database-tools.ps1 restore -BackupFile backup.sql

# Show recent logs
pwsh scripts/database-tools.ps1 logs
```

**Actions:**

- `status` - Database connection and status info
- `reset` - Complete database reset (destructive)
- `migrate` - Apply pending migrations
- `seed` - Populate with sample data
- `backup` - Create timestamped backup
- `restore` - Restore from backup file
- `logs` - Show recent database logs

---

### 🧹 **Maintenance & Cleanup**

#### `clean.ps1`

Project cleanup and cache management.

```powershell
# Basic cleanup (build artifacts, logs)
pwsh scripts/clean.ps1

# Deep cleanup (includes caches, temp files)
pwsh scripts/clean.ps1 -Deep

# Clean and reinstall node_modules
pwsh scripts/clean.ps1 -NodeModules

# Complete cleanup (everything)
pwsh scripts/clean.ps1 -All
```

**Options:**

- Default: Removes build artifacts, logs, coverage reports
- `-Deep`: Adds cache cleanup, OS temp files
- `-NodeModules`: Removes and reinstalls dependencies
- `-All`: Complete cleanup including everything above

---

## 🎯 **Quick Reference**

### **Daily Development Workflow**

```powershell
# 1. Setup (first time only)
pwsh scripts/dev-setup.ps1

# 2. Before committing
pwsh scripts/ci.ps1

# 3. Performance check
pwsh scripts/performance.ps1

# 4. Clean up when needed
pwsh scripts/clean.ps1
```

### **Deployment Workflow**

```powershell
# 1. Full validation build
pwsh scripts/deploy.ps1 build

# 2. Test locally
pwsh scripts/deploy.ps1 preview

# 3. Analyze performance
pwsh scripts/deploy.ps1 analyze
```

### **Database Workflow**

```powershell
# 1. Check status
pwsh scripts/database-tools.ps1 status

# 2. Backup before changes
pwsh scripts/database-tools.ps1 backup

# 3. Apply migrations
pwsh scripts/database-tools.ps1 migrate

# 4. Seed with data
pwsh scripts/database-tools.ps1 seed
```

---

## 📊 **NPM Scripts Integration**

These PowerShell scripts complement the npm scripts defined in `package.json`:

### **NPM Scripts Available:**

```json
{
  "dev": "npm run test:pre-dev && vite",
  "dev:debug": "npm run test:pre-dev && cross-env DEBUG=true vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:pre-dev": "vitest run --reporter=verbose --bail=1"
}
```

### **When to Use What:**

| Task             | NPM Script      | PowerShell Script                 | Use Case                 |
| ---------------- | --------------- | --------------------------------- | ------------------------ |
| Development      | `npm run dev`   | -                                 | Daily development        |
| Quick test       | `npm test`      | -                                 | Fast test run            |
| Full CI check    | -               | `pwsh scripts/ci.ps1`             | Pre-commit validation    |
| Production build | `npm run build` | `pwsh scripts/deploy.ps1 build`   | Simple vs. comprehensive |
| Performance test | -               | `pwsh scripts/performance.ps1`    | Performance analysis     |
| Database work    | -               | `pwsh scripts/database-tools.ps1` | Database management      |

---

## 🔧 **Script Features**

### **Common Features Across All Scripts:**

- ✅ **Error Handling**: Proper exit codes and error messages
- 🎨 **Colored Output**: Easy-to-read colored terminal output
- 📋 **Help Documentation**: Built-in help with `-help` or `help` action
- ⚡ **Performance Timing**: Execution time tracking where relevant
- 🔍 **Prerequisite Checking**: Validates required tools and dependencies
- 📊 **Progress Reporting**: Clear progress indicators and summaries

### **PowerShell Requirements:**

- **PowerShell 7+** (cross-platform)
- **Node.js 20+**
- **npm** (comes with Node.js)
- **Supabase CLI** (for database scripts)

---

## 🚨 **Important Notes**

### **Destructive Operations:**

- `database-tools.ps1 reset` - **DESTROYS ALL DATA**
- `clean.ps1 -NodeModules` - Removes and reinstalls dependencies
- `clean.ps1 -All` - Complete project cleanup

### **Safety Features:**

- Confirmation prompts for destructive operations
- `-Force` flag to skip confirmations (use with caution)
- Automatic backups before database operations
- Rollback capabilities where possible

### **Performance Considerations:**

- Scripts cache results where appropriate
- Parallel execution for independent operations
- Skip flags for faster execution during development
- Incremental operations to avoid unnecessary work

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Execution policy" error on Windows:**

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Supabase CLI not found:**

   ```bash
   npm install -g supabase
   ```

3. **Node.js version issues:**
   - Install Node.js 20+ from [nodejs.org](https://nodejs.org/)

4. **Permission errors:**
   - Run PowerShell as Administrator (Windows)
   - Check file permissions (Linux/macOS)

### **Getting Help:**

- Run any script with `help` action: `pwsh scripts/[script].ps1 help`
- Check the script source code for detailed comments
- Refer to the main project README.md for additional context

---

## 📈 **Script Performance Metrics**

| Script               | Typical Runtime | Resource Usage       | Frequency            |
| -------------------- | --------------- | -------------------- | -------------------- |
| `dev-setup.ps1`      | 30-60s          | Medium (npm install) | Once per setup       |
| `ci.ps1`             | 60-120s         | High (full pipeline) | Pre-commit           |
| `health-check.ps1`   | 15-30s          | Low                  | Multiple times daily |
| `performance.ps1`    | 30-45s          | Medium               | Before releases      |
| `deploy.ps1 build`   | 45-90s          | High                 | Pre-deployment       |
| `database-tools.ps1` | 5-30s           | Low-Medium           | As needed            |
| `clean.ps1`          | 5-15s           | Low                  | Weekly               |

---

_This script collection provides a comprehensive toolkit for Bookify development, testing, and deployment workflows. Each script is designed to be self-contained, well-documented, and safe to use in both development and CI/CD environments._
