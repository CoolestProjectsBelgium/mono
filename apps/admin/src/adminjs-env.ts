import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const APP_DIR = path.dirname(fileURLToPath(import.meta.url))

process.chdir(APP_DIR)
process.env.ADMIN_JS_TMP_DIR = path.join(APP_DIR, '.adminjs')
if (process.env.NODE_ENV === 'production') {
  process.env.ADMIN_JS_SKIP_BUNDLE = 'true'
}
