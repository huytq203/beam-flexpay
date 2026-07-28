import { useEffect, useState } from 'react'

const isDocumentHidden = (): boolean =>
  typeof document !== 'undefined' && document.visibilityState === 'hidden'

/** Cho phép dừng các vòng lặp trang trí khi người dùng rời tab. */
export function usePageHidden(): boolean {
  const [isHidden, setIsHidden] = useState<boolean>(isDocumentHidden)

  useEffect(() => {
    const handleVisibilityChange = () => setIsHidden(isDocumentHidden())
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return isHidden
}
