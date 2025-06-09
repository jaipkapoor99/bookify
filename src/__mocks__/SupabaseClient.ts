import { vi } from "vitest";

const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const rpc = vi.fn(() => ({ select: vi.fn() }));

const from = vi.fn(() => ({
  select: vi.fn(() => ({
    eq,
    single,
    order: vi.fn(() => ({
      eq,
      single,
    })),
  })),
}));

const signUp = vi.fn();
const signInWithPassword = vi.fn();
const signOut = vi.fn();

const auth = {
  signUp,
  signInWithPassword,
  signOut,
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  getSession: vi.fn(() => ({ data: { session: null } })),
};

const functions = {
  invoke: vi.fn(),
};

export const supabase = {
  from,
  rpc,
  auth,
  functions,
};

export const createSupabaseSignupClient = vi.fn(() => ({
  auth,
}));
