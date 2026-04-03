// Root server.js for Render deployment
// This file starts the backend server from the project-root/backend directory

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set working directory to project root for proper path resolution
process.chdir(__dirname);

// Backend server path
const backendPath = path.join(__dirname, 'project-root', 'backend', 'server.js');

console.log('🚀 Starting YHK Backend Server...');
console.log('📁 Working directory:', __dirname);
console.log('📂 Backend path:', backendPath);

// Start the backend server with proper environment
const backendServer = spawn('node', [backendPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '50017'
  },
  cwd: __dirname
});

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('📡 Received SIGINT, shutting down gracefully...');
  backendServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📡 Received SIGTERM, shutting down gracefully...');
  backendServer.kill('SIGTERM');
  process.exit(0);
});

// Handle server errors
backendServer.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

backendServer.on('exit', (code) => {
  console.log(`🔄 Backend server exited with code ${code}`);
  process.exit(code);
});

backendServer.on('close', (code) => {
  console.log(`� Backend server closed with code ${code}`);
});

console.log('✅ Server startup initiated');
