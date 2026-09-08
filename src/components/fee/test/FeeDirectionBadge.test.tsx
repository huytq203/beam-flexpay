import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeeDirectionBadge } from '../FeeDirectionBadge'

describe('FeeDirectionBadge', () => {
  it('gắn nhãn đầu ra cho giao dịch rút tiền', () => {
    render(<FeeDirectionBadge serviceType='EWALLET_WITHDRAWAL' />)
    expect(screen.getByText('Đầu ra')).toBeInTheDocument()
  })

  it('gắn nhãn đầu vào cho giao dịch nạp tiền', () => {
    render(<FeeDirectionBadge serviceType='EWALLET_DEPOSIT' />)
    expect(screen.getByText('Đầu vào')).toBeInTheDocument()
  })

  it('hiện kèm tên loại dịch vụ khi được truyền caption', () => {
    render(
      <FeeDirectionBadge serviceType='EWALLET_WITHDRAWAL' caption='Rút tiền ví' />
    )
    expect(screen.getByText('Đầu ra')).toBeInTheDocument()
    expect(screen.getByText('Rút tiền ví')).toBeInTheDocument()
  })

  it('không bịa chiều tiền cho loại dịch vụ chưa phân loại', () => {
    render(<FeeDirectionBadge serviceType='SOMETHING_NEW' />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText('Đầu ra')).not.toBeInTheDocument()
  })

  it('ưu tiên chiều truyền thẳng hơn suy từ loại dịch vụ', () => {
    render(
      <FeeDirectionBadge serviceType='EWALLET_DEPOSIT' direction='INTERNAL' />
    )
    expect(screen.getByText('Nội bộ')).toBeInTheDocument()
  })
})
