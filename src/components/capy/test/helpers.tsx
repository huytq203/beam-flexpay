import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { setAccessToken } from '@slices/authSlice'

interface Identity {
  readonly username: string
  readonly fullName?: string
  readonly email?: string
}

const encode = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

/** Token không ký, đủ để `jwtDecode` đọc ra tên, email và `preferred_username`. */
export function fakeJwt({ username, fullName, email }: Identity): string {
  return `${encode({ alg: 'none' })}.${encode({
    preferred_username: username,
    name: fullName,
    email,
    exp: Math.floor(Date.now() / 1000) + 3600
  })}.x`
}

export function capyWrapper(identity: Identity, route: string) {
  const store = createAppStore()
  store.dispatch(setAccessToken({ token: fakeJwt(identity) }))
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  )
}

export function mockMedia({ wide = true, reduced = false } = {}): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes('min-width') ? wide : reduced,
      addEventListener: () => undefined,
      removeEventListener: () => undefined
    })
  })
}
