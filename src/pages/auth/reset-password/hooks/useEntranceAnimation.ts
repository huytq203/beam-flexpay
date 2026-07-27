import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

/**
 * Wrapper quanh gsap cho hiệu ứng vào màn của khu vực auth.
 * Chỉ file này biết đến gsap — đổi thư viện animation không lan ra component.
 */
export function useEntranceAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  replayKey: string
): void {
  useEffect(() => {
    if (!scopeRef.current) return
    // Tab đang ẩn thì rAF bị bóp lại, animation bò rất chậm và người dùng quay lại
    // sẽ thấy một cột trắng. Trường hợp đó bỏ hẳn entrance, hiện thẳng nội dung.
    if (document.visibilityState === 'hidden') return

    const context = gsap.context(() => {
      const play = (
        selector: string,
        from: gsap.TweenVars,
        to: gsap.TweenVars
      ): void => {
        const targets = gsap.utils.toArray<Element>(selector)
        if (targets.length > 0) gsap.fromTo(targets, from, to)
      }

      play(
        '.reset-disc',
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      )
      play(
        '.reset-heading',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: 'power2.out' }
      )
      play(
        '.reset-stack > *',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, delay: 0.3, ease: 'power2.out' }
      )
    }, scopeRef)

    return () => context.revert()
  }, [scopeRef, replayKey])
}
