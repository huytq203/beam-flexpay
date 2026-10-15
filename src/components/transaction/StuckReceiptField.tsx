import { useRef, useState, type ChangeEvent } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ButtonComponent } from '@components/index'
import { useUploadStuckTransactionReceiptMutation } from '@services/apiStuckTransaction'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'
import {
  RECEIPT_ACCEPT,
  formatFileSize,
  receiptUploadCacheKey,
  validateReceiptFile
} from './stuckReceipt.utils'
import { describeUploadError } from './stuckTransaction.utils'

interface StuckReceiptFieldProps {
  transactionCode: string
  /** Đang gửi cập nhật: khoá chọn/gỡ để biên lai không đổi giữa chừng. */
  disabled?: boolean
}

/**
 * Chọn biên lai khi chốt Thành công. `receiptKey` nằm trong state form (không copy vào
 * store); file chỉ gắn vào giao dịch khi update-status thành công.
 */
export const StuckReceiptField = ({
  transactionCode,
  disabled = false
}: StuckReceiptFieldProps) => {
  const { control, setValue } =
    useFormContext<StuckTransactionUpdateFormValues>()
  const receipt = useWatch({ control, name: 'receipt' })
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [upload, { isLoading }] = useUploadStuckTransactionReceiptMutation({
    fixedCacheKey: receiptUploadCacheKey(transactionCode)
  })
  const isLocked = disabled || isLoading

  const handleChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || isLocked) return
    const invalid = validateReceiptFile(file)
    setError(invalid)
    if (invalid) return
    try {
      const result = await upload({ transactionCode, file }).unwrap()
      setValue('receipt', {
        receiptKey: result.receiptKey,
        fileName: file.name,
        sizeBytes: result.sizeBytes ?? file.size
      })
    } catch (uploadError) {
      setError(describeUploadError(uploadError))
    }
  }

  const handleRemove = (): void => {
    setValue('receipt', undefined)
    setError(null)
  }

  return (
    <div className='flex flex-col gap-1 sm:col-span-3'>
      <span className='text-sm font-medium text-foreground'>Ảnh biên lai</span>
      <input
        ref={inputRef}
        type='file'
        hidden
        aria-label='Ảnh biên lai'
        accept={RECEIPT_ACCEPT}
        disabled={isLocked}
        onChange={(event) => void handleChange(event)}
      />
      {receipt ? (
        <div className='flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm'>
          <span className='min-w-0 break-all'>
            {receipt.fileName} · {formatFileSize(receipt.sizeBytes)}
          </span>
          <ButtonComponent
            htmlType='button'
            type='default'
            size='small'
            content='Gỡ'
            aria-label='Gỡ biên lai'
            disabled={isLocked}
            onClick={handleRemove}
          />
        </div>
      ) : (
        <ButtonComponent
          htmlType='button'
          type='default'
          className='w-fit'
          content='Chọn biên lai'
          loading={isLoading}
          disabled={isLocked}
          onClick={() => inputRef.current?.click()}
        />
      )}
      <span className='text-xs text-muted-foreground'>
        Ảnh jpeg, jpg, png, webp hoặc PDF, tối đa 2MB.
      </span>
      {error && (
        <p
          role='alert'
          className='m-0 text-sm text-danger-strong'
        >
          {error}
        </p>
      )}
    </div>
  )
}
