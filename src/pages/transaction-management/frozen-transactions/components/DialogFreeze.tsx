import { Radio } from '@components/index'
import { FormDatePicker, FormInputNumber, FormRadio, FormTextArea } from '@components/form'
import { WarningIcon } from '@components/icons'
import React from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePostFreezeMutation } from '@services/apiWalletAccount.api'
import { notification } from 'antd'
import { formatCurrency, formatNumber } from '@utils/formatNumber'
import { ButtonComponent } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { FreezeFormValues, FreezeSchema } from '../schemas/Freeze.schema'

interface DialogFreezeProps {
    accountId?: string
    ownerName?: string
    balance?: number
    currency?: string
    onSuccess?: () => void
    onCancel?: () => void
}



const DialogFreeze = ({
    accountId,
    ownerName,
    balance = 0,
    currency = 'VNĐ',
    onSuccess,
    onCancel,
}: DialogFreezeProps) => {

    const { successMess } = useMessage()

    const { control, watch, handleSubmit, reset, setValue } = useForm<FreezeFormValues>({
        defaultValues: { freezeType: 1, amount: balance, reason: '' },
        resolver: zodResolver(FreezeSchema),
    })
    const freezeType = watch('freezeType')

    useEffect(() => {
        if (freezeType === 1) {

            setValue('amount', balance)
        } else {
            setValue('amount', 0)
        }
    }, [freezeType, balance])

    const [postFreeze, { isLoading }] = usePostFreezeMutation()

    const onSubmit = async (values: FreezeFormValues) => {
        if (!accountId) return
        try {
            await postFreeze({
                accountId,
                reason: values.reason,
            }).unwrap()
            successMess('Đóng băng thành công')
            reset()
            onSuccess?.()
        } catch {

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
                            { value: 2, label: 'Đóng băng một phần', disabled: true },
                        ]}
                    />

                    <FormInputNumber
                        disabled={freezeType == 1}
                        suffix="VNĐ"
                        control={control}
                        name="amount"
                        placeholder="Nhập số tiền..."
                        formatter={(value: string | number | undefined): string => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value: string | undefined): number => Number(value?.replace(/,/g, ''))}
                        label={
                            <span>
                                Số tiền cần đóng băng <span className="text-red-600">*</span>
                            </span>
                        }
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
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === ' ') {
                                const target = e.target as HTMLTextAreaElement;
                                if (target.selectionStart === 0 || target.value.charAt(target.selectionStart - 1) === ' ') {
                                    e.preventDefault();
                                }
                            }
                        }}
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
