/**
 * Hình học bản đồ tuyến — thuần toán, không phụ thuộc three.js hay React.
 * Cùng một kết quả nuôi hai bản dựng: mô hình WebGL và bản đồ SVG dự phòng,
 * nên hai bản luôn kể đúng một câu chuyện.
 *
 * Ngữ pháp: mọi đoạn chỉ chạy theo bội số 45°, đúng luật sơ đồ tàu điện của
 * Beck. Các tuyến toả ra từ một ga trung chuyển bên trái rồi bẻ một lần về
 * phía trục giữa, nên chúng cắt nhau — và vì mỗi tuyến nằm ở một cao độ riêng,
 * chỗ cắt là giao cắt khác mức thật chứ không phải hai nét đè lên nhau.
 */

export interface Point2 {
  x: number
  z: number
}

export interface LineGeometry {
  id: string
  elevation: number
  /** Đường gấp khúc của tuyến: ga trung chuyển → điểm bẻ → điểm cuối. */
  polyline: Point2[]
  /** Toạ độ từng ga, theo đúng thứ tự trong menu. */
  stations: Point2[]
}

export interface NetworkGeometry {
  hub: Point2
  lines: LineGeometry[]
  radius: number
}

/** Nan quạt 45° cho tối đa năm tuyến, chọn đối xứng khi có ít tuyến hơn. */
const FAN_SLOTS = [-90, -45, 0, 45, 90]
const FAN_BY_COUNT: Record<number, number[]> = {
  1: [0],
  2: [-45, 45],
  3: [-90, 0, 90],
  4: [-90, -45, 45, 90],
  5: FAN_SLOTS
}

const STATION_GAP = 2.15
const TRUNK_STATIONS = 2
/**
 * Tuyến xuất phát từ mép đĩa ga trung chuyển chứ không từ tâm — nếu vẽ từ tâm,
 * các dải nằm ở cao độ trên sẽ phủ kín chính cái ga đang nói "bạn ở đây".
 */
const HUB_CLEARANCE = 0.92
const BASE_ELEVATION = 0.06
const ELEVATION_STEP = 0.13

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

const step = (from: Point2, degrees: number, distance: number): Point2 => ({
  x: from.x + Math.cos(toRadians(degrees)) * distance,
  z: from.z + Math.sin(toRadians(degrees)) * distance
})

/** Tuyến luôn bẻ về phía trục giữa để các tuyến cắt nhau thay vì chạy song song. */
const doglegOf = (trunkAngle: number): number =>
  trunkAngle === 0 ? 45 : trunkAngle - Math.sign(trunkAngle) * 45

const fanAngles = (count: number): number[] =>
  FAN_BY_COUNT[count] ??
  Array.from({ length: count }, (_, index) =>
    FAN_SLOTS[index % FAN_SLOTS.length]
  )

const buildLine = (
  id: string,
  index: number,
  stationCount: number,
  trunkAngle: number
): LineGeometry => {
  const hub: Point2 = { x: 0, z: 0 }
  const dogleg = doglegOf(trunkAngle)
  const trunkCount = Math.min(TRUNK_STATIONS, stationCount)

  const start = step(hub, trunkAngle, HUB_CLEARANCE)
  const stations: Point2[] = []
  let cursor = hub

  for (let i = 0; i < trunkCount; i += 1) {
    cursor = step(cursor, trunkAngle, STATION_GAP)
    stations.push(cursor)
  }

  const corner = cursor

  for (let i = trunkCount; i < stationCount; i += 1) {
    cursor = step(cursor, dogleg, STATION_GAP)
    stations.push(cursor)
  }

  const polyline =
    stationCount > trunkCount ? [start, corner, cursor] : [start, cursor]

  return {
    id,
    elevation: BASE_ELEVATION + index * ELEVATION_STEP,
    polyline,
    stations
  }
}

export interface LineInput {
  id: string
  stationCount: number
}

export const buildNetworkGeometry = (
  lines: readonly LineInput[]
): NetworkGeometry => {
  const angles = fanAngles(lines.length)
  const built = lines.map((line, index) =>
    buildLine(line.id, index, Math.max(line.stationCount, 1), angles[index])
  )

  const radius = built.reduce((furthest, line) => {
    const lineMax = line.stations.reduce(
      (best, point) => Math.max(best, Math.hypot(point.x, point.z)),
      0
    )
    return Math.max(furthest, lineMax)
  }, STATION_GAP)

  return { hub: { x: 0, z: 0 }, lines: built, radius }
}

/** Khung bao của toàn mạng lưới, dùng để căn khung cho bản đồ SVG. */
export const boundsOf = (
  geometry: NetworkGeometry,
  padding: number
): { minX: number; minZ: number; width: number; height: number } => {
  const points = [
    geometry.hub,
    ...geometry.lines.flatMap((line) => [...line.polyline, ...line.stations])
  ]
  const xs = points.map((point) => point.x)
  const zs = points.map((point) => point.z)
  const minX = Math.min(...xs) - padding
  const minZ = Math.min(...zs) - padding

  return {
    minX,
    minZ,
    width: Math.max(...xs) + padding - minX,
    height: Math.max(...zs) + padding - minZ
  }
}
