import { useState } from 'react'
import { ImageComponent } from '@components/index'
import type { EvidenceImage } from '@type/apiResponseEKYC'

interface EkycEvidenceThumbProps {
  label: string
  caption: string
  image?: EvidenceImage
}

export const EkycEvidenceThumb = ({
  label,
  caption,
  image
}: EkycEvidenceThumbProps) => {
  // Link S3 ký sẵn chỉ sống vài phút; lỗi tải gần như luôn là link đã hết hạn.
  const [failedUrl, setFailedUrl] = useState<string>()
  const [mountedAt] = useState(() => Date.now())
  const url = image?.url ?? undefined
  const isExpired =
    Boolean(url) &&
    (failedUrl === url ||
      Boolean(image?.expiresAt && Date.parse(image.expiresAt) <= mountedAt))

  const placeholder = isExpired ? 'Ảnh đã hết hạn, tải lại trang' : label

  return (
    <div className='flex min-w-0 flex-1 flex-col items-center gap-2'>
      <div className='flex h-24 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-[12px] text-muted-foreground'>
        {url && !isExpired ? (
          <ImageComponent
            src={url}
            alt={caption}
            rootClassName='size-full'
            className='size-full object-contain'
            preview={{ mask: 'Phóng to' }}
            onError={() => setFailedUrl(url)}
          />
        ) : (
          <span className='px-2 text-center'>{placeholder}</span>
        )}
      </div>
      <span className='text-xs text-muted-foreground'>{caption}</span>
    </div>
  )
}
