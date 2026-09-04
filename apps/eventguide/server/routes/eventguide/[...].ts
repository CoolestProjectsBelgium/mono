import { proxyRequest } from 'h3'

const apiOrigin = 'http://127.0.0.1:3001'

export default defineEventHandler((event) => {
  const suffix = event.path.replace(/^\/eventguide/, '') || '/'
  return proxyRequest(event, `${apiOrigin}/eventguide${suffix}`)
})
