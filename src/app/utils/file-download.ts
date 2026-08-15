import dayjs from 'dayjs'

const UTF8_BOM = '﻿'
const BOM_BYTES = [0xef, 0xbb, 0xbf]

/** Đọc tên file backend gửi kèm trong header `Content-Disposition`. */
export const parseFilenameFromDisposition = (
  header: string | null
): string | null => {
  if (!header) return null

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim())
    } catch {
      // Header filename* hỏng vẫn có thể còn filename thường hợp lệ bên dưới.
    }
  }

  const quoted = /filename="?([^";]+)"?/i.exec(header)
  return quoted?.[1]?.trim() ?? null
}

/** Tên file dùng khi backend không gửi (hoặc CORS chặn) `Content-Disposition`. */
export const buildFallbackFilename = (prefix: string): string =>
  `${prefix}_${dayjs().format('YYYYMMDD-HHmmss')}.csv`

/** Chỉ thêm BOM UTF-8 khi CSV chưa có để Excel đọc đúng tiếng Việt. */
const ensureUtf8Bom = async (blob: Blob): Promise<Blob> => {
  const head = new Uint8Array(await blob.slice(0, 3).arrayBuffer())
  const hasBom = BOM_BYTES.every((byte, index) => head[index] === byte)
  if (hasBom) return blob

  return new Blob([UTF8_BOM, blob], {
    type: blob.type || 'text/csv;charset=utf-8'
  })
}

/** Đưa blob cho trình duyệt tải xuống dưới tên `filename`. */
export const saveBlobAsFile = async (
  blob: Blob,
  filename: string
): Promise<void> => {
  const fileBlob = filename.toLowerCase().endsWith('.csv')
    ? await ensureUtf8Bom(blob)
    : blob

  const url = URL.createObjectURL(fileBlob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
