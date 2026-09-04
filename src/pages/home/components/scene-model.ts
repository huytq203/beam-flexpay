import * as THREE from 'three'
import type { Point2 } from './network-geometry'
import {
  HUB_RADIUS,
  RIBBON_HEIGHT,
  RIBBON_WIDTH,
  STATION_RADIUS,
  type LineRuntime,
  type SceneLine,
  type StationLabel
} from './scene-types'

/**
 * Dựng phần vật chất của mô hình: đèn, mặt nền nhận bóng, các dải tuyến, đĩa ga
 * và ga trung chuyển. Tách khỏi `network-scene.ts` để file điều phối chỉ còn lo
 * vòng render, chuột và vòng đời.
 */

/** Điểm nằm ở tỉ lệ `t` dọc theo một đường gấp khúc, dùng cho xung chạy tuyến. */
export const pointAt = (path: readonly Point2[], t: number): Point2 => {
  const spans = path.length - 1
  const scaled = Math.min(Math.max(t, 0), 1) * spans
  const index = Math.min(Math.floor(scaled), spans - 1)
  const local = scaled - index
  const from = path[index]
  const to = path[index + 1]
  return {
    x: from.x + (to.x - from.x) * local,
    z: from.z + (to.z - from.z) * local
  }
}

const buildRibbon = (
  path: readonly Point2[],
  material: THREE.Material
): THREE.Mesh[] => {
  const meshes: THREE.Mesh[] = []

  for (let i = 0; i < path.length - 1; i += 1) {
    const from = path[i]
    const to = path[i + 1]
    const length = Math.hypot(to.x - from.x, to.z - from.z)
    if (length < 1e-4) continue

    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(length, RIBBON_HEIGHT, RIBBON_WIDTH),
      material
    )
    segment.position.set((from.x + to.x) / 2, 0, (from.z + to.z) / 2)
    segment.rotation.y = -Math.atan2(to.z - from.z, to.x - from.x)
    segment.castShadow = true
    segment.receiveShadow = true
    meshes.push(segment)

    // Khớp nối bo tròn ở mỗi điểm bẻ, để góc 45° không bị hở như hai thanh kê.
    const joint = new THREE.Mesh(
      new THREE.CylinderGeometry(
        RIBBON_WIDTH / 2,
        RIBBON_WIDTH / 2,
        RIBBON_HEIGHT,
        18
      ),
      material
    )
    joint.position.set(to.x, 0, to.z)
    joint.castShadow = true
    meshes.push(joint)
  }

  return meshes
}

export interface StageOptions {
  scene: THREE.Scene
  focus: THREE.Vector3
  span: number
}

/** Đèn chính đổ bóng thật và mặt nền chỉ nhận bóng, để nền CSS lộ qua. */
export const buildStage = ({ scene, focus, span }: StageOptions): void => {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc7ced8, 2.1))

  /*
   * Đèn gần như thẳng đỉnh: bóng phải đọc thành điểm tiếp xúc dưới dải tuyến,
   * không thành một dải xám chạy song song. Xám đã mang nghĩa "tuyến đang câm"
   * nên một vệt xám thứ hai cạnh mỗi tuyến sẽ tranh mất từ vựng đó.
   */
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(focus.x - span * 0.35, span * 3.4, focus.z + span * 0.3)
  key.target.position.copy(focus)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 1
  key.shadow.camera.far = span * 6
  Object.assign(key.shadow.camera, {
    left: -span,
    right: span,
    top: span,
    bottom: -span
  })
  key.shadow.camera.updateProjectionMatrix()
  key.shadow.bias = -0.0012
  key.shadow.radius = 3
  scene.add(key)
  scene.add(key.target)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(span * 6, span * 6),
    new THREE.ShadowMaterial({ opacity: 0.1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(focus.x, -0.02, focus.z)
  ground.receiveShadow = true
  scene.add(ground)
}

export interface ModelOptions {
  scene: THREE.Scene
  labelLayer: HTMLElement
  lines: readonly SceneLine[]
  hubLabel: string
  hubColor: string
  plateColor: string
}

export interface NetworkModelParts {
  runtimes: LineRuntime[]
  stationMeshes: THREE.Mesh[]
  labels: StationLabel[]
  hub: THREE.Mesh
  hubRing: THREE.Mesh
}

export const buildNetworkModel = ({
  scene,
  labelLayer,
  lines,
  hubLabel,
  hubColor,
  plateColor
}: ModelOptions): NetworkModelParts => {
  const plate = new THREE.MeshStandardMaterial({
    color: new THREE.Color(plateColor),
    roughness: 0.42,
    metalness: 0
  })
  const stationGeometry = new THREE.CylinderGeometry(
    STATION_RADIUS,
    STATION_RADIUS,
    0.14,
    28
  )
  const ringGeometry = new THREE.TorusGeometry(STATION_RADIUS, 0.075, 12, 30)

  const stationMeshes: THREE.Mesh[] = []
  const runtimes: LineRuntime[] = []
  const labels: StationLabel[] = []

  lines.forEach((line) => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(line.color),
      roughness: 0.34,
      metalness: 0.02
    })
    const group = new THREE.Group()
    group.position.y = line.geometry.elevation

    buildRibbon(line.geometry.polyline, material).forEach((mesh) =>
      group.add(mesh)
    )

    line.geometry.stations.forEach((point, index) => {
      const station = line.stations[index]
      if (!station) return

      const disc = new THREE.Mesh(stationGeometry, plate)
      disc.position.set(point.x, RIBBON_HEIGHT / 2 + 0.07, point.z)
      disc.castShadow = true
      disc.userData = { to: station.to, lineId: line.id }
      group.add(disc)
      stationMeshes.push(disc)

      const ring = new THREE.Mesh(ringGeometry, material)
      ring.rotation.x = Math.PI / 2
      ring.position.copy(disc.position)
      group.add(ring)

      const label = document.createElement('span')
      label.className = 'network-label'
      label.textContent = station.label
      label.style.setProperty('--line', line.color)
      labelLayer.appendChild(label)
      labels.push({ lineId: line.id, element: label, anchor: disc })
    })

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(line.color) })
    )
    pulse.visible = false
    group.add(pulse)

    scene.add(group)
    runtimes.push({
      id: line.id,
      group,
      material,
      baseColor: material.color.clone(),
      elevation: line.geometry.elevation,
      pulse,
      path: line.geometry.polyline
    })
  })

  // Đĩa ga trung chuyển luôn nằm trên mọi tuyến, kể cả tuyến ở cao độ cao nhất.
  const hubElevation =
    runtimes.reduce(
      (highest, runtime) => Math.max(highest, runtime.elevation),
      0
    ) + 0.24

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(HUB_RADIUS, HUB_RADIUS, 0.3, 40),
    plate
  )
  hub.position.y = hubElevation
  hub.castShadow = true
  scene.add(hub)

  const hubPlate = document.createElement('span')
  hubPlate.className = 'network-label network-label--hub'
  hubPlate.textContent = hubLabel
  hubPlate.style.setProperty('--line', hubColor)
  labelLayer.appendChild(hubPlate)
  labels.push({ lineId: '', element: hubPlate, anchor: hub })

  const hubRing = new THREE.Mesh(
    new THREE.TorusGeometry(HUB_RADIUS, 0.11, 14, 44),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(hubColor),
      roughness: 0.3,
      metalness: 0.05
    })
  )
  hubRing.rotation.x = Math.PI / 2
  hubRing.position.y = hubElevation + 0.15
  scene.add(hubRing)

  return { runtimes, stationMeshes, labels, hub, hubRing }
}
