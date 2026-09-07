import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { setAccessToken } from '@slices/authSlice'
import { SCREENS } from '@/app/permissions'
import { PATHS } from '@constants/pathConstant'
import { SECURE_PANEL } from '@constants/routersConstant'
import { renderWithProviders } from '@/test/render'
import LandingRedirect from '../LandingRedirect'

const base64Url = (value: object): string =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/** Token giả lập đúng cấu trúc JWT để đi qua đúng luồng decode của authSlice. */
const tokenWith = (permissions: string[]): string =>
  [base64Url({ alg: 'none' }), base64Url({ permissions, roles: [] }), 'sig'].join('.')

const renderAt = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(setAccessToken({ token: tokenWith(permissions) }))

  return renderWithProviders(
    <Routes>
      <Route
        path={SECURE_PANEL}
        element={<LandingRedirect />}
      />
      <Route
        path={SCREENS.TRANSACTION_WALLET.path}
        element={<div>transaction</div>}
      />
      <Route
        path={PATHS.FORBIDDEN}
        element={<div>forbidden</div>}
      />
    </Routes>,
    { route: SECURE_PANEL, store }
  )
}

describe('LandingRedirect', () => {
  it('đẩy thẳng sang màn đầu tiên user có quyền', () => {
    renderAt(['EWALLET:TRANSACTION:FULL'])

    expect(screen.getByText('transaction')).toBeInTheDocument()
  })

  it('đẩy sang màn 403 khi token không có quyền nào', () => {
    renderAt([])

    expect(screen.getByText('forbidden')).toBeInTheDocument()
  })
})
