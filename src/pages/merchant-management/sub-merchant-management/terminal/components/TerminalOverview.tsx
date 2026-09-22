import { Link } from 'react-router-dom'

import { SCREENS } from '@/app/permissions'

import type { TerminalRow } from '../types/terminal.type'
import { getTerminalTypeLabel } from '../utils/terminal.utils'

interface TerminalOverviewProps {
  record: TerminalRow
}

const DetailItem = ({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className='min-w-0 space-y-1'>
    <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
    <dd className='break-words text-sm font-medium text-foreground'>
      {children}
    </dd>
  </div>
)

export function TerminalOverview({ record }: TerminalOverviewProps) {
  return (
    <section
      aria-labelledby='terminal-overview-title'
      className='space-y-4'
    >
      <div className='border-b border-border pb-2'>
        <h2
          id='terminal-overview-title'
          className='font-display text-sm font-semibold text-foreground'
        >
          Thông tin Terminal
        </h2>
        <p className='mt-1 text-xs text-muted-foreground'>
          Định danh, vị trí và tuyến quản lý của điểm chấp nhận thanh toán.
        </p>
      </div>
      <dl className='grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3'>
        <DetailItem label='Terminal ID'>
          <span className='tabular-nums'>{record.tid}</span>
        </DetailItem>
        <DetailItem label='Loại Terminal'>
          {getTerminalTypeLabel(record.type)}
        </DetailItem>
        <DetailItem label='Điện thoại'>
          {record.phone || 'Chưa cập nhật'}
        </DetailItem>
        <DetailItem label='Merchant cha'>
          {record.parentMerchantName}
          <span className='ml-2 text-xs text-muted-foreground'>
            {record.parentMerchantCode}
          </span>
        </DetailItem>
        <DetailItem label='Sub-merchant cha'>
          <Link
            className='underline decoration-border underline-offset-4 hover:text-secondary-foreground focus-visible:outline-2 focus-visible:outline-primary'
            to={`${SCREENS.MERCHANT_SUB_MERCHANT.path}/detail/${record.subMerchantId}`}
          >
            {record.subMerchantName} · {record.subMerchantCode}
          </Link>
        </DetailItem>
        <DetailItem label='Cập nhật gần nhất'>
          <span className='tabular-nums'>{record.updatedAt}</span>
        </DetailItem>
        <div className='sm:col-span-2 xl:col-span-3'>
          <DetailItem label='Địa chỉ'>{record.address}</DetailItem>
        </div>
        <div className='sm:col-span-2 xl:col-span-3'>
          <DetailItem label='Ghi chú'>
            {record.note || 'Không có ghi chú'}
          </DetailItem>
        </div>
      </dl>
    </section>
  )
}
