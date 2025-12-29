import { useCallback } from 'react'

type SvgOptions = {
  size?: number
  width?: number
  height?: number
  className?: string
}

export function useSVG() {
  const svg = useCallback(
    (href: string, options?: SvgOptions) => {
      const size = options?.size ?? 20
      const width = options?.width ?? size
      const height = options?.height ?? size

      return (
        <svg
          className={`pointer-events-none ${options?.className ?? ''}`}
          width={width}
          height={height}
          aria-hidden
        >
          <use href={href} />
        </svg>
      )
    },
    []
  )

  return { svg }
}
