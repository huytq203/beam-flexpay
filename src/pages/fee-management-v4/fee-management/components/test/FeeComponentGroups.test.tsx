import { render, screen } from '@testing-library/react'
import type { ColumnsType } from 'antd/es/table'
import { describe, expect, it, vi } from 'vitest'
import type { FeeComponent } from '../../types/FeeComponent.types'
import { FeeComponentGroups } from '../FeeComponentGroups'

const columns: ColumnsType<FeeComponent> = [
  { title: 'Loại phí', dataIndex: 'componentType' },
  {
    title: 'Mức phí',
    key: 'amount',
    render: (_v, record) => record.fixedAmount ?? '—'
  }
]

const withdrawalPolicy: FeeComponent[] = [
  {
    id: 'bank',
    componentType: 'BANK_FEE',
    beneficiaryType: 'BANK',
    baseOn: 'AMOUNT',
    calculationMethod: 'DIRECT',
    roundMode: 'HALF_UP',
    payerType: 'USER',
    fixedAmount: 2000
  },
  {
    id: 'system',
    componentType: 'SYSTEM_FEE',
    beneficiaryType: 'SYSTEM',
    baseOn: 'AMOUNT',
    calculationMethod: 'DIRECT',
    roundMode: 'HALF_UP',
    payerType: 'USER',
    fixedAmount: 3000
  }
]

describe('FeeComponentGroups', () => {


  it('hiện mức phí của từng thành phần', () => {
    render(
      <FeeComponentGroups dataSource={withdrawalPolicy} columns={columns} />
    )

    expect(screen.getByText('2000')).toBeInTheDocument()
    expect(screen.getByText('3000')).toBeInTheDocument()
  })

  it('không cộng tổng — tổng phụ thuộc số tiền giao dịch nên không hiển thị', () => {
    render(
      <FeeComponentGroups dataSource={withdrawalPolicy} columns={columns} />
    )

    expect(screen.queryByText(/Người dùng trả/i)).not.toBeInTheDocument()
    expect(screen.queryByText('5000')).not.toBeInTheDocument()
  })

  it('hiện trạng thái rỗng khi chính sách chưa có thành phần nào', () => {
    render(<FeeComponentGroups dataSource={[]} columns={columns} />)
    expect(screen.getByText('Chưa có thành phần phí nào')).toBeInTheDocument()
  })

  it('hiện trạng thái lỗi kèm nút thử lại', () => {
    const onRetry = vi.fn()
    render(
      <FeeComponentGroups
        dataSource={undefined}
        columns={columns}
        isError
        onRetry={onRetry}
      />
    )

    expect(
      screen.getByText('Không tải được danh sách thành phần phí')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })

  it('không hiện dữ liệu khi đang tải', () => {
    render(
      <FeeComponentGroups
        dataSource={withdrawalPolicy}
        columns={columns}
        isLoading
      />
    )

    expect(screen.queryByText('Ngân hàng hưởng')).not.toBeInTheDocument()
  })
})
