import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'

export interface AuthIntroAnimation {
  brandRef: RefObject<HTMLDivElement | null>
  sceneRef: RefObject<HTMLDivElement | null>
  mascotRef: RefObject<HTMLDivElement | null>
  formRef: RefObject<HTMLDivElement | null>
}

interface AnimationElements {
  brand: HTMLDivElement
  scene: HTMLDivElement | null
  mascot: HTMLDivElement | null
  form: HTMLDivElement | null
}

const animateIntro = (
  mascot: HTMLDivElement | null,
  form: HTMLDivElement | null
): void => {
  gsap
    .timeline()
    .fromTo(
      '.auth-mountain-layer',
      { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }
    )
    .fromTo(
      mascot,
      { opacity: 0, y: 54, clipPath: 'inset(100% 0 0 0)' },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'expo.out'
      },
      '-=0.65'
    )
    .fromTo(
      '.auth-brand-copy > *',
      { opacity: 0, x: -24 },
      {
        opacity: 1,
        x: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out'
      },
      '-=0.55'
    )

  if (form) {
    gsap.fromTo(
      form,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' }
    )
  }
}

const setupIntro = (
  brand: HTMLDivElement,
  mascot: HTMLDivElement | null,
  form: HTMLDivElement | null
): (() => void) => {
  const media = gsap.matchMedia()
  const context = gsap.context(() => {
    media.add('(prefers-reduced-motion: no-preference)', () =>
      animateIntro(mascot, form)
    )
  }, brand)

  return () => {
    media.revert()
    context.revert()
  }
}

const setupParallax = (
  brand: HTMLDivElement,
  scene: HTMLDivElement | null
): (() => void) => {
  const moveSceneX = gsap.quickTo(scene, 'x', {
    duration: 0.8,
    ease: 'power3.out'
  })
  const moveSceneY = gsap.quickTo(scene, 'y', {
    duration: 0.8,
    ease: 'power3.out'
  })
  const handlePointerMove = (event: PointerEvent): void => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = brand.getBoundingClientRect()
    moveSceneX(((event.clientX - bounds.left) / bounds.width - 0.5) * 12)
    moveSceneY(((event.clientY - bounds.top) / bounds.height - 0.5) * 9)
  }
  const resetScene = (): void => {
    moveSceneX(0)
    moveSceneY(0)
  }

  brand.addEventListener('pointermove', handlePointerMove)
  brand.addEventListener('pointerleave', resetScene)

  return () => {
    brand.removeEventListener('pointermove', handlePointerMove)
    brand.removeEventListener('pointerleave', resetScene)
  }
}

const setupAuthAnimation = ({
  brand,
  scene,
  mascot,
  form
}: AnimationElements): (() => void) => {
  const cleanupIntro = setupIntro(brand, mascot, form)
  const cleanupParallax = setupParallax(brand, scene)
  return () => {
    cleanupParallax()
    cleanupIntro()
  }
}

/** Timeline mở màn + parallax con trỏ cho panel thương hiệu. */
export function useAuthIntroAnimation(): AuthIntroAnimation {
  const brandRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const brand = brandRef.current
    if (!brand) return

    return setupAuthAnimation({
      brand,
      scene: sceneRef.current,
      mascot: mascotRef.current,
      form: formRef.current
    })
  }, [])

  return { brandRef, sceneRef, mascotRef, formRef }
}
