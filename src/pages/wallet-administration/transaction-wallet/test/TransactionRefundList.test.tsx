import { renderWithProviders } from '@/test/render'
import type { RefundItemInfo } from '@/app/schemas/unified-refund.schema'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TransactionRefundList } from '../components/TransactionRefundList'

const rejected: RefundItemInfo = {
  refundCode: 'RF2',
  refundType: 'WITHDRAW_BANK',
  status: 'REJECTED',
  displayStatus: 'REJECTED',
  requestedAmount: 200,
  netCredit: 0,
  createdAt: '2026-10-18T10:00:00',
  approvedAt: null,
  createdBy: 'admin2',
  rejectedReason: 'Sai thong tin'
}

const succeeded: RefundItemInfo = {
  refundCode: 'RF1',
  refundType: 'REFUND_EWALLET',
  status: 'SUCCESS',
  displayStatus: 'FAILED_REFUND',
  requestedAmount: 300,
  netCredit: 290,
  createdAt: '2026-10-17T09:00:00',
  approvedAt: '2026-10-17T09:30:00',
  createdBy: 'admin1',
  rejectedReason: null
}

describe('khối Yêu cầu hoàn tiền ở chi tiết giao dịch', () => {
  it('null là chưa tra được, không khẳng định chưa hoàn', () => {
    renderWithProviders(<TransactionRefundList refunds={null} />)

    expect(
      screen.getByText(/Không tải được danh sách hoàn tiền/)
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Chưa có yêu cầu hoàn tiền')
    ).not.toBeInTheDocument()
  })

  it('vắng trường được coi như null', () => {
    renderWithProviders(<TransactionRefundList refunds={undefined} />)

    expect(
      screen.getByText(/Không tải được danh sách hoàn tiền/)
    ).toBeInTheDocument()
  })

  it('mảng rỗng là chưa có yêu cầu hoàn', () => {
    renderWithProviders(<TransactionRefundList refunds={[]} />)

    expect(screen.getByText('Chưa có yêu cầu hoàn tiền')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('giữ thứ tự BE trả, hiện nhãn theo displayStatus và loại hoàn', () => {
    renderWithProviders(
      <TransactionRefundList refunds={[rejected, succeeded]} />
    )

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('RF2')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Đã từ chối')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Sai thong tin')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Hoàn nạp tiền')).toBeInTheDocument()
    expect(within(rows[1]).getByText('RF1')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Thất bại hoàn tiền')).toBeInTheDocument()
    expect(
      within(rows[1]).getByText('Hoàn chuyển tiền')
    ).toBeInTheDocument()
  })

  it('yêu cầu bị từ chối không hiện số thực nhận 0', () => {
    renderWithProviders(<TransactionRefundList refunds={[rejected]} />)

    const row = screen.getAllByRole('row')[1]
    const cells = within(row).getAllByRole('cell')
    expect(cells[3]).toHaveTextContent('--')
  })

  it('mã loại hoặc trạng thái lạ hiện nguyên văn', () => {
    renderWithProviders(
      <TransactionRefundList
        refunds={[
          {
            ...succeeded,
            refundType: 'NEW_TYPE',
            status: 'NEW',
            displayStatus: 'NEW_STATUS'
          }
        ]}
      />
    )

    expect(screen.getByText('NEW_TYPE')).toBeInTheDocument()
    expect(screen.getByText('NEW_STATUS')).toBeInTheDocument()
  })
})
