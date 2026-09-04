import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@phosphor-icons/react'
import type { TransitStation } from '../types/transit'

interface StationLinkProps {
  station: TransitStation
}

/**
 * Một ga trên dải tuyến: điểm dừng thật, nên nó là `Link` thật — bấm được,
 * tab tới được, và mang đúng nhãn in trên bản đồ.
 */
export function StationLink({ station }: StationLinkProps) {
  return (
    <li data-portal-station>
      <Link
        to={station.to}
        className='station-link group relative flex items-center gap-3 rounded-md py-0.5 pl-9 pr-2 text-[13px] leading-5 outline-none transition-colors duration-200 hover:bg-portal-plate focus-visible:ring-2 focus-visible:ring-primary'
      >
        <span
          aria-hidden
          className='absolute left-[13px] size-[9px] rounded-full border-[2.5px] border-[var(--line)] bg-portal-plate transition-transform duration-200 group-hover:scale-125'
        />
        <span className='min-w-0 flex-1 truncate'>{station.label}</span>
        <ArrowRightIcon
          aria-hidden
          size={14}
          weight='bold'
          className='shrink-0 -translate-x-1 text-portal-ink-soft opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
        />
      </Link>
    </li>
  )
}
