import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useUploadMerchantDocumentMutation } from '@/app/services/apiMerchant'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { FormField, UploadControl } from '@components/form'
import { ESCROW_MAX_DOCUMENTS } from '../constants/merchantEscrow.constants'
import {
  ESCROW_EVIDENCE_ACCEPT,
  type EscrowEvidenceFile,
  type EscrowOrderFormValues
} from '../utils/escrowOrder.schema'

/** STT 8: tối đa 10MB mỗi tệp. `UploadControl` loại tệp quá cỡ ngay lúc chọn. */
const MAX_FILE_MB = 10

interface EvidenceListProps {
  value: EscrowEvidenceFile[]
  onChange: (files: EscrowEvidenceFile[]) => void
  /**
   * Đọc danh sách hiện tại của form. Các lượt tải chạy song song và kết thúc lệch nhau, nên mỗi lượt
   * phải cập nhật trên danh sách mới nhất chứ không phải bản `value` lúc nó bắt đầu.
   */
  read: () => EscrowEvidenceFile[]
}

/**
 * Danh sách chứng từ: tệp mới chọn được tải lên kho tạm NGAY (STT 8) với loại
 * `ESCROW_DEPOSIT_EVIDENCE`; `stagingId` BE trả về được giữ trong `response` để gửi kèm lệnh dưới
 * tên `fileRef`. Tải lỗi thì bỏ tệp đó khỏi danh sách và báo lỗi, các trường khác giữ nguyên
 * (NFR-MER-0627-04).
 */
function EvidenceList({ value, onChange, read }: EvidenceListProps) {
  const [uploadDocument] = useUploadMerchantDocumentMutation()
  const [error, setError] = useState('')

  const upload = async (file: EscrowEvidenceFile) => {
    const raw = file.originFileObj
    if (!raw) return
    try {
      const { stagingId } = await uploadDocument({
        file: raw,
        documentType: 'ESCROW_DEPOSIT_EVIDENCE'
      }).unwrap()
      onChange(
        read().map((item) =>
          item.uid === file.uid
            ? {
                ...item,
                status: 'done',
                response: {
                  fileRef: stagingId,
                  fileName: raw.name,
                  contentType: raw.type || 'application/octet-stream',
                  sizeBytes: raw.size
                }
              }
            : item
        )
      )
    } catch (failure) {
      onChange(read().filter((item) => item.uid !== file.uid))
      setError(
        getApiErrorDetail(failure, `Không tải lên được ${raw.name}. Vui lòng thử lại.`)
      )
    }
  }

  const handleChange = (files: EscrowEvidenceFile[]) => {
    setError('')
    const known = new Set(read().map((item) => item.uid))
    const added = files.filter(
      (file) => !known.has(file.uid) && file.originFileObj
    )
    // Không tải các tệp vượt quá 5: schema đã báo "Tối đa 5 chứng từ", tải lên chỉ tốn băng thông.
    // Tệp bị bỏ qua mang trạng thái lỗi để người dùng xóa đi rồi chọn lại nếu cần.
    const room = Math.max(0, ESCROW_MAX_DOCUMENTS - (files.length - added.length))
    const toUpload = added.slice(0, room)
    onChange(
      files.map((file) => {
        if (!added.includes(file)) return file
        return { ...file, status: toUpload.includes(file) ? 'uploading' : 'error' }
      })
    )
    toUpload.forEach((file) => void upload(file))
  }

  return (
    <>
      <UploadControl
        value={value}
        onChange={handleChange}
        accept={ESCROW_EVIDENCE_ACCEPT}
        maxFileSizeInMB={MAX_FILE_MB}
        dragText='Kéo thả hoặc chọn sao kê, ủy nhiệm chi (PDF, JPG, PNG, WEBP; tối đa 5 tệp, 10MB mỗi tệp)'
      />
      {value.some((file) => file.status === 'uploading') && (
        <p className='mt-1 text-xs text-muted-foreground'>
          Đang tải chứng từ lên…
        </p>
      )}
      {error && (
        <p
          role='alert'
          className='mt-1 text-xs text-danger-strong'
        >
          {error}
        </p>
      )}
    </>
  )
}

/** Ô "Chứng từ đính kèm" (STT 8) gắn vào form tạo lệnh nạp. */
export function EscrowEvidenceUpload({
  form
}: {
  form: UseFormReturn<EscrowOrderFormValues>
}) {
  return (
    <FormField
      name='documents'
      control={form.control}
      label='Chứng từ đính kèm'
      required
      className='flex flex-col md:col-span-2'
      classNameLable='font-medium'
      render={(field) => (
        <EvidenceList
          value={field.value}
          onChange={field.onChange}
          read={() => form.getValues('documents')}
        />
      )}
    />
  )
}
