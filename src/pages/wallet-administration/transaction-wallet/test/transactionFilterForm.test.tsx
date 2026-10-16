import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormSearch from '../components/FormSearch'
import { FULL, renderAs } from './transaction.setup'

describe('Form lọc hoàn tiền', () => {
  it('không còn ô Có hoàn tiền? riêng', async () => {
    renderAs(
      <FormSearch
        filters={{}}
        handleSearch={vi.fn()}
        onReset={vi.fn()}
      />,
      FULL
    )

    await screen.findByLabelText('Loại giao dịch')
    expect(screen.queryByLabelText('Có hoàn tiền?')).not.toBeInTheDocument()
  })

  it('chọn loại giao dịch Hoàn tiền thì chỉ gửi hasRefund=true, không gửi loại giao dịch', async () => {
    const handleSearch = vi.fn()
    renderAs(
      <FormSearch
        filters={{}}
        handleSearch={handleSearch}
        onReset={vi.fn()}
      />,
      FULL
    )

    await userEvent.click(await screen.findByLabelText('Loại giao dịch'))
    await userEvent.click(await screen.findByTitle('Hoàn tiền'))
    await userEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionType: '',
        hasRefund: 'true'
      })
    )
  })

  it('loại giao dịch khác không gửi hasRefund', async () => {
    const handleSearch = vi.fn()
    renderAs(
      <FormSearch
        filters={{}}
        handleSearch={handleSearch}
        onReset={vi.fn()}
      />,
      FULL
    )

    await userEvent.click(await screen.findByLabelText('Loại giao dịch'))
    await userEvent.click(await screen.findByTitle('Nạp tiền'))
    await userEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({ transactionType: 'CASH_IN', hasRefund: '' })
    )
  })

  it('trạng thái lọc có lựa chọn "Thất bại hoàn tiền"', async () => {
    renderAs(
      <FormSearch
        filters={{}}
        handleSearch={vi.fn()}
        onReset={vi.fn()}
      />,
      FULL
    )

    await userEvent.click(await screen.findByLabelText('Trạng thái'))

    expect(await screen.findByTitle('Thất bại hoàn tiền')).toBeInTheDocument()
  })
})
