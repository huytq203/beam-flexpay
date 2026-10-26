import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_LEVELS,
  DEFAULT_LEVELS,
  IDLE_ONLY_ACTIONS,
  SPEED_LEVELS,
  buildTuning
} from '../engine/tuning'

describe('buildTuning', () => {
  it('mặc định: ngủ sau 5 phút', () => {
    expect(buildTuning(DEFAULT_LEVELS).sleepAfterMs).toBe(5 * 60_000)
  })

  it('"không ngủ" cho ra null', () => {
    expect(
      buildTuning({ ...DEFAULT_LEVELS, sleepAfter: 0 }).sleepAfterMs
    ).toBeNull()
  })

  it('mức tốc độ tăng dần: chậm < vừa < nhanh, cả đi lẫn chạy', () => {
    const [slow, normal, fast] = SPEED_LEVELS.map((speed) =>
      buildTuning({ ...DEFAULT_LEVELS, speed })
    )
    expect(slow.walkSpeed).toBeLessThan(normal.walkSpeed)
    expect(normal.walkSpeed).toBeLessThan(fast.walkSpeed)
    expect(slow.runSpeed).toBeLessThan(normal.runSpeed)
    expect(normal.runSpeed).toBeLessThan(fast.runSpeed)
    expect(slow.hopScale).toBeGreaterThan(fast.hopScale)
  })

  it('mức hiếu động: ít thì nghỉ lâu hơn và ít di chuyển hơn nhiều', () => {
    const [low, normal, high] = ACTIVITY_LEVELS.map((activity) =>
      buildTuning({ ...DEFAULT_LEVELS, activity })
    )
    expect(low.gap[0]).toBeGreaterThan(normal.gap[0])
    expect(normal.gap[0]).toBeGreaterThan(high.gap[0])
    const moving = (weighted: readonly string[]) =>
      weighted.filter((name) => ['roam', 'run', 'climb'].includes(name))
        .length / weighted.length
    expect(moving(low.weighted)).toBeLessThan(moving(normal.weighted))
    expect(moving(normal.weighted)).toBeLessThan(moving(high.weighted))
  })

  it('không hành động ngẫu nhiên nào là ngủ; chế độ đứng yên không có di chuyển', () => {
    for (const activity of ACTIVITY_LEVELS) {
      expect(
        buildTuning({ ...DEFAULT_LEVELS, activity }).weighted
      ).not.toContain('sleep')
    }
    expect(
      IDLE_ONLY_ACTIONS.some((name) => ['roam', 'run', 'climb'].includes(name))
    ).toBe(false)
  })
})
