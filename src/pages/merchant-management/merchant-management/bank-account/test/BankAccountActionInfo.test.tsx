import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { BankAccountActionInfo } from '../components/BankAccountActionInfo'

const base: BankAccountDto = {
  id: 'bank-1',
  level: 'MASTER',
  bankCode: 'TCB',
  accountNumber: '1903456789012',
  accountName: 'CONG TY A',
  isDefault: false,
  status: 'ACTIVE',
  linkStatus: 'LINKED',
  holdMode: false,
  payable: true
}

describe('BankAccountActionInfo', () => {
  it('đặt mặc định cấp Master có hiệu lực ngay', () => {
    render(
      <BankAccountActionInfo
        type='default'
        row={base}
      />
    )
    expect(screen.getByText(/có hiệu lực ngay sau khi xác nhận/)).toBeVisible()
    expect(screen.queryByText(/chờ một quản trị viên khác/)).toBeNull()
  })

  it('đặt mặc định cấp Sub báo cần quản trị viên khác duyệt', () => {
    render(
      <BankAccountActionInfo
        type='default'
        row={{ ...base, level: 'SUB' }}
      />
    )
    expect(screen.getByText(/chờ một quản trị viên khác/)).toBeVisible()
  })

  it('tạm giữ giải thích đóng băng chi tiền và yêu cầu tối thiểu 10 ký tự', () => {
    render(
      <BankAccountActionInfo
        type='hold'
        row={base}
      />
    )
    expect(screen.getByText(/đóng băng việc chi tiền/)).toBeVisible()
    expect(screen.getByText(/tối thiểu 10 ký tự/)).toBeVisible()
  })

  it('bỏ tạm giữ hiện lý do đang giữ', () => {
    render(
      <BankAccountActionInfo
        type='hold'
        row={{ ...base, holdMode: true, holdModeReason: 'Nghi ngờ gian lận' }}
      />
    )
    expect(screen.getByText(/Lý do đang giữ: Nghi ngờ gian lận/)).toBeVisible()
  })
})
