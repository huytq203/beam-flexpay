import { Cancelled } from './runtime'

/** Hẹn giờ và tween có huỷ theo "epoch": đổi epoch thì mọi việc đang chờ bị huỷ ở nhịp kế tiếp. */
export class Clock {
  private readonly timers = new Set<number>()

  constructor(private readonly currentEpoch: () => number) {}

  wait(ms: number, epoch: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = window.setTimeout(() => {
        this.timers.delete(id)
        if (epoch === this.currentEpoch()) resolve()
        else reject(new Cancelled())
      }, ms)
      this.timers.add(id)
    })
  }

  tween(ms: number, epoch: number, step: (k: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = performance.now()
      const frame = (now: number): void => {
        if (epoch !== this.currentEpoch()) return reject(new Cancelled())
        const k = ms > 0 ? Math.min(1, (now - start) / ms) : 1
        step(k)
        if (k < 1) requestAnimationFrame(frame)
        else resolve()
      }
      requestAnimationFrame(frame)
    })
  }

  after(ms: number, run: () => void): void {
    const id = window.setTimeout(() => {
      this.timers.delete(id)
      run()
    }, ms)
    this.timers.add(id)
  }

  clear(): void {
    this.timers.forEach((id) => window.clearTimeout(id))
    this.timers.clear()
  }
}
