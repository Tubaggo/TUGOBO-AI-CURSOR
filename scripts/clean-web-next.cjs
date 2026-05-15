/**
 * Remove apps/web/.next (Next.js build output + cache).
 * Safe to run when dev server is stopped; on Windows, locked files may fail if Next is still running.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "apps", "web", ".next");

if (!fs.existsSync(target)) {
  console.log("[clean:web] Nothing to remove:", target);
  process.exit(0);
}

try {
  fs.rmSync(target, { recursive: true, force: true });
  console.log("[clean:web] Removed:", target);
} catch (err) {
  console.error("[clean:web] Failed to remove .next:", err && err.message ? err.message : err);
  console.error("[clean:web] Stop the dev server (Ctrl+C), then retry — or run run-clean-dev.bat on Windows.");
  process.exit(1);
}
