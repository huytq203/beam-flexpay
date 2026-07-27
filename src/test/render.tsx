import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'

export interface RenderWithProvidersOptions {
  /** Route khởi tạo, gồm cả query string. */
  route?: string
}

/** Render component trong Redux + Router, mỗi lần một store sạch. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: RenderWithProvidersOptions = {}
): RenderResult {
  return render(
    <Provider store={createAppStore()}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  )
}
