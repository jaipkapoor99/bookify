// Console interceptor to forward browser logs to terminal
let isInterceptorInitialized = false;

export const initializeConsoleInterceptor = () => {
  // Only initialize once and only in development
  if (isInterceptorInitialized || !import.meta.env.DEV) {
    return;
  }

  isInterceptorInitialized = true;

  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  // Function to send logs to terminal
  const sendToTerminal = async (
    level: string,
    message: string,
    data: any[]
  ) => {
    try {
      await fetch("/__console_log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message,
          data: data.map((item) => {
            // Convert objects to strings for safe transmission
            if (typeof item === "object" && item !== null) {
              try {
                return JSON.parse(JSON.stringify(item)); // Deep clone to avoid circular refs
              } catch {
                return "[Object]";
              }
            }
            return item;
          }),
        }),
      });
    } catch {
      // Silently fail if endpoint is not available
    }
  };

  // Intercept console.log
  console.log = (...args) => {
    originalConsole.log(...args);
    const message = args[0]?.toString() || "";
    sendToTerminal("log", message, args.slice(1));
  };

  // Intercept console.info
  console.info = (...args) => {
    originalConsole.info(...args);
    const message = args[0]?.toString() || "";
    sendToTerminal("info", message, args.slice(1));
  };

  // Intercept console.warn
  console.warn = (...args) => {
    originalConsole.warn(...args);
    const message = args[0]?.toString() || "";
    sendToTerminal("warn", message, args.slice(1));
  };

  // Intercept console.error
  console.error = (...args) => {
    originalConsole.error(...args);
    const message = args[0]?.toString() || "";
    sendToTerminal("error", message, args.slice(1));
  };

  // Intercept console.debug
  console.debug = (...args) => {
    originalConsole.debug(...args);
    const message = args[0]?.toString() || "";
    sendToTerminal("debug", message, args.slice(1));
  };

  console.log(
    "🔗 Console interceptor initialized - all logs will appear in terminal"
  );
};
