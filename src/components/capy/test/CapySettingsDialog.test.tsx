import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@languages/i18n'
import { SCREENS } from '@/app/permissions'
import { capyWrapper, mockMedia } from './helpers'

const env = vi.hoisted(() => ({ CAPY_ENABLED: true }))
vi.mock('@configs/env', () => ({ ENV: env }))

import { CapySettingsDialog } from '../CapySettingsDialog'

const ROUTE: string = SCREENS.ROLE_MANAGEMENT.path
const renderToggle = (route: string = ROUTE) =>
  render(
    <CapySettingsDialog
      open
      onCancel={vi.fn()}
    />,
    {
      wrapper: capyWrapper({ username: 'huy', fullName: 'Trần Huy' }, route)
    }
  )

const stored = (): string => window.localStorage.getItem('capy:huy') ?? ''

describe('CapySettingsDialog', () => {
  beforeEach(() => {
    env.CAPY_ENABLED = true
    window.localStorage.clear()
    mockMedia()
  })

  it('hộp thoại có hai công tắc', async () => {
    renderToggle()
    expect(await screen.findAllByRole('switch')).toHaveLength(2)
  })

  it('tắt công tắc thì lưu enabled=false; "chỉ đứng yên" lưu idleOnly=true', async () => {
    renderToggle()
    const [enabled, idleOnly] = await screen.findAllByRole('switch')
    fireEvent.click(idleOnly)
    expect(stored()).toContain('"idleOnly":true')
    fireEvent.click(enabled)
    expect(stored()).toContain('"enabled":false')
  })

  it('bảng cài đặt có tốc độ, độ hiếu động và thời gian ngủ, lưu khi đổi', async () => {
    renderToggle()
    fireEvent.click(await screen.findByText('Nhanh'))
    expect(stored()).toContain('"speed":"fast"')
    fireEvent.click(screen.getByText('Nhiều'))
    expect(stored()).toContain('"activity":"high"')
    expect(screen.getByText('Ngủ khi không ai động vào')).toBeInTheDocument()
  })

  it('chọn thời gian ngủ trong danh sách', async () => {
    renderToggle()
    const select = await screen.findByRole('combobox')
    fireEvent.mouseDown(select)
    fireEvent.click(await screen.findByText('Không ngủ'))
    expect(stored()).toContain('"sleepAfter":0')
  })
})
