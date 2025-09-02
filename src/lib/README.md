# API Client Architecture

## Overview

The API client has been simplified to use the Supabase SDK directly.
This provides a more streamlined and maintainable architecture.

## Structure

### 📁 Files

- **`auth-client.ts`** - Initializes and exports the Supabase client.
- **`database-client.ts`** - Re-exports the Supabase client as `dbApi`
  for database operations.
- **`api-client.ts`** - Main entry point that re-exports `dbApi`.

### 🔐 Supabase Client (`auth-client.ts`)

**Responsibilities:**

- Initializes the Supabase client with environment variables.
- Exports the Supabase client for use in other modules.

### 📊 Database Client (`database-client.ts`)

**Responsibilities:**

- Re-exports the Supabase client with the alias `dbApi` to maintain backwards
  compatibility with components that use this convention.

### 🔗 Main Entry Point (`api-client.ts`)

**Responsibilities:**

- Re-exports `dbApi` for a single import point.

## Benefits

### ✅ **Simplicity**

- Eliminates unnecessary abstractions and custom logic.
- Directly uses the powerful and well-documented Supabase SDK.

### ✅ **Maintainability**

- Easier to understand and maintain.
- Reduces the amount of custom code that needs to be tested.

### ✅ **Type Safety**

- Leverages the built-in types from the Supabase SDK.
