// Vite plugin to capture debug logs and display them in terminal
export default function debugPlugin() {
  return {
    name: "debug-logger",
    configureServer(server) {
      // Add middleware to handle debug log endpoint
      server.middlewares.use("/__debug_log", (req, res, next) => {
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const debugData = JSON.parse(body);
              const { timestamp, level, message, data } = debugData;

              // Color codes for terminal output
              const colors = {
                INFO: "\x1b[36m", // Cyan
                WARN: "\x1b[33m", // Yellow
                ERROR: "\x1b[31m", // Red
                SUCCESS: "\x1b[32m", // Green
                RESET: "\x1b[0m", // Reset
              };

              const color = colors[level] || colors.INFO;
              const reset = colors.RESET;

              // Log to terminal
              console.log(
                `${color}[${timestamp}] [${level}] 🐛 ${message}${reset}`
              );
              if (data && Object.keys(data).length > 0) {
                console.log(JSON.stringify(data, null, 2));
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end('{"status":"ok"}');
            } catch (error) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end('{"error":"Invalid JSON"}');
            }
          });
        } else {
          next();
        }
      });

      // Add middleware to capture browser console logs
      server.middlewares.use("/__console_log", (req, res, next) => {
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const logData = JSON.parse(body);
              const { level, message, data } = logData;

              // Color codes for different log levels
              const colors = {
                log: "\x1b[37m", // White
                info: "\x1b[36m", // Cyan
                warn: "\x1b[33m", // Yellow
                error: "\x1b[31m", // Red
                debug: "\x1b[35m", // Magenta
                RESET: "\x1b[0m", // Reset
              };

              const color = colors[level] || colors.log;
              const reset = colors.RESET;

              // Format timestamp
              const timestamp = new Date().toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                fractionalSecondDigits: 3,
              });

              // Log to terminal with proper formatting
              console.log(
                `${color}[${timestamp}] [BROWSER-${level.toUpperCase()}] ${message}${reset}`
              );
              if (data && data.length > 0) {
                data.forEach((item, index) => {
                  if (typeof item === "object") {
                    console.log(`  [${index}]:`, JSON.stringify(item, null, 2));
                  } else {
                    console.log(`  [${index}]:`, item);
                  }
                });
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end('{"status":"ok"}');
            } catch (error) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end('{"error":"Invalid JSON"}');
            }
          });
        } else {
          next();
        }
      });
    },
  };
}
