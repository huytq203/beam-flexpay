import { renderWithProviders } from '@/test/render'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HistoryFormSearch from '../components/HistoryFormSearch'

describe('HistoryFormSearch', () => {
  it('nút Xóa lọc và Tìm kiếm có icon như các bộ lọc khác', () => {
    renderWithProviders(<HistoryFormSearch onSearch={vi.fn()} />)

    const resetButton = screen.getByRole('button', { name: /Xóa lọc/ })
    const searchButton = screen.getByRole('button', { name: /Tìm kiếm/ })

    expect(resetButton.querySelector('svg')).toBeInTheDocument()
    expect(searchButton.querySelector('svg')).toBeInTheDocument()
  })

  it('Xóa lọc xoá bộ lọc và tìm lại với điều kiện rỗng', () => {
    const onSearch = vi.fn()
    renderWithProviders(<HistoryFormSearch onSearch={onSearch} />)

    fireEvent.click(screen.getByRole('button', { name: /Xóa lọc/ }))

    expect(onSearch).toHaveBeenCalledWith({})
  })
})
