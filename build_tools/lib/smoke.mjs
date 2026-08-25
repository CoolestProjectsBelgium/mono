import { sshExec } from './ssh.mjs';

/**
 * @param {{ sshUser: string, sshHost: string, port: number, smokePath: string, runImpl?: Function }} input
 */
export function smokeLocalhost(input) {
  const path = input.smokePath.startsWith('/') ? input.smokePath : `/${input.smokePath}`;
  const result = sshExec({
    sshUser: input.sshUser,
    sshHost: input.sshHost,
    runImpl: input.runImpl,
    command: `curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:${input.port}${path}`,
  });
  const code = result.stdout.trim();
  if (code !== '200' && code !== '301' && code !== '302') {
    throw new Error(`Smoke check failed: localhost:${input.port}${path} returned ${code}`);
  }
  return code;
}
