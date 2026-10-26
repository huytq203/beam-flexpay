import type { AnimationName } from '../frames/animations'
import { clamp, pick, rand, type Runtime } from './runtime'
import { DEEP_SLEEP_MS, IDLE_ONLY_ACTIONS, type ActionName } from './tuning'
import { limitTravel, pushOutOfZones } from './zones'

const BODY_HEIGHT = 80
const BIG_FALL = 90

export async function playOnce(
  rt: Runtime,
  name: AnimationName,
  epoch: number,
  flip?: boolean
): Promise<void> {
  rt.player.play(name, { once: true, flip })
  await rt.wait(rt.player.duration(name), epoch)
}

export const standY = (rt: Runtime, y: number): number => y - rt.feet

function bandZones(rt: Runtime, index: number) {
  const world = rt.world()
  const platform = world.platforms[Math.min(index, world.platforms.length - 1)]
  const zones = world.zones.filter(
    (z) => z.top < platform.y && z.bottom > platform.y - BODY_HEIGHT
  )
  return { platform, zones }
}

/** Toạ độ ngang trên nền `index`, đã đẩy ra khỏi vùng cấm và kẹp trong khoảng nền. */
export function safeX(rt: Runtime, index: number, x: number): number {
  const { platform, zones } = bandZones(rt, index)
  const bounds = [platform.lo, platform.hi] as const
  const pushed = pushOutOfZones(
    clamp(x, bounds[0], bounds[1]),
    rt.bodyWidth,
    zones,
    6,
    bounds
  )
  return clamp(pushed, bounds[0], bounds[1])
}

/** Điểm đến đi được trên nền hiện tại: an toàn và không băng qua vùng cấm giữa đường. */
function reachableX(rt: Runtime, x: number): number {
  const { zones } = bandZones(rt, rt.platform)
  return limitTravel(rt.x, safeX(rt, rt.platform, x), rt.bodyWidth, zones)
}

async function stowPhone(rt: Runtime, epoch: number): Promise<void> {
  if (!rt.phoneOut) return
  await playOnce(rt, 'phoneIn', epoch, false)
  rt.phoneOut = false
}

/** Đi hoặc chạy: cất điện thoại, quay ngang, bước, quay lại; thỉnh thoảng rút điện thoại ra xem. */
export async function walkTo(
  rt: Runtime,
  epoch: number,
  x: number,
  options: { run?: boolean; look?: boolean } = {}
): Promise<void> {
  const target = reachableX(rt, x)
  const dx = target - rt.x
  if (Math.abs(dx) < 3) return
  const flip = dx < 0
  const { walkSpeed, runSpeed, runFrom, lookChance } = rt.tuning
  const fast = options.run ?? Math.abs(dx) > runFrom
  await stowPhone(rt, epoch)
  await playOnce(rt, 'turnIn', epoch, flip)
  rt.player.play(fast ? 'run' : 'walk', { flip })
  const from = rt.x
  await rt.tween(
    (Math.abs(dx) / (fast ? runSpeed : walkSpeed)) * 1000,
    epoch,
    (k) => rt.put(from + dx * k, rt.y)
  )
  await playOnce(rt, 'turnOut', epoch, flip)
  rt.player.play('idle', { flip: false })
  if (options.look !== false && Math.random() < lookChance) {
    await playOnce(rt, 'phoneOut', epoch, false)
    rt.phoneOut = true
    rt.player.play('phoneLook', { flip: false })
    await rt.wait(rand(1800, 3200), epoch)
  }
}

export async function hopTo(
  rt: Runtime,
  epoch: number,
  x: number,
  y: number,
  peak: number
): Promise<void> {
  await stowPhone(rt, epoch)
  rt.player.play('takeoff', { flip: x < rt.x })
  await rt.wait(140, epoch)
  rt.player.punch(0.9, 1.12)
  const [fromX, fromY] = [rt.x, rt.y]
  rt.player.play('air')
  await rt.tween(
    (320 + Math.abs(y - fromY) * 1.2 + Math.abs(x - fromX) * 0.8) *
      rt.tuning.hopScale,
    epoch,
    (k) =>
      rt.put(
        fromX + (x - fromX) * k,
        fromY + (y - fromY) * k - 4 * peak * k * (1 - k)
      )
  )
  rt.player.punch(1.18, 0.82)
  rt.player.play('idle', { flip: false })
}

/** Nhảy từng bậc sang nền `target`, rồi đi tới `x`. */
export async function goTo(
  rt: Runtime,
  epoch: number,
  target: number,
  x: number
): Promise<void> {
  for (let guard = 0; guard < 20 && rt.platform !== target; guard += 1) {
    const world = rt.world()
    const last = world.platforms.length - 1
    const next = clamp(rt.platform + (target > rt.platform ? 1 : -1), 0, last)
    const platform = world.platforms[next]
    const reach = platform.only
      ? clamp(rt.x, platform.lo, platform.hi)
      : rt.x + rand(-60, 60)
    await hopTo(
      rt,
      epoch,
      safeX(rt, next, reach),
      standY(rt, platform.y),
      Math.max(28, Math.abs(standY(rt, platform.y) - rt.y) * 0.6 + 16)
    )
    rt.platform = next
    await rt.wait(280, epoch)
  }
  await walkTo(rt, epoch, x, { look: false })
}

export async function roam(rt: Runtime, epoch: number): Promise<void> {
  const world = rt.world()
  const index = Math.floor(rand(0, world.platforms.length))
  const platform = world.platforms[index]
  await goTo(rt, epoch, index, rand(platform.lo, platform.hi))
}

export async function run(rt: Runtime, epoch: number): Promise<void> {
  const platform = rt.world().platforms[rt.platform]
  await walkTo(
    rt,
    epoch,
    rt.x < (platform.lo + platform.hi) / 2 ? platform.hi : platform.lo,
    { run: true }
  )
}

export async function climb(rt: Runtime, epoch: number): Promise<void> {
  const world = rt.world()
  const far = world.platforms
    .map((_, i) => i)
    .filter((i) => Math.abs(i - rt.platform) >= 3)
  if (far.length === 0) return
  const index = pick(far)
  const platform = world.platforms[index]
  await goTo(rt, epoch, index, rand(platform.lo, platform.hi))
}

export async function rest(
  rt: Runtime,
  epoch: number,
  say?: string
): Promise<void> {
  rt.player.punch(1.08, 0.9)
  rt.player.play('sit')
  if (say) rt.say(say, 1800)
  await rt.wait(3600, epoch)
  await playOnce(rt, 'standUp', epoch)
  rt.player.play('idle')
}

/** Gật gù rồi ngủ `dozeMs` mili giây, sau đó đứng dậy. */
export async function sleepFor(
  rt: Runtime,
  epoch: number,
  dozeMs: number
): Promise<void> {
  rt.player.play('nod')
  await rt.wait(3200, epoch)
  rt.player.play('doze')
  await rt.wait(dozeMs, epoch)
  await playOnce(rt, 'standUp', epoch)
  rt.player.punch(1.05, 0.95)
  rt.player.play('idle')
}

/** Giấc ngủ dài 1 đến 2 phút: khi không ai động vào lâu, hoặc người dùng bảo ngủ. */
export function deepSleep(rt: Runtime, epoch: number): Promise<void> {
  return sleepFor(rt, epoch, rand(DEEP_SLEEP_MS[0], DEEP_SLEEP_MS[1]))
}

export async function selfie(rt: Runtime, epoch: number): Promise<void> {
  await playOnce(rt, 'selfie', epoch)
  rt.player.play('idle')
}

const TABLE: Readonly<
  Record<ActionName, (rt: Runtime, epoch: number) => Promise<void>>
> = {
  roam,
  run,
  climb,
  rest: (rt, epoch) => rest(rt, epoch),
  selfie
}

/** Chọn và chạy một hành động ngẫu nhiên; `idleOnly` chỉ chọn trong nhóm không di chuyển. */
export function randomAction(
  rt: Runtime,
  epoch: number,
  idleOnly: boolean
): Promise<void> {
  const name = pick(idleOnly ? IDLE_ONLY_ACTIONS : rt.tuning.weighted)
  return TABLE[name](rt, epoch)
}
