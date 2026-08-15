import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildFallbackFilename,
  parseFilenameFromDisposition,
  saveBlobAsFile
} from '../file-download'

describe('parseFilenameFromDisposition', () => {
  it('đọc được filename* dạng UTF-8 có dấu tiếng Việt', () => {
    const header =
      "attachment; filename=\"lien-ket.csv\"; filename*=UTF-8''li%C3%AAn-k%E1%BA%BFt.csv"

    expect(parseFilenameFromDisposition(header)).toBe('liên-kết.csv')
  })

  it('đọc được filename thường khi không có filename*', () => {
    expect(
      parseFilenameFromDisposition('attachment; filename="bank-links.csv"')
    ).toBe('bank-links.csv')
  })

  it('fallback về filename thường khi filename* bị sai percent-encoding', () => {
    expect(
      parseFilenameFromDisposition(
        "attachment; filename=\"bank-links.csv\"; filename*=UTF-8''bad%E0%A4%A"
      )
    ).toBe('bank-links.csv')
  })

  it('trả null khi thiếu header', () => {
    expect(parseFilenameFromDisposition(null)).toBeNull()
  })

  it('trả null khi header không chứa tên file', () => {
    expect(parseFilenameFromDisposition('attachment')).toBeNull()
  })
})

describe('buildFallbackFilename', () => {
  it('nối tiền tố với dấu thời gian và đuôi csv', () => {
    expect(buildFallbackFilename('dong-bang-so-du')).toMatch(
      /^dong-bang-so-du_\d{8}-\d{6}\.csv$/
    )
  })
})

describe('saveBlobAsFile', () => {
  const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      writable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      writable: true
    })
  })

  /** Lấy blob thật sự được đưa cho trình duyệt tải xuống. */
  const savedBlob = (): Blob => createObjectURL.mock.calls[0][0]

  it('thêm BOM UTF-8 khi backend gửi CSV thiếu BOM', async () => {
    await saveBlobAsFile(
      new Blob(['ma,ten\n1,Bình'], { type: 'text/csv' }),
      'a.csv'
    )

    const bytes = new Uint8Array(await savedBlob().slice(0, 3).arrayBuffer())
    expect(Array.from(bytes)).toEqual([0xef, 0xbb, 0xbf])
  })

  it('không thêm BOM lần hai khi backend đã gửi BOM', async () => {
    const withBom = new Blob(['﻿ma,ten\n1,Bình'], { type: 'text/csv' })

    await saveBlobAsFile(withBom, 'a.csv')

    expect(savedBlob().size).toBe(withBom.size)
  })

  it('không đụng tới nội dung khi file không phải csv', async () => {
    const raw = new Blob(['noi dung'], { type: 'application/pdf' })

    await saveBlobAsFile(raw, 'a.pdf')

    expect(savedBlob().size).toBe(raw.size)
  })

  it('thu hồi object URL sau khi tải', async () => {
    vi.useFakeTimers()

    await saveBlobAsFile(new Blob(['x'], { type: 'text/csv' }), 'a.csv')

    vi.advanceTimersByTime(999)
    expect(revokeObjectURL).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
    vi.useRealTimers()
  })
})
