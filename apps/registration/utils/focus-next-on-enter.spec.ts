import { describe, expect, it } from 'vitest'
import { focusNextOnEnter } from './focus-next-on-enter'

function createForm(html: string): HTMLFormElement {
  document.body.innerHTML = html
  return document.body.querySelector('form')!
}

function enterOn(element: HTMLElement): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
  element.dispatchEvent(event)
  return event
}

describe('focusNextOnEnter', () => {
  it('focuses the next field on Enter', () => {
    const form = createForm(`
      <form>
        <input id="first" type="text" />
        <input id="second" type="text" />
      </form>
    `)
    const first = form.querySelector('#first') as HTMLInputElement
    const second = form.querySelector('#second') as HTMLInputElement
    first.focus()

    const event = enterOn(first)
    focusNextOnEnter(event, form)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(second)
  })

  it('does not move focus on the last field but prevents submit', () => {
    const form = createForm(`
      <form>
        <input id="only" type="text" />
        <button type="submit">Submit</button>
      </form>
    `)
    const only = form.querySelector('#only') as HTMLInputElement
    only.focus()

    const event = enterOn(only)
    focusNextOnEnter(event, form)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(only)
  })

  it('ignores textarea Enter', () => {
    const form = createForm(`
      <form>
        <textarea id="area"></textarea>
        <input id="next" type="text" />
      </form>
    `)
    const area = form.querySelector('#area') as HTMLTextAreaElement
    area.focus()

    const event = enterOn(area)
    focusNextOnEnter(event, form)

    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(area)
  })

  it('skips disabled fields when advancing', () => {
    const form = createForm(`
      <form>
        <input id="first" type="text" />
        <input id="middle" type="text" disabled />
        <input id="last" type="text" />
      </form>
    `)
    const first = form.querySelector('#first') as HTMLInputElement
    const last = form.querySelector('#last') as HTMLInputElement
    first.focus()

    const event = enterOn(first)
    focusNextOnEnter(event, form)

    expect(document.activeElement).toBe(last)
  })

  it('does nothing when Enter was already handled', () => {
    const form = createForm(`
      <form>
        <input id="first" type="text" />
        <input id="second" type="text" />
      </form>
    `)
    const first = form.querySelector('#first') as HTMLInputElement
    first.focus()

    const event = enterOn(first)
    event.preventDefault()
    focusNextOnEnter(event, form)

    expect(document.activeElement).toBe(first)
  })

  it('ignores button Enter', () => {
    const form = createForm(`
      <form>
        <input id="first" type="text" />
        <button type="button" id="btn">Click</button>
      </form>
    `)
    const btn = form.querySelector('#btn') as HTMLButtonElement
    btn.focus()

    const event = enterOn(btn)
    focusNextOnEnter(event, form)

    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(btn)
  })
})
