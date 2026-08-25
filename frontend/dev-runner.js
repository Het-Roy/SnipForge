const { spawn } = require('child_process');
const path = require('path');

console.log("🛠️  Starting SnipForge Full-Stack...");

// 1. Start Backend
const server = spawn('npm', ['run', 'dev'], { 
  cwd: path.join(__dirname, '../server'), 
  shell: true,
  stdio: 'inherit' 
});

// 2. Start Frontend
const client = spawn('npm', ['start'], { 
  cwd: __dirname, 
  shell: true, 
  stdio: 'inherit' 
});

// Cleanup on exit
process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});
