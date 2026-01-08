#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting Asset Management System Development Servers...\n");

// Start backend server
console.log("📡 Starting Backend Server (FastAPI)...");
const backend = spawn(
  "python",
  [
    "-m",
    "uvicorn",
    "app.main:app",
    "--reload",
    "--host",
    "0.0.0.0",
    "--port",
    "8000",
  ],
  {
    cwd: path.join(__dirname, "backend"),
    stdio: "inherit",
    shell: true,
  }
);

// Start frontend server
console.log("⚛️  Starting Frontend Server (React)...");
const frontend = spawn("npm", ["start"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
  shell: true,
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down servers...");
  backend.kill();
  frontend.kill();
  process.exit(0);
});

backend.on("close", (code) => {
  console.log(`Backend server exited with code ${code}`);
});

frontend.on("close", (code) => {
  console.log(`Frontend server exited with code ${code}`);
});

console.log("\n✅ Development servers starting...");
console.log("📡 Backend: http://localhost:8000");
console.log("⚛️  Frontend: http://localhost:3000");
console.log("📚 API Docs: http://localhost:8000/docs");
console.log("\nPress Ctrl+C to stop both servers");
