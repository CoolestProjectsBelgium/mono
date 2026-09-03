import { describe, expect, it } from 'vitest'
import { parseSseChunk, parseVotingSsePayload } from './voting-sse-parser'

describe('parseVotingSsePayload', () => {
  it('parses timer events', () => {
    expect(parseVotingSsePayload(JSON.stringify({
      type: 'timer',
      message: '',
      startDate: '2026-09-03T10:00:00.000Z',
      endDate: '2026-09-03T12:00:00.000Z',
    }))).toEqual({
      type: 'timer',
      message: '',
      startDate: '2026-09-03T10:00:00.000Z',
      endDate: '2026-09-03T12:00:00.000Z',
    })
  })

  it('parses message events', () => {
    expect(parseVotingSsePayload(JSON.stringify({
      type: 'message',
      message: 'Please take a break.',
    }))).toEqual({
      type: 'message',
      message: 'Please take a break.',
      startDate: undefined,
      endDate: undefined,
    })
  })
})

describe('parseSseChunk', () => {
  it('extracts SSE data blocks with CRLF delimiters', () => {
    const chunk = [
      'event: timer',
      'data: {"type":"timer","message":"","startDate":"2026-09-03T10:00:00.000Z","endDate":"2026-09-03T12:00:00.000Z"}',
      '',
      'event: message',
      'data: {"type":"message","message":"Hello jury"}',
      '',
    ].join('\r\n')

    expect(parseSseChunk(chunk)).toEqual([
      {
        type: 'timer',
        message: '',
        startDate: '2026-09-03T10:00:00.000Z',
        endDate: '2026-09-03T12:00:00.000Z',
      },
      {
        type: 'message',
        message: 'Hello jury',
        startDate: undefined,
        endDate: undefined,
      },
    ])
  })

  it('extracts SSE data blocks', () => {
    const chunk = [
      'event: timer',
      'data: {"type":"timer","message":"","startDate":"2026-09-03T10:00:00.000Z","endDate":"2026-09-03T12:00:00.000Z"}',
      '',
      'event: message',
      'data: {"type":"message","message":"Hello jury"}',
      '',
    ].join('\n')

    expect(parseSseChunk(chunk)).toEqual([
      {
        type: 'timer',
        message: '',
        startDate: '2026-09-03T10:00:00.000Z',
        endDate: '2026-09-03T12:00:00.000Z',
      },
      {
        type: 'message',
        message: 'Hello jury',
        startDate: undefined,
        endDate: undefined,
      },
    ])
  })
})
