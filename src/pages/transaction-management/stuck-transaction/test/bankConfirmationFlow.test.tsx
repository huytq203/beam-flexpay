import { ConfigProvider } from 'antd'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { StuckTransactionUpdateAction } from '@/components/transaction/StuckTransactionUpdateAction'

const renderAction = (transactionType = 'CASH_IN') => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:EWALLET:FULL']))
  render(
    <Provider store={store}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <MessageProvider>
          <StuckTransactionUpdateAction
            transactionCode='FW26CBFW1'
            transactionType={transactionType}
            journalStatus='PENDING'
          />
        </MessageProvider>
      </ConfigProvider>
    </Provider>
  )
  return userEvent.setup({ delay: null })
}
const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value }
  })

describe('bank confirmation flow', () => {
  it('preserves note after 4101, validates evidence and sends the complete payload', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post(
        '*/transactions/FW26CBFW1/update-status',
        async ({ request }) => {
          bodies.push(await request.json())
          if (bodies.length === 1)
            return HttpResponse.json(
              {
                message: 'RECONCILIATION_EVIDENCE_REQUIRED',
                status: '4101',
                detail: 'Cần nhập kết quả đã xác nhận trực tiếp với ngân hàng'
              },
              { status: 400 }
            )
          return HttpResponse.json({
            success: true,
            data: { transactionCode: 'FW26CBFW1', newStatus: 'POSTED' }
          })
        }
      )
    )
    const user = renderAction()
    await user.click(
      screen.getByRole('button', { name: 'Cập nhật giao dịch treo' })
    )
    await user.click(screen.getByLabelText(/Kết quả cuối/))
    await user.click(await screen.findByTitle('Thành công'))
    fill('Lý do cập nhật', 'Đã đối chiếu ngân hàng')
    await user.click(screen.getByRole('button', { name: 'Xác nhận cập nhật' }))
    expect(await screen.findByLabelText(/Kênh xác nhận/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Lý do cập nhật/)).toHaveValue(
      'Đã đối chiếu ngân hàng'
    )
    await user.click(screen.getByRole('button', { name: 'Xác nhận cập nhật' }))
    expect(
      await screen.findByText('Vui lòng chọn kênh xác nhận')
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(1)
    await user.click(screen.getByLabelText(/Kênh xác nhận/))
    expect(await screen.findByTitle('Hotline')).toBeInTheDocument()
    expect(screen.getByTitle('Tại quầy')).toBeInTheDocument()
    await user.click(screen.getByTitle('Email'))
    fill('Tham chiếu xác nhận', 'CONF-1')
    fill('Thời điểm xác nhận', '02/01/2026 10:00:00')
    fireEvent.keyDown(screen.getByLabelText(/Thời điểm xác nhận/), {
      key: 'Enter',
      code: 'Enter'
    })
    fireEvent.blur(screen.getByLabelText(/Thời điểm xác nhận/))
    fill('Mã giao dịch ngân hàng', 'BANK-1')
    fill('Ngày giá trị', '02/01/2026')
    fireEvent.keyDown(screen.getByLabelText(/Ngày giá trị/), {
      key: 'Enter',
      code: 'Enter'
    })
    fireEvent.blur(screen.getByLabelText(/Ngày giá trị/))
    fill('Thời điểm ngân hàng ghi sổ', '02/01/2026 09:00:00')
    fireEvent.keyDown(screen.getByLabelText(/Thời điểm ngân hàng ghi sổ/), {
      key: 'Enter',
      code: 'Enter'
    })
    fireEvent.blur(screen.getByLabelText(/Thời điểm ngân hàng ghi sổ/))
    await user.click(screen.getByRole('button', { name: 'Xác nhận cập nhật' }))
    await waitFor(() => expect(bodies).toHaveLength(2))
    expect(bodies[1]).toEqual({
      newStatus: 'POSTED',
      note: 'Đã đối chiếu ngân hàng',
      bankConfirmation: {
        outcome: 'POSTED',
        confirmationChannel: 'EMAIL',
        confirmationReference: 'CONF-1',
        confirmedAt: new Date('2026-01-02T10:00').toISOString(),
        bankReference: 'BANK-1',
        valueDate: '2026-01-02',
        bankBookedAt: new Date('2026-01-02T09:00').toISOString()
      }
    })
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 3000 }
    )
  })
  it('does not offer bank evidence for internal transfers', async () => {
    const user = renderAction('P2P_TRANSFER')
    await user.click(
      screen.getByRole('button', { name: 'Cập nhật giao dịch treo' })
    )
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
