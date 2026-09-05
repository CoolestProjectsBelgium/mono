import { execSync } from 'node:child_process';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const targets = sh("pgrep -f 'loader.mjs src/index.ts' || true").split('\n').filter(Boolean);
for (const pid of targets) {
  try {
    const cwd = sh(`readlink -f /proc/${pid}/cwd`);
    if (!cwd.includes('apps/admin')) continue;
    sh(`kill -9 ${pid}`);
    console.log(`killed ${pid} (${cwd})`);
  } catch (err) {
    console.log(`skip ${pid}: ${err.message}`);
  }
}

try { sh('pkill -9 -f "tsx watch src/index.ts"'); } catch { /* none */ }
try { sh('fuser -k 3000/tcp'); } catch { /* none */ }
sh('sleep 2');
console.log('remaining:', sh("pgrep -af 'loader.mjs src/index.ts' || echo none"));
