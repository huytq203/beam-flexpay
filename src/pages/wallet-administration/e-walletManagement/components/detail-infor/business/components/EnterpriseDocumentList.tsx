import { useState } from 'react'
import type { UploadFile } from '@components/form'
import { ButtonComponent } from '@components/index'
import {
  UploadFilePreview,
  UploadFileThumbnail,
  type PreviewState
} from '@components/form/UploadFilePreview'
import { isImageFile } from '@components/form/uploadFile.utils'
import type { EnterpriseWalletDocument } from '@type/enterpriseWallet'

export interface EnterpriseDocumentItem {
  label: string
  document?: EnterpriseWalletDocument | null
}

interface EnterpriseDocumentListProps {
  items: EnterpriseDocumentItem[]
  resolveFileUrl: (file: UploadFile) => Promise<string>
}

const toUploadFile = (document: EnterpriseWalletDocument): UploadFile => ({
  uid: document.id ?? '',
  name: document.filename ?? 'Tệp đính kèm',
  type: document.contentType,
  size: document.sizeBytes,
  status: 'done'
})

export function EnterpriseDocumentList({
  items,
  resolveFileUrl
}: EnterpriseDocumentListProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [error, setError] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const openPreview = async (file: UploadFile) => {
    setError('')
    setLoadingId(file.uid)
    try {
      const url = await resolveFileUrl(file)
      setPreview({
        name: file.name,
        url,
        isImage: isImageFile(file),
        isLocal: false
      })
    } catch {
      setError(`Không thể mở ${file.name}. Vui lòng thử lại.`)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <ul className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {items.map(({ label, document }) => {
          const file = document?.id ? toUploadFile(document) : null
          return (
            <li
              key={label}
              className='flex min-w-0 flex-col gap-2'
            >
              <span className='text-xs font-medium text-muted-foreground'>
                {label}
              </span>
              {file ? (
                <div className='flex min-w-0 items-center gap-3 rounded-lg border border-border p-2'>
                  <span className='flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted'>
                    <UploadFileThumbnail
                      file={file}
                      resolveFileUrl={resolveFileUrl}
                    />
                  </span>
                  <span
                    className='min-w-0 flex-1 truncate text-sm font-medium text-foreground'
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <ButtonComponent
                    type='default'
                    size='small'
                    content='Xem'
                    aria-label={`Xem ${label}`}
                    loading={loadingId === file.uid}
                    onClick={() => void openPreview(file)}
                  />
                </div>
              ) : (
                <p className='rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground'>
                  Chưa đính kèm
                </p>
              )}
            </li>
          )
        })}
      </ul>
      {error && (
        <p
          role='alert'
          className='mt-2 text-xs text-danger-strong'
        >
          {error}
        </p>
      )}
      <UploadFilePreview
        preview={preview}
        onClose={() => setPreview(null)}
      />
    </>
  )
}
