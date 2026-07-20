import { FormTextArea } from '@components/form'
import { WarningIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { usePostUnfreezeMutation } from '@services/apiWalletAccount.api'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UnfreezeSchema, UnfreezeFormValues } from '../schemas/Freeze.schema'
import { useMessage } from '@hooks/useMessage'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'

interface DialogUnfreezeProps {
    accountId?: string
    ownerName?: string
    holdBalance?: number
    currency?: string
    onSuccess?: () => void
    onCancel?: () => void
}



const DialogUnfreeze = ({
    accountId,
    ownerName,
    holdBalance = 0,
    currency = 'VNĐ',
    onSuccess,
    onCancel,
}: DialogUnfreezeProps) => {
    const { successMess } = useMessage()
    const { control, handleSubmit, reset } = useForm<UnfreezeFormValues>({
        defaultValues: { reason: '' },
        resolver: zodResolver(UnfreezeSchema),
    })
    const [postUnfreeze, { isLoading }] = usePostUnfreezeMutation()

    const onSubmit = async (values: UnfreezeFormValues) => {
        if (!accountId) return
        try {
            await postUnfreeze({
                accountId,
                reason: values.reason,
            }).unwrap()
            successMess('Mở băng tài khoản thành công')
            reset()
            onSuccess?.()
        } catch {

        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex-between p-3 bg-blue-50 border rounded-md">
                    <p>Số dư đang đóng băng:</p>
                    <p className="font-medium text-orange-600">
                        {formatCurrency(holdBalance, { symbol: currency, position: 'after' })}
                    </p>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                    <FormTextArea
                        control={control}
                        name="reason"
                        placeholder="Nhập lý do mở băng..."
                        label={
                            <span>
                                Lý do mở băng <span className="text-red-600">*</span>
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
                        Hệ thống sẽ hoàn trả tiền từ{' '}
                        <span className="underline">Ví Đóng Băng</span> về lại{' '}
                        <span className="underline">Ví Khả Dụng</span> của tài khoản
                        <span className="font-medium"> {ownerName ?? '--'}</span>
                    </p>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <ButtonComponent type="default" content="Hủy" onClick={onCancel} />
                    <ButtonComponent
                        htmlType="submit"
                        loading={isLoading}
                        content="Xác nhận mở băng"
                    />
                </div>
            </form>
        </div>
    )
}

export default DialogUnfreeze
