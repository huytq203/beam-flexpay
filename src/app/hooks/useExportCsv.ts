import { globalMessage } from '@hooks/useMessage'
import type { ExportedFile } from '@services/apiExportCsv'
import { buildFallbackFilename, saveBlobAsFile } from '@utils/file-download'
import { useCallback, useState } from 'react'

interface UseExportCsvParams<TArgs> {
  /** `trigger` của mutation export, ví dụ `useExportFreezesMutation()[0]`. */
  trigger: (args: TArgs) => { unwrap: () => Promise<ExportedFile> }
  /** `reset` của cùng mutation — dọn Blob khỏi store sau khi tải xong. */
  reset: () => void
  /** Tiền tố tên file khi backend không gửi `Content-Disposition`. */
  filenamePrefix: string
  successMessage?: string
}

interface UseExportCsvResult<TArgs> {
  exportFile: (args: TArgs) => Promise<void>
  isExporting: boolean
}

export const useExportCsv = <TArgs,>({
  trigger,
  reset,
  filenamePrefix,
  successMessage = 'Đã tải file CSV'
}: UseExportCsvParams<TArgs>): UseExportCsvResult<TArgs> => {
  const [isExporting, setIsExporting] = useState(false)

  const exportFile = useCallback(
    async (args: TArgs): Promise<void> => {
      if (isExporting) return

      setIsExporting(true)
      try {
        let file: ExportedFile
        try {
          file = await trigger(args).unwrap()
        } catch {
          // Lỗi RTK đã được errorMiddleware thông báo.
          return
        }

        try {
          await saveBlobAsFile(
            file.blob,
            file.filename ?? buildFallbackFilename(filenamePrefix)
          )
          globalMessage.success(successMessage)
        } catch {
          globalMessage.error('Không thể lưu file CSV. Vui lòng thử lại.')
        }
      } finally {
        setIsExporting(false)
        reset()
      }
    },
    [filenamePrefix, isExporting, reset, successMessage, trigger]
  )

  return { exportFile, isExporting }
}
