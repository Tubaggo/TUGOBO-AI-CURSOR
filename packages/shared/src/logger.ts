type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function formatContext(context?: Record<string, unknown>): string {
  if (!context) return "";
  // PII redaction: strip phone numbers and message bodies from logs
  const safe = { ...context };
  if ("phone" in safe) safe.phone = "[REDACTED]";
  if ("fromPhone" in safe) safe.fromPhone = "[REDACTED]";
  if ("toPhone" in safe) safe.toPhone = "[REDACTED]";
  if ("body" in safe) safe.body = "[REDACTED]";
  if ("content" in safe) safe.content = "[REDACTED]";
  if ("message" in safe) safe.message = "[REDACTED]";
  return " " + JSON.stringify(safe);
}

function log({ level, message, context }: LogEntry) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${formatContext(context)}`;
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log({ level: "debug", message, context }),
  info: (message: string, context?: Record<string, unknown>) =>
    log({ level: "info", message, context }),
  warn: (message: string, context?: Record<string, unknown>) =>
    log({ level: "warn", message, context }),
  error: (message: string, context?: Record<string, unknown>) =>
    log({ level: "error", message, context }),
};
