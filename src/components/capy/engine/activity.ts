const EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'wheel',
  'scroll',
  'touchstart'
]

/** Gọi `onActivity` mỗi khi người dùng động vào trang. Trả hàm gỡ theo dõi. */
export function trackActivity(onActivity: () => void): () => void {
  EVENTS.forEach((name) =>
    document.addEventListener(name, onActivity, {
      capture: true,
      passive: true
    })
  )
  return () =>
    EVENTS.forEach((name) =>
      document.removeEventListener(name, onActivity, { capture: true })
    )
}
