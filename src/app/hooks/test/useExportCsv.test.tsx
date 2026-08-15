import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExportCsv } from '../useExportCsv'

const saveBlobAsFile = vi.fn()
const successMessage = vi.fn()
const errorMessage = vi.fn()

vi.mock('@utils/file-download', async () => {
  const actual = await vi.importActual<typeof import('@utils/file-download')>(
    '@utils/file-download'
  )
  return {
    ...actual,
    saveBlobAsFile: (...args: unknown[]) => saveBlobAsFile(...args)
  }
})

vi.mock('@hooks/useMessage', () => ({
  globalMessage: {
    success: (content: string) => successMessage(content),
    error: (content: string) => errorMessage(content),
    info: vi.fn(),
    warning: vi.fn()
  }
}))

const setup = (
  unwrap: () => Promise<{ blob: Blob; filename: string | null }>
) => {
  const reset = vi.fn()
  const trigger = vi.fn(() => ({ unwrap }))
  const view = renderHook(() =>
    useExportCsv({ trigger, reset, filenamePrefix: 'dong-bang-so-du' })
  )
  return { ...view, reset, trigger }
}

describe('useExportCsv', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lưu file với tên backend gửi và báo thành công', async () => {
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result, reset } = setup(async () => ({
      blob,
      filename: 'be-dat-ten.csv'
    }))

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(saveBlobAsFile).toHaveBeenCalledWith(blob, 'be-dat-ten.csv')
    expect(successMessage).toHaveBeenCalledTimes(1)
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('dùng tên dự phòng khi backend không gửi tên file', async () => {
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result } = setup(async () => ({ blob, filename: null }))

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(saveBlobAsFile).toHaveBeenCalledWith(
      blob,
      expect.stringMatching(/^dong-bang-so-du_\d{8}-\d{6}\.csv$/)
    )
  })

  it('không lưu file và không tự toast lỗi khi request hỏng', async () => {
    const { result } = setup(async () => {
      throw new Error('Lỗi')
    })

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(saveBlobAsFile).not.toHaveBeenCalled()
    expect(errorMessage).not.toHaveBeenCalled()
    expect(successMessage).not.toHaveBeenCalled()
  })

  it('báo lỗi riêng khi API thành công nhưng trình duyệt không lưu được file', async () => {
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    saveBlobAsFile.mockRejectedValueOnce(new Error('Không tạo được object URL'))
    const { result } = setup(async () => ({ blob, filename: 'a.csv' }))

    await act(async () => {
      await result.current.exportFile({ accountId: 'a' })
    })

    expect(errorMessage).toHaveBeenCalledWith(
      'Không thể lưu file CSV. Vui lòng thử lại.'
    )
    expect(successMessage).not.toHaveBeenCalled()
  })

  it('bật isExporting trong lúc tải rồi tắt khi xong', async () => {
    let release: (() => void) | undefined
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result } = setup(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ blob, filename: 'a.csv' })
        })
    )

    act(() => {
      void result.current.exportFile({ accountId: 'a' })
    })
    await waitFor(() => expect(result.current.isExporting).toBe(true))

    await act(async () => {
      release?.()
    })
    await waitFor(() => expect(result.current.isExporting).toBe(false))
  })

  it('bỏ qua lần bấm thứ hai khi đang tải', async () => {
    let release: (() => void) | undefined
    const blob = new Blob(['ma\n1'], { type: 'text/csv' })
    const { result, trigger } = setup(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ blob, filename: 'a.csv' })
        })
    )

    act(() => {
      void result.current.exportFile({ accountId: 'a' })
    })
    await waitFor(() => expect(result.current.isExporting).toBe(true))
    await act(async () => {
      void result.current.exportFile({ accountId: 'a' })
      release?.()
    })

    expect(trigger).toHaveBeenCalledTimes(1)
  })
})
