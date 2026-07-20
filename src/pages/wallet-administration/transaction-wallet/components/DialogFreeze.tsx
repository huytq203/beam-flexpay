import { Radio } from '@components/index'
import { FormDatePicker, FormInputNumber, FormRadio, FormTextArea } from '@components/form'
import { WarningIcon } from '@components/icons'
import React from 'react'
import { useForm } from 'react-hook-form'
import { usePostFreezeMutation } from '@services/apiWalletAccount.api'
import { notification } from 'antd'
import { formatCurrency } from '@utils/formatNumber'
import { ButtonComponent } from '@components/index'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'

interface DialogFreezeProps {
    accountId?: string
    ownerName?: string
    balance?: number
    currency?: string
    onSuccess?: () => void
    onCancel?: () => void
}

interface FreezeFormValues {
    freezeType: 1 | 2
    amount?: number
    reason: string
    expiryTime?: string
}

const DialogFreeze = ({
    accountId,
    ownerName,
    balance = 0,
    currency = 'VNĐ',
    onSuccess,
    onCancel,
}: DialogFreezeProps) => {
    const { control, watch, handleSubmit, reset } = useForm<FreezeFormValues>({
        defaultValues: { freezeType: 1 },
    })
    const freezeType = watch('freezeType')

    const [postFreeze, { isLoading }] = usePostFreezeMutation()

    const onSubmit = async (values: FreezeFormValues) => {
        if (!accountId) return
        try {
            await postFreeze({
                accountId,
                reason: values.reason,
            }).unwrap()
            notification.success({ message: 'Đóng băng tài khoản thành công' })
            reset()
            onSuccess?.()
        } catch (err: any) {
            notification.error({
                message: 'Đóng băng thất bại',
                description: err?.data?.message ?? 'Đã xảy ra lỗi',
            })
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex-between p-3 bg-blue-50 border rounded-md">
                    <p>Số dư hiện tại:</p>
                    <p className="font-medium">
                        {formatCurrency(balance, { symbol: currency, position: 'after' })}
                    </p>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                    <FormRadio
                        label="Hình thức đóng băng"
                        control={control}
                        name="freezeType"
                        options={[
                            { value: 1, label: 'Đóng băng toàn bộ' },
                            { value: 2, label: 'Đóng băng một phần' },
                        ]}
                    />

                    <FormInputNumber
                        disabled={freezeType == 1}
                        suffix="VNĐ"
                        control={control}
                        name="amount"
                        placeholder="Nhập số tiền..."
                        label={
                            <span>
                                Số tiền cần đóng băng <span className="text-red-600">*</span>
                            </span>
                        }
                        onKeyDown={blockLeadingAndRepeatedSpace}
                    />

                    {freezeType == 2 && (
                        <div>
                            <FormDatePicker
                                showTime
                                control={control}
                                name="expiryTime"
                                label="Thời gian đóng băng (Tự động)"
                            />
                            <span className="text-gray-500 text-sm">
                                <span className="text-red-600">*</span>Để trống sẽ băng vô thời hạn
                            </span>
                        </div>
                    )}

                    <FormTextArea
                        control={control}
                        name="reason"
                        placeholder="Nhập lý do..."
                        label={
                            <span>
                                Lý do đóng băng <span className="text-red-600">*</span>
                            </span>
                        }
                        onKeyDown={blockLeadingAndRepeatedSpace}
                    />
                </div>

                <div className="bg-orange-50 mt-3 p-3 text-yellow-700 rounded-md">
                    <p>
                        <span className="font-medium flex items-center gap-1">
                            <WarningIcon />
                            Lưu ý:
                        </span>{' '}
                        Hệ thống sẽ trừ tiền từ{' '}
                        <span className="underline">Ví Khả Dụng</span> và chuyển sang{' '}
                        <span className="underline">Ví Đóng Băng</span> của tài khoản
                        <span className="font-medium"> {ownerName ?? '--'}</span>
                    </p>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <ButtonComponent type="default" content="Hủy" onClick={onCancel} />
                    <ButtonComponent
                        htmlType="submit"
                        loading={isLoading}
                        content="Xác nhận"
                    />
                </div>
            </form>
        </div>
    )
}

export default DialogFreeze