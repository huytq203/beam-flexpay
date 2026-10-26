import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@languages/i18n'
import { SCREENS } from '@/app/permissions'
import { capyWrapper, mockMedia } from './helpers'

const env = vi.hoisted(() => ({ CAPY_ENABLED: true }))
vi.mock('@configs/env', () => ({ ENV: env }))

const fake = vi.hoisted(() => ({
  engines: [] as Array<{
    greeting: () => string
    start: ReturnType<typeof vi.fn>
    stop: ReturnType<typeof vi.fn>
    greet: ReturnType<typeof vi.fn>
    pointerDown: ReturnType<typeof vi.fn>
    pointerUp: ReturnType<typeof vi.fn>
    perform: ReturnType<typeof vi.fn>
    setTuning: ReturnType<typeof vi.fn>
  }>
}))

vi.mock('../engine/CapyEngine', () => ({
  BODY_WIDTH: 54,
  BODY_HEIGHT: 78,
  CapyEngine: class {
    greeting: () => string
    start = vi.fn()
    stop = vi.fn()
    greet = vi.fn()
    setIdleOnly = vi.fn()
    setTuning = vi.fn()
    pointerDown = vi.fn()
    pointerMove = vi.fn()
    pointerUp = vi.fn(() => 'click')
    perform = vi.fn()
    constructor(options: { greeting: () => string }) {
      this.greeting = options.greeting
      fake.engines.push(this)
    }
  }
}))

import { Capy } from '../Capy'

let imageCount = 0
class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_value: string) {
    imageCount += 1
    queueMicrotask(() => this.onload?.())
  }
}

const ROUTE = SCREENS.ROLE_MANAGEMENT.path
const huy = { username: 'huy', fullName: 'Trần Huy', email: 'huy@beam.vn' }

const renderCapy = (identity = huy, route: string = ROUTE) =>
  render(<Capy />, { wrapper: capyWrapper(identity, route) })

describe('Capy', () => {
  beforeEach(() => {
    env.CAPY_ENABLED = true
    fake.engines.length = 0
    imageCount = 0
    window.localStorage.clear()
    mockMedia()
    vi.stubGlobal('Image', FakeImage)
    // jsdom chưa có canvas 2D; engine đã bị thay bằng bản giả nên ngữ cảnh chỉ cần tồn tại.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as CanvasRenderingContext2D
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('không hiện và không tải ảnh khi env tắt', async () => {
    env.CAPY_ENABLED = false
    renderCapy()
    await Promise.resolve()
    expect(screen.queryByTestId('capy-canvas')).toBeNull()
    expect(imageCount).toBe(0)
  })

  it('không hiện ở route bị chặn', async () => {
    renderCapy(huy, '/secure-panel/forbidden')
    await Promise.resolve()
    expect(screen.queryByTestId('capy-canvas')).toBeNull()
    expect(imageCount).toBe(0)
  })

  it('không hiện khi người dùng đã tắt', async () => {
    window.localStorage.setItem(
      'capy:huy',
      JSON.stringify({ enabled: false, idleOnly: false })
    )
    renderCapy()
    await Promise.resolve()
    expect(screen.queryByTestId('capy-canvas')).toBeNull()
    expect(imageCount).toBe(0)
  })

  it('hiện đúng một canvas và khởi động engine khi đủ điều kiện', async () => {
    renderCapy()
    expect(await screen.findAllByTestId('capy-canvas')).toHaveLength(1)
    expect(fake.engines).toHaveLength(1)
    expect(fake.engines[0].start).toHaveBeenCalledTimes(1)
  })

  it('rê chuột thì chào, cảm ứng thì không', async () => {
    renderCapy()
    const canvas = await screen.findByTestId('capy-canvas')
    const box = canvas.parentElement as HTMLElement
    fireEvent.pointerEnter(box, { pointerType: 'touch' })
    expect(fake.engines[0].greet).not.toHaveBeenCalled()
    fireEvent.pointerEnter(box, { pointerType: 'mouse' })
    expect(fake.engines[0].greet).toHaveBeenCalledTimes(1)
  })

  it('câu chào mang tên người đăng nhập (chữ cuối của họ tên)', async () => {
    renderCapy()
    await screen.findByTestId('capy-canvas')
    const text = fake.engines[0].greeting()
    expect(text).toContain('Huy')
    expect(text).not.toContain('Trần')
  })

  it('họ tên trống thì dùng phần trước @ của email, không có chữ undefined', async () => {
    renderCapy({ username: 'a', fullName: '', email: 'lan@beam.vn' })
    await screen.findByTestId('capy-canvas')
    const text = fake.engines[0].greeting()
    expect(text).toContain('lan')
    expect(text).not.toContain('undefined')
  })

  it('gỡ component thì dừng engine', async () => {
    const view = renderCapy()
    await screen.findByTestId('capy-canvas')
    view.unmount()
    await waitFor(() => expect(fake.engines[0].stop).toHaveBeenCalled())
  })

  it('bấm vào Capy mở menu; "Ngủ" gọi engine, "Ẩn" giống tắt và được lưu', async () => {
    renderCapy()
    const canvas = await screen.findByTestId('capy-canvas')
    const box = canvas.parentElement as HTMLElement
    fireEvent.pointerUp(box)
    fireEvent.click(await screen.findByRole('button', { name: 'Ngủ' }))
    expect(fake.engines[0].perform).toHaveBeenCalledWith('sleep')

    fireEvent.pointerUp(box)
    fireEvent.click(await screen.findByRole('button', { name: 'Ẩn' }))
    expect(window.localStorage.getItem('capy:huy')).toContain('"enabled":false')
    expect(fake.engines[0].perform).toHaveBeenCalledWith('bye')
    await waitFor(
      () => expect(screen.queryByTestId('capy-canvas')).toBeNull(),
      {
        timeout: 3000
      }
    )
  })

  it('truyền mức tốc độ, hiếu động và thời gian ngủ đã lưu cho engine', async () => {
    window.localStorage.setItem(
      'capy:huy',
      JSON.stringify({
        enabled: true,
        idleOnly: false,
        speed: 'slow',
        activity: 'low',
        sleepAfter: 10
      })
    )
    renderCapy()
    await screen.findByTestId('capy-canvas')
    const tuning = fake.engines[0].setTuning.mock.calls.at(-1)?.[0]
    expect(tuning.sleepAfterMs).toBe(10 * 60_000)
    expect(tuning.walkSpeed).toBeLessThan(55)
  })
})
