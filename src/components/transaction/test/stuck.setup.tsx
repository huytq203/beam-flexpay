import { ConfigProvider } from 'antd'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { StuckTransactionUpdateAction } from '../StuckTransactionUpdateAction'

export const CODE = 'TXN20261008000456'
export const FULL = 'EWALLET:EWALLET:FULL'
export const NOTE = 'Đã đối chiếu sao kê ngân hàng, tiền đã về cho khách'
export const TRIGGER = /Xử lý chi tiền/

export type User = ReturnType<typeof userEvent.setup>
type Json = Record<string, unknown>

const action = (status: string, optionalFields: string[]) => ({
  status,
  mode: 'MANUAL_BANK_CONFIRMATION',
  requiredFields: ['note'],
  optionalFields
})

export const POSTED_FULL = action('POSTED', [
  'authCode',
  'settlementId',
  'bankReference',
  'receiptKey'
])
export const POSTED_INTERNAL = action('POSTED', ['authCode', 'settlementId'])
export const FAILED_DEPOSIT = action('FAILED', [
  'refund',
  'refundAuthCode',
  'refundSettlementId',
  'refundBankReference'
])
export const FAILED_PLAIN = action('FAILED', [])

/** Mock `POST /refresh`; trả về mảng đếm số lần gọi. */
export const mockRefresh = (
  allowedActions: object[],
  bankCheck?: object
): { calls: number } => {
  const counter = { calls: 0 }
  server.use(
    http.post(`*/transactions/${CODE}/refresh`, () => {
      counter.calls += 1
      return HttpResponse.json({
        success: true,
        data: {
          transactionCode: CODE,
          status: 'RECONCILIATION_REQUIRED',
          ...(bankCheck ? { bankCheck } : {}),
          allowedActions
        }
      })
    })
  )
  return counter
}

/** Mock `update-status`, ghi lại body và trả thành công. */
export const mockUpdate = (newStatus = 'POSTED'): Json[] => {
  const bodies: Json[] = []
  server.use(
    http.post(`*/transactions/${CODE}/update-status`, async ({ request }) => {
      bodies.push((await request.json()) as Json)
      return HttpResponse.json({
        success: true,
        data: { transactionCode: CODE, newStatus }
      })
    })
  )
  return bodies
}

interface RenderOptions {
  transactionType?: string
  compact?: boolean
  permissions?: string[]
}

export const renderAction = ({
  transactionType = 'CASH_IN',
  compact = false,
  permissions = [FULL]
}: RenderOptions = {}): User => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  render(
    <Provider store={store}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <MessageProvider>
          <StuckTransactionUpdateAction
            transactionCode={CODE}
            transactionType={transactionType}
            journalStatus='PENDING'
            compact={compact}
          />
        </MessageProvider>
      </ConfigProvider>
    </Provider>
  )
  return userEvent.setup({ delay: null })
}

export const openForm = async (user: User): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: TRIGGER }))
}

export const choose = async (user: User, outcome: string): Promise<void> => {
  await user.click(await screen.findByLabelText(/Kết quả cuối/))
  await user.click(await screen.findByTitle(outcome))
}

export const fill = (label: RegExp | string, value: string): void => {
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value }
  })
}

export const submit = (user: User) =>
  user.click(screen.getByRole('button', { name: 'Xác nhận cập nhật' }))
