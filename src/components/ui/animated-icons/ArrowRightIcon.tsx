import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type MouseEvent
} from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils/cn'

export interface ArrowRightIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface ArrowRightIconProps
  extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    | 'color'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
  > {
  size?: number
  duration?: number
  isAnimated?: boolean
  color?: string
}

const ArrowRightIcon = forwardRef<
  ArrowRightIconHandle,
  ArrowRightIconProps
>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      className,
      size = 24,
      duration = 1,
      isAnimated = true,
      color,
      style,
      ...props
    },
    ref
  ) => {
    const iconRef = useRef<SVGSVGElement>(null)
    const animationRef = useRef<gsap.core.Timeline | null>(null)
    const isControlled = useRef(false)

    const stopAnimation = useCallback((): void => {
      animationRef.current?.kill()
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          x: 0,
          duration: 0.12,
          overwrite: true,
          ease: 'power2.out'
        })
      }
    }, [])

    const startAnimation = useCallback((): void => {
      if (
        !isAnimated ||
        !iconRef.current ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      animationRef.current?.kill()
      animationRef.current = gsap
        .timeline({ defaults: { overwrite: true } })
        .to(iconRef.current, {
          x: -2,
          duration: 0.12 * duration,
          ease: 'power1.inOut'
        })
        .to(iconRef.current, {
          x: 4,
          duration: 0.24 * duration,
          ease: 'power2.out'
        })
        .to(iconRef.current, {
          x: 0,
          duration: 0.24 * duration,
          ease: 'power2.out'
        })
    }, [duration, isAnimated])

    useImperativeHandle(
      ref,
      () => {
        isControlled.current = true
        return { startAnimation, stopAnimation }
      },
      [startAnimation, stopAnimation]
    )

    useEffect(
      () => () => {
        animationRef.current?.kill()
      },
      []
    )

    const handleEnter = (event: MouseEvent<HTMLSpanElement>): void => {
      if (!isControlled.current) startAnimation()
      onMouseEnter?.(event)
    }

    const handleLeave = (event: MouseEvent<HTMLSpanElement>): void => {
      if (!isControlled.current) stopAnimation()
      onMouseLeave?.(event)
    }

    return (
      <span
        className={cn('inline-flex items-center justify-center', className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ color, ...style }}
        {...props}
      >
        <svg
          ref={iconRef}
          xmlns='http://www.w3.org/2000/svg'
          width={size}
          height={size}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M5 12h14' />
          <path d='m12 5 7 7-7 7' />
        </svg>
      </span>
    )
  }
)

ArrowRightIcon.displayName = 'ArrowRightIcon'

export { ArrowRightIcon }
