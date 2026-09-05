import { execSync } from 'node:child_process';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

try { sh('pkill -f "tsx watch src/index.ts"'); } catch { /* none */ }
try { sh('fuser -k 3000/tcp'); } catch { /* none */ }

sh('sleep 3');
sh('cd /workspace && npm run build --workspace=apps/admin');
sh('cd /workspace && nohup npm run start:dev --workspace=apps/admin > /tmp/admin.log 2>&1 &');
sh('sleep 20');

const status = sh("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/admin");
const processes = sh("pgrep -af 'loader.mjs src/index.ts' || true");
console.log(JSON.stringify({ adminStatus: status, processes }, null, 2));
