import type { AnimationName } from '../frames/animations'
import type { FrameName } from '../frames/manifest'
import * as act from './actions'
import { trackActivity } from './activity'
import { Clock } from './clock'
import * as react from './interactions'
import { FramePlayer, type Canvas2dLike } from './player'
import { Drag } from './drag'
import { Cancelled, clamp, rand, type Runtime } from './runtime'
import { findSnapPlatform, measureWorld, type World } from './world'
import { buildTuning, DEFAULT_LEVELS, type CapyTuning } from './tuning'
import { overlapsBody } from './zones'

export interface CapyEngineOptions {
  readonly ctx: Canvas2dLike
  readonly images: ReadonlyMap<FrameName, CanvasImageSource>
  /** Hộp bắt chuột của Capy (54x78px), engine đặt `transform` của nó. */
  readonly box: HTMLElement
  readonly canvasSize: number
  readonly dpr: number
  readonly greeting: () => string
  readonly onBubble: (text: string | null) => void
}

export const BODY_WIDTH = 54
export const BODY_HEIGHT = 78
const FEET = BODY_HEIGHT / 2 - 2
const CANVAS_BASE = 160
const GREET_COOLDOWN = 6000
const WORLD_TTL = 150
const BUSY: readonly AnimationName[] = ['takeoff', 'air', 'held', 'dizzy']

export class CapyEngine implements Runtime {
  readonly player: FramePlayer
  readonly bodyWidth = BODY_WIDTH
  readonly feet = FEET
  x = 0
  y = 0
  platform = 0
  phoneOut = false

  private epoch = 0
  private running = false
  private idleOnly = false
  private raf = 0
  private lastGreet = -Infinity
  private drag: Drag | null = null
  private spin = 0
  private cached: { world: World; at: number } | null = null
  private readonly clock = new Clock(() => this.epoch)
  private lastActive = performance.now()
  private stopTracking: (() => void) | null = null
  tuning: CapyTuning = buildTuning(DEFAULT_LEVELS)
  private pendingScroll = false

  constructor(private readonly o: CapyEngineOptions) {
    this.player = new FramePlayer(
      o.ctx,
      o.images,
      o.canvasSize,
      CANVAS_BASE,
      o.dpr
    )
  }

  get state(): { x: number; y: number; anim: string } {
    return { x: this.x, y: this.y, anim: this.player.current }
  }

  world(): World {
    const now = performance.now()
    if (!this.cached || now - this.cached.at > WORLD_TTL) {
      this.cached = { world: measureWorld(BODY_WIDTH), at: now }
    }
    return this.cached.world
  }

  put(x: number, y: number): void {
    this.x = x
    this.y = y
    this.o.box.style.transform = `translate3d(${x - BODY_WIDTH / 2}px,${y - BODY_HEIGHT / 2}px,0)`
  }

  /** Đặt Capy đứng trên nền `index` tại `x` (dùng khi khởi động và trong test). */
  teleport(index: number, x: number): void {
    const world = this.world()
    const i = clamp(index, 0, world.platforms.length - 1)
    const platform = world.platforms[i]
    this.platform = i
    this.put(clamp(x, platform.lo, platform.hi), platform.y - FEET)
  }

  wait(ms: number, epoch: number): Promise<void> {
    return this.clock.wait(ms, epoch)
  }

  tween(ms: number, epoch: number, step: (k: number) => void): Promise<void> {
    return this.clock.tween(ms, epoch, step)
  }

  say(text: string | null, ms = 1600): void {
    this.o.onBubble(text)
    if (text !== null) this.clock.after(ms, () => this.o.onBubble(null))
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.lastActive = performance.now()
    this.stopTracking = trackActivity(() => {
      this.lastActive = performance.now()
    })
    const world = this.world()
    this.teleport(
      world.platforms.length - 1,
      rand(world.width * 0.3, world.width * 0.7)
    )
    this.player.play('idle', { flip: false })
    document.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onScroll)
    this.raf = requestAnimationFrame(this.renderLoop)
    this.launch(null)
  }

  stop(): void {
    this.running = false
    this.epoch += 1
    this.clock.clear()
    this.stopTracking?.()
    this.stopTracking = null
    cancelAnimationFrame(this.raf)
    document.removeEventListener('scroll', this.onScroll, true)
    window.removeEventListener('resize', this.onScroll)
    this.o.onBubble(null)
  }

  /** Bật đứng yên thì dừng ngay tại chỗ, không đi nốt quãng đang dở. Đang nhảy hoặc rơi thì để hạ xuống xong. */
  setIdleOnly(value: boolean): void {
    const turnedOn = value && !this.idleOnly
    this.idleOnly = value
    if (
      !turnedOn ||
      !this.running ||
      this.drag ||
      BUSY.includes(this.player.current)
    )
      return
    this.launch(() =>
      Promise.resolve(this.player.play('idle', { flip: false }))
    )
  }

  setTuning(tuning: CapyTuning): void {
    this.tuning = tuning
  }

  /** Chào khi rê chuột. Trả false nếu đang bận, đang nắm hay còn trong thời gian nghỉ. */
  greet(): boolean {
    const now = performance.now()
    if (!this.running || this.drag) return false
    if (
      BUSY.includes(this.player.current) ||
      now - this.lastGreet < GREET_COOLDOWN
    )
      return false
    this.lastGreet = now
    this.launch((e) => react.wave(this, e, this.o.greeting()))
    return true
  }

  /** Việc do người dùng chọn từ menu của Capy. */
  perform(kind: react.PerformKind): void {
    if (!this.running || this.drag) return
    this.launch((e) => react.perform(this, e, kind, this.o.greeting()))
  }

  pointerDown(clientX: number, clientY: number): void {
    if (!this.running) return
    this.epoch += 1
    this.o.onBubble(null)
    this.phoneOut = false
    this.drag = new Drag(clientX, clientY, this.x, this.y)
    this.player.play('held', { flip: false })
  }

  pointerMove(clientX: number, clientY: number): void {
    const drag = this.drag
    if (!drag) return
    const { width, height } = this.world()
    const next = drag.move(clientX, clientY, width, height)
    this.put(next.x, next.y)
    this.spin = next.spin
  }

  pointerUp(): 'click' | 'drag' | null {
    const drag = this.drag
    if (!drag) return null
    this.drag = null
    this.spin = 0
    this.player.rotation = 0
    this.cached = null
    if (!drag.moved) this.lastGreet = performance.now()
    this.launch(
      drag.moved
        ? (e) => react.fall(this, e)
        : (e) => react.wave(this, e, this.o.greeting())
    )
    return drag.moved ? 'drag' : 'click'
  }

  private readonly renderLoop = (now: number): void => {
    this.raf = requestAnimationFrame(this.renderLoop)
    if (this.drag)
      this.player.rotation += (this.spin - this.player.rotation) * 0.3
    this.spin *= 0.85
    const zones = this.cached?.world.zones
    if (zones)
      this.o.box.style.opacity = overlapsBody(this.x, this.y, zones)
        ? '0.35'
        : ''
    this.player.render(now)
  }

  private readonly onScroll = (): void => {
    if (this.pendingScroll || !this.running) return
    this.pendingScroll = true
    requestAnimationFrame(() => {
      this.pendingScroll = false
      this.cached = null
      this.reconcile()
    })
  }

  /** Nền dưới chân đã dịch chuyển hay biến mất (cuộn trang): dính theo nếu gần, không thì rơi. */
  private reconcile(): void {
    if (this.drag || BUSY.includes(this.player.current)) return
    const world = this.world()
    const feet = this.y + FEET
    const near = findSnapPlatform(world, this.x, feet)
    if (near >= 0) {
      this.platform = near
      this.put(this.x, world.platforms[near].y - FEET)
      return
    }
    this.launch((e) => react.fall(this, e))
  }

  /** Huỷ việc đang làm, chạy `action` (nếu có), rồi quay lại vòng chọn hành động ngẫu nhiên. */
  private launch(action: ((epoch: number) => Promise<void>) | null): void {
    this.epoch += 1
    const epoch = this.epoch
    this.player.rotation = 0
    this.player.offsetY = 0
    const run = async (): Promise<void> => {
      try {
        if (action) await action(epoch)
        while (this.running && epoch === this.epoch) {
          await this.wait(rand(...this.tuning.gap), epoch)
          await this.nextAction(epoch)
        }
      } catch (error) {
        if (!(error instanceof Cancelled)) throw error
      }
    }
    void run()
  }

  /** Lâu không ai động vào thì ngủ một giấc dài; không thì chọn hành động ngẫu nhiên. */
  private async nextAction(epoch: number): Promise<void> {
    const after = this.tuning.sleepAfterMs
    if (after !== null && performance.now() - this.lastActive >= after) {
      await act.deepSleep(this, epoch)
      this.lastActive = performance.now()
      return
    }
    await act.randomAction(this, epoch, this.idleOnly)
  }
}
