import { vi } from "vitest";

const abortSignal = vi.fn();
const single = vi.fn(() => Promise.resolve({ data: {}, error: null }));
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq, abortSignal }));
const from = vi.fn(() => ({ select }));
const rpc = vi.fn(() => Promise.resolve({ data: [], error: null }));

const onAuthStateChange = vi.fn((_event, callback) => {
  const mockSession = {
    access_token: "mock-access-token",
    user: { id: "mock-user-id", email: "user@example.com" },
  };
  if (callback) {
    callback("INITIAL_SESSION", mockSession);
  }
  return {
    data: { subscription: { unsubscribe: vi.fn() } },
  };
});

const getSession = vi.fn(() =>
  Promise.resolve({
    data: {
      session: {
        access_token: "mock-access-token",
        user: { id: "mock-user-id", email: "user@example.com" },
      },
    },
  })
);

export const supabase = {
  from,
  auth: {
    onAuthStateChange,
    getSession,
  },
  rpc,
};
