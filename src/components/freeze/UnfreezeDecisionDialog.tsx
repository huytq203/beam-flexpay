import { ShieldCheckIcon, XCircleIcon } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'
import {
  FREEZE_TYPE_LABEL,
  type FreezeType
} from '@constants/freeze.constant'
import {
  UnfreezeDecision,
  type UnfreezeDecisionDialogState
} from '@hooks/useUnfreezeApproval'
import { formatCurrency } from '@utils/formatNumber'
import { getFreezeAmountSummary } from '@utils/freeze'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'

const DECISION_COPY = {
  [UnfreezeDecision.APPROVE]: {
    title: 'Phê duyệt lệnh mở băng',
    icon: <ShieldCheckIcon size={18} />,
    titleClassName: 'text-secondary-foreground',
    confirmLabel: 'Xác nhận duyệt',
    consequenceClassName: 'bg-warning/10 text-warning-strong'
  },
  [UnfreezeDecision.REJECT]: {
    title: 'Từ chối lệnh mở băng',
    icon: <XCircleIcon size={18} />,
    titleClassName: 'text-danger-strong',
    confirmLabel: 'Xác nhận từ chối',
    consequenceClassName: 'bg-muted text-muted-foreground'
  }
} as const

interface DetailRowProps {
  label: string
  children: ReactNode
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <dt className="shrink-0 text-muted-foreground">{label}</dt>
    <dd className="text-right font-medium break-words">{children}</dd>
  </div>
)

export const UnfreezeDecisionDialog = ({
  open,
  decision,
  item,
  loading,
  onConfirm,
  onCancel
}: UnfreezeDecisionDialogState) => {
  if (!decision || !item) return null

  const copy = DECISION_COPY[decision]
  const { held, shortfall } = getFreezeAmountSummary(item)
  const ownerName = item.ownerUsername ?? '--'
  const isApprove = decision === UnfreezeDecision.APPROVE

  return (
    <DialogModal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={null}
      title={
        <span className={`flex items-center gap-2 ${copy.titleClassName}`}>
          {copy.icon}
          {copy.title}
        </span>
      }
      content={
        <div>
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="text-muted-foreground">Số tiền đang bị giữ</p>
            <p className="amount-caution text-2xl font-semibold tabular-nums">
              {formatCurrency(held, { symbol: 'VNĐ', position: 'after' })}
            </p>
            {shortfall > 0 && (
              <p className="amount-negative mt-1 text-[12px] font-medium">
                Còn thiếu{' '}
                {formatCurrency(shortfall, { symbol: 'VNĐ', position: 'after' })}{' '}
                chưa giữ được
              </p>
            )}
          </div>

          <dl className="mt-3 divide-y divide-border">
            <DetailRow label="Khách hàng">{ownerName}</DetailRow>
            <DetailRow label="Loại đóng băng">
              {FREEZE_TYPE_LABEL[item.type as FreezeType] ?? item.type}
            </DetailRow>
            <DetailRow label="Lý do đóng băng">{item.reason || '--'}</DetailRow>
            <DetailRow label="Thời gian tạo">
              {item.createdAt
                ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')
                : '--'}
            </DetailRow>
          </dl>

          <div className={`mt-3 rounded-md p-3 ${copy.consequenceClassName}`}>
            {isApprove ? (
              <p>
                Duyệt lệnh sẽ chuyển tiền từ{' '}
                <span className="underline">Ví Đóng Băng</span> về{' '}
                <span className="underline">Ví Khả Dụng</span> của tài khoản{' '}
                <span className="font-medium">{ownerName}</span>. Người duyệt
                phải khác người tạo lệnh và thao tác này không hoàn tác được.
              </p>
            ) : (
              <p>
                Từ chối lệnh thì không đồng nào rời{' '}
                <span className="underline">Ví Đóng Băng</span>. Người tạo lệnh
                có thể gửi lại yêu cầu mở băng khác sau đó.
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <ButtonComponent type="default" content="Hủy" onClick={onCancel} />
            <ButtonComponent
              onClick={onConfirm}
              loading={loading}
              color={isApprove ? undefined : 'danger'}
              variant={isApprove ? undefined : 'solid'}
              content={copy.confirmLabel}
            />
          </div>
        </div>
      }
    />
  )
}
