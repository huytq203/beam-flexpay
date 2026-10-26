export interface Platform {
  /** Toạ độ y của mép nền, tính theo lớp phủ. */
  readonly y: number
  /** Khoảng tâm ngang Capy được phép đứng. */
  readonly lo: number
  readonly hi: number
  /** Nền chỉ với tới khi x nằm trong khoảng này (ví dụ mép trên một ô nhập). */
  readonly only?: readonly [number, number]
}

const REACH = 10

/**
 * Chỉ số nền gần nhất ở bên dưới chân tại `x`. Không còn nền nào bên dưới thì lấy nền
 * cuối cùng (đáy viewport), nên Capy luôn có chỗ đứng.
 */
export function pickPlatformBelow(
  platforms: readonly Platform[],
  feetY: number,
  x: number
): number {
  let best = -1
  platforms.forEach((platform, index) => {
    if (platform.y < feetY - REACH) return
    if (
      platform.only &&
      (x < platform.only[0] - REACH || x > platform.only[1] + REACH)
    )
      return
    if (best === -1 || platform.y < platforms[best].y) best = index
  })
  return best === -1 ? platforms.length - 1 : best
}
