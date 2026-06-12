const PREFIX = {
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  success: "✅",
  debug: "🔍",
};

function formatMessage(level: keyof typeof PREFIX, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `${PREFIX[level]} [${timestamp}] ${message}${dataStr}`;
}

export const logger = {
  info: (message: string, data?: unknown) =>
    console.log(formatMessage("info", message, data)),
  warn: (message: string, data?: unknown) =>
    console.warn(formatMessage("warn", message, data)),
  error: (message: string, data?: unknown) =>
    console.error(formatMessage("error", message, data)),
  success: (message: string, data?: unknown) =>
    console.log(formatMessage("success", message, data)),
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.log(formatMessage("debug", message, data));
    }
  },
};
