// =============================================
// DEBUG UTILITY
// Centralized debug logging system
// =============================================

import { ENV_VARS } from "./constants";

// Check if debug mode is enabled
const isDebugEnabled = (): boolean => {
  // In browser environment, only use import.meta.env and localStorage
  if (typeof window !== "undefined") {
    return (
      import.meta.env[ENV_VARS.DEBUG] === "true" ||
      localStorage.getItem("debug") === "true"
    );
  }
  // In Node.js environment, check both process.env and import.meta.env
  return (
    (typeof process !== "undefined" &&
      process.env[ENV_VARS.DEBUG] === "true") ||
    import.meta.env[ENV_VARS.DEBUG] === "true"
  );
};

// Debug log levels
export const DEBUG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const;

type DebugLevel = (typeof DEBUG_LEVELS)[keyof typeof DEBUG_LEVELS];

// Color codes for different log levels
const COLOR_CODES = {
  INFO: "\x1b[36m", // Cyan
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  SUCCESS: "\x1b[32m", // Green
  RESET: "\x1b[0m", // Reset
} as const;

// Format timestamp
const getTimestamp = (): string => {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Main debug function
export const debug = {
  log: (
    message: string,
    data?: unknown,
    level: DebugLevel = DEBUG_LEVELS.INFO,
  ) => {
    if (!isDebugEnabled()) return;

    const timestamp = getTimestamp();
    const colorCode = COLOR_CODES[level];
    const resetCode = COLOR_CODES.RESET;

    const logMessage = `${colorCode}[${timestamp}] [${level}] ${message}${resetCode}`;
    const dataMessage = data ? "\n" + JSON.stringify(data, null, 2) : "";

    // Log to browser console
    console.log(logMessage, dataMessage);

    // Also send to terminal via Vite's server-side logging in development
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      // Use console.error to ensure it appears in the terminal (Vite captures console.error)
      console.error(
        `🐛 [${level}] ${message}`,
        data ? JSON.stringify(data, null, 2) : "",
      );
    }
  },

  info: (message: string, data?: unknown) => {
    debug.log(message, data, DEBUG_LEVELS.INFO);
  },

  warn: (message: string, data?: unknown) => {
    debug.log(message, data, DEBUG_LEVELS.WARN);
  },

  error: (message: string, data?: unknown) => {
    debug.log(message, data, DEBUG_LEVELS.ERROR);
  },

  success: (message: string, data?: unknown) => {
    debug.log(message, data, DEBUG_LEVELS.SUCCESS);
  },

  // Specific debug functions for different parts of the app
  auth: (message: string, data?: unknown) => {
    debug.info(`🔐 AUTH: ${message}`, data);
  },

  api: (message: string, data?: unknown) => {
    debug.info(`🌐 API: ${message}`, data);
  },

  db: (message: string, data?: unknown) => {
    debug.info(`🗄️  DB: ${message}`, data);
  },

  ui: (message: string, data?: unknown) => {
    debug.info(`🎨 UI: ${message}`, data);
  },

  booking: (message: string, data?: unknown) => {
    debug.info(`🎫 BOOKING: ${message}`, data);
  },

  // Check if debugging is enabled
  isEnabled: isDebugEnabled,

  // Enable/disable debug for runtime control
  enable: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("debug", "true");
    }
  },

  disable: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("debug");
    }
  },
};

// Export debug as default
export default debug;
