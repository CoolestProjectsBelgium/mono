import type { VotingSseEvent } from '~/types/api'

export function parseVotingSsePayload(raw: string): VotingSseEvent | null {
  try {
    const parsed = JSON.parse(raw) as Partial<VotingSseEvent>
    if (parsed.type !== 'message' && parsed.type !== 'timer') {
      return null
    }

    return {
      type: parsed.type,
      message: parsed.message ?? '',
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    }
  }
  catch {
    return null
  }
}

export function parseSseChunk(chunk: string): VotingSseEvent[] {
  const normalized = chunk.replace(/\r\n/g, '\n')
  const events: VotingSseEvent[] = []
  const blocks = normalized.split('\n\n')

  for (const block of blocks) {
    const dataLine = block
      .split('\n')
      .find(line => line.startsWith('data:'))

    if (!dataLine) {
      continue
    }

    const payload = dataLine.replace(/^data:\s?/, '')
    const event = parseVotingSsePayload(payload)
    if (event) {
      events.push(event)
    }
  }

  return events
}
