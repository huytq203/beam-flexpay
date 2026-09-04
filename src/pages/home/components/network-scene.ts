import * as THREE from 'three'
import gsap from 'gsap'
import { createCameraRig } from './scene-camera'
import { createLabelProjector, muteLabels } from './scene-labels'
import { buildNetworkModel, buildStage } from './scene-model'
import { createSceneIntro } from './scene-intro'
import { LIFT, type NetworkScene, type NetworkSceneOptions } from './scene-types'

export type {
  NetworkScene,
  NetworkSceneOptions,
  SceneLine,
  SceneStation
} from './scene-types'

/**
 * Mô hình vật lý của bản đồ tuyến, dựng bằng three.js.
 *
 * Không phải hình trang trí: mỗi tuyến là một dải đùn thật nằm ở một cao độ
 * riêng, đổ bóng thật xuống mặt nền, nên chỗ hai tuyến cắt nhau là giao cắt
 * khác mức đọc được chứ không phải hai nét chồng lên nhau.
 *
 * File này chỉ điều phối: dựng renderer, nối chuột, chạy vòng render và dọn
 * dẹp. Phần vật chất nằm ở `scene-model`, khung hình ở `scene-camera`, nhãn ở
 * `scene-labels`, chuỗi mở màn ở `scene-intro`.
 *
 * Module cố ý không biết gì về React, nhờ vậy `three` nằm trọn trong chunk động
 * của màn home.
 */
export function createNetworkScene(
  options: NetworkSceneOptions
): NetworkScene | null {
  const {
    canvas,
    container,
    labelLayer,
    lines,
    network,
    hubLabel,
    hubColor,
    plateColor,
    dimColor,
    reduceMotion,
    onStationActivate,
    onLineFocus
  } = options

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
  } catch {
    return null
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const rig = createCameraRig(network, lines.length)
  buildStage({ scene, focus: rig.focus, span: rig.span })

  const { runtimes, stationMeshes, labels, hub, hubRing } = buildNetworkModel({
    scene,
    labelLayer,
    lines,
    hubLabel,
    hubColor,
    plateColor
  })

  const projectLabels = createLabelProjector(
    container,
    rig.camera,
    hub,
    labels
  )
  const dim = new THREE.Color(dimColor)

  let needsRender = true
  const invalidate = (): void => {
    needsRender = true
  }

  const resize = (): void => {
    const { clientWidth, clientHeight } = container
    if (clientWidth === 0 || clientHeight === 0) return
    renderer.setSize(clientWidth, clientHeight, false)
    rig.camera.aspect = clientWidth / clientHeight
    rig.camera.updateProjectionMatrix()
    rig.fit(rig.camera.aspect)
    invalidate()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered: THREE.Mesh | null = null

  const readPointer = (event: PointerEvent): void => {
    const rect = container.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  const pickStation = (): THREE.Mesh | null => {
    raycaster.setFromCamera(pointer, rig.camera)
    const hit = raycaster.intersectObjects(stationMeshes, false)[0]
    return hit ? (hit.object as THREE.Mesh) : null
  }

  const scaleHovered = (mesh: THREE.Mesh, to: number): void => {
    gsap.to(mesh.scale, {
      x: to,
      y: to,
      z: to,
      duration: to === 1 ? 0.2 : 0.22,
      ease: 'power2.out',
      onUpdate: invalidate
    })
  }

  const handlePointerMove = (event: PointerEvent): void => {
    readPointer(event)

    if (!reduceMotion) {
      rig.parallaxTarget.x = pointer.x * rig.span * 0.18
      rig.parallaxTarget.y = pointer.y * rig.span * 0.12
    }

    const next = pickStation()
    if (next === hovered) return

    if (hovered) scaleHovered(hovered, 1)
    hovered = next
    container.style.cursor = next ? 'pointer' : ''
    onLineFocus(next ? (next.userData.lineId as string) : null)
    if (next) scaleHovered(next, 1.5)
    invalidate()
  }

  const handlePointerLeave = (): void => {
    rig.parallaxTarget.x = 0
    rig.parallaxTarget.y = 0
    if (hovered) {
      scaleHovered(hovered, 1)
      hovered = null
    }
    container.style.cursor = ''
    onLineFocus(null)
    invalidate()
  }

  const handleClick = (event: PointerEvent): void => {
    readPointer(event)
    const target = pickStation()
    if (target) onStationActivate(target.userData.to as string)
  }

  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('pointerleave', handlePointerLeave)
  container.addEventListener('click', handleClick as EventListener)

  let frameId = 0
  const tick = (): void => {
    frameId = requestAnimationFrame(tick)

    const dx = rig.parallaxTarget.x - rig.parallax.x
    const dy = rig.parallaxTarget.y - rig.parallax.y
    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      rig.parallax.x += dx * 0.06
      rig.parallax.y += dy * 0.06
      needsRender = true
    }

    if (!needsRender) return
    needsRender = false
    rig.apply()
    renderer.render(scene, rig.camera)
    projectLabels()
  }
  tick()

  const intro =
    reduceMotion || document.visibilityState === 'hidden'
      ? null
      : createSceneIntro({
          runtimes,
          hub,
          hubRing,
          dolly: rig.dolly,
          invalidate
        })

  const setActiveLine = (lineId: string | null): void => {
    muteLabels(labels, lineId)

    runtimes.forEach((runtime) => {
      const isActive = lineId === null || runtime.id === lineId
      gsap.to(runtime.material.color, {
        r: isActive ? runtime.baseColor.r : dim.r,
        g: isActive ? runtime.baseColor.g : dim.g,
        b: isActive ? runtime.baseColor.b : dim.b,
        duration: 0.3,
        onUpdate: invalidate
      })
      gsap.to(runtime.group.position, {
        y:
          lineId !== null && runtime.id === lineId
            ? runtime.elevation + LIFT
            : runtime.elevation,
        duration: 0.42,
        ease: 'power3.out',
        onUpdate: invalidate
      })
    })
  }

  const dispose = (): void => {
    cancelAnimationFrame(frameId)
    intro?.dispose()
    gsap.killTweensOf([
      ...runtimes.map((runtime) => runtime.group.position),
      ...runtimes.map((runtime) => runtime.material.color)
    ])
    observer.disconnect()
    labels.forEach(({ element }) => element.remove())
    container.removeEventListener('pointermove', handlePointerMove)
    container.removeEventListener('pointerleave', handlePointerLeave)
    container.removeEventListener('click', handleClick as EventListener)
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        const material = object.material
        if (Array.isArray(material)) material.forEach((item) => item.dispose())
        else material.dispose()
      }
    })
    renderer.dispose()
  }

  return { setActiveLine, dispose }
}
