import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SUB_MERCHANT_FIXTURES } from '../../sub-merchant/constants/subMerchant.fixture'
import { TERMINAL_FIXTURES } from '../../terminal/constants/terminal.fixture'
import { EntityLockDialog } from '../EntityLockDialog'
import { ManagementPageHeader } from '../ManagementPageHeader'
import { ManagementStatusTag } from '../ManagementStatusTag'
import { ManagementTableState } from '../ManagementTableState'

describe('ManagementPageHeader', () => {
  it('announces the record count and renders both action slots', () => {
    render(
      <ManagementPageHeader
        actions={<button type='button'>Xuất Excel</button>}
        primaryAction={<button type='button'>Thêm Sub-merchant</button>}
        title='Danh sách sub-merchant'
        total={4}
      />
    )

    expect(screen.getByText('4 bản ghi')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: 'Xuất Excel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thêm Sub-merchant' })).toBeInTheDocument()
  })
})

describe('ManagementTableState', () => {
  it.each(['loading', 'error', 'empty'] as const)(
    'renders %s state with accessible copy',
    (state) => {
      render(
        <ManagementTableState
          entityName='Sub-merchant'
          onRetry={vi.fn()}
          state={state}
        />
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    }
  )
})

describe('EntityLockDialog', () => {
  it('blocks unlock when parent state controls the entity', () => {
    render(
      <EntityLockDialog
        blockedMessage='Mở Merchant cha trước'
        entityLabel='SUB-001'
        mode='unlock'
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
      />
    )

    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('submits a trimmed reason of at least ten characters', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()

    render(
      <EntityLockDialog
        entityLabel='SUB-001'
        mode='lock'
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        open
      />
    )

    await user.type(screen.getByLabelText('Lý do khóa'), ' ngắn ')
    await user.click(screen.getByRole('button', { name: 'Khóa' }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByText('Lý do cần có ít nhất 10 ký tự.')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Lý do khóa'))
    await user.type(screen.getByLabelText('Lý do khóa'), '  Kiểm tra định kỳ  ')
    await user.click(screen.getByRole('button', { name: 'Khóa' }))

    expect(onConfirm).toHaveBeenCalledWith('Kiểm tra định kỳ')
  })
})

describe('ManagementStatusTag', () => {
  it('shows the cascade status with the parent-level label', () => {
    render(<ManagementStatusTag status='SUSPENDED_BY_PARENT' />)

    expect(screen.getByText('Tạm ngưng theo cấp cha')).toBeInTheDocument()
  })
})

describe('hierarchy fixture seeds', () => {
  it('freezes only the exported seed arrays and covers hierarchy states', () => {
    expect(Object.isFrozen(SUB_MERCHANT_FIXTURES)).toBe(true)
    expect(Object.isFrozen(TERMINAL_FIXTURES)).toBe(true)
    expect(SUB_MERCHANT_FIXTURES.map((row) => row.status)).toEqual(
      expect.arrayContaining(['ACTIVE', 'LOCKED', 'SUSPENDED_BY_PARENT'])
    )
    expect(TERMINAL_FIXTURES.map((row) => row.type)).toEqual(
      expect.arrayContaining(['STATIC_QR', 'DYNAMIC_QR', 'POS', 'SOFTPOS'])
    )
    expect(TERMINAL_FIXTURES.map((row) => row.status)).toEqual(
      expect.arrayContaining(['ACTIVE', 'LOCKED', 'SUSPENDED_BY_SUB'])
    )
  })
})
