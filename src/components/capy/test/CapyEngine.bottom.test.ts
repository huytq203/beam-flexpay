import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACTIVITY_LEVELS, DEFAULT_LEVELS, buildTuning } from '../engine/tuning'
import { addBlock, makeEngine, mockRects } from './engineHelpers'

describe('Capy chỉ đi dọc đáy khung màn hình', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    mockRects()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('không mức hiếu động nào có hành động nhảy bậc', () => {
    for (const activity of ACTIVITY_LEVELS) {
      expect(
        buildTuning({ ...DEFAULT_LEVELS, activity }).weighted
      ).not.toContain('climb')
    }
  })

  it('suốt 10 phút luôn ở độ cao của đáy dù trang có nhiều thẻ và hàng bảng', async () => {
    addBlock('<div class="ant-card" data-rect="100,300,600,120"></div>')
    addBlock('<div class="ant-table-row" data-rect="100,500,600,40"></div>')
    const { engine } = makeEngine()
    engine.start()
    const floor = engine.state.y
    for (let i = 0; i < 60; i += 1) {
      await vi.advanceTimersByTimeAsync(10_000)
      expect(engine.state.y, `giây ${i * 10}`).toBe(floor)
    }
    engine.stop()
  })

  it('có di chuyển ngang dọc đáy, không đứng im mãi', async () => {
    const { engine } = makeEngine()
    engine.start()
    const xs = new Set<number>()
    for (let i = 0; i < 40; i += 1) {
      await vi.advanceTimersByTimeAsync(10_000)
      xs.add(Math.round(engine.state.x / 20))
    }
    expect(xs.size).toBeGreaterThan(2)
    engine.stop()
  })
})
