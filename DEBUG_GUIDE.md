# Debug Guide

This guide explains how to use the debug functionality in the booking platform.

## Quick Start

### Enable Debug Mode

```bash
# Run with debug logs (includes tests)
npm run dev:debug

# Run with debug logs (skip tests)
npm run dev:debug-quiet
```

### Debug Output

When debug mode is enabled, you'll see colored, timestamped logs **both in your browser console AND in the terminal**:

**Terminal Output:**

```
[20:23:46.123] [INFO] 🐛 Initializing with session
{
  "hasToken": true,
  "userId": "user-123",
  "fullUser": { ... }
}

[20:23:46.456] [INFO] 🐛 MyBookingsPage loaded successfully
{
  "ticketsRaw": [...],
  "eventsVenues": [...],
  "venues": [...],
  "events": [...],
  "locations": [...],
  "transformedTickets": [...]
}
```

**Browser Console:**

```
[20:23:46.123] [INFO] 🔐 AUTH: Initializing with session {...}
[20:23:46.456] [INFO] 🎫 BOOKING: MyBookingsPage loaded successfully {...}
```

## Debug Categories

The debug system includes specialized loggers for different parts of the app:

- `🔐 AUTH` - Authentication and session management
- `🌐 API` - API calls and responses
- `🗄️ DB` - Database operations
- `🎨 UI` - User interface events
- `🎫 BOOKING` - Booking-related operations

## Usage in Code

### Import the debug utility

```typescript
import debug from "@/lib/debug";
```

### Basic logging

```typescript
debug.info("Something happened", { data: "example" });
debug.warn("Warning message", errorObject);
debug.error("Error occurred", errorDetails);
debug.success("Operation completed successfully");
```

### Category-specific logging

```typescript
debug.auth("User logged in", { userId: "123" });
debug.api("API call completed", { endpoint: "/users", status: 200 });
debug.db("Database query executed", { table: "users", rows: 5 });
debug.ui("Button clicked", { buttonId: "submit" });
debug.booking("Ticket booked", { ticketId: "456", eventId: "789" });
```

### Runtime control

```typescript
// Check if debug is enabled
if (debug.isEnabled()) {
  // Expensive debug operation
}

// Enable/disable debug at runtime (browser only)
debug.enable();
debug.disable();
```

## Environment Variables

Debug mode is controlled by the `DEBUG` environment variable:

- `DEBUG=true` - Enable debug logging
- `DEBUG=false` or unset - Disable debug logging

## Log Levels

- **INFO** (Cyan) - General information
- **WARN** (Yellow) - Warnings and non-critical issues
- **ERROR** (Red) - Errors and exceptions
- **SUCCESS** (Green) - Successful operations

## Best Practices

1. **Use appropriate categories** - Use `debug.auth()`, `debug.api()`, etc. instead of generic `debug.info()`
2. **Include relevant data** - Pass objects with context information
3. **Don't log sensitive data** - Avoid logging passwords, tokens, or personal information
4. **Use conditional logging** - Check `debug.isEnabled()` for expensive operations
5. **Keep messages concise** - Use clear, descriptive messages

## Examples

### Authentication Flow

```typescript
debug.auth("Starting login process", { email: user.email });
debug.auth("Session created", {
  userId: session.user.id,
  expiresAt: session.expires_at,
});
debug.auth("Profile fetched", { profileId: profile.user_id });
```

### API Calls

```typescript
debug.api("Making request", { method: "POST", url: "/api/tickets" });
debug.api("Request completed", { status: 200, duration: "245ms" });
debug.api("Request failed", { status: 400, error: "Validation failed" });
```

### Database Operations

```typescript
debug.db("Querying tickets", { userId: "123", filters: { status: "active" } });
debug.db("Query completed", { rowCount: 5, duration: "12ms" });
```

## Troubleshooting

### Debug logs not appearing?

1. Make sure you're using `npm run dev:debug` or `npm run dev:debug-quiet`
2. Check that the `DEBUG` environment variable is set to `true`
3. Verify that `cross-env` is installed: `npm install -D cross-env`

### Performance impact?

Debug logging is automatically disabled in production builds. The debug checks have minimal performance impact when disabled.

### Browser console vs Terminal?

- **Terminal logs** - All debug logs are forwarded to the terminal where they're accessible to AI assistants and development tools
- **Browser console** - All debug logs also appear in the browser's developer console for interactive debugging

Debug logs appear in **both places simultaneously** when debug mode is enabled, giving you maximum visibility into application behavior.
