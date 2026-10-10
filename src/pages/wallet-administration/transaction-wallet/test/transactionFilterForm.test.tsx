import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormSearch from '../components/FormSearch'
import { FULL, renderAs } from './transaction.setup'

describe('Form lọc hoàn tiền', () => {
  it('form tìm kiếm đưa lựa chọn Có hoàn tiền? lên handleSearch', async () => {
    const handleSearch = vi.fn()
    renderAs(<FormSearch handleSearch={handleSearch} />, FULL)

    await userEvent.click(await screen.findByLabelText('Có hoàn tiền?'))
    await userEvent.click(await screen.findByTitle('Có'))
    await userEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({ hasRefund: 'true' })
    )
  })

  it('trạng thái lọc có lựa chọn "Thất bại hoàn tiền"', async () => {
    renderAs(<FormSearch handleSearch={vi.fn()} />, FULL)

    await userEvent.click(await screen.findByLabelText('Trạng thái'))

    expect(await screen.findByTitle('Thất bại hoàn tiền')).toBeInTheDocument()
  })
})
