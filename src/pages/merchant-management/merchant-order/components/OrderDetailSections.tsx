import type { ReactNode } from 'react'
import { CopyableText } from '@components/index'
import { BANK_LABELS } from '../constants/merchantOrder.constants'
import type { MerchantOrder } from '../types/merchantOrder.types'
import {
  formatOrderDateTime,
  formatOrderMoney,
  isFeeFinal
} from '../utils/merchantOrder.utils'
import { OrderStatusTag } from './OrderStatusTag'

interface RowProps {
  label: string
  children: ReactNode
}

function Row({ label, children }: RowProps) {
  return (
    <div className='grid grid-cols-3 gap-2 py-1.5 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='col-span-2 min-w-0 break-words text-foreground'>
        {children || '—'}
      </dd>
    </div>
  )
}

function Copy({ value }: { value?: string | null }) {
  return value ? (
    <CopyableText
      value={value}
      className='text-sm font-normal text-foreground'
    />
  ) : null
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mb-4'>
      <h3 className='mb-1 border-b border-border pb-1 font-display text-sm font-semibold text-foreground'>
        {title}
      </h3>
      <dl>{children}</dl>
    </section>
  )
}

/** Thông tin chung, thanh toán và phí/ghi có của một đơn. */
export function OrderDetailSections({ order }: { order: MerchantOrder }) {
  const feeNote = isFeeFinal(order) ? '' : ' (ước tính)'
  return (
    <>
      <Section title='Thông tin đơn'>
        <Row label='Mã đơn'>{order.orderCode}</Row>
        <Row label='Trạng thái'>
          <OrderStatusTag status={order.status} />
        </Row>
        <Row label='Mô tả'>{order.orderDescription}</Row>
        <Row label='Số tiền'>{formatOrderMoney(order.amount)}</Row>
        <Row label={`Phí${feeNote}`}>{formatOrderMoney(order.feeAmount)}</Row>
        <Row label={`Merchant nhận${feeNote}`}>
          {formatOrderMoney(order.netAmount)}
        </Row>
        <Row label='Ngân hàng'>
          {BANK_LABELS[order.bankCode] ?? order.bankCode}
        </Row>
        <Row label='Hạn thanh toán'>{formatOrderDateTime(order.expiredAt)}</Row>
        <Row label='Tạo lúc'>{formatOrderDateTime(order.createdAt)}</Row>
        <Row label='Cập nhật lúc'>{formatOrderDateTime(order.updatedAt)}</Row>
      </Section>
      <Section title='Merchant'>
        <Row label='Merchant'>
          {order.merchantName}
          {order.merchantCode ? ` (${order.merchantCode})` : ''}
        </Row>
        <Row label='Sub-merchant'>
          <Copy value={order.subMerchantId} />
        </Row>
        <Row label='Terminal'>
          <Copy value={order.terminalId} />
        </Row>
        <Row label='Sổ doanh thu'>{order.sourceLedgerVersion}</Row>
      </Section>
      <PaymentSection order={order} />
      <Section title='Ghi có'>
        <Row label='Mã giao dịch'>{order.transactionCode}</Row>
        <Row label='Bút toán'>{order.journalId}</Row>
        <Row label='Giao dịch ví'>{order.creditTransactionId}</Row>
        <Row label='Mã tính phí'>{order.feeCalculationId}</Row>
        <Row label='Chính sách phí'>{order.feePolicyId}</Row>
        <Row label='Mã phí'>{order.feeCode}</Row>
        <Row label='Phiên bản phí'>
          {order.feePolicyVersion
            ? formatOrderDateTime(order.feePolicyVersion)
            : ''}
        </Row>
        <Row label='Lý do chưa ghi có'>{order.creditFailureReason}</Row>
      </Section>
    </>
  )
}

function PaymentSection({ order }: { order: MerchantOrder }) {
  const va = order.virtualAccount
  const qr = order.qrCode ?? va?.qrCode
  return (
    <Section title='Phương tiện thanh toán'>
      <Row label='Số TK định danh'>{va?.virtualAccountNo}</Row>
      <Row label='Tên TK / người thụ hưởng'>
        {va?.virtualAccountName ?? order.paymentName}
      </Row>
      <Row label='Mã tham chiếu (VCB)'>{order.paymentRef}</Row>
      <Row label='Nội dung QR'>
        <Copy value={qr} />
        {!qr && (
          <span className='text-xs text-muted-foreground'>
            Chỉ có khi đơn còn chờ thanh toán.
          </span>
        )}
      </Row>
    </Section>
  )
}
