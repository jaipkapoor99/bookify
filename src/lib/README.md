# API Client Architecture

## Overview

The API client has been refactored from a single 437-line file into a modular architecture for better maintainability and separation of concerns.

## Structure

### 📁 Files

- **`api-client.ts`** - Main entry point (35 lines)
- **`auth-client.ts`** - Authentication operations (195 lines)
- **`database-client.ts`** - Database operations (220 lines)

### 🔐 Authentication Client (`auth-client.ts`)

**Responsibilities:**

- User authentication (login/logout)
- OAuth flow management (Google)
- Session management and storage
- Token refresh and validation

**Key Exports:**

```typescript
import {
  authApi, // Authentication operations
  getCurrentUser, // Get current user
  getStoredSession, // Session utilities
  storeSession, // Session storage
  type User, // User type
  type Session, // Session type
  type AuthResponse, // Auth response type
} from "./auth-client";
```

### 📊 Database Client (`database-client.ts`)

**Responsibilities:**

- CRUD operations (Create, Read, Update, Delete)
- RPC function calls
- Query filtering and options
- Database error handling
- Auth token management for database calls

**Key Exports:**

```typescript
import {
  dbApi, // Database operations
  setAuthToken, // Set auth token for requests
  initializeDbAuth, // Initialize database auth
} from "./database-client";
```

### 🔗 Main Entry Point (`api-client.ts`)

**Responsibilities:**

- Re-export all functionality from specialized modules
- Maintain backwards compatibility
- Single import point for existing code

**Usage (unchanged):**

```typescript
import { authApi, dbApi, type User } from "@/lib/api-client";
```

## Benefits

### ✅ **Maintainability**

- **Focused modules**: Each file has a single responsibility
- **Smaller files**: 195 + 220 + 35 lines vs 437 lines
- **Clear separation**: Auth logic separate from database logic

### ✅ **Developer Experience**

- **Better navigation**: Easier to find specific functionality
- **Reduced complexity**: Less cognitive load per file
- **Type safety**: Maintained across all modules

### ✅ **Backwards Compatibility**

- **No breaking changes**: Existing imports continue to work
- **Same API**: All existing function signatures unchanged
- **Zero refactoring**: No changes needed in application code

### ✅ **Testing & Debugging**

- **Isolated testing**: Can test auth and database logic separately
- **Clearer errors**: Easier to identify which module has issues
- **Better debugging**: Smaller surface area per module

## Migration Path

### For New Code

Consider importing from specific modules for clarity:

```typescript
// More explicit - shows what you're using
import { authApi } from "./auth-client";
import { dbApi } from "./database-client";

// Still works - backwards compatible
import { authApi, dbApi } from "./api-client";
```

### For Existing Code

No changes required! All existing imports continue to work exactly as before.

## Architecture Principles

1. **Single Responsibility**: Each module handles one domain
2. **Loose Coupling**: Modules are independent where possible
3. **High Cohesion**: Related functionality is grouped together
4. **Backwards Compatibility**: Existing code continues to work
5. **Type Safety**: Full TypeScript support throughout

This architecture follows industry best practices for API client organization and makes the codebase more maintainable for long-term development.
