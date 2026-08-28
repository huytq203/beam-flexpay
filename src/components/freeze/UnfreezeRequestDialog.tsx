import { FormInputNumber, FormRadio, FormTextArea } from '@components/form'
import { SnowflakeIcon, WarningIcon } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'
import { UnfreezeCommandStatus } from '@constants/freeze.constant'
import type { FreezeItem, UnfreezeCommand } from '@type/freeze.type'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'
import { formatCurrency } from '@utils/formatNumber'
import dayjs from 'dayjs'
import { toVnd, UnfreezeAmountMode } from './unfreeze-request.schema'
import { useUnfreezeRequestForm } from './useUnfreezeRequestForm'

interface UnfreezeRequestFormProps {
    item: FreezeItem
    onSuccess?: () => void
    onCancel: () => void
}

interface UnfreezeRequestDialogProps {
    open: boolean
    item: FreezeItem | null
    onSuccess?: () => void
    onCancel: () => void
}

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

/** Bảng lịch sử các lệnh mở băng đã tạo cho bản ghi này. */
const UnfreezeCommandList = ({ commands }: { commands: UnfreezeCommand[] }) => {
    if (commands.length === 0) return null

    return (
        <div className="mt-3">
            <p className="mb-1.5 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                Các yêu cầu mở băng trước đó
            </p>
            <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                {commands.map((cmd, idx) => {
                    const cfg = COMMAND_STATUS_CONFIG[cmd.status]
                    return (
                        <div key={cmd.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/20">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-muted-foreground text-[11px] shrink-0">
                                    #{idx + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-medium tabular-nums text-[13px]">
                                        {formatCurrency(cmd.amount, { symbol: 'VNĐ', position: 'after' })}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        Maker: {cmd.makerId}
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
    )
}

/**
 * Form chỉ được mount khi hộp thoại mở — `destroyOnHidden` của DialogModal lo phần huỷ.
 * Nhờ vậy state form tự sạch sau mỗi lần đóng và hook không chạy khi màn hình chỉ đang
 * hiển thị bảng.
 */
const UnfreezeRequestForm = ({
    item,
    onSuccess,
    onCancel
}: UnfreezeRequestFormProps) => {
    const {
        control,
        unfreezeType,
        remaining,
        shortfall,
        maxAmount,
        availableToRequest,
        isLoading,
        submit
    } = useUnfreezeRequestForm(item, onSuccess)

    const commands = item.unfreezeCommands ?? []

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                submit()
            }}
        >
            {/* Tổng quan số tiền */}
            <div className="rounded-md border border-border bg-muted/40 p-3 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-[13px]">Đang bị giữ</p>
                    <p className="amount-caution text-lg font-semibold tabular-nums">
                        {toVnd(remaining)}
                    </p>
                </div>
                {shortfall > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-[13px]">Còn thiếu chưa giữ được</p>
                        <p className="amount-negative text-[13px] font-medium tabular-nums">
                            {toVnd(shortfall)}
                        </p>
                    </div>
                )}
            </div>

            {/* Lịch sử lệnh cũ */}
            <UnfreezeCommandList commands={commands} />

            <div className="mt-3 flex flex-col gap-3">
                <FormRadio
                    label="Hình thức mở băng"
                    control={control}
                    name="unfreezeType"
                    options={[
                        { value: UnfreezeAmountMode.FULL, label: 'Mở băng toàn bộ' },
                        { value: UnfreezeAmountMode.PARTIAL, label: 'Mở băng một phần' }
                    ]}
                />

                <div>
                    <FormInputNumber
                        disabled={unfreezeType === UnfreezeAmountMode.FULL}
                        min={1}
                        max={maxAmount}
                        suffix="VNĐ"
                        control={control}
                        name="amount"
                        placeholder="Nhập số tiền..."
                        formatter={(value: string | number | undefined): string =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={(value: string | undefined): number =>
                            Number(value?.replace(/,/g, ''))
                        }
                        label={
                            <span>
                                Số tiền cần mở băng <span className="text-danger-strong">*</span>
                            </span>
                        }
                        onKeyDown={blockLeadingAndRepeatedSpace}
                    />
                    <p className="mt-1 text-[12px] text-muted-foreground">
                        {shortfall > 0
                            ? `Tối đa ${toVnd(maxAmount)} — mở quá ${toVnd(remaining)} đồng nghĩa huỷ đòi phần còn thiếu.`
                            : `Tối đa ${toVnd(maxAmount)}. Mở một phần thì phần còn lại vẫn bị giữ.`}
                    </p>
                </div>

                <FormTextArea
                    control={control}
                    name="reason"
                    placeholder="Nhập lý do mở băng..."
                    label={
                        <span>
                            Lý do mở băng <span className="text-danger-strong">*</span>
                        </span>
                    }
                    onKeyDown={blockLeadingAndRepeatedSpace}
                />
            </div>

            <div className="mt-3 rounded-md bg-warning/10 p-3 text-warning-strong">
                <span className="font-medium flex items-center gap-1">
                    <WarningIcon />
                    Lưu ý:
                </span>
                <p>
                    Yêu cầu này cần một người khác phê duyệt. Tiền chỉ rời{' '}
                    <span className="underline">Ví Đóng Băng</span> về{' '}
                    <span className="underline">Ví Khả Dụng</span> của tài khoản{' '}
                    <span className="font-medium">{item.ownerUsername ?? '--'}</span>{' '}
                    sau khi lệnh được duyệt.
                </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <ButtonComponent type="default" content="Hủy" onClick={onCancel} />
                <ButtonComponent
                    htmlType="submit"
                    loading={isLoading}
                    content="Gửi yêu cầu mở băng"
                />
            </div>
        </form>
    )
}

export const UnfreezeRequestDialog = ({
    open,
    item,
    onSuccess,
    onCancel
}: UnfreezeRequestDialogProps) => (
    <DialogModal
        open={open}
        onOk={onCancel}
        onCancel={onCancel}
        footer={null}
        title={
            <span className="flex items-center gap-2 text-secondary-foreground">
                <SnowflakeIcon size={18} />
                Yêu cầu mở băng
            </span>
        }
    >
        {item ? (
            <UnfreezeRequestForm
                item={item}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        ) : null}
    </DialogModal>
)
