import { useEffect, useState } from 'react'
import type { UploadFile } from 'antd'
import { FileDoneOutlined, ImageBrokenIcon } from '@components/icons'
import { ImageComponent, ModalComponent } from '@components/index'
import { isImageFile } from './uploadFile.utils'

interface PreviewState {
  name: string
  url: string
  isImage: boolean
  isLocal: boolean
}

interface UploadFilePreviewProps {
  preview: PreviewState | null
  onClose: () => void
}

export function UploadFilePreview({
  preview,
  onClose
}: UploadFilePreviewProps) {
  useEffect(
    () => () => {
      if (preview?.isLocal) URL.revokeObjectURL(preview.url)
    },
    [preview]
  )

  return (
    <ModalComponent
      title={
        <span
          className='block truncate pr-8'
          title={preview?.name}
        >
          {preview?.name ?? 'Xem tệp'}
        </span>
      }
      open={Boolean(preview)}
      onCancel={onClose}
      footer={null}
      width={1440}
      styles={{ body: { maxHeight: 'none', overflowY: 'hidden' } }}
      modalText={
        preview ? (
          <div className='flex h-[min(76vh,800px)] min-h-64 w-full items-center justify-center overflow-hidden rounded-md bg-muted/50'>
            {preview.isImage ? (
              <ImageComponent
                src={preview.url}
                alt={preview.name}
                preview={false}
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className='block max-h-full max-w-full object-contain'
              />
            ) : (
              <iframe
                title={`Xem PDF ${preview.name}`}
                src={preview.url}
                className='h-full w-full border-0'
              />
            )}
          </div>
        ) : null
      }
    />
  )
}

interface UploadFileThumbnailProps {
  file: UploadFile
  resolveFileUrl?: (file: UploadFile) => Promise<string>
}

export function UploadFileThumbnail({
  file,
  resolveFileUrl
}: UploadFileThumbnailProps) {
  const [url, setUrl] = useState<string>()
  const { uid, name, type, originFileObj } = file
  const isImage = isImageFile(file)

  useEffect(() => {
    if (!isImage) return
    let active = true
    let localUrl: string | undefined
    if (originFileObj) {
      localUrl = URL.createObjectURL(originFileObj)
      const nextUrl = localUrl
      queueMicrotask(() => {
        if (active) setUrl(nextUrl)
      })
    } else if (resolveFileUrl) {
      resolveFileUrl({ uid, name, type })
        .then((resolvedUrl) => {
          if (active) setUrl(resolvedUrl)
        })
        .catch(() => {
          if (active) setUrl(undefined)
        })
    }

    return () => {
      active = false
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [isImage, uid, name, type, originFileObj, resolveFileUrl])

  if (!isImage) {
    return (
      <FileDoneOutlined
        aria-hidden
        className='text-xl text-danger-strong'
      />
    )
  }

  return url || file.url ? (
    <ImageComponent
      src={url || file.url}
      alt=''
      preview={false}
      className='size-12 rounded-md object-cover'
    />
  ) : (
    <ImageBrokenIcon
      aria-hidden
      size={22}
      className='text-muted-foreground'
    />
  )
}

export type { PreviewState }
