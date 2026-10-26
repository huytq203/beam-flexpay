import { ANIMATIONS, type AnimationName } from '../frames/animations'
import { FRAME_META, type FrameName } from '../frames/manifest'

/** Phần ngữ cảnh canvas 2D mà bộ phát dùng; test tiêm bản giả. */
export interface Canvas2dLike {
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void
  clearRect(x: number, y: number, w: number, h: number): void
  translate(x: number, y: number): void
  rotate(angle: number): void
  scale(x: number, y: number): void
  drawImage(
    image: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void
}

export const FRAME_SCALE = 0.62

interface PlayOptions {
  readonly once?: boolean
  readonly flip?: boolean
}

/** Phát chuỗi khung hình, vẽ vào canvas với xoay, nhún theo lò xo và co giãn khi tiếp đất. */
export class FramePlayer {
  rotation = 0
  offsetY = 0
  private name: AnimationName = 'idle'
  private startedAt = 0
  private once = false
  private flipped = false
  private sx = 1
  private sy = 1
  private vx = 0
  private vy = 0

  constructor(
    private readonly ctx: Canvas2dLike,
    private readonly images: ReadonlyMap<FrameName, CanvasImageSource>,
    private readonly size: number,
    private readonly base: number,
    private readonly dpr: number
  ) {}

  get current(): AnimationName {
    return this.name
  }

  get flip(): boolean {
    return this.flipped
  }

  play(
    name: AnimationName,
    { once = false, flip = this.flipped }: PlayOptions = {}
  ): void {
    this.name = name
    this.once = once
    this.flipped = flip
    this.startedAt = performance.now()
  }

  duration(name: AnimationName): number {
    const { frames, fps } = ANIMATIONS[name]
    return (frames.length / fps) * 1000
  }

  /** Co giãn tức thời rồi tự về 1 (ví dụ ép dẹp khi tiếp đất). */
  punch(sx: number, sy: number): void {
    this.sx = sx
    this.sy = sy
    this.vx = 0
    this.vy = 0
  }

  render(now: number): void {
    const { frames, fps } = ANIMATIONS[this.name]
    const raw = Math.floor(((now - this.startedAt) / 1000) * fps)
    const index = this.once
      ? Math.min(frames.length - 1, Math.max(0, raw))
      : Math.max(0, raw) % frames.length
    const frame = frames[index]
    const image = this.images.get(frame)
    const { ctx, size } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    if (!image) return

    this.vx = (this.vx + (1 - this.sx) * 0.35) * 0.72
    this.sx += this.vx
    this.vy = (this.vy + (1 - this.sy) * 0.35) * 0.72
    this.sy += this.vy

    const meta = FRAME_META[frame]
    const k = FRAME_SCALE * meta.s
    const bar = 'bar' in meta ? meta.bar : undefined
    const mid = bar ? 0 : (meta.h * k) / 2
    ctx.translate(size / 2, this.base + this.offsetY - mid)
    ctx.rotate(this.rotation)
    ctx.translate(0, mid)
    ctx.scale((this.flipped ? -1 : 1) * this.sx, this.sy)
    if (bar)
      ctx.drawImage(image, -bar[0] * k, -bar[1] * k, meta.w * k, meta.h * k)
    else ctx.drawImage(image, -meta.ax * k, -meta.h * k, meta.w * k, meta.h * k)
  }
}
