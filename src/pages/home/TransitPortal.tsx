import { useCallback, useEffect, useRef, useState } from 'react'
import { ProhibitInsetIcon } from '@phosphor-icons/react'
import { useTransitMap } from './hooks/useTransitMap'
import { usePortalMotion } from './hooks/usePortalMotion'
import { PortalTopBar } from './components/PortalTopBar'
import { ShiftGreeting } from './components/ShiftGreeting'
import { LineStrip } from './components/LineStrip'
import { NetworkModel } from './components/NetworkModel'
import { NetworkDiagram } from './components/NetworkDiagram'

/**
 * Màn khởi động `/secure-panel` — bản đồ tuyến của mạng lưới FlexPay.
 *
 * Trạng thái dữ liệu ở đây chỉ có hai: có tuyến và không có tuyến. Quyền được
 * giải mã sẵn từ JWT trong `authSlice` lúc khởi tạo store, không phải một lần
 * gọi API, nên màn này không có trạng thái loading hay error để dựng.
 */
export default function TransitPortal() {
  const rootRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLElement | null>(null)
  const { lines, geometry, stationCount } = useTransitMap()
  const [activeLineId, setActiveLineId] = useState<string | null>(null)
  const [modelAvailable, setModelAvailable] = useState(true)

  const handleLineFocus = useCallback(
    (lineId: string | null) => setActiveLineId(lineId),
    []
  )
  const handleModelUnavailable = useCallback(() => setModelAvailable(false), [])

  usePortalMotion({ rootRef, lineCount: lines.length })

  useEffect(() => {
    headingRef.current =
      rootRef.current?.querySelector('[data-portal-heading]') ?? null
    // preventScroll: cột trái cuộn được, nên focus mặc định sẽ kéo nó lệch.
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  if (lines.length === 0) {
    return (
      <div className='relative flex min-h-[100dvh] flex-col items-center justify-center bg-portal-ground px-6 text-center'>
        <PortalTopBar />
        <ProhibitInsetIcon
          aria-hidden
          size={52}
          weight='duotone'
          className='text-portal-ink-soft'
        />
        <h1 className='mt-6 font-signage text-2xl font-extrabold uppercase tracking-[0.04em] text-portal-ink'>
          Chưa có tuyến nào mở
        </h1>
        <p className='mt-3 max-w-[52ch] text-sm leading-6 text-portal-ink-soft'>
          Tài khoản đã đăng nhập nhưng chưa được cấp quyền nghiệp vụ nào, nên
          bản đồ không có tuyến để vẽ. Liên hệ quản trị viên để kiểm tra nhóm
          quyền.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className='relative flex min-h-[100dvh] flex-col bg-portal-ground text-portal-ink lg:h-[100dvh] lg:overflow-hidden'
    >
      <PortalTopBar />

      <div className='grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(340px,36%)_minmax(0,1fr)]'>
        <div className='portal-scroll order-2 flex flex-col px-6 pb-12 pt-6 sm:px-8 lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:pb-5 lg:pt-32'>
          <ShiftGreeting
            lineCount={lines.length}
            stationCount={stationCount}
          />

          <nav
            aria-label='Các phân hệ được cấp quyền'
            className='mt-4 flex flex-col gap-3'
          >
            {lines.map((line) => (
              <LineStrip
                key={line.id}
                line={line}
                isMuted={activeLineId !== null && activeLineId !== line.id}
                onFocus={handleLineFocus}
              />
            ))}
          </nav>
        </div>

        <div className='relative order-1 h-[38dvh] min-h-[260px] lg:order-2 lg:h-auto lg:min-h-0'>
          <div className='hidden size-full lg:block'>
            {modelAvailable ? (
              <NetworkModel
                lines={lines}
                geometry={geometry}
                activeLineId={activeLineId}
                onLineFocus={handleLineFocus}
                onUnavailable={handleModelUnavailable}
              />
            ) : (
              <NetworkDiagram
                lines={lines}
                geometry={geometry}
                activeLineId={activeLineId}
              />
            )}
          </div>

          <div className='size-full px-5 pb-2 pt-16 lg:hidden'>
            <NetworkDiagram
              lines={lines}
              geometry={geometry}
              activeLineId={activeLineId}
              showLabels={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
