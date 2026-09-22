import { act, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  changeTerminalStatus, createTerminal, resetTerminalRepository
} from '../../terminal/hooks/useTerminals'
import { SubMerchantMetrics } from '../components/SubMerchantMetrics'
import {
  createFixtureSubMerchant, resetSubMerchantRepository, toggleSubMerchantStatus,
  useSubMerchantRecord, useSubMerchants
} from '../hooks/useSubMerchants'

const NEW_SUB = {
  parentMerchantId: 'merchant-0142', name: 'Sub mới', phoneInherited: true, phone: '',
  addressInherited: true, address: '', businessField: 'F&B'
}

function Metrics() {
  const record = useSubMerchantRecord('sub-001')
  return record ? <SubMerchantMetrics record={record} /> : null
}

beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})

describe('Sub-merchant phản ứng với thay đổi repository', () => {
  it('đếm tổng và Terminal hoạt động từ repository khi tạo, khóa và cascade', () => {
    render(<Metrics />)
    expect(screen.getByText(/^(Số Terminal|Terminal hoạt động)$/).nextElementSibling).toHaveTextContent(/^2$/)
    expect(screen.getByText('1 đang hoạt động')).toBeInTheDocument()

    act(() => {
      createTerminal({
        parentMerchantId: 'merchant-0142', subMerchantId: 'sub-001', name: 'POS thêm mới',
        type: 'POS', address: '42 Nguyễn Huệ', phone: '', note: ''
      })
    })
    expect(screen.getByText('Số Terminal').nextElementSibling).toHaveTextContent(/^3$/)
    expect(screen.getByText('2 đang hoạt động')).toBeInTheDocument()
    act(() => { changeTerminalStatus('terminal-001', 'Khóa thiết bị kiểm tra') })
    expect(screen.getByText('1 đang hoạt động')).toBeInTheDocument()
    act(() => { toggleSubMerchantStatus('sub-001', 'Khóa toàn bộ điểm bán') })
    expect(screen.getByText('0 đang hoạt động')).toBeInTheDocument()
    expect(screen.getByText('Số Terminal').nextElementSibling).toHaveTextContent(/^3$/)
    act(() => { toggleSubMerchantStatus('sub-001', 'Mở lại điểm bán') })
    expect(screen.getByText('1 đang hoạt động')).toBeInTheDocument()
  })

  it('kẹp về trang 1 khi tổng ACTIVE giảm từ 11 xuống 10', () => {
    for (let index = 1; index <= 9; index += 1) {
      createFixtureSubMerchant({ ...NEW_SUB, name: `Sub active ${index}` })
    }
    const { result } = renderHook(() => useSubMerchants())
    act(() => { result.current.setFilters({ query: '', status: 'ACTIVE' }) })
    act(() => { result.current.setPage(2) })
    expect(result.current.total).toBe(11)
    expect(result.current.rows).toHaveLength(1)
    act(() => { result.current.toggleStatus(result.current.rows[0].id, 'Khóa để kiểm tra') })

    expect(result.current.total).toBe(10)
    expect(result.current.page).toBe(1)
    expect(result.current.rows).toHaveLength(10)
  })
})
