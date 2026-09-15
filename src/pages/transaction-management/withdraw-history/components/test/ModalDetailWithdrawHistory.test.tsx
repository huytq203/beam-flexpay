import { renderWithProviders } from '@/test/render'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/useMessage'
import { apiWalletCore } from '@services/apiService'
import { server } from '@/test/mocks/server'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import DialogDetailWithdrawHistory from '../ModalDetailWithdrawHistory'
import useHandle from '../../hooks/useHandle'

const journal: UnifiedContentJournal = {
  id: '42754cad-7d81-474e-8441-4e5cd14f34af',
  journalCode: 'JOURNAL-001',
  transactionCode: 'FW26Q6QD0',
  status: 'POSTED',
  transactionType: 'CASH_OUT',
  from: {
    id: 'user-1',
    username: 'flexpay-user',
    displayName: 'Nguyễn Văn A',
    type: 'USER'
  },
  to: {
    id: 'bank-1',
    username: 'VPB',
    displayName: 'VPB',
    type: 'BANK'
  },
  amount: 100000,
  grossAmount: 101000,
  feeAmount: 1000,
  currency: 'VND',
  paymentMethod: 'BANK_TRANSFER',
  bankCode: 'VPB',
  bankRefId: null,
  transactionId: '52bada0d-500b-462e-a86d-d5c64440a46a',
  reversesJournalId: null,
  reversedByJournalId: null,
  description: 'Rút tiền',
  failureReason: null,
  createdAt: '2026-08-12T10:15:34',
  postedAt: '2026-08-12T10:15:35',
  archivedAt: null,
  sourceDomain: 'USER_WALLET'
}

const withdrawalResponse = {
  data: {
    id: 'c6be19cf-1da6-488c-89b1-d04a6d26c4b3',
    transactionCode: 'FW26Q6QD0',
    beneficiary: {
      bankCode: 'VPB',
      accountNumber: '2020000000011',
      accountName: 'NGUYỄN THU HÀ TRANG'
    }
  },
  message: 'success',
  detail: 'Thành công',
  success: true,
  status: '1000'
}

const DetailLoaderProbe = () => {
  const {
    isDetailOpen,
    detailData,
    withdrawalDetail,
    isDetailLoading,
    openDetail,
    closeDetail
  } = useHandle()

  return (
    <div>
      <button type='button' onClick={() => void openDetail(journal.id)}>
        Mở chi tiết
      </button>
      <button type='button' onClick={closeDetail}>Đóng chi tiết</button>
      <span data-testid='detail-state'>
        {isDetailOpen
          ? `${detailData?.transactionCode}-${withdrawalDetail?.beneficiary?.accountNumber}`
          : 'closed'}
      </span>
      <span data-testid='journal-status'>{detailData?.status ?? 'none'}</span>
      {isDetailLoading && <span>Đang tải đủ dữ liệu</span>}
    </div>
  )
}

const FullDetailFlowProbe = () => {
  const { isDetailOpen, detailData, withdrawalDetail, openDetail } = useHandle()

  return (
    <MessageProvider>
      <button type='button' onClick={() => void openDetail(journal.id)}>
        Mở đầy đủ chi tiết
      </button>
      {isDetailOpen && detailData && withdrawalDetail && (
        <DialogDetailWithdrawHistory
          data={detailData}
          withdrawalDetail={withdrawalDetail}
        />
      )}
    </MessageProvider>
  )
}

describe('useHandle withdraw detail', () => {
  it('chỉ mở dialog sau khi journal và beneficiary đã tải xong', async () => {
    const withdrawalRequestSpy = vi.fn()
    server.use(
      http.get('*/wallet/journal/unified/:id', async () => {
        await delay(50)
        return HttpResponse.json({ data: journal })
      }),
      http.get('*/withdrawals', async () => {
        withdrawalRequestSpy()
        await delay(50)
        return HttpResponse.json(withdrawalResponse)
      })
    )

    renderWithProviders(<DetailLoaderProbe />)
    fireEvent.click(screen.getByRole('button', { name: 'Mở chi tiết' }))

    expect(screen.getByTestId('detail-state')).toHaveTextContent('closed')
    expect(screen.getByText('Đang tải đủ dữ liệu')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByTestId('detail-state')).toHaveTextContent(
        'FW26Q6QD0-2020000000011'
      )
    )
    expect(withdrawalRequestSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Đóng chi tiết' }))
    expect(screen.getByTestId('detail-state')).toHaveTextContent('closed')
  })

  it('cập nhật dữ liệu detail khi mutation invalidate cache', async () => {
    let journalStatus = 'PENDING'
    server.use(
      http.get('*/wallet/journal/unified/:id', () =>
        HttpResponse.json({ data: { ...journal, status: journalStatus } })
      ),
      http.get('*/withdrawals', () => HttpResponse.json(withdrawalResponse))
    )
    const store = createAppStore()

    renderWithProviders(<DetailLoaderProbe />, { store })
    fireEvent.click(screen.getByRole('button', { name: 'Mở chi tiết' }))

    await waitFor(() =>
      expect(screen.getByTestId('journal-status')).toHaveTextContent('PENDING')
    )

    journalStatus = 'POSTED'
    store.dispatch(apiWalletCore.util.invalidateTags(['Journal']))

    await waitFor(() =>
      expect(screen.getByTestId('journal-status')).toHaveTextContent('POSTED')
    )
  })

  it('chỉ gọi API withdrawal một lần khi mở đầy đủ modal', async () => {
    const withdrawalRequestSpy = vi.fn()
    server.use(
      http.get('*/wallet/journal/unified/:id', () =>
        HttpResponse.json({ data: journal })
      ),
      http.get('*/withdrawals', () => {
        withdrawalRequestSpy()
        return HttpResponse.json(withdrawalResponse)
      })
    )

    renderWithProviders(<FullDetailFlowProbe />)
    fireEvent.click(screen.getByRole('button', { name: 'Mở đầy đủ chi tiết' }))

    expect(await screen.findByText('2020000000011')).toBeInTheDocument()
    await waitFor(() =>
      expect(withdrawalRequestSpy).toHaveBeenCalledTimes(1)
    )
  })
})

describe('ModalDetailWithdrawHistory', () => {
  it('hiển thị thông tin thụ hưởng đã tải trước', () => {
    renderWithProviders(
      <MessageProvider>
        <DialogDetailWithdrawHistory
          data={journal}
          withdrawalDetail={withdrawalResponse.data}
        />
      </MessageProvider>
    )

    expect(screen.getByText('2020000000011')).toBeInTheDocument()
    expect(screen.getByText('NGUYỄN THU HÀ TRANG')).toBeInTheDocument()
  })

  it('hiển thị trạng thái rỗng khi không có người thụ hưởng', () => {
    renderWithProviders(
      <MessageProvider>
        <DialogDetailWithdrawHistory
          data={journal}
          withdrawalDetail={{ ...withdrawalResponse.data, beneficiary: null }}
        />
      </MessageProvider>
    )

    expect(
      screen.getByText('Không có thông tin thụ hưởng.')
    ).toBeInTheDocument()
  })

  it('hiển thị trạng thái bút toán thất bại bằng màu danger', () => {
    renderWithProviders(
      <MessageProvider>
        <DialogDetailWithdrawHistory
          data={{ ...journal, status: 'FAILED' }}
          withdrawalDetail={withdrawalResponse.data}
        />
      </MessageProvider>
    )

    expect(screen.getByText('Thất bại')).toHaveClass('danger-status')
  })
})
