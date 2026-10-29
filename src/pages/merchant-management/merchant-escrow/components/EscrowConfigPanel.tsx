import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useCancelEscrowConfigMutation,
  useGetEscrowOverviewQuery
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  feedback
} from '@components/index'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ESCROW_CONFIG_SOURCE_LABEL,
  ESCROW_REQUIREMENT_MODE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowConfig } from '../types/merchantEscrow.types'
import { EscrowConfigForm } from './EscrowConfigForm'

const SCREEN = 'MERCHANT_ESCROW_DETAIL' as const

/** Thông tin đề xuất đang chờ duyệt của Master và nút rút lại đề xuất. */
function PendingProposal({ pending }: { pending: EscrowConfig }) {
  const [cancelProposal, { isLoading }] = useCancelEscrowConfigMutation()
  const [confirming, setConfirming] = useState(false)

  const cancel = async () => {
    try {
      await cancelProposal(pending.id).unwrap()
      feedback.success('Đã hủy đề xuất')
      setConfirming(false)
    } catch (failure) {
      feedback.error(getApiErrorDetail(failure, 'Không hủy được đề xuất'))
    }
  }

  return (
    <section
      aria-label='Đề xuất chờ duyệt'
      className='rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm'
    >
      <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
        <h3 className='font-semibold'>
          Đề xuất chờ duyệt (phiên bản {pending.version})
        </h3>
        <Can
          screen={SCREEN}
          action='update'
        >
          <ButtonComponent
            size='small'
            type='default'
            content='Hủy đề xuất'
            onClick={() => setConfirming(true)}
          />
        </Can>
      </div>
      <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'>
        <dt className='text-muted-foreground'>Mức yêu cầu đề xuất</dt>
        <dd className='tabular-nums'>
          {formatCurrency(pending.requiredAmount)}
        </dd>
        <dt className='text-muted-foreground'>Cách xác định mức</dt>
        <dd>
          {pending.requirementMode
            ? ESCROW_REQUIREMENT_MODE_LABEL[pending.requirementMode]
            : ''}
        </dd>
        <dt className='text-muted-foreground'>Nguồn</dt>
        <dd>{ESCROW_CONFIG_SOURCE_LABEL[pending.source]}</dd>
        <dt className='text-muted-foreground'>Lý do</dt>
        <dd>{pending.reason ?? ''}</dd>
        <dt className='text-muted-foreground'>Ngày đề xuất</dt>
        <dd>{formatUTCToLocalDateTime(pending.createdAt)}</dd>
      </dl>
      <DialogModal
        open={confirming}
        title='Hủy đề xuất cấu hình'
        okText='Hủy đề xuất'
        okButtonProps={{ loading: isLoading, danger: true }}
        onOk={() => void cancel()}
        onCancel={() => setConfirming(false)}
      >
        <p className='text-sm'>
          Đề xuất phiên bản {pending.version} sẽ chuyển sang trạng thái đã hủy
          và cấu hình đang áp dụng giữ nguyên.
        </p>
      </DialogModal>
    </section>
  )
}

/**
 * Panel cấu hình ký quỹ ở chi tiết Master. Mỗi Master chỉ có một đề xuất chờ duyệt tại một thời
 * điểm (BE trả `MERCHANT_ESCROW_PENDING_EXISTS`), nên khi đang có đề xuất thì khóa nút sửa cho
 * tới khi đề xuất được duyệt, từ chối hoặc hủy.
 */
export function EscrowConfigPanel({ masterId }: { masterId: string }) {
  const query = useGetEscrowOverviewQuery(masterId, { skip: !masterId })
  const [editing, setEditing] = useState(false)
  const overview = query.data
  if (!overview) return null
  const { current, pending } = overview

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <header className='mb-3 flex flex-wrap items-center justify-between gap-2'>
        <h2 className='font-display text-base font-semibold'>
          Cấu hình ký quỹ
        </h2>
        {!editing && (
          <Can
            screen={SCREEN}
            action='update'
          >
            <ButtonComponent
              size='small'
              content={current ? 'Sửa cấu hình' : 'Thiết lập cấu hình'}
              disabled={pending !== null}
              onClick={() => setEditing(true)}
            />
          </Can>
        )}
      </header>
      <div className='flex flex-col gap-3'>
        {pending && <PendingProposal pending={pending} />}
        {pending && !editing && (
          <Can
            screen={SCREEN}
            action='update'
          >
            <p className='text-xs text-muted-foreground'>
              Cần duyệt, từ chối hoặc hủy đề xuất đang chờ trước khi lưu thay
              đổi mới.
            </p>
          </Can>
        )}
        {editing && (
          <EscrowConfigForm
            masterId={masterId}
            current={current}
            onClose={() => setEditing(false)}
          />
        )}
      </div>
    </CardComponent>
  )
}
