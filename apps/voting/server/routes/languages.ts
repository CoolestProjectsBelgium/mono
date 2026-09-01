import { proxyRequest } from 'h3'

const apiOrigin = 'http://127.0.0.1:3001'

export default defineEventHandler((event) => {
  return proxyRequest(event, `${apiOrigin}/languages`)
})
