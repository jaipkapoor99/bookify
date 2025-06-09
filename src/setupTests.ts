/// <reference types="vitest/globals" />

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Polyfill for ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Apply the manual mock for the Supabase client
vi.mock("@/SupabaseClient");
