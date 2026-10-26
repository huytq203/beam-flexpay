import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CapyEngine } from '../engine/CapyEngine'
import { addBlock, makeEngine, mockRects } from './engineHelpers'
import { buildTuning, DEFAULT_LEVELS, SAFETY, STAGE } from '../engine/tuning'

describe('CapyEngine', () => {
  beforeEach(() => {
    STAGE.pagePlatforms = true
    vi.useFakeTimers()
    document.body.innerHTML = ''
    mockRects()
  })
  afterEach(() => {
    STAGE.pagePlatforms = false
    SAFETY.forbiddenZones = false
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('stop() huỷ hết bộ đếm giờ và vòng vẽ', async () => {
    const { engine } = makeEngine()
    engine.start()
    engine.stop()
    await vi.advanceTimersByTimeAsync(500)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('chào khi đứng yên và nhận câu chào có tên', () => {
    const { engine, bubbles } = makeEngine(() => 'Chào Huy!')
    engine.start()
    expect(engine.greet()).toBe(true)
    expect(bubbles).toContain('Chào Huy!')
    engine.stop()
  })

  it('không chào khi đang bị nắm, và nghỉ 6 giây giữa hai lần', async () => {
    const { engine, bubbles } = makeEngine()
    engine.start()
    engine.pointerDown(engine.state.x, engine.state.y)
    expect(engine.greet()).toBe(false)
    expect(bubbles).not.toContain('Chào Huy!')
    engine.pointerUp()
    await vi.advanceTimersByTimeAsync(4000)
    expect(engine.greet()).toBe(false)
    await vi.advanceTimersByTimeAsync(3000)
    expect(engine.greet()).toBe(true)
    engine.stop()
  })

  it('có hộp thoại mở thì Capy không dịch chỗ, đứng yên vẫn đứng yên', async () => {
    const { engine } = makeEngine()
    engine.start()
    engine.setIdleOnly(true)
    const before = engine.state
    addBlock('<div role="dialog" data-rect="300,200,400,300"></div>')
    await vi.advanceTimersByTimeAsync(40000)
    expect(engine.state.x).toBe(before.x)
    expect(engine.state.y).toBe(before.y)
    engine.stop()
  })

  it('nền đang đứng bị cuộn khuất thì rơi xuống nền thấp hơn, toạ độ luôn hữu hạn', async () => {
    const { engine } = makeEngine()
    const card = addBlock(
      '<div class="ant-card" data-rect="100,300,600,120"></div>'
    )
    engine.start()
    engine.teleport(0, 300)
    const before = engine.state.y
    card.remove()
    document.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(3500)
    const { x, y } = engine.state
    expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
    expect(y).toBeGreaterThan(before)
    engine.stop()
  })

  it('chế độ chỉ đứng yên không đổi vị trí ngang', async () => {
    const { engine } = makeEngine()
    engine.start()
    engine.setIdleOnly(true)
    const startX = engine.state.x
    await vi.advanceTimersByTimeAsync(40000)
    expect(engine.state.x).toBe(startX)
    engine.stop()
  })

  it('mờ đi khi đang chồng lên vùng cấm (khi công tắc bật) và rõ lại khi ra khỏi', async () => {
    SAFETY.forbiddenZones = true
    const { engine, box } = makeEngine()
    addBlock('<div class="ant-card" data-rect="100,300,600,120"></div>')
    addBlock('<div data-capy="no" data-rect="250,230,100,70"></div>')
    engine.start()
    engine.teleport(0, 300)
    await vi.advanceTimersByTimeAsync(60)
    expect(box.style.opacity).toBe('0.35')
    engine.teleport(0, 600)
    await vi.advanceTimersByTimeAsync(60)
    expect(box.style.opacity).toBe('')
    engine.stop()
    SAFETY.forbiddenZones = false
  })

  it('công tắc vùng cấm tắt thì không mờ dù đứng trên ô nhạy cảm', async () => {
    const { engine, box } = makeEngine()
    addBlock('<div class="ant-card" data-rect="100,300,600,120"></div>')
    addBlock('<div data-capy="no" data-rect="250,230,100,70"></div>')
    engine.start()
    engine.teleport(0, 300)
    await vi.advanceTimersByTimeAsync(60)
    expect(box.style.opacity).toBe('')
    engine.stop()
  })

  describe('ngủ khi không ai động vào', () => {
    const MIN = 60_000
    const asleep = (anim: string) => anim === 'nod' || anim === 'doze'

    /** Tiến từng giây tới khi Capy bắt đầu gật gù; trả số giây đã trôi. */
    async function untilSleepy(
      engine: CapyEngine,
      limitMs: number
    ): Promise<number> {
      let elapsed = 0
      while (elapsed < limitMs && !asleep(engine.state.anim)) {
        await vi.advanceTimersByTimeAsync(1000)
        elapsed += 1000
      }
      return elapsed
    }

    it('5 phút không động vào thì ngủ, ngủ 1 đến 2 phút rồi dậy', async () => {
      const { engine } = makeEngine()
      engine.start()
      await vi.advanceTimersByTimeAsync(4 * MIN)
      expect(asleep(engine.state.anim)).toBe(false)
      const waited = await untilSleepy(engine, 3 * MIN)
      expect(4 * MIN + waited).toBeGreaterThanOrEqual(5 * MIN)
      expect(asleep(engine.state.anim)).toBe(true)
      await vi.advanceTimersByTimeAsync(55_000)
      expect(asleep(engine.state.anim)).toBe(true)
      await vi.advanceTimersByTimeAsync(80_000)
      expect(asleep(engine.state.anim)).toBe(false)
      engine.stop()
    })

    it('có người động vào thì tính lại từ đầu', async () => {
      const { engine } = makeEngine()
      engine.start()
      await vi.advanceTimersByTimeAsync(4 * MIN)
      document.dispatchEvent(new Event('pointermove'))
      await vi.advanceTimersByTimeAsync(80_000)
      expect(asleep(engine.state.anim)).toBe(false)
      engine.stop()
    })

    it('chọn "không ngủ" thì không bao giờ ngủ', async () => {
      const { engine } = makeEngine()
      engine.start()
      engine.setTuning(buildTuning({ ...DEFAULT_LEVELS, sleepAfter: 0 }))
      await vi.advanceTimersByTimeAsync(20 * MIN)
      expect(asleep(engine.state.anim)).toBe(false)
      engine.stop()
    })

    it('đổi sang ngủ sau 3 phút thì ngủ sớm hơn', async () => {
      const { engine } = makeEngine()
      engine.start()
      engine.setTuning(buildTuning({ ...DEFAULT_LEVELS, sleepAfter: 3 }))
      const waited = await untilSleepy(engine, 5 * MIN)
      expect(waited).toBeGreaterThanOrEqual(3 * MIN)
      expect(waited).toBeLessThan(4 * MIN)
      engine.stop()
    })
  })
})
