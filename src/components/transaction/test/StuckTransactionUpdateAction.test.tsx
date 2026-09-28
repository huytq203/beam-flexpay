import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { StatusEnum } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import { StuckTransactionUpdateAction } from '../StuckTransactionUpdateAction'

const TRANSACTION_CODE = 'CO2609070001'
const APPROVER_PERMISSION = 'EWALLET:EWALLET:FULL'
const NOTE = 'Da doi chieu sao ke ngan hang, tien da ghi co cho khach'

const mockWithdrawalStatus = (status: string) => {
  server.use(
    http.get('*/withdrawals', () =>
      HttpResponse.json({
        data: {
          id: 'withdrawal-1',
          transactionCode: TRANSACTION_CODE,
          beneficiary: null,
          status
        }
      })
    )
  )
}

interface RenderOptions {
  permissions?: string[]
  journalStatus?: string
  transactionType?: string
  compact?: boolean
}

const renderAction = ({
  permissions = [APPROVER_PERMISSION],
  journalStatus = StatusEnum.PENDING,
  transactionType = 'CASH_OUT',
  compact = false
}: RenderOptions = {}) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  const user = userEvent.setup({ delay: null })

  render(
    <Provider store={store}>
      <MessageProvider>
        <StuckTransactionUpdateAction
          transactionCode={TRANSACTION_CODE}
          transactionType={transactionType}
          journalStatus={journalStatus}
          compact={compact}
        />
      </MessageProvider>
    </Provider>
  )

  return { user }
}

const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole('button', { name: /Cập nhật giao dịch treo/ })
  )
}

const chooseOutcome = async (
  user: ReturnType<typeof userEvent.setup>,
  label: string
) => {
  await user.click(await screen.findByLabelText(/Kết quả cuối/))
  await user.click(await screen.findByTitle(label))
}

const fill = async (label: RegExp, value: string) => {
  fireEvent.change(await screen.findByLabelText(label), { target: { value } })
}

describe('StuckTransactionUpdateAction', () => {
  it('ẩn nút khi lệnh rút đang chờ duyệt', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PENDING_APPROVAL)

    renderAction()

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /Cập nhật giao dịch treo/ })
      ).not.toBeInTheDocument()
    )
  })

  it('hiện nút khi lệnh rút đã rời khỏi hàng chờ duyệt', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)

    renderAction()

    expect(
      await screen.findByRole('button', { name: /Cập nhật giao dịch treo/ })
    ).toBeInTheDocument()
  })

  it('ẩn nút khi bút toán đã có kết quả cuối', () => {
    mockWithdrawalStatus(WithdrawalStatus.POSTED)

    renderAction({ journalStatus: StatusEnum.POSTED })

    expect(
      screen.queryByRole('button', { name: /Cập nhật giao dịch treo/ })
    ).not.toBeInTheDocument()
  })

  it('ẩn nút khi tài khoản thiếu quyền', () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)

    renderAction({ permissions: ['EWALLET:TRANSACTION:VIEW'] })

    expect(
      screen.queryByRole('button', { name: /Cập nhật giao dịch treo/ })
    ).not.toBeInTheDocument()
  })

  it('chốt Thành công gửi Auth Code và Settlement ID khi được nhập', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)
    let body: unknown = null
    server.use(
      http.post(
        `*/transactions/${TRANSACTION_CODE}/update-status`,
        async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({
            data: { transactionCode: TRANSACTION_CODE, newStatus: 'POSTED' }
          })
        }
      )
    )

    const { user } = renderAction()

    await openForm(user)
    await chooseOutcome(user, 'Thành công')
    await fill(/Auth Code/, 'AUTH123456')
    await fill(/Settlement ID/, 'STL20260825001')
    await fill(/Lý do cập nhật/, NOTE)
    await user.click(screen.getByRole('button', { name: 'Xác nhận cập nhật' }))

    await waitFor(() =>
      expect(body).toEqual({
        newStatus: 'POSTED',
        note: NOTE,
        authCode: 'AUTH123456',
        settlementId: 'STL20260825001'
      })
    )
  })

  it('chốt Thất bại không gửi hai mã đối soát', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)
    let body: unknown = null
    server.use(
      http.post(
        `*/transactions/${TRANSACTION_CODE}/update-status`,
        async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({
            data: { transactionCode: TRANSACTION_CODE, newStatus: 'FAILED' }
          })
        }
      )
    )

    const { user } = renderAction()

    await openForm(user)
    await chooseOutcome(user, 'Thất bại')
    await fill(/Lý do cập nhật/, NOTE)
    await user.click(screen.getByRole('button', { name: 'Xác nhận cập nhật' }))

    await waitFor(() =>
      expect(body).toEqual({ newStatus: 'FAILED', note: NOTE })
    )
  })

  it('hiển thị dạng icon ở màn danh sách và vẫn mở được form', async () => {
    let readCount = 0
    server.use(
      http.get('*/withdrawals', () => {
        readCount += 1
        return HttpResponse.json({
          data: {
            id: 'withdrawal-1',
            transactionCode: TRANSACTION_CODE,
            beneficiary: null,
            status: WithdrawalStatus.PAYING
          }
        })
      })
    )
    const { user } = renderAction({ compact: true })

    expect(readCount).toBe(0)
    await openForm(user)
    expect(readCount).toBe(1)
    expect(await screen.findByLabelText(/Kết quả cuối/)).toBeInTheDocument()
  })

  it('nói trước hậu quả của lựa chọn trước khi người dùng bấm', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)

    const { user } = renderAction()

    await openForm(user)
    await chooseOutcome(user, 'Thất bại')

    expect(
      await screen.findByText(/giải phóng khoản tiền đang bị giữ/i)
    ).toBeInTheDocument()
  })
})
