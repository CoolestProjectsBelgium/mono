import { useVotingSessionStore } from '~/stores/votingSession'
import type { VotingSseEvent } from '~/types/api'
import { parseSseChunk } from '~/utils/voting-sse-parser'

let activeController: AbortController | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelayMs = 1000
let reconnectAuthorization: string | null = null
let reconnectApiBase: string | null = null

export function applyVotingSseEvent(event: VotingSseEvent): void {
  const sessionStore = useVotingSessionStore()

  if (event.type === 'timer' && event.startDate && event.endDate) {
    sessionStore.setVotingWindow(event.startDate, event.endDate)
    return
  }

  if (event.type === 'message' && event.message) {
    sessionStore.setBroadcastMessage(event.message)
  }
}

async function consumeSseStream(
  response: Response,
  signal: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('SSE response has no body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (!signal.aborted) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)

      for (const event of parseSseChunk(`${block}\n\n`)) {
        applyVotingSseEvent(event)
      }

      boundary = buffer.indexOf('\n\n')
    }
  }
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

export function disconnectVotingSse(): void {
  clearReconnectTimer()
  reconnectAuthorization = null
  reconnectApiBase = null
  if (activeController) {
    activeController.abort()
    activeController = null
  }
  reconnectDelayMs = 1000
}

export async function connectVotingSse(apiBase: string, authorization: string): Promise<void> {
  disconnectVotingSse()

  reconnectApiBase = apiBase
  reconnectAuthorization = authorization

  const controller = new AbortController()
  activeController = controller

  try {
    const response = await fetch(`${apiBase}/sse`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        Authorization: authorization,
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`SSE connection failed (${response.status})`)
    }

    reconnectDelayMs = 1000
    void consumeSseStream(response, controller.signal)
      .finally(() => {
        if (activeController === controller) {
          activeController = null
        }
        if (!controller.signal.aborted && reconnectAuthorization && reconnectApiBase) {
          scheduleReconnect()
        }
      })
  }
  catch {
    if (activeController === controller) {
      activeController = null
    }
    if (controller.signal.aborted || !reconnectAuthorization || !reconnectApiBase) {
      return
    }

    scheduleReconnect()
  }
}

function scheduleReconnect() {
  clearReconnectTimer()
  reconnectTimer = setTimeout(() => {
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000)
    if (reconnectAuthorization && reconnectApiBase) {
      void connectVotingSse(reconnectApiBase, reconnectAuthorization)
    }
  }, reconnectDelayMs)
}
