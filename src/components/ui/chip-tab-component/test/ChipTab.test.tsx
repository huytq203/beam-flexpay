import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChipTab } from '../ChipTab'
import { ChipTabGroup } from '../ChipTabGroup'

describe('ChipTab', () => {
  it('role button: dùng aria-pressed và style chọn', () => {
    render(<ChipTab isActive>Tất cả</ChipTab>)
    const chip = screen.getByRole('button', { name: 'Tất cả' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).not.toHaveAttribute('aria-selected')
    expect(chip.className).toContain('bg-primary')
    expect(chip.className).toContain('rounded-md')
  })

  it('role tab: dùng aria-selected', () => {
    render(
      <ChipTabGroup
        role='tablist'
        aria-label='Miền'
      >
        <ChipTab
          role='tab'
          isActive={false}
        >
          A
        </ChipTab>
      </ChipTabGroup>
    )
    const tab = screen.getByRole('tab', { name: 'A' })
    expect(tab).toHaveAttribute('aria-selected', 'false')
    expect(tab).not.toHaveAttribute('aria-pressed')
    expect(screen.getByRole('tablist', { name: 'Miền' })).toBeInTheDocument()
  })

  it('gọi onClick và render icon', async () => {
    const onClick = vi.fn()
    render(
      <ChipTab
        isActive={false}
        onClick={onClick}
        icon={<svg data-testid='icon' />}
      >
        Nhãn
      </ChipTab>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Nhãn' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('disabled thì không gọi onClick', async () => {
    const onClick = vi.fn()
    render(
      <ChipTab
        isActive={false}
        disabled
        onClick={onClick}
      >
        X
      </ChipTab>
    )
    const chip = screen.getByRole('button', { name: 'X' })
    expect(chip).toBeDisabled()
    await userEvent.click(chip)
    expect(onClick).not.toHaveBeenCalled()
  })
})
