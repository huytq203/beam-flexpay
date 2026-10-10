import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DetailTransactionHeader } from '../components/DetailTransactionHeader'
import {
  FULL,
  FULL_ONLY_TRANSACTION,
  makeTransaction,
  renderAs
} from './transaction.setup'

describe('DetailTransactionHeader — nút Hoàn tiền', () => {
  it('hiện cho giao dịch thành công, không đóng băng, người có EWALLET:FULL và mở form tạo yêu cầu', async () => {
    renderAs(<DetailTransactionHeader transaction={makeTransaction()} />, FULL)

    await userEvent.click(screen.getByRole('button', { name: /Hoàn tiền/ }))

    expect(
      await screen.findByRole('dialog', { name: 'Tạo yêu cầu hoàn tiền' })
    ).toBeInTheDocument()
  })

  it.each([
    ['đóng băng', makeTransaction({ frozen: true }), FULL],
    ['chưa thành công', makeTransaction({ status: 'PENDING' }), FULL],
    ['thiếu EWALLET:FULL', makeTransaction(), FULL_ONLY_TRANSACTION]
  ])('ẩn khi %s', (_name, transaction, permissions) => {
    renderAs(<DetailTransactionHeader transaction={transaction} />, permissions)

    expect(screen.queryByRole('button', { name: /Hoàn tiền/ })).toBeNull()
    expect(screen.getByText(/Chi tiết giao dịch/)).toBeInTheDocument()
  })
})

describe('DetailTransactionHeader — nút Xem biên lai', () => {
  it('hiện cho giao dịch đã thành công của người có EWALLET:FULL', () => {
    renderAs(<DetailTransactionHeader transaction={makeTransaction()} />, FULL)

    expect(screen.getByRole('button', { name: 'Xem biên lai' })).toBeVisible()
  })

  it.each([
    ['chưa thành công', makeTransaction({ status: 'PENDING' }), FULL],
    ['thiếu EWALLET:FULL', makeTransaction(), FULL_ONLY_TRANSACTION]
  ])('ẩn khi %s', (_name, transaction, permissions) => {
    renderAs(<DetailTransactionHeader transaction={transaction} />, permissions)

    expect(screen.queryByRole('button', { name: 'Xem biên lai' })).toBeNull()
  })
})
