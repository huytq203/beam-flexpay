import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { AUTHENTICATION, FORBIDDENERROR } from '@constants/routersConstant'
import { capyWrapper, mockMedia } from './helpers'

const env = vi.hoisted(() => ({ CAPY_ENABLED: true }))
vi.mock('@configs/env', () => ({ ENV: env }))

import { useCapySettings } from '../hooks/useCapySettings'

const ROUTE = SCREENS.ROLE_MANAGEMENT.path

const wrapper = (username: string, route: string = ROUTE) =>
  capyWrapper({ username }, route)

describe('useCapySettings', () => {
  beforeEach(() => {
    env.CAPY_ENABLED = true
    window.localStorage.clear()
    mockMedia()
  })

  it('available khi env bật, đúng route, màn rộng và không giảm chuyển động', () => {
    const { result } = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(result.current.available).toBe(true)
    expect(result.current.enabled).toBe(true)
  })

  it('không available khi env tắt', () => {
    env.CAPY_ENABLED = false
    const { result } = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(result.current.available).toBe(false)
  })

  it('không available ở các route bị chặn (đăng nhập, từ chối truy cập)', () => {
    for (const route of [FORBIDDENERROR, `${AUTHENTICATION}/login`]) {
      const { result } = renderHook(() => useCapySettings(), {
        wrapper: wrapper('huy', route)
      })
      expect(result.current.available).toBe(false)
    }
  })

  it('available ở mọi màn khác sau đăng nhập, kể cả màn giao dịch', () => {
    for (const route of [
      SCREENS.TRANSACTION_MANAGEMENT.path,
      SCREENS.USER_ACCOUNT.path,
      '/secure-panel/bat-ky-man-nao'
    ]) {
      const { result } = renderHook(() => useCapySettings(), {
        wrapper: wrapper('huy', route)
      })
      expect(result.current.available).toBe(true)
    }
  })

  it('không available khi bật giảm chuyển động hoặc màn hẹp', () => {
    mockMedia({ reduced: true })
    const a = renderHook(() => useCapySettings(), { wrapper: wrapper('huy') })
    expect(a.result.current.available).toBe(false)
    mockMedia({ wide: false })
    const b = renderHook(() => useCapySettings(), { wrapper: wrapper('huy') })
    expect(b.result.current.available).toBe(false)
  })

  it('tuỳ chọn lưu riêng theo username và giữ sau khi render lại', () => {
    const huy = renderHook(() => useCapySettings(), { wrapper: wrapper('huy') })
    act(() => huy.result.current.setEnabled(false))
    expect(huy.result.current.enabled).toBe(false)
    expect(window.localStorage.getItem('capy:huy')).toContain('"enabled":false')

    const lan = renderHook(() => useCapySettings(), { wrapper: wrapper('lan') })
    expect(lan.result.current.enabled).toBe(true)

    huy.unmount()
    const again = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(again.result.current.enabled).toBe(false)
  })

  it('localStorage ném lỗi thì vẫn trả mặc định và không crash', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })
    const { result } = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(result.current.enabled).toBe(true)
    expect(result.current.idleOnly).toBe(false)
    spy.mockRestore()
  })

  it('lưu và đọc lại tốc độ, độ hiếu động, thời gian ngủ; giá trị hỏng rơi về mặc định', () => {
    const first = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(first.result.current).toMatchObject({
      speed: 'normal',
      activity: 'normal',
      sleepAfter: 5
    })
    act(() =>
      first.result.current.update({
        speed: 'slow',
        activity: 'low',
        sleepAfter: 10
      })
    )
    first.unmount()
    const again = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(again.result.current).toMatchObject({
      speed: 'slow',
      activity: 'low',
      sleepAfter: 10
    })
    again.unmount()

    window.localStorage.setItem(
      'capy:huy',
      JSON.stringify({ speed: 'bay', activity: 7, sleepAfter: 99 })
    )
    const broken = renderHook(() => useCapySettings(), {
      wrapper: wrapper('huy')
    })
    expect(broken.result.current).toMatchObject({
      speed: 'normal',
      activity: 'normal',
      sleepAfter: 5
    })
  })
})
