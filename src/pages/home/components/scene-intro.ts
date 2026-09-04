import gsap from 'gsap'
import type * as THREE from 'three'
import { pointAt } from './scene-model'
import type { LineRuntime } from './scene-types'

interface IntroOptions {
  runtimes: readonly LineRuntime[]
  hub: THREE.Mesh
  hubRing: THREE.Mesh
  dolly: { value: number }
  invalidate: () => void
}

export interface SceneIntro {
  timeline: gsap.core.Timeline
  /** Huỷ chốt an toàn và đưa mô hình về trạng thái cuối. */
  dispose: () => void
}

/**
 * Chuỗi mở màn của mô hình: camera kéo vào, các tuyến mọc ra từ ga trung chuyển
 * theo thứ tự, rồi một xung sáng chạy hết mỗi tuyến đúng một lần.
 *
 * Toàn bộ dùng `fromTo` với đích tường minh. `from` ghi lại giá trị đang có làm
 * đích, nên dựng chuỗi lần hai sẽ chốt luôn trạng thái dở dang của lần một và
 * mô hình đứng lại ở kích thước gần bằng không — đúng lỗi đã xảy ra một lần.
 *
 * GSAP chạy trên requestAnimationFrame mà trình duyệt tiết chế rAF khi cửa sổ
 * bị che, nên có thêm chốt `setTimeout` độc lập với rAF kéo thẳng tới cuối.
 */
export const createSceneIntro = ({
  runtimes,
  hub,
  hubRing,
  dolly,
  invalidate
}: IntroOptions): SceneIntro => {
  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onUpdate: invalidate
  })

  const safety = window.setTimeout(() => {
    if (timeline.progress() < 1) timeline.progress(1)
    invalidate()
  }, 1800)

  timeline.fromTo(
    dolly,
    { value: 1.42 },
    { value: 1, duration: 1.1, ease: 'power2.out', onUpdate: invalidate },
    0
  )

  timeline.fromTo(
    [hub.scale, hubRing.scale],
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(2)' },
    0.05
  )

  runtimes.forEach((runtime, index) => {
    const at = 0.1 + index * 0.09

    timeline.fromTo(
      runtime.group.scale,
      { x: 0.02, z: 0.02 },
      { x: 1, z: 1, duration: 0.62 },
      at
    )
    timeline.fromTo(
      runtime.group.position,
      { y: runtime.elevation - 1.1 },
      { y: runtime.elevation, duration: 0.6 },
      at
    )

    const travel = { t: 0 }
    timeline.to(
      travel,
      {
        t: 1,
        duration: 0.85,
        ease: 'none',
        onStart: () => {
          runtime.pulse.visible = true
        },
        onUpdate: () => {
          const point = pointAt(runtime.path, travel.t)
          runtime.pulse.position.set(point.x, 0.3, point.z)
          invalidate()
        },
        onComplete: () => {
          runtime.pulse.visible = false
          invalidate()
        }
      },
      0.5 + index * 0.09
    )
  })

  return {
    timeline,
    dispose: () => {
      window.clearTimeout(safety)
      timeline.progress(1)
      timeline.kill()
    }
  }
}
