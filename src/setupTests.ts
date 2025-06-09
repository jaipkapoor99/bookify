import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("@/SupabaseClient", async (importActual) => {
  const actual = await importActual<typeof import("@/SupabaseClient")>();

  // Deep mock the Supabase client to handle chained calls
  const single = vi.fn();
  const abortSignal = vi.fn(() => ({
    then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
      resolve({ data: [], error: null }),
  }));
  const eq = vi.fn(() => ({ single: single }));
  const select = vi.fn(() => ({
    eq: eq,
    single: single,
    abortSignal: abortSignal,
    then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
      resolve({ data: [], error: null }),
  }));
  const from = vi.fn(() => ({ select: select }));

  // RPC needs to handle both 2 and 3 argument calls
  const rpc = vi.fn(() => {
    // Return an object that supports .select() chaining
    return {
      select: select,
      then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
        resolve({ data: [], error: null }),
    };
  });

  // Mock auth for signup
  const auth = {
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
  };

  // Mock functions.invoke
  const functions = {
    invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
  };

  return {
    ...actual,
    supabase: {
      ...actual.supabase,
      from: from,
      rpc: rpc,
      auth: auth,
      functions: functions,
    },
    createSupabaseSignupClient: vi.fn(() => ({
      auth: {
        signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    })),
  };
});
