import { useState } from 'react'
import {
  useGetEscrowOrderDocumentReadUrlMutation,
  useGetEscrowOrderQuery
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { Image } from 'antd'
import { ButtonComponent, DrawerComponent } from '@components/index'
import { formatCurrency, formatFileSize } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ESCROW_ORDER_STATUS_LABEL,
  ESCROW_SOURCE_LABEL
} from '../constants/merchantEscrow.constants'
import type {
  EscrowDocumentRef,
  EscrowOrder
} from '../types/merchantEscrow.types'
import { formatLocalDate } from '../utils/escrowOrder.schema'
import { EscrowLoadError } from './EscrowLoadError'
import { EscrowOrderDecisionPanel } from './EscrowOrderDecisionPanel'
import { EscrowOrderImpactTable } from './EscrowOrderImpactTable'

const money = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : formatCurrency(value)

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className='flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-b-0'>
    <dt className='text-muted-foreground'>{label}</dt>
    <dd className='text-right font-medium break-all tabular-nums'>{value}</dd>
  </div>
)

function OrderFields({
  order,
  subLabel
}: {
  order: EscrowOrder
  subLabel: string
}) {
  const bank = order.source === 'BANK_TRANSFER'
  return (
    <dl>
      <Field
        label='Trạng thái'
        value={ESCROW_ORDER_STATUS_LABEL[order.status] ?? order.status}
      />
      <Field
        label='Nguồn tiền'
        value={ESCROW_SOURCE_LABEL[order.source] ?? order.source}
      />
      <Field
        label='Số tiền'
        value={money(order.amount)}
      />
      {bank ? (
        <>
          <Field
            label='Tài khoản nhận'
            value={order.receivingAccountRef ?? '—'}
          />
          <Field
            label='Mã tham chiếu chuyển khoản'
            value={order.transferReference ?? '—'}
          />
          <Field
            label='Ngày ngân hàng ghi có'
            value={formatLocalDate(order.creditedOn)}
          />
        </>
      ) : (
        <>
          <Field
            label='Sub-merchant nguồn'
            value={subLabel}
          />
          <Field
            label='Đã giữ chỗ số dư Sub'
            value={order.reserved ? 'Có' : 'Chưa'}
          />
        </>
      )}
      {order.overfundedBy > 0 && (
        <Field
          label='Nạp vượt mức yêu cầu'
          value={money(order.overfundedBy)}
        />
      )}
      <Field
        label='Ghi chú'
        value={order.note ?? '—'}
      />
      {/* BE chỉ trả mã người dùng, chưa có tên người lập/người duyệt. */}
      <Field
        label='Người lập'
        value={order.authorId ?? '—'}
      />
      <Field
        label='Lúc tạo'
        value={formatUTCToLocalDateTime(order.createdAt)}
      />
      <Field
        label='Người quyết định'
        value={order.approverId ?? '—'}
      />
      <Field
        label='Lúc quyết định'
        value={formatUTCToLocalDateTime(order.decidedAt) || '—'}
      />
      <Field
        label='Lý do quyết định'
        value={order.decisionReason ?? '—'}
      />
    </dl>
  )
}

/**
 * Danh sách chứng từ của lệnh. Mỗi lần bấm "Xem" xin một link mới (sống 5 phút, BE ghi nhật ký người
 * xem). Ảnh xem trước ngay trong màn (SRS 3.6.29 STT 14, NFR-MER-0629-04); tệp khác (PDF) mở tab mới.
 * Chứng từ của lệnh lập trước khi BE lưu lâu dài trả 404 kèm câu giải thích: hiện nguyên câu đó thay
 * vì mở link hỏng.
 */
function OrderDocuments({
  orderId,
  documents
}: {
  orderId: string
  documents: EscrowDocumentRef[]
}) {
  const [readUrl] = useGetEscrowOrderDocumentReadUrlMutation()
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const open = async (doc: EscrowDocumentRef) => {
    setError('')
    setOpening(doc.fileRef)
    try {
      const { url } = await readUrl({ id: orderId, fileId: doc.fileRef }).unwrap()
      if (doc.contentType.startsWith('image/')) setPreviewUrl(url)
      else window.open(url, '_blank', 'noopener')
    } catch (failure) {
      setError(getApiErrorDetail(failure, `Không mở được ${doc.fileName}`))
    } finally {
      setOpening(null)
    }
  }

  return (
    <section className='flex flex-col gap-2'>
      <h3 className='text-sm font-semibold'>Chứng từ đính kèm</h3>
      {documents.length === 0 ? (
        <p className='text-sm text-muted-foreground'>Không có chứng từ.</p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {documents.map((doc) => (
            <li
              key={doc.fileRef}
              className='flex items-center gap-3 rounded-lg border border-border p-2 text-sm'
            >
              <span className='min-w-0 flex-1'>
                <span
                  className='block truncate font-medium'
                  title={doc.fileName}
                >
                  {doc.fileName}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {formatFileSize(doc.sizeBytes)}
                </span>
              </span>
              <ButtonComponent
                type='default'
                size='small'
                htmlType='button'
                content='Xem'
                aria-label={`Xem ${doc.fileName}`}
                loading={opening === doc.fileRef}
                onClick={() => void open(doc)}
              />
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p
          role='status'
          className='rounded-md bg-danger/10 p-2 text-sm text-danger-strong'
        >
          {error}
        </p>
      )}
      {/* Ảnh ẩn chỉ để dùng khung xem trước (phóng to, xoay) của antd. */}
      {previewUrl && (
        <Image
          className='hidden'
          src={previewUrl}
          alt='Chứng từ đính kèm'
          preview={{
            visible: true,
            src: previewUrl,
            onVisibleChange: (visible) => {
              if (!visible) setPreviewUrl(null)
            }
          }}
        />
      )}
    </section>
  )
}

interface EscrowOrderDetailDrawerProps {
  orderId: string | null
  /** Nhãn hiển thị của Sub nguồn theo id (tab đã tải danh sách Sub của Master). */
  subLabelOf: (subMerchantId: string | null) => string
  onClose: () => void
}

/**
 * Chi tiết một lệnh nạp ký quỹ. Dùng chung cho tab lệnh nạp của Master và hàng chờ phê duyệt; khối
 * Duyệt/Từ chối/Trả lại (SRS 3.6.29) tự ẩn khi người xem không có quyền duyệt hoặc lệnh không còn chờ.
 */
export function EscrowOrderDetailDrawer({
  orderId,
  subLabelOf,
  onClose
}: EscrowOrderDetailDrawerProps) {
  const query = useGetEscrowOrderQuery(orderId ?? '', { skip: !orderId })
  const view = query.data
  const order = view?.order

  return (
    <DrawerComponent
      open={orderId !== null}
      onClose={onClose}
      width={560}
      destroyOnHidden
      title={order ? `Lệnh nạp ${order.orderCode}` : 'Lệnh nạp ký quỹ'}
    >
      {query.isError && (
        <EscrowLoadError
          error={query.error}
          fallback='Không tải được lệnh nạp ký quỹ.'
          onRetry={() => void query.refetch()}
        />
      )}
      {view && order && (
        <div className='flex flex-col gap-4'>
          {/* Ghi sổ thất bại sau khi duyệt (vd. Wallet Core từ chối) là việc kế toán phải xử lý ngay. */}
          {order.failureReason && (
            <p
              role='alert'
              className='rounded-lg border border-danger-strong/30 bg-danger/10 p-3 text-sm font-medium text-danger-strong'
            >
              Lỗi xử lý: {order.failureReason}
            </p>
          )}
          {order.stale && (
            <p className='rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-strong'>
              Lệnh chờ duyệt quá 7 ngày
              {order.source === 'SUB_REVENUE'
                ? '; tiền của Sub-merchant đang bị giữ chỗ.'
                : '.'}
            </p>
          )}
          <OrderFields
            order={order}
            subLabel={subLabelOf(order.subMerchantId)}
          />
          <EscrowOrderImpactTable impact={view.impact} />
          {order.source === 'BANK_TRANSFER' && (
            <OrderDocuments
              orderId={order.id}
              documents={order.documents}
            />
          )}
          <EscrowOrderDecisionPanel view={view} />
        </div>
      )}
    </DrawerComponent>
  )
}
