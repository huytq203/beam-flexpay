import { afterAll, beforeAll, vi } from 'vitest'

const nativeGetComputedStyle = window.getComputedStyle.bind(window)

export function suppressAntPseudoElementWarning(): void {
  beforeAll(() => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
      nativeGetComputedStyle(element)
    )
  })
  afterAll(() => vi.restoreAllMocks())
}
