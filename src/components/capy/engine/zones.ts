export interface Box {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

/** Vùng Capy không được vào hay đứng chồng lên: dữ liệu nhạy cảm, hộp thoại, ô đang gõ. */
export const FORBIDDEN_SELECTOR = [
  '[data-capy="no"]',
  '[role="dialog"]',
  '.ant-modal',
  'input:focus',
  'textarea:focus',
  'select:focus',
  '[contenteditable="true"]'
].join(',')

export function intersectsForbidden(
  box: Box,
  zones: readonly Box[],
  pad = 6
): boolean {
  return zones.some(
    (zone) =>
      box.left < zone.right + pad &&
      box.right > zone.left - pad &&
      box.top < zone.bottom + pad &&
      box.bottom > zone.top - pad
  )
}

/**
 * Đưa tâm ngang `x` của Capy (rộng `width`) ra khỏi các vùng cấm. Các vùng chạm nhau được gộp thành một
 * dải liền trước, rồi đi ra phía gần hơn nằm trong `bounds` (khoảng nền đứng được). Chỉ xét chiều ngang;
 * người gọi truyền vào các vùng nằm trong dải dọc đang đứng.
 */
export function pushOutOfZones(
  x: number,
  width: number,
  zones: readonly Box[],
  pad = 6,
  bounds?: readonly [number, number]
): number {
  const reach = pad + width / 2
  const spans = zones
    .map((zone): [number, number] => [zone.left - reach, zone.right + reach])
    .sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const span of spans) {
    const last = merged[merged.length - 1]
    if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1])
    else merged.push([span[0], span[1]])
  }
  const hit = merged.find(([lo, hi]) => x > lo && x < hi)
  if (!hit) return x
  const inside = (value: number): boolean =>
    !bounds || (value >= bounds[0] && value <= bounds[1])
  const exits = [hit[0], hit[1]].filter(inside)
  const options = exits.length > 0 ? exits : [hit[0], hit[1]]
  return options.reduce((best, value) =>
    Math.abs(value - x) < Math.abs(best - x) ? value : best
  )
}

/**
 * Giới hạn điểm đến `to` để đường đi từ `from` không đi vào vùng cấm nào: gặp vùng cấm trên đường
 * thì dừng sát trước nó. Capy đang đứng trong hoặc sát vùng cấm thì vẫn đi ra được.
 */
export function limitTravel(
  from: number,
  to: number,
  width: number,
  zones: readonly Box[],
  pad = 6
): number {
  const dir = Math.sign(to - from)
  if (dir === 0) return to
  let limit = to
  for (const zone of zones) {
    const edge =
      dir > 0 ? zone.left - pad - width / 2 : zone.right + pad + width / 2
    const ahead =
      dir > 0 ? edge >= from && edge < limit : edge <= from && edge > limit
    if (ahead) limit = edge
  }
  return limit
}

/** Thân Capy (tâm `x`, `y`; hộp 54x78px, bỏ lề trong suốt) có chồng lên vùng cấm nào không. */
export function overlapsBody(
  x: number,
  y: number,
  zones: readonly Box[]
): boolean {
  const body = { left: x - 19, right: x + 19, top: y - 21, bottom: y + 39 }
  return intersectsForbidden(body, zones, 0)
}
