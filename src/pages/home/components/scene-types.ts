import type * as THREE from 'three'
import type { LineGeometry, NetworkGeometry, Point2 } from './network-geometry'

/** Một ga trên mô hình 3D, đã quy về dữ liệu thuần cho tầng three.js. */
export interface SceneStation {
  id: string
  label: string
  to: string
}

export interface SceneLine {
  id: string
  color: string
  geometry: LineGeometry
  stations: SceneStation[]
}

export interface NetworkSceneOptions {
  canvas: HTMLCanvasElement
  container: HTMLElement
  /** Lớp DOM phủ trên canvas, nơi mô hình treo nhãn ga. */
  labelLayer: HTMLElement
  lines: readonly SceneLine[]
  network: NetworkGeometry
  hubLabel: string
  hubColor: string
  plateColor: string
  dimColor: string
  reduceMotion: boolean
  onStationActivate: (to: string) => void
  onLineFocus: (lineId: string | null) => void
}

export interface NetworkScene {
  setActiveLine: (lineId: string | null) => void
  dispose: () => void
}

export const RIBBON_WIDTH = 0.34
export const RIBBON_HEIGHT = 0.16
export const STATION_RADIUS = 0.3
export const HUB_RADIUS = 0.62
/** Độ nâng của tuyến đang được chọn. */
export const LIFT = 0.5

export interface LineRuntime {
  id: string
  group: THREE.Group
  material: THREE.MeshStandardMaterial
  baseColor: THREE.Color
  elevation: number
  pulse: THREE.Mesh
  path: Point2[]
}

export interface StationLabel {
  /** Chuỗi rỗng nghĩa là nhãn của ga trung chuyển: không thuộc tuyến nào. */
  lineId: string
  element: HTMLElement
  anchor: THREE.Object3D
}
