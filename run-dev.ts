import { spawn } from "bun";
import os from "node:os";

const bunPath = process.execPath || "bun";

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();

console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("\x1b[36m%s\x1b[0m", "  🚀 Memulai Backend & Frontend (Notion Tracker) ");
console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("  💻 Local PC : http://localhost:5173");
console.log(`  📱 HP (Wi-Fi): \x1b[32mhttp://${localIp}:5173\x1b[0m`);
console.log("  ⚙️  Backend  : http://localhost:3001");
console.log("  Tekan Ctrl+C untuk menghentikan kedua server.");
console.log("--------------------------------------------------\n");

// Helper untuk format stream output dengan warna
async function pipeOutput(
  stream: ReadableStream<Uint8Array> | null,
  tag: string,
  color: string
) {
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim().length > 0) {
          console.log(`${color}[${tag}]\x1b[0m ${line}`);
        }
      }
    }
    if (buffer.trim().length > 0) {
      console.log(`${color}[${tag}]\x1b[0m ${buffer}`);
    }
  } catch (_) {}
}

// 1. Jalankan Backend (Elysia)
const backend = spawn([bunPath, "run", "dev"], {
  cwd: "./backend",
  stdout: "pipe",
  stderr: "pipe",
  env: process.env,
});

// 2. Jalankan Frontend (React Router / Vite)
const frontend = spawn([bunPath, "run", "dev"], {
  cwd: "./frontend",
  stdout: "pipe",
  stderr: "pipe",
  env: process.env,
});

// Pipe outputs dengan warna berbeda
pipeOutput(backend.stdout, "BACKEND", "\x1b[35m");  // Magenta
pipeOutput(backend.stderr, "BACKEND", "\x1b[31m");  // Red
pipeOutput(frontend.stdout, "FRONTEND", "\x1b[32m"); // Green
pipeOutput(frontend.stderr, "FRONTEND", "\x1b[33m"); // Yellow

// Handle cleanup saat Ctrl+C
function cleanExit() {
  console.log("\n\x1b[33m%s\x1b[0m", "Menghentikan server backend dan frontend...");
  try {
    backend.kill();
  } catch (_) {}
  try {
    frontend.kill();
  } catch (_) {}
  process.exit(0);
}

process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);
process.on("exit", cleanExit);
