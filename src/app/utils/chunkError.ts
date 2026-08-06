/**
 * Deploy mới xoá các file `assets/<name>-<hash>.js` của bản cũ, nhưng tab đang
 * mở vẫn chạy bundle cũ nên `import()` động trỏ tới hash đã biến mất. Trình
 * duyệt báo lỗi nạp module — không phải 404 của router — và nếu không chặn thì
 * lỗi này rơi vào error boundary rồi hiện nhầm ra màn 404.
 */
const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'unable to preload css',
  // SPA fallback trả index.html cho file .js không tồn tại → sai MIME type
  'expected a javascript module script',
  'failed to load module script',
  'importing a module script failed'
]

const RELOAD_MARK_KEY = 'app:chunk-reload-at'
const RELOAD_COOLDOWN_MS = 10_000

const readMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return ''
}

/** Đọc/ghi sessionStorage an toàn: Safari private mode có thể ném lỗi. */
const readMark = (): number => {
  try {
    const raw = sessionStorage.getItem(RELOAD_MARK_KEY)
    return raw === null ? Number.NaN : Number(raw)
  } catch {
    return Number.NaN
  }
}

const writeMark = (value: number): void => {
  try {
    sessionStorage.setItem(RELOAD_MARK_KEY, String(value))
  } catch {
    // Không ghi được thì bỏ qua: cùng lắm mất lớp chống lặp reload.
  }
}

export const isChunkLoadError = (error: unknown): boolean => {
  const message = readMessage(error).toLowerCase()
  if (!message) return false
  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}

/**
 * Đọc thuần (không ghi) xem có được phép reload hay không, để component quyết
 * định render gì mà không phải chờ effect chạy xong.
 */
export const canReloadForChunkError = (): boolean => {
  const lastReloadAt = readMark()
  if (!Number.isFinite(lastReloadAt)) return true
  return Date.now() - lastReloadAt >= RELOAD_COOLDOWN_MS
}

/**
 * Nạp lại trang để lấy index.html mới (hash chunk mới). Chỉ cho phép một lần
 * trong `RELOAD_COOLDOWN_MS` để lỗi vĩnh viễn không biến thành vòng lặp reload.
 *
 * @returns `true` nếu đã kích hoạt reload, `false` nếu bị chặn bởi cooldown.
 */
export const reloadForChunkError = (): boolean => {
  if (!canReloadForChunkError()) return false

  writeMark(Date.now())
  window.location.reload()
  return true
}

/**
 * Vite phát `vite:preloadError` khi helper preload không nạp được chunk. Bắt ở
 * đây để tự phục hồi trước khi lỗi kịp lan tới error boundary; khi cooldown
 * chặn reload thì để lỗi đi tiếp cho boundary hiển thị màn phù hợp.
 */
export const installChunkReloadGuard = (): (() => void) => {
  const handlePreloadError = (event: Event): void => {
    if (reloadForChunkError()) {
      event.preventDefault()
    }
  }

  window.addEventListener('vite:preloadError', handlePreloadError)
  return () => window.removeEventListener('vite:preloadError', handlePreloadError)
}
