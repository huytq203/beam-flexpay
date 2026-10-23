import type { ReactNode } from 'react'
import { CopyableText } from '@components/index'
import {
  formatOrderDateTime,
  formatOrderMoney
} from '../../merchant-order/utils/merchantOrder.utils'
import { SETTLEMENT_INTEGRITY_CHECKS } from '../constants/settlementItem.constants'
import type { SettlementItemDetail } from '../types/settlementItem.types'
import { formatSnapshotValue } from '../utils/settlementItem.utils'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid grid-cols-3 gap-2 py-1.5 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='col-span-2 min-w-0 break-words text-foreground'>
        {children || '—'}
      </dd>
    </div>
  )
}

export function DetailSection({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className='mb-4'>
      <h3 className='mb-1 border-b border-border pb-1 font-display text-sm font-semibold text-foreground'>
        {title}
      </h3>
      {children}
    </section>
  )
}

const copy = (value: string) => (
  <CopyableText
    value={value}
    className='text-sm font-normal text-foreground'
  />
)

/** `false` ở bất kỳ cờ nào là dấu hiệu dữ liệu hỏng, cần cảnh báo. */
export function IntegrityChecks({ item }: { item: SettlementItemDetail }) {
  const failed = SETTLEMENT_INTEGRITY_CHECKS.filter(({ key }) => !item[key])
  return (
    <DetailSection title='Kiểm tra toàn vẹn'>
      {failed.length > 0 && (
        <div
          role='alert'
          className='mb-2 rounded-lg border border-danger-strong/30 p-2 text-sm text-danger-strong'
        >
          Dữ liệu mục quyết toán có dấu hiệu không toàn vẹn, cần kiểm tra lại
          với bộ phận kỹ thuật.
        </div>
      )}
      <ul className='space-y-1 text-sm'>
        {SETTLEMENT_INTEGRITY_CHECKS.map(({ key, label }) => (
          <li
            key={key}
            className={item[key] ? 'text-foreground' : 'text-danger-strong'}
          >
            {item[key] ? 'Đạt' : 'Không đạt'}: {label}
          </li>
        ))}
      </ul>
    </DetailSection>
  )
}

export function SettlementItemInfo({ item }: { item: SettlementItemDetail }) {
  return (
    <>
      <DetailSection title='Thông tin thanh toán'>
        <dl>
          <Row label='Mã đơn'>{copy(item.orderCode)}</Row>
          <Row label='Id đơn'>{copy(item.orderId)}</Row>
          <Row label='Id Master'>{copy(item.masterId)}</Row>
          <Row label='Id Sub-merchant'>{copy(item.subMerchantId)}</Row>
          <Row label='Id lô tiền (lot)'>{copy(item.lotId)}</Row>
          <Row label='Thanh toán lúc'>{formatOrderDateTime(item.paidAt)}</Row>
          <Row label='Đạt T+N lúc'>
            {formatOrderDateTime(item.tnEligibleAt)}
          </Row>
          <Row label='Hết hạn giữ'>
            {item.heldAmount > 0 ? formatOrderDateTime(item.holdReleaseAt) : ''}
          </Row>
        </dl>
      </DetailSection>
      <DetailSection title='Cấu thành tiền'>
        <dl>
          <Row label='Khách trả'>{formatOrderMoney(item.grossAmount)}</Row>
          <Row label='Phí'>{formatOrderMoney(item.feeAmount)}</Row>
          <Row label='Doanh thu ghi nhận'>
            {formatOrderMoney(item.recognisedAmount)}
          </Row>
          <Row label='Đợt 1'>{formatOrderMoney(item.firstTrancheAmount)}</Row>
          <Row label='Đợt tạm giữ'>{formatOrderMoney(item.heldAmount)}</Row>
        </dl>
      </DetailSection>
    </>
  )
}

/** Ảnh chụp lúc thanh toán (JSON tự do): hiển thị khóa-giá trị, không phụ thuộc cấu trúc. */
export function SnapshotSection({
  title,
  data
}: {
  title: string
  data: Record<string, unknown>
}) {
  const entries = Object.entries(data ?? {})
  return (
    <DetailSection title={title}>
      {entries.length === 0 ? (
        <p className='text-sm text-muted-foreground'>Không có dữ liệu.</p>
      ) : (
        <dl>
          {entries.map(([key, value]) => (
            <Row
              key={key}
              label={key}
            >
              {formatSnapshotValue(value)}
            </Row>
          ))}
        </dl>
      )}
    </DetailSection>
  )
}
