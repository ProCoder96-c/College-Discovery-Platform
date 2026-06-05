const { spawn } = require('child_process');
const path = require('path');

console.log("=================================================");
console.log("Starting CampusSelect Dev Orchestrator...");
console.log("=================================================");

// Spawn Backend REST Server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line) console.log(`[Backend] ${line}`);
  });
});

backend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line) console.error(`[Backend ERR] ${line}`);
  });
});

// Spawn Frontend Dev Server
const frontend = spawn('npx', ['vite'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true
});

frontend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line) console.log(`[Frontend] ${line}`);
  });
});

frontend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line) console.error(`[Frontend ERR] ${line}`);
  });
});

backend.on('close', (code) => {
  console.log(`[Backend] Server closed with exit code ${code}`);
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`[Frontend] Vite closed with exit code ${code}`);
  process.exit(code);
});

// Capture termination signals to clean up child processes
process.on('SIGINT', () => {
  console.log("\nShutting down servers...");
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log("\nShutting down servers...");
  backend.kill();
  frontend.kill();
  process.exit();
});
