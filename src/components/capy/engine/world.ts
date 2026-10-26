import type { Platform } from './platforms'
import { findSensitiveElements } from './sensitive'
import { SAFETY, STAGE } from './tuning'
import { FORBIDDEN_SELECTOR, type Box } from './zones'

/** Các phần tử có mép trên Capy đứng được. Có thể chỉ định thêm bằng `data-capy="platform"`. */
export const PLATFORM_SELECTOR = [
  '[data-capy="platform"]',
  '.ant-card',
  '.ant-table-row',
  '.ant-btn',
  '.ant-input',
  '.ant-select',
  'input'
].join(',')

export interface World {
  /** Sắp theo y tăng dần; phần tử cuối là đáy viewport nên luôn có chỗ đứng. */
  readonly platforms: readonly Platform[]
  readonly zones: readonly Box[]
  readonly width: number
  readonly height: number
}

const HEADER_CLEARANCE = 56
const MAX_PLATFORMS = 80

const toBox = (rect: DOMRect): Box => ({
  left: rect.left,
  right: rect.right,
  top: rect.top,
  bottom: rect.bottom
})

function measureZones(doc: Document, height: number): Box[] {
  return [
    ...Array.from(doc.querySelectorAll(FORBIDDEN_SELECTOR)),
    ...findSensitiveElements(doc)
  ]
    .map((el) => toBox(el.getBoundingClientRect()))
    .filter(
      (box) =>
        box.right > box.left &&
        box.bottom > box.top &&
        box.bottom > 0 &&
        box.top < height
    )
}

/** Đo nền đứng được và vùng cấm đang nằm trong khung nhìn. `bodyWidth` là bề rộng hộp Capy. */
export function measureWorld(
  bodyWidth: number,
  doc: Document = document
): World {
  const width = window.innerWidth
  const height = window.innerHeight
  const half = bodyWidth / 2

  const zones = SAFETY.forbiddenZones ? measureZones(doc, height) : []

  const seen = new Set<string>()
  const found: Platform[] = []
  const candidates = STAGE.pagePlatforms
    ? Array.from(doc.querySelectorAll(PLATFORM_SELECTOR))
    : []
  for (const el of candidates) {
    if (found.length >= MAX_PLATFORMS) break
    const rect = el.getBoundingClientRect()
    if (
      rect.width < bodyWidth + 8 ||
      rect.top < HEADER_CLEARANCE ||
      rect.top > height - 30
    )
      continue
    const key = `${Math.round(rect.top)}:${Math.round(rect.left)}`
    if (seen.has(key)) continue
    seen.add(key)
    found.push({ y: rect.top, lo: rect.left + half, hi: rect.right - half })
  }
  found.sort((a, b) => a.y - b.y)
  found.push({
    y: height - 8,
    lo: half + 4,
    hi: Math.max(half + 4, width - half - 4)
  })
  return { platforms: found, zones, width, height }
}

/** Nền nằm sát chân (lệch tối đa 40px, chứa `x`) để Capy dính theo khi trang cuộn; -1 nếu không có. */
export function findSnapPlatform(
  world: World,
  x: number,
  feetY: number
): number {
  return world.platforms.findIndex(
    (p) => Math.abs(p.y - feetY) <= 40 && x >= p.lo - 4 && x <= p.hi + 4
  )
}
