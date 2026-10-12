import { MessageProvider } from '@/app/hooks/MessageProvider'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { savePermissions } from '@slices/authSlice'
import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import WalletLimitFormPage from '../pages/WalletLimitFormPage'
import { walletLimitPaths } from '../utils/walletLimit.paths'

export const CONFLICT_MESSAGE =
  'Cấu hình đã được người khác cập nhật. Vui lòng tải lại trước khi lưu.'

export const basePolicy: WalletLimitPolicy = {
  id: 'p-1',
  scopeType: 'WALLET',
  targetId: 'w-1',
  targetDisplay: '0912345678',
  walletType: 'ALL',
  transactionType: 'WITHDRAWAL',
  minPerTransaction: 10000,
  maxPerTransaction: 5000000,
  dailyMaximum: 10000000,
  normalMonthlyMaximum: null,
  specialMonthlyMaximum: null,
  walletBalanceMaximum: null,
  outflowDailyMaximum: null,
  outflowMonthlyMaximum: null,
  outboundMaxTimesPerDay: null,
  approvalThreshold: null,
  status: 'ACTIVE',
  bankOverrides: [],
  createdAt: '2026-10-08T03:10:00Z',
  createdByUsername: 'admin',
  updatedAt: null,
  updatedByUsername: null,
  rowVersion: 3
}

export const systemAll: WalletLimitPolicy = {
  ...basePolicy,
  id: 'sys-1',
  scopeType: 'SYSTEM',
  targetId: null,
  targetDisplay: null,
  transactionType: 'ALL',
  maxPerTransaction: 50000000,
  dailyMaximum: 100000000,
  normalMonthlyMaximum: 500000000,
  specialMonthlyMaximum: 800000000,
  walletBalanceMaximum: 200000000,
  outflowDailyMaximum: 100000000,
  outflowMonthlyMaximum: 500000000,
  outboundMaxTimesPerDay: 20,
  approvalThreshold: 20000000
}

export const ok = <T,>(data: T) => HttpResponse.json({ data })

export const mockScopes = () =>
  server.use(
    http.get('*/wallet-limit-scopes/profiles', () =>
      ok({
        content: [
          {
            id: 'w-1',
            userId: 'u-1',
            username: '0912345678',
            status: 'ACTIVE',
            walletType: 'STANDARD',
            limitGroupId: null
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      })
    ),
    http.get('*/wallet-limit-scopes/groups', () => ok([]))
  )

export const renderForm = (route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.EWALLET_FULL]))
  const list = walletLimitPaths.list
  return renderWithProviders(
    <MessageProvider>
      <Routes>
        <Route
          path={walletLimitPaths.create}
          element={<WalletLimitFormPage />}
        />
        <Route
          path={`${list}/:id/edit`}
          element={<WalletLimitFormPage />}
        />
        <Route
          path={`${list}/:id`}
          element={<p>Trang chi tiết</p>}
        />
      </Routes>
    </MessageProvider>,
    { route, store }
  )
}

export const mockPolicy = (policies: WalletLimitPolicy[]) => {
  let call = 0
  server.use(
    http.get('*/wallet-limit-policies/:id', () =>
      ok(policies[Math.min(call++, policies.length - 1)])
    )
  )
}

export const pickWallet = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByPlaceholderText('Chọn ví theo số điện thoại'))
  await user.click(
    await screen.findByRole('button', { name: 'Chọn ví 0912345678' })
  )
}

export const typeInto = async (
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  value: string,
  index = 0
) => user.type(screen.getAllByLabelText(label)[index], value)
