import { FormInputNumber, FormRadio, FormTextArea } from '@components/form'
import { SnowflakeIcon, WarningIcon } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'
import type { FreezeItem } from '@type/freeze.type'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'
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
        isLoading,
        submit
    } = useUnfreezeRequestForm(item, onSuccess)

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                submit()
            }}
        >
            <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-muted-foreground">Số tiền đang bị giữ</p>
                <p className="amount-caution text-2xl font-semibold tabular-nums">
                    {toVnd(remaining)}
                </p>
                {shortfall > 0 && (
                    <p className="amount-negative mt-1 text-[12px] font-medium tabular-nums">
                        Còn thiếu {toVnd(shortfall)} chưa giữ được
                    </p>
                )}
            </div>

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
