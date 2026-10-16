import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'

import { renderWithProviders } from '@/test/render'

import { EntityLockDialog } from '../EntityLockDialog'
import { ManagementPageHeader } from '../ManagementPageHeader'
import { ManagementStatusTag } from '../ManagementStatusTag'
import { ManagementTableState } from '../ManagementTableState'

const nativeGetComputedStyle = window.getComputedStyle

beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
    nativeGetComputedStyle(element)
  )
})

afterAll(() => vi.restoreAllMocks())

function EntityLockDialogLifecycleHarness({
  onConfirm
}: {
  onConfirm: (reason: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(false)}
      >
        Đóng dialog
      </button>
      <button
        type='button'
        onClick={() => setOpen(true)}
      >
        Mở dialog
      </button>
      <EntityLockDialog
        entityLabel='SUB-001'
        mode='lock'
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
        open={open}
      />
    </>
  )
}

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
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Thêm Sub-merchant' })
    ).toBeInTheDocument()
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

  it('renders supplied list content for a successful state', () => {
    render(
      <ManagementTableState
        entityName='Sub-merchant'
        state='success'
      >
        <p>SUB-0142-01</p>
      </ManagementTableState>
    )

    expect(screen.getByText('SUB-0142-01')).toBeInTheDocument()
  })
})

describe('EntityLockDialog', () => {
  it('blocks unlock when parent state controls the entity', () => {
    renderWithProviders(
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

    renderWithProviders(
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
    expect(
      screen.getByText('Lý do cần có ít nhất 8 ký tự.')
    ).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Lý do khóa'))
    await user.type(screen.getByLabelText('Lý do khóa'), '  Kiểm tra định kỳ  ')
    await user.click(screen.getByRole('button', { name: 'Khóa' }))

    expect(onConfirm).toHaveBeenCalledWith('Kiểm tra định kỳ')
  })

  it('connects invalid reason input with its announced validation message', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <EntityLockDialog
        entityLabel='SUB-001'
        mode='lock'
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
      />
    )

    const reasonInput = screen.getByLabelText('Lý do khóa')
    await user.type(reasonInput, 'ngắn')
    await user.click(screen.getByRole('button', { name: 'Khóa' }))

    const error = screen.getByRole('alert')
    expect(reasonInput).toHaveAttribute('aria-invalid', 'true')
    expect(reasonInput).toHaveAttribute('aria-describedby', error.id)
    expect(error).toHaveTextContent('Lý do cần có ít nhất 8 ký tự.')
  })

  it('clears the reason and validation state when the dialog reopens', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderWithProviders(
      <EntityLockDialogLifecycleHarness onConfirm={onConfirm} />
    )

    await user.type(screen.getByLabelText('Lý do khóa'), 'ngắn')
    await user.click(screen.getByRole('button', { name: 'Khóa' }))
    expect(
      screen.getByText('Lý do cần có ít nhất 8 ký tự.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Đóng dialog' }))
    await user.click(screen.getByRole('button', { name: 'Mở dialog' }))

    expect(screen.getByLabelText('Lý do khóa')).toHaveValue('')
    expect(
      screen.queryByText('Lý do cần có ít nhất 8 ký tự.')
    ).not.toBeInTheDocument()
  })
})

describe('ManagementStatusTag', () => {
  it('shows the cascade status with the parent-level label', () => {
    render(<ManagementStatusTag status='SUSPENDED_BY_PARENT' />)

    expect(screen.getByText('Tạm ngưng theo cấp cha')).toBeInTheDocument()
  })
})
