import type { ReactNode } from 'react'
import { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Upload } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { ButtonComponent } from '@components/index'
import { FormField } from './FormField'
import {
  UploadFilePreview,
  UploadFileThumbnail,
  type PreviewState
} from './UploadFilePreview'
import { isImageFile } from './uploadFile.utils'

const { Dragger } = Upload

interface FormUploadCombinedProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string | ReactNode
  className?: string
  classNameLabel?: string
  multiple?: boolean
  maxCount?: number
  accept?: string
  disabled?: boolean
  dragText?: string
  resolveFileUrl?: (file: UploadFile) => Promise<string>
  allowRemoveStored?: boolean
}

export function FormUploadCombined<T extends FieldValues>({
  name,
  control,
  label,
  className = 'col-span-6 flex flex-col',
  classNameLabel = 'font-medium',
  multiple = true,
  maxCount,
  accept,
  disabled = false,
  dragText = 'Kéo thả hoặc chọn tệp',
  resolveFileUrl,
  allowRemoveStored = true
}: FormUploadCombinedProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      classNameLable={classNameLabel}
      render={(field) => (
        <UploadControl
          value={field.value || []}
          onChange={field.onChange}
          multiple={multiple}
          maxCount={maxCount}
          accept={accept}
          disabled={disabled}
          dragText={dragText}
          resolveFileUrl={resolveFileUrl}
          allowRemoveStored={allowRemoveStored}
        />
      )}
    />
  )
}

interface UploadControlProps {
  value?: UploadFile[]
  onChange?: (files: UploadFile[]) => void
  multiple?: boolean
  maxCount?: number
  accept?: string
  disabled?: boolean
  dragText?: string
  resolveFileUrl?: (file: UploadFile) => Promise<string>
  allowRemoveStored?: boolean
}

export function UploadControl({
  value = [],
  onChange,
  multiple = true,
  maxCount,
  accept,
  disabled = false,
  dragText = 'Kéo thả hoặc chọn tệp',
  resolveFileUrl,
  allowRemoveStored = true
}: UploadControlProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handlePreview = async (file: UploadFile) => {
    setPreviewError('')
    setLoadingId(file.uid)
    try {
      const isLocal = Boolean(file.originFileObj)
      const url = file.originFileObj
        ? URL.createObjectURL(file.originFileObj)
        : resolveFileUrl
          ? await resolveFileUrl(file)
          : file.url
      if (!url) throw new Error('Missing file URL')
      setPreview({ name: file.name, url, isImage: isImageFile(file), isLocal })
    } catch {
      setPreviewError(`Không thể mở ${file.name}. Vui lòng thử lại.`)
    } finally {
      setLoadingId(null)
    }
  }

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setPreviewError('')
    onChange?.(fileList)
  }

  return (
    <>
      <Dragger
        multiple={multiple}
        maxCount={maxCount}
        accept={accept}
        disabled={disabled}
        fileList={value}
        beforeUpload={() => false}
        onChange={handleChange}
        showUploadList={false}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>{dragText}</p>
      </Dragger>

      {value.length > 0 && (
        <ul
          className='mt-2 space-y-2'
          aria-label='Tệp đã chọn'
        >
          {value.map((file) => (
            <li
              key={file.uid}
              className='flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-2'
            >
              <span className='flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted'>
                <UploadFileThumbnail
                  file={file}
                  resolveFileUrl={resolveFileUrl}
                />
              </span>
              <span className='min-w-0 flex-1'>
                <span
                  className='block truncate text-sm font-medium text-foreground'
                  title={file.name}
                >
                  {file.name}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {isImageFile(file) ? 'Ảnh' : 'PDF'}
                  {file.size
                    ? ` · ${(file.size / 1024 / 1024).toFixed(1)} MB`
                    : ''}
                </span>
              </span>
              <ButtonComponent
                type='default'
                size='small'
                htmlType='button'
                content='Xem'
                aria-label={`Xem ${file.name}`}
                loading={loadingId === file.uid}
                onClick={() => void handlePreview(file)}
              />
              {!disabled &&
                (allowRemoveStored || Boolean(file.originFileObj)) && (
                  <ButtonComponent
                    type='default'
                    size='small'
                    htmlType='button'
                    content='Xóa'
                    aria-label={`Xóa ${file.name}`}
                    onClick={() =>
                      onChange?.(value.filter((item) => item.uid !== file.uid))
                    }
                  />
                )}
            </li>
          ))}
        </ul>
      )}
      {previewError && (
        <p
          role='alert'
          className='mt-2 text-xs text-danger-strong'
        >
          {previewError}
        </p>
      )}
      <UploadFilePreview
        preview={preview}
        onClose={() => setPreview(null)}
      />
    </>
  )
}

export type { UploadFile }
export default FormUploadCombined
