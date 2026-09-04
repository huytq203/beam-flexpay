import * as THREE from 'three'
import type { StationLabel } from './scene-types'

/**
 * Nhãn ga được chiếu từ toạ độ 3D xuống lớp DOM phủ trên canvas sau mỗi lần
 * render, và đẩy ra theo hướng xuyên tâm tính từ ga trung chuyển: tuyến chạy
 * lên thì nhãn nằm trên, chạy xuống thì nhãn nằm dưới, nhãn bên trái tâm thì
 * căn phải. Nhờ vậy nhãn toả theo đúng nan quạt của mạng lưới thay vì xếp
 * chồng thành một cột bên phải.
 */

const RADIAL_OFFSET = 26
const HUB_LABEL_DROP = 34

export const createLabelProjector = (
  container: HTMLElement,
  camera: THREE.Camera,
  hub: THREE.Object3D,
  labels: readonly StationLabel[]
): (() => void) => {
  const projected = new THREE.Vector3()

  return (): void => {
    const halfWidth = container.clientWidth / 2
    const halfHeight = container.clientHeight / 2

    hub.getWorldPosition(projected)
    projected.project(camera)
    const hubX = projected.x * halfWidth + halfWidth
    const hubY = -projected.y * halfHeight + halfHeight

    labels.forEach(({ element, anchor, lineId: owner }) => {
      if (owner === '') {
        element.style.transform = `translate3d(${hubX.toFixed(1)}px, ${(hubY + HUB_LABEL_DROP).toFixed(1)}px, 0)`
        element.style.translate = '-50% 0'
        return
      }

      anchor.getWorldPosition(projected)
      projected.project(camera)
      const x = projected.x * halfWidth + halfWidth
      const y = -projected.y * halfHeight + halfHeight

      const dx = x - hubX
      const dy = y - hubY
      const length = Math.hypot(dx, dy) || 1
      const ox = (dx / length) * RADIAL_OFFSET
      const oy = (dy / length) * RADIAL_OFFSET

      element.style.transform = `translate3d(${(x + ox).toFixed(1)}px, ${(y + oy).toFixed(1)}px, 0)`
      element.style.translate = dx < 0 ? '-100% -50%' : '0 -50%'
    })
  }
}

/** Nhãn ga trung chuyển (`lineId === ''`) không thuộc tuyến nào nên không câm. */
export const muteLabels = (
  labels: readonly StationLabel[],
  activeLineId: string | null
): void => {
  labels.forEach(({ element, lineId: owner }) => {
    element.dataset.muted = String(
      owner !== '' && activeLineId !== null && owner !== activeLineId
    )
  })
}
