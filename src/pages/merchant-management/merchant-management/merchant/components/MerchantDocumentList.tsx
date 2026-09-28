import { useCallback, useState } from 'react'
import type { UploadFile } from '@components/form'
import { ButtonComponent } from '@components/index'
import {
  UploadFilePreview,
  UploadFileThumbnail,
  type PreviewState
} from '@components/form/UploadFilePreview'
import { isImageFile } from '@components/form/uploadFile.utils'
import { useLazyGetMerchantDocumentUrlQuery } from '@services/apiMerchant'
import type { StoredFile } from '@type/merchant'

interface Props {
  merchantId: string
  title: string
  files: StoredFile[]
}

export function MerchantDocumentList({ merchantId, title, files }: Props) {
  const [getDocumentUrl] = useLazyGetMerchantDocumentUrlQuery()
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [error, setError] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const resolveFileUrl = useCallback(
    async (file: UploadFile) => {
      const result = await getDocumentUrl(
        { merchantId, documentId: file.uid },
        false
      ).unwrap()
      return result.url
    },
    [getDocumentUrl, merchantId]
  )

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
    <section className='min-w-0'>
      <h3 className='mb-2 text-xs font-medium text-muted-foreground'>
        {title}
      </h3>
      {files.length === 0 ? (
        <p className='text-sm text-foreground'>—</p>
      ) : (
        <ul className='space-y-2'>
          {files.map((storedFile) => {
            const file: UploadFile = {
              uid: storedFile.id,
              name: storedFile.filename,
              type: storedFile.contentType,
              size: storedFile.sizeBytes,
              status: 'done'
            }
            return (
              <li
                key={file.uid}
                className='flex min-w-0 items-center gap-3 rounded-lg border border-border p-2'
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
                  </span>
                </span>
                <ButtonComponent
                  type='default'
                  size='small'
                  content='Xem'
                  aria-label={`Xem ${file.name}`}
                  loading={loadingId === file.uid}
                  onClick={() => void openPreview(file)}
                />
              </li>
            )
          })}
        </ul>
      )}
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
    </section>
  )
}
