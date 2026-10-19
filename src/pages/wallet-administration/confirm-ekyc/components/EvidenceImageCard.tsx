import { useState } from 'react'
import {
  ArrowsCounterClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ImageBrokenIcon
} from '@components/icons'
import { ButtonComponent, ImageComponent } from '@components/index'

interface EvidenceImageCardProps {
  title: string
  description: string
  url?: string
  expired?: boolean
  onReload?: () => void
  /** Có truyền thì hiện nút chuyển sang ảnh trước/sau ngay trên khung ảnh. */
  onPrev?: () => void
  onNext?: () => void
}

const NAV_BUTTON_CLASS =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl border border-border bg-background/90 text-foreground transition-colors hover:border-primary hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function EvidenceImageCard({
  title,
  description,
  url,
  expired = false,
  onReload,
  onPrev,
  onNext
}: EvidenceImageCardProps) {
  // Link S3 ký sẵn hết hạn sau vài phút; lỗi tải gần như luôn là link đã hết hạn.
  const [failedUrl, setFailedUrl] = useState<string>()
  const isExpired = expired || (Boolean(url) && failedUrl === url)

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
        {onPrev && (
          <button
            type='button'
            aria-label='Ảnh trước'
            onClick={onPrev}
            className={`${NAV_BUTTON_CLASS} left-2`}
          >
            <CaretLeftIcon
              aria-hidden
              size={16}
            />
          </button>
        )}
        {onNext && (
          <button
            type='button'
            aria-label='Ảnh tiếp theo'
            onClick={onNext}
            className={`${NAV_BUTTON_CLASS} right-2`}
          >
            <CaretRightIcon
              aria-hidden
              size={16}
            />
          </button>
        )}
      </div>
    </figure>
  )
}
