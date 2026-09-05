import { execSync } from 'node:child_process';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const pids = sh("pgrep -f 'loader.mjs src/index.ts' || true").split('\n').filter(Boolean);
for (const pid of pids) {
  try {
    const cwd = sh(`readlink -f /proc/${pid}/cwd`);
    console.log(`PID ${pid} cwd=${cwd}`);
  } catch {
    console.log(`PID ${pid} cwd=?`);
  }
}

try {
  console.log('port3000:', sh('fuser 3000/tcp 2>/dev/null || echo none'));
} catch {
  console.log('port3000: unknown');
}
