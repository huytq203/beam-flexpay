import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'

type AppStore = ReturnType<typeof createAppStore>

export interface RenderWithProvidersOptions {
  /** Route khởi tạo, gồm cả query string. */
  route?: string
  /** Store dựng sẵn, dùng khi case cần dispatch trước lúc render (ví dụ quyền). */
  store?: AppStore
}

/** Render component trong Redux + Router, mỗi lần một store sạch. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', store = createAppStore() }: RenderWithProvidersOptions = {}
): RenderResult {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  )
}
