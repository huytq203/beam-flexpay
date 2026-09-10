import { createAppStore } from '@/app/store'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { act, render, screen } from '@testing-library/react'
import Cookies from 'js-cookie'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppLayout from '../AppLayout'

const mocks = vi.hoisted(() => ({
  refreshAccessToken: vi.fn()
}))

vi.mock('@configs/fetchBaseQueryCustom', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@configs/fetchBaseQueryCustom')
  >()),
  initInactivityTracker: vi.fn(),
  refreshAccessToken: mocks.refreshAccessToken
}))

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

const renderLayout = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/secure-panel/transaction-management/frozen-transactions',
        element: <AppLayout />
      },
      {
        path: '/secure-panel/forbidden',
        element: <div>forbidden</div>
      },
      {
        path: '/secure-panel/auth/login',
        element: <div>login</div>
      }
    ],
    {
      initialEntries: [
        '/secure-panel/transaction-management/frozen-transactions'
      ]
    }
  )

  render(
    <Provider store={createAppStore()}>
      <RouterProvider router={router} />
    </Provider>
  )
}

describe('AppLayout — khôi phục phiên', () => {
  beforeEach(() => {
    Cookies.remove(CookieKey.ACCESS_TOKEN)
    Cookies.set(CookieKey.REFRESH_TOKEN, 'refresh-token')
  })

  afterEach(() => {
    Cookies.remove(CookieKey.ACCESS_TOKEN)
    Cookies.remove(CookieKey.REFRESH_TOKEN)
    vi.clearAllMocks()
  })

  it('chờ refresh và không chuyển sang forbidden khi chưa có permissions', async () => {
    const refresh = deferred<string | null>()
    mocks.refreshAccessToken.mockReturnValue(refresh.promise)

    renderLayout()

    expect(await screen.findByAltText('loading')).toBeInTheDocument()
    expect(screen.queryByText('forbidden')).not.toBeInTheDocument()
    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1)

    await act(async () => refresh.resolve(null))

    expect(await screen.findByText('login')).toBeInTheDocument()
    expect(screen.queryByText('forbidden')).not.toBeInTheDocument()
  })
})
