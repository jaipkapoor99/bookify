# 🗄️ Database Files

This directory contains all database-related files for the Bookify event booking platform.

## 📋 **File Overview**

### 🔧 **Database Dumps & Backups**

| File                         | Description                                      | Use Case                            | Size |
| ---------------------------- | ------------------------------------------------ | ----------------------------------- | ---- |
| `database_complete_dump.sql` | Complete database dump including schema and data | Full database restoration           | 16KB |
| `database_data_only.sql`     | Data-only dump without schema                    | Data restoration to existing schema | 25KB |
| `populate_database_safe.sql` | Safe population script with sample data          | Development and testing             | 13KB |

---

## 🎯 **Usage Instructions**

### **Complete Database Restoration**

```bash
# Restore complete database (schema + data)
psql -h localhost -p 54322 -U postgres -d postgres -f database_complete_dump.sql
```

### **Data-Only Restoration**

```bash
# Restore only data to existing schema
psql -h localhost -p 54322 -U postgres -d postgres -f database_data_only.sql
```

### **Development Setup**

```bash
# Populate database with safe sample data
psql -h localhost -p 54322 -U postgres -d postgres -f populate_database_safe.sql
```

---

## 🔍 **File Details**

### **database_complete_dump.sql**

- **Purpose**: Full database backup including schema and data
- **Contains**: Tables, relationships, RLS policies, functions, and data
- **Best For**: Complete environment setup, disaster recovery
- **Generated**: Automated backup from production-ready schema

### **database_data_only.sql**

- **Purpose**: Data restoration without schema changes
- **Contains**: INSERT statements for all tables
- **Best For**: Refreshing data in existing database
- **Generated**: Data-only export from populated database

### **populate_database_safe.sql**

- **Purpose**: Safe development data population
- **Contains**: Sample events, venues, locations, and user data
- **Best For**: Development, testing, and demos
- **Features**:
  - Safe INSERT statements with conflict resolution
  - Realistic sample data for testing
  - Maintains referential integrity

---

## 🚀 **Quick Start**

### For New Development Environment

```bash
# 1. Start Supabase
supabase start

# 2. Populate with sample data
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres -f database/populate_database_safe.sql
```

### For Production-Like Testing

```bash
# Use complete dump for full production replica
psql -h localhost -p 54322 -U postgres -d postgres -f database/database_complete_dump.sql
```

---

## 🛡️ **Safety Notes**

### **Development Safety**

- `populate_database_safe.sql` uses `INSERT ... ON CONFLICT DO NOTHING` to prevent duplicates
- All scripts are idempotent and can be run multiple times safely
- No destructive operations (DROP, DELETE) in safe population script

### **Production Considerations**

- Always backup production data before running restoration scripts
- Test scripts in staging environment first
- Complete dumps should be used with caution in production

---

## 📊 **Database Schema Overview**

The database includes these main tables:

### **Core Tables**

- `events` - Event information and details
- `venues` - Venue information
- `locations` - Location data with pincode
- `events_venues` - Many-to-many relationship with pricing
- `users` - User profile information
- `tickets` - Booking records

### **Relationships**

- Events ↔ Venues (many-to-many via events_venues)
- Venues → Locations (one-to-many)
- Users → Tickets (one-to-many)
- Events_Venues → Tickets (one-to-many)

---

## 🔧 **Database Tools**

For advanced database operations, use the PowerShell database tools:

```powershell
# Database status and connection info
pwsh scripts/database-tools.ps1 status

# Create backup
pwsh scripts/database-tools.ps1 backup

# Restore from backup
pwsh scripts/database-tools.ps1 restore -BackupFile backup.sql
```

---

## 📈 **File Maintenance**

### **Update Schedule**

- Database dumps are created after major schema changes
- Sample data is updated when new features require test data
- Complete dumps are generated before major releases

### **Version Compatibility**

- Files are compatible with PostgreSQL 14+
- Designed for Supabase environment
- Row Level Security (RLS) policies included

---

_This database documentation was last updated on 2025-01-17 for Bookify v1.6.4_
