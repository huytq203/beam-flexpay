import * as THREE from 'three'
import { boundsOf, type NetworkGeometry } from './network-geometry'
import { LIFT } from './scene-types'

/**
 * Khung hình được giải từ khung bao thật của mạng lưới chứ không đặt tay: số
 * tuyến và số ga đổi theo quyền của từng tài khoản, nên một khoảng cách camera
 * cố định sẽ vừa với tài khoản này và hụt với tài khoản khác.
 */

/**
 * Nhãn ga treo bên phải mỗi ga và không nằm trong khung bao hình học, nên căn
 * camera vào đúng tâm khung bao sẽ đẩy toàn bộ khối chữ lệch sang phải. Dịch
 * điểm nhìn sang phải một quãng để phần nhãn được chia chỗ như phần hình.
 */
const LABEL_BIAS = 1.15
const VIEW_DIRECTION = new THREE.Vector3(-0.34, 0.78, 0.66).normalize()

export interface CameraRig {
  camera: THREE.PerspectiveCamera
  focus: THREE.Vector3
  span: number
  /** Hệ số kéo camera, để chuỗi mở màn đi qua đúng thứ vòng render có đọc. */
  dolly: { value: number }
  parallax: { x: number; y: number }
  parallaxTarget: { x: number; y: number }
  fit: (aspect: number) => void
  apply: () => void
}

export const createCameraRig = (
  network: NetworkGeometry,
  lineCount: number
): CameraRig => {
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400)
  const box = boundsOf(network, 0.5)
  const focus = new THREE.Vector3(
    box.minX + box.width / 2 + LABEL_BIAS,
    0,
    box.minZ + box.height / 2
  )
  const modelRadius = Math.hypot(box.width, box.height) / 2
  const restingCamera = new THREE.Vector3()

  /*
   * `LIFT` chỉ xuất hiện thoáng qua trên tuyến đang được chọn, nên tính trọn nó
   * vào khung hình là trả chỗ trống thường trực cho một trạng thái nhất thời.
   * Chừa một nửa là đủ để tuyến nâng lên không bị cắt đầu.
   */
  const topY = 0.3 + lineCount * 0.13 + LIFT * 0.5
  const corners: THREE.Vector3[] = []
  for (const x of [box.minX, box.minX + box.width]) {
    for (const z of [box.minZ, box.minZ + box.height]) {
      for (const y of [0, topY]) corners.push(new THREE.Vector3(x, y, z))
    }
  }

  const axisRight = new THREE.Vector3()
    .crossVectors(VIEW_DIRECTION, new THREE.Vector3(0, 1, 0))
    .normalize()
  const axisUp = new THREE.Vector3()
    .crossVectors(axisRight, VIEW_DIRECTION)
    .normalize()
  const offset = new THREE.Vector3()
  const parallaxOffset = new THREE.Vector3()

  const dolly = { value: 1 }
  const parallax = { x: 0, y: 0 }
  const parallaxTarget = { x: 0, y: 0 }

  /*
   * Khoảng cách camera giải trực tiếp từ tám đỉnh khung bao: với mỗi đỉnh,
   * khoảng cách tối thiểu để nó còn nằm trong nón nhìn là |lệch ngang| / tan +
   * độ sâu theo trục nhìn. Lấy max của tám đỉnh là khung vừa khít, không thừa
   * khoảng trống như cách ước lượng bằng bán kính bao.
   */
  const fit = (aspect: number): void => {
    const tanVertical = Math.tan((camera.fov * Math.PI) / 360)
    const tanHorizontal = tanVertical * aspect
    let distance = 0

    corners.forEach((corner) => {
      offset.copy(corner).sub(focus)
      const depth = offset.dot(VIEW_DIRECTION)
      distance = Math.max(
        distance,
        Math.abs(offset.dot(axisRight)) / tanHorizontal + depth,
        Math.abs(offset.dot(axisUp)) / tanVertical + depth
      )
    })

    restingCamera
      .copy(VIEW_DIRECTION)
      .multiplyScalar(distance)
      .add(focus)
  }

  const apply = (): void => {
    camera.position
      .copy(restingCamera)
      .sub(focus)
      .multiplyScalar(dolly.value)
      .add(focus)
      .add(parallaxOffset.set(parallax.x, parallax.y, 0))
    camera.lookAt(focus)
  }

  fit(1)
  apply()

  return {
    camera,
    focus,
    span: modelRadius + 2,
    dolly,
    parallax,
    parallaxTarget,
    fit,
    apply
  }
}
