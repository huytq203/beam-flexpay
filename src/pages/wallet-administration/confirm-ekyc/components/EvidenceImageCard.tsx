import { useState } from 'react'
import { ArrowsCounterClockwiseIcon, ImageBrokenIcon } from '@components/icons'
import { ButtonComponent, ImageComponent } from '@components/index'

interface EvidenceImageCardProps {
  title: string
  description: string
  url?: string
  onReload?: () => void
}

export function EvidenceImageCard({
  title,
  description,
  url,
  onReload
}: EvidenceImageCardProps) {
  // Link S3 ký sẵn hết hạn sau vài phút; lỗi tải gần như luôn là link đã hết hạn.
  const [failedUrl, setFailedUrl] = useState<string>()
  const isExpired = Boolean(url) && failedUrl === url

  return (
    <figure className='flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-background p-3'>
      <figcaption className='flex items-baseline justify-between gap-2'>
        <span className='text-sm font-semibold text-foreground'>{title}</span>
        <span className='truncate text-xs text-muted-foreground'>
          {description}
        </span>
      </figcaption>
      <div className='relative flex h-[min(48vh,420px)] min-h-60 w-full items-center justify-center overflow-hidden rounded-lg bg-muted'>
        {url && !isExpired ? (
          <ImageComponent
            src={url}
            alt={title}
            rootClassName='size-full'
            className='size-full object-contain'
            preview={{ mask: 'Phóng to' }}
            onError={() => setFailedUrl(url)}
          />
        ) : (
          <div className='flex flex-col items-center gap-2 px-4 text-center text-muted-foreground'>
            <ImageBrokenIcon
              aria-hidden
              size={28}
            />
            <p className='text-xs'>
              {isExpired
                ? 'Liên kết ảnh đã hết hạn.'
                : 'Lần thực hiện này chưa có ảnh.'}
            </p>
            {isExpired && onReload && (
              <ButtonComponent
                size='small'
                type='default'
                content='Tải lại ảnh'
                icon={
                  <ArrowsCounterClockwiseIcon
                    aria-hidden
                    size={14}
                  />
                }
                onClick={onReload}
              />
            )}
          </div>
        )}
      </div>
    </figure>
  )
}
