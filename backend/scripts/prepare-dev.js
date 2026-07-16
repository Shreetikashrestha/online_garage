import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const prismaBin = path.join(backendRoot, 'node_modules', '.bin', 'prisma');

const run = (command, options = {}) => {
  execSync(command, {
    cwd: backendRoot,
    stdio: 'inherit',
    ...options,
  });
};

const safeRun = (command, label) => {
  try {
    run(command);
  } catch (error) {
    console.warn(`⚠️  ${label} step failed. Continuing with startup...`);
  }
};

if (fs.existsSync(prismaBin)) {
  fs.chmodSync(prismaBin, 0o755);
}

safeRun('docker compose up -d', 'Docker container startup');
safeRun('npx prisma db push', 'Prisma schema sync');

try {
  const output = execSync('lsof -ti :3000 || true', {
    cwd: backendRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const pids = output
    .split(/\s+/)
    .map((pid) => Number(pid))
    .filter((pid) => Number.isInteger(pid) && pid > 0);

  if (pids.length > 0) {
    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Ignore missing or already-exited processes.
      }
    }

    console.log(`🧹 Cleared stale backend process(es) on port 3000: ${pids.join(', ')}`);
  }
} catch {
  console.warn('⚠️  Could not inspect port 3000 for stale processes.');
}
