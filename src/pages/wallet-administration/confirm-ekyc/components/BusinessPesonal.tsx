import { useEffect, useState } from 'react'
import type { ContentEKYC, EvidenceImage } from '@type/apiResponseEKYC'
import { ImageComponent } from '@components/index'
import { cn } from '@lib/utils/cn'
import dayjs from 'dayjs'
import { EvidenceImageCard } from './EvidenceImageCard'

interface BusinessPesonalProps {
  attempts?: readonly ContentEKYC[]
  /** Phiên đang hiển thị OCR; ảnh lấy từ lần khác thì ghi rõ để khỏi nhầm. */
  ocrSessionId?: string
  selectedSessionId?: string
  onReload?: () => void
}

const findUrl = (images: EvidenceImage[], type: string, now: number) =>
  images.find(
    (image) =>
      image.type === type &&
      (!image.expiresAt || Date.parse(image.expiresAt) > now)
  )?.url ?? undefined

// Lần mới nhất có thể đang dở dang chưa có ảnh; lấy lần mới nhất đã có ảnh.
const pickEvidenceAttempt = (attempts: readonly ContentEKYC[]) =>
  attempts.find((attempt) => attempt.evidenceImages?.length)

const EVIDENCE_ITEMS = [
  {
    type: 'FRONT',
    title: 'CCCD mặt trước',
    description: 'Ảnh chân dung và thông tin định danh'
  },
  {
    type: 'BACK',
    title: 'CCCD mặt sau',
    description: 'Ngày cấp và đặc điểm nhận dạng'
  },
  {
    type: 'FACE_FAR',
    title: 'Ảnh chân dung',
    description: 'Đối chiếu với giấy tờ'
  }
] as const

type EvidenceType = (typeof EVIDENCE_ITEMS)[number]['type']

const BusinessPesonal = ({
  attempts = [],
  ocrSessionId,
  selectedSessionId,
  onReload
}: BusinessPesonalProps) => {
  const attempt = selectedSessionId
    ? attempts.find((item) => item.sessionId === selectedSessionId)
    : pickEvidenceAttempt(attempts)
  const images = attempt?.evidenceImages ?? []
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const capturedAt = attempt?.completedAt ?? attempt?.createdAt
  const isOtherAttempt = Boolean(attempt) && attempt?.sessionId !== ocrSessionId
  const attemptKey = attempt?.sessionId ?? attempt?.createdAt ?? ''
  const [selection, setSelection] = useState<{
    attemptKey: string
    type: EvidenceType
  } | null>(null)
  const selectedType =
    selection?.attemptKey === attemptKey
      ? selection.type
      : (EVIDENCE_ITEMS.find((item) => findUrl(images, item.type, now))?.type ??
        'FRONT')
  const selectedImage = EVIDENCE_ITEMS.find(
    (item) => item.type === selectedType
  )!
  const selectedEvidence = images.find((image) => image.type === selectedType)
  const selectedIndex = EVIDENCE_ITEMS.indexOf(selectedImage)
  // Vòng tròn: ảnh cuối bấm "tiếp" quay về ảnh đầu.
  const handleStep = (offset: number) => {
    const total = EVIDENCE_ITEMS.length
    const next = EVIDENCE_ITEMS[(selectedIndex + offset + total) % total]
    setSelection({ attemptKey, type: next.type })
  }
  const selectedExpired = Boolean(
    selectedEvidence?.expiresAt && Date.parse(selectedEvidence.expiresAt) <= now
  )

  return (
    <div className='flex min-w-0 flex-col gap-3'>
      {isOtherAttempt && capturedAt && (
        <p className='text-xs text-muted-foreground'>
          Ảnh lấy từ lần thực hiện lúc{' '}
          {dayjs.utc(capturedAt).format('DD/MM/YYYY HH:mm')}.
        </p>
      )}
      <EvidenceImageCard
        title={selectedImage.title}
        description={selectedImage.description}
        url={findUrl(images, selectedType, now)}
        expired={selectedExpired}
        onReload={onReload}
        onPrev={() => handleStep(-1)}
        onNext={() => handleStep(1)}
      />
      <div
        className='grid grid-cols-3 gap-2'
        aria-label='Chọn ảnh bằng chứng'
      >
        {EVIDENCE_ITEMS.map((item) => {
          const url = findUrl(images, item.type, now)
          const isSelected = item.type === selectedType

          return (
            <button
              key={item.type}
              type='button'
              aria-label={`Xem ${item.title}`}
              aria-pressed={isSelected}
              onClick={() => setSelection({ attemptKey, type: item.type })}
              className={cn(
                'flex min-w-0 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                isSelected
                  ? 'border-foreground bg-primary/10'
                  : 'border-border bg-background hover:border-primary'
              )}
            >
              <span className='flex h-14 w-full items-center justify-center overflow-hidden rounded-md bg-muted'>
                {url ? (
                  <ImageComponent
                    src={url}
                    alt=''
                    preview={false}
                    rootClassName='size-full'
                    className='size-full object-contain'
                  />
                ) : (
                  <span className='text-center text-xs text-muted-foreground'>
                    Chưa có ảnh
                  </span>
                )}
              </span>
              <span className='text-xs font-medium leading-4 text-foreground'>
                {item.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BusinessPesonal
