import React, { useEffect, useState } from 'react'
import { FloatButton } from 'antd'

import './style.css'

type AntdBackTopProps = React.ComponentProps<typeof FloatButton.BackTop>

export type ScrollToTopButtonProps = AntdBackTopProps & {
  /**
   * Tương thích với API BackTop mới của antd trong khi dự án còn dùng antd 5.
   */
  showProgress?: boolean
}

const sharedProps: ScrollToTopButtonProps = {
  showProgress: true,
  visibilityHeight: 0
}

const getDefaultTarget = (): HTMLElement | Window =>
  document.querySelector<HTMLElement>('.app-content') ?? window

const getScrollElement = (
  target: HTMLElement | Window | Document
): HTMLElement => {
  if (target instanceof HTMLElement) return target

  if (target === window) {
    return (document.scrollingElement ?? document.documentElement) as HTMLElement
  }

  const targetDocument = target as Document
  return (targetDocument.scrollingElement ?? targetDocument.documentElement) as HTMLElement
}

export function ScrollToTopButton({
  showProgress = sharedProps.showProgress,
  visibilityHeight = sharedProps.visibilityHeight,
  target = getDefaultTarget,
  className,
  shape = 'circle',
  tooltip = 'Lên đầu trang',
  'aria-label': ariaLabel = 'Cuộn lên đầu trang',
  style,
  ...props
}: ScrollToTopButtonProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!showProgress) return

    const scrollTarget = target()
    let animationFrame: number | undefined

    const updateProgress = (): void => {
      const scrollElement = getScrollElement(scrollTarget)
      const scrollableHeight = scrollElement.scrollHeight - scrollElement.clientHeight
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (scrollElement.scrollTop / scrollableHeight) * 100))
          : 0

      setProgress(nextProgress)
      animationFrame = undefined
    }

    const scheduleProgressUpdate = (): void => {
      if (animationFrame !== undefined) return
      animationFrame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    scrollTarget.addEventListener('scroll', scheduleProgressUpdate, { passive: true })
    window.addEventListener('resize', scheduleProgressUpdate)

    return () => {
      scrollTarget.removeEventListener('scroll', scheduleProgressUpdate)
      window.removeEventListener('resize', scheduleProgressUpdate)
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
    }
  }, [showProgress, target])

  const progressStyle = {
    ...style,
    '--scroll-progress': `${progress * 3.6}deg`
  } as React.CSSProperties

  return (
    <FloatButton.BackTop
      {...props}
      target={target}
      visibilityHeight={visibilityHeight}
      shape={shape}
      aria-label={ariaLabel}
      tooltip={tooltip}
      className={['scroll-to-top-button', showProgress && 'show-progress', className]
        .filter(Boolean)
        .join(' ')}
      style={{ insetInlineEnd: 10,bottom: 24, ...progressStyle }}
    />
  )
}
