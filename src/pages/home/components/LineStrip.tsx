import type { CSSProperties } from 'react'
import type { TransitLine } from '../types/transit'
import { StationLink } from './StationLink'

interface LineStripProps {
  line: TransitLine
  isMuted: boolean
  onFocus: (lineId: string | null) => void
}

/**
 * Sơ đồ dải tuyến — đúng thứ dán trong toa tàu: một thanh ray màu chạy dọc,
 * các ga bám vào nó theo thứ tự. Đây là menu chính của màn hình, không phải
 * chú giải trang trí cho mô hình 3D.
 */
export function LineStrip({ line, isMuted, onFocus }: LineStripProps) {
  return (
    <section
      data-portal-line
      /*
       * Trạng thái câm lùi về màu xám của bảng chứ không mờ đi: bốn tuyến còn
       * lại vẫn phải là điều hướng đọc được, không phải một lớp ma. Đổi hai biến
       * màu là đủ để thanh ray, đĩa ga, huy hiệu và chữ cùng lùi một nhịp.
       */
      style={
        {
          '--line': isMuted
            ? 'var(--portal-dim)'
            : `var(--line-${line.token})`,
          '--line-ink': isMuted
            ? 'var(--portal-ink-soft)'
            : `var(--line-${line.token}-ink)`
        } as CSSProperties
      }
      className='relative [&_*]:transition-colors [&_*]:duration-300'
      onMouseEnter={() => onFocus(line.id)}
      onMouseLeave={() => onFocus(null)}
      onFocus={() => onFocus(line.id)}
      onBlur={() => onFocus(null)}
      aria-labelledby={`line-${line.token}`}
    >
      <span
        aria-hidden
        className='absolute bottom-2.5 left-4 top-3.5 w-[3px] rounded-full bg-[var(--line)]'
      />

      <header className='relative flex items-start gap-3 pl-9'>
        <span
          aria-hidden
          className='absolute left-[9px] top-[3px] size-[17px] rounded-full border-[3px] border-[var(--line)] bg-portal-plate'
        />
        <div className='min-w-0 flex-1'>
          <h2
            id={`line-${line.token}`}
            className={`font-signage text-[15px] font-bold uppercase leading-5 tracking-[0.06em] ${isMuted ? 'text-portal-ink-soft' : 'text-portal-ink'}`}
          >
            {line.label}
          </h2>
          <p className='mt-0.5 text-[12px] leading-4 text-portal-ink-soft'>
            {line.description}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          {line.elevatedRisk && (
            <span className='rounded-[3px] px-1.5 py-0.5 font-signage text-[10px] font-bold uppercase leading-4 tracking-[0.1em] text-[var(--line-ink)] ring-1 ring-inset ring-[var(--line)]'>
              Kiểm soát
            </span>
          )}
          <span
            aria-hidden
            className='rounded-[3px] bg-[var(--line-ink)] px-1.5 py-0.5 font-signage text-[11px] font-bold leading-4 tracking-[0.1em] text-white'
          >
            {line.code}
          </span>
        </div>
      </header>

      <ul className='mt-1'>
        {line.stations.map((station) => (
          <StationLink
            key={station.id}
            station={station}
          />
        ))}
      </ul>
    </section>
  )
}
