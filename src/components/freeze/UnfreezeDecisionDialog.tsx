import { ShieldCheckIcon, XCircleIcon } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'
import {
  FREEZE_TYPE_LABEL,
  UnfreezeCommandStatus,
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
import type { UnfreezeCommand } from '@type/freeze.type'

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

const COMMAND_STATUS_CONFIG: Record<
  UnfreezeCommand['status'],
  { label: string; className: string }
> = {
  [UnfreezeCommandStatus.PENDING_APPROVAL]: {
    label: 'Chờ duyệt',
    className: 'warning-status'
  },
  [UnfreezeCommandStatus.EXECUTED]: {
    label: 'Đã thực hiện',
    className: 'success-status'
  },
  [UnfreezeCommandStatus.REJECTED]: {
    label: 'Đã từ chối',
    className: 'normal-status'
  }
}

const fmt = (v: number) =>
  formatCurrency(v, { symbol: 'VNĐ', position: 'after' })

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
  const commands = item.unfreezeCommands ?? []

  // Lệnh đang chờ duyệt (lệnh hiện tại checker đang xem xét)
  const pendingCommand = commands.find(
    (c) => c.id === item.unfreezeCommandId
  )

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
          {/* Tổng quan số tiền bị giữ */}
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="text-muted-foreground">Số tiền đang bị giữ</p>
            <p className="amount-caution text-2xl font-semibold tabular-nums">
              {fmt(held)}
            </p>
            {shortfall > 0 && (
              <p className="amount-negative mt-1 text-[12px] font-medium">
                Còn thiếu {fmt(shortfall)} chưa giữ được
              </p>
            )}
          </div>

          {/* Thông tin lệnh đang chờ duyệt */}
          {pendingCommand && (
            <div className="mt-3 rounded-md border border-warning/40 bg-warning/5 p-3 space-y-1">
              <p className="text-[12px] font-medium text-warning-strong uppercase tracking-wide">
                Lệnh đang chờ phê duyệt
              </p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[13px]">Số tiền yêu cầu</span>
                <span className="font-semibold tabular-nums">{fmt(pendingCommand.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[13px]">Người tạo (maker)</span>
                <span className="font-medium">{pendingCommand.makerId}</span>
              </div>
              {pendingCommand.reason && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground text-[13px] shrink-0">Lý do</span>
                  <span className="font-medium text-right text-[13px]">{pendingCommand.reason}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[13px]">Thời gian tạo</span>
                <span className="text-[13px]">
                  {pendingCommand.createdAt
                    ? dayjs(pendingCommand.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    : '--'}
                </span>
              </div>
            </div>
          )}

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

          {/* Lịch sử toàn bộ lệnh mở băng */}
          {commands.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Lịch sử yêu cầu mở băng ({commands.length})
              </p>
              <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                {commands.map((cmd, idx) => {
                  const cfg = COMMAND_STATUS_CONFIG[cmd.status]
                  const isPending = cmd.status === UnfreezeCommandStatus.PENDING_APPROVAL
                  return (
                    <div
                      key={cmd.id}
                      className={`flex items-center justify-between gap-3 px-3 py-2 ${isPending ? 'bg-warning/5' : 'bg-muted/20'}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground text-[11px] shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium tabular-nums text-[13px]">
                            {fmt(cmd.amount)}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Maker: {cmd.makerId}
                            {cmd.checkerId ? ` · Checker: ${cmd.checkerId}` : ''}
                            {cmd.reason ? ` · ${cmd.reason}` : ''}
                          </p>
                          {cmd.createdAt && (
                            <p className="text-[11px] text-muted-foreground">
                              {dayjs(cmd.createdAt).format('DD/MM/YYYY HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
