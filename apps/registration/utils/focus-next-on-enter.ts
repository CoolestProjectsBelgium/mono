const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([disabled])',
  'select:not([disabled])',
].join(', ')

function isFieldVisible(element: HTMLElement): boolean {
  if (element.closest('[hidden]')) {
    return false
  }
  if (element.hasAttribute('disabled')) {
    return false
  }
  return true
}

function getFormFields(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter(isFieldVisible)
}

/**
 * On Enter in a text input or select, move focus to the next field instead of submitting the form.
 * Textareas, buttons, and already-handled targets (e.g. open combobox) are left alone.
 * On the last field, Enter is swallowed so the form does not submit.
 */
export function focusNextOnEnter(event: KeyboardEvent, root: HTMLElement): void {
  if (event.key !== 'Enter' || event.defaultPrevented) {
    return
  }

  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return
  }

  const tag = target.tagName
  if (tag === 'TEXTAREA' || tag === 'BUTTON') {
    return
  }
  if (tag !== 'INPUT' && tag !== 'SELECT') {
    return
  }

  const fields = getFormFields(root)
  const index = fields.indexOf(target)
  if (index === -1) {
    return
  }

  event.preventDefault()

  const next = fields[index + 1]
  if (next) {
    next.focus()
  }
}

export { getFormFields, FIELD_SELECTOR }
