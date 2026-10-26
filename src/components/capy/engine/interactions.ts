import { deepSleep, hopTo, playOnce, safeX, standY, walkTo } from './actions'
import { pickPlatformBelow } from './platforms'
import type { Runtime } from './runtime'

const BIG_FALL = 90

/** Vẫy tay, hiện lời chào trong `ms` mili giây rồi về đứng yên. */
export async function wave(
  rt: Runtime,
  epoch: number,
  text: string,
  ms = 2700
): Promise<void> {
  rt.player.play('wave')
  rt.say(text, ms)
  await rt.wait(ms + 100, epoch)
  rt.player.play('idle')
}

/** Vẫy tay chào tạm biệt khi người dùng tắt Capy. */
export async function bye(rt: Runtime, epoch: number): Promise<void> {
  rt.player.play('bye', { flip: false })
  await rt.wait(rt.player.duration('bye') + 200, epoch)
}

export type PerformKind = 'greet' | 'sleep' | 'bye'

/** Việc do người dùng chọn: từ menu của Capy hoặc khi tắt. */
export function perform(
  rt: Runtime,
  epoch: number,
  kind: PerformKind,
  greeting: string
): Promise<void> {
  if (kind === 'sleep') return deepSleep(rt, epoch)
  if (kind === 'bye') return bye(rt, epoch)
  return wave(rt, epoch, greeting)
}

/** Rơi xuống nền gần nhất bên dưới; cao hơn 90px thì lộn nhào, choáng rồi đứng dậy. */
export async function fall(rt: Runtime, epoch: number): Promise<void> {
  const world = rt.world()
  const [fromX, fromY] = [rt.x, rt.y]
  const index = pickPlatformBelow(world.platforms, fromY + rt.feet, fromX)
  const platform = world.platforms[index]
  const toX = safeX(rt, index, fromX)
  const toY = standY(rt, platform.y)
  const distance = toY - fromY
  const big = distance > BIG_FALL
  if (distance >= 0) {
    rt.player.play('air', { flip: false })
    const spin = big ? (toX >= fromX ? 1 : -1) * Math.PI * 2 : 0
    await rt.tween(Math.sqrt((2 * distance) / 2600) * 1000 + 90, epoch, (k) => {
      rt.put(fromX + (toX - fromX) * k, fromY + distance * k * k)
      rt.player.rotation = spin * k
    })
    rt.player.rotation = 0
  } else {
    await hopTo(rt, epoch, toX, toY, 30)
  }
  rt.platform = index
  if (big) {
    rt.player.punch(1.25, 0.72)
    rt.player.play('dizzy', { flip: false })
    await rt.wait(1500, epoch)
    await playOnce(rt, 'standUp', epoch)
  } else {
    rt.player.punch(1.15, 0.85)
  }
  rt.player.play('idle', { flip: false })
  await rt.wait(700, epoch)
}

/** Có hộp thoại mở: xuống đáy màn hình, về góc trái và ngồi chờ. */
export async function shelter(rt: Runtime, epoch: number): Promise<void> {
  const world = rt.world()
  const last = world.platforms.length - 1
  if (rt.platform !== last) {
    const toY = standY(rt, world.platforms[last].y)
    await hopTo(rt, epoch, rt.x, toY, 20)
    rt.platform = last
  }
  await walkTo(rt, epoch, world.platforms[last].lo, { look: false, run: true })
  rt.player.play('sit')
}
