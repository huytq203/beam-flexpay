import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEngine, mockRects } from './engineHelpers'

/** Kéo Capy lên giữa không trung rồi thả; trả vị trí lúc thả. */
function dragAndDrop(engine: ReturnType<typeof makeEngine>['engine']): {
  x: number
  y: number
} {
  const { x, y } = engine.state
  engine.pointerDown(x, y)
  engine.pointerMove(x + 120, y - 300)
  engine.pointerUp()
  return { x: x + 120, y: y - 300 }
}

describe('thả Capy lơ lửng', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    mockRects()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('rơi xuống nền gần nhất bên dưới, cả khi đang bật "chỉ đứng yên"', async () => {
    for (const idleOnly of [false, true]) {
      const { engine } = makeEngine()
      engine.start()
      engine.setIdleOnly(idleOnly)
      const dropped = dragAndDrop(engine)
      await vi.advanceTimersByTimeAsync(4000)
      expect(engine.state.y, `idleOnly=${idleOnly}`).toBeGreaterThan(
        dropped.y + 100
      )
      engine.stop()
    }
  })

  it('bật "chỉ đứng yên" giữa lúc đi thì dừng ngay, không đi nốt quãng đang dở', async () => {
    const { engine } = makeEngine()
    engine.start()
    // Chờ tới lúc Capy đang đi hoặc chạy.
    let waited = 0
    while (!['walk', 'run'].includes(engine.state.anim) && waited < 600_000) {
      await vi.advanceTimersByTimeAsync(500)
      waited += 500
    }
    expect(['walk', 'run']).toContain(engine.state.anim)
    engine.setIdleOnly(true)
    const before = { ...engine.state }
    expect(engine.state.anim).toBe('idle')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(engine.state.x).toBe(before.x)
    expect(engine.state.y).toBe(before.y)
    engine.stop()
  })

  it('đã đứng yên thì không bao giờ đi lại, dù để rất lâu', async () => {
    const { engine } = makeEngine()
    engine.start()
    engine.setIdleOnly(true)
    const before = { ...engine.state }
    for (let i = 0; i < 30; i += 1) {
      await vi.advanceTimersByTimeAsync(20_000)
      expect(['walk', 'run', 'turnIn', 'turnOut']).not.toContain(
        engine.state.anim
      )
    }
    expect(engine.state.x).toBe(before.x)
    engine.stop()
  })
})
