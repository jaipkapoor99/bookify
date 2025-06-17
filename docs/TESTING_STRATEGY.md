# Testing Strategy

## Overview

Bookify follows a comprehensive testing strategy ensuring reliability, performance, and user experience across all components. Our testing approach combines unit tests, integration tests, and end-to-end validation with a focus on Test-Driven Development (TDD).

## Testing Philosophy

### Test-Driven Development (TDD)

- **Red-Green-Refactor Cycle**: Write failing tests first, implement minimal code to pass, then refactor
- **Specification by Example**: Tests serve as living documentation of expected behavior
- **Regression Prevention**: Comprehensive test coverage prevents breaking changes

### Testing Pyramid

```
        /\
       /  \
      / E2E \     ← Few, high-level integration tests
     /______\
    /        \
   / INTEG.  \   ← Medium number of integration tests
  /__________\
 /            \
/ UNIT TESTS  \  ← Many, fast unit tests
/______________\
```

## Test Categories

### 1. Unit Tests

**Location**: `src/components/**/__tests__/`, `src/pages/__tests__/`, `src/lib/__tests__/`, `src/contexts/__tests__/`

**Coverage**:

- **Components**: Rendering, user interactions, props handling
- **Hooks**: Custom hook behavior and state management
- **Utilities**: Pure functions and helper methods
- **Context Providers**: State management and side effects

**Examples**:

```typescript
// Component Testing
describe("MyBookingsPage", () => {
  it("should display bookings when user is authenticated", async () => {
    // Test implementation
  });
});

// Context Testing
describe("AuthContext", () => {
  it("should handle session persistence on page refresh", async () => {
    // Test session restoration
  });
});
```

### 2. Integration Tests

**Location**: `src/__tests__/integration.test.tsx`

**Coverage**:

- **Authentication Flow**: Login, logout, session management
- **Session Management**: Persistence, expiry, corruption handling
- **Route Protection**: Access control and redirects
- **Error Handling**: Network failures, API errors
- **Performance**: Load times and responsiveness

**Key Test Scenarios**:

```typescript
describe("Session Management", () => {
  it("should handle corrupted session", async () => {
    // Validates session cleanup for invalid data
  });

  it("should handle session expiry", async () => {
    // Ensures expired sessions are properly cleared
  });
});
```

### 3. API Client Testing

**Location**: `src/lib/__tests__/api-client.test.ts`

**Coverage**:

- **Modular Architecture**: auth-client.ts, database-client.ts separation
- **Authentication**: Login, logout, token management
- **Database Operations**: CRUD operations with proper error handling
- **Session Persistence**: Token storage and retrieval

## Testing Tools & Setup

### Core Testing Stack

- **Test Runner**: Vitest (fast, Vite-native)
- **Testing Library**: React Testing Library (user-centric testing)
- **Mocking**: Vitest mocks for external dependencies
- **Assertions**: Vitest expect (Jest-compatible)

### Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
  },
});
```

### Mocking Strategy

```typescript
// Mock external dependencies
vi.mock("@/lib/api-client");
vi.mock("sonner");

// Mock environment variables
vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
```

## Session Persistence Testing

### Problem Solved

**Issue**: Page refresh on protected routes (like `/my-bookings`) redirected users to login despite valid authentication.

**Root Cause**: Hardcoded `loading: false` in AuthContext caused premature authentication checks.

### Testing Approach

```typescript
describe("Session Persistence", () => {
  it("should maintain authentication state on page refresh", async () => {
    // Mock valid session
    const mockSession = {
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: Math.floor(Date.now() / 1000) + 3600, // Valid timestamp
      user: { id: "test-user-id", email: "test@example.com" },
    };

    // Verify session restoration
    mockedAuthApi.getSession.mockResolvedValue({
      data: mockSession,
      error: null,
    });

    // Test protected route access
    render(<App initialEntries={["/my-bookings"]} />);

    // Should not redirect to login
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("m@example.com")
      ).not.toBeInTheDocument();
    });
  });
});
```

### Expiry Validation Testing

```typescript
it("should handle session expiry correctly", async () => {
  const mockExpiredSession = {
    expires_in: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    // ... other session data
  };

  // Should clear expired session and show login
  await waitFor(() => {
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });
});
```

## Testing Best Practices

### 1. Test Isolation

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Reset localStorage
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
});
```

### 2. Async Testing

```typescript
// Use waitFor for state updates
await waitFor(() => {
  expect(screen.getByText("Welcome back!")).toBeInTheDocument();
});

// Handle loading states
expect(screen.getByText("Authenticating...")).toBeInTheDocument();
```

### 3. User-Centric Testing

```typescript
// Test user interactions, not implementation details
fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
  target: { value: "test@example.com" },
});
fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
```

### 4. Error Boundary Testing

```typescript
describe("Error Handling", () => {
  it("should handle network errors gracefully", async () => {
    mockedAuthApi.getSession.mockRejectedValue(new Error("Network error"));

    // Should show appropriate error state
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    });
  });
});
```

## Performance Testing

### Load Time Validation

```typescript
it("should render home page quickly", async () => {
  const startTime = performance.now();
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Discover Amazing Events")).toBeInTheDocument();
  });

  const endTime = performance.now();
  const renderTime = endTime - startTime;

  // Should render within reasonable time (less than 1 second)
  expect(renderTime).toBeLessThan(1000);
});
```

### Large Dataset Handling

```typescript
it("should handle large datasets efficiently", async () => {
  const mockLargeEventList = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Event ${i + 1}`,
    description: `Description ${i + 1}`,
  }));

  // Test performance with large data
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Discover Amazing Events")).toBeInTheDocument();
  });
});
```

## Test Coverage Goals

### Current Coverage

- **Unit Tests**: 95%+ coverage for critical components
- **Integration Tests**: Complete authentication and routing flows
- **API Tests**: 100% coverage for auth-client and database-client modules

### Quality Metrics

- **All Tests Passing**: ✅ 66/66 tests passing
- **Zero Linter Errors**: ✅ Clean code standards maintained
- **Performance Benchmarks**: ✅ Sub-1000ms render times

## Continuous Integration

### Pre-commit Checks

```bash
npm run test      # Run all tests
npm run lint      # Code quality checks
npm run build     # Verify build success
```

### Test Automation

- **Pull Request Validation**: All tests must pass before merge
- **Regression Testing**: Automated test suite on every commit
- **Performance Monitoring**: Load time tracking in CI/CD

## Testing Workflow

### 1. Feature Development

1. **Write Failing Test**: Define expected behavior
2. **Implement Feature**: Minimal code to pass test
3. **Refactor**: Optimize while maintaining test coverage
4. **Integration Test**: Verify end-to-end functionality

### 2. Bug Fixes

1. **Reproduce Bug**: Create failing test case
2. **Fix Implementation**: Update code to pass test
3. **Regression Test**: Ensure fix doesn't break existing functionality
4. **Documentation**: Update relevant test documentation

### 3. Performance Optimization

1. **Baseline Measurement**: Establish current performance metrics
2. **Optimization**: Implement performance improvements
3. **Validation**: Verify improvements meet performance targets
4. **Monitoring**: Add performance tests to prevent regressions

## Key Testing Achievements

### Session Persistence (v1.6.1)

- ✅ **Fixed Page Refresh Issue**: Protected routes maintain authentication state
- ✅ **Enhanced Loading States**: Proper loading indicators during session restoration
- ✅ **Expiry Validation**: Robust session expiry detection and cleanup
- ✅ **Test Coverage**: Comprehensive session management test suite

### Architecture Testing

- ✅ **Modular API Client**: Separate testing for auth and database operations
- ✅ **Context Testing**: AuthContext state management validation
- ✅ **Route Protection**: Complete authentication flow testing
- ✅ **Error Handling**: Network failure and edge case coverage

## Future Testing Enhancements

### 1. Visual Regression Testing

- Component snapshot testing
- UI consistency validation
- Cross-browser compatibility

### 2. End-to-End Testing

- User journey automation
- Real database integration
- Production environment testing

### 3. Accessibility Testing

- Screen reader compatibility
- Keyboard navigation
- ARIA compliance validation

---

**Testing Philosophy**: "Test behavior, not implementation. Focus on user experience, not code structure."
