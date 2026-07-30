import { FormTextArea } from '@components/form'
import { UnlockOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { usePostUnlockMutation } from '@services/apiWalletAccount.api'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UnlockSchema, UnlockFormValues } from '../schemas/Freeze.schema'
import { useMessage } from '@hooks/useMessage'

interface DialogUnlockProps {
    ownerId?: string
    ownerName?: string
    onSuccess?: () => void
    onCancel?: () => void
}

const DialogUnlock = ({ ownerId, ownerName, onSuccess, onCancel }: DialogUnlockProps) => {
    const { successMess } = useMessage()
    const { control, handleSubmit, reset } = useForm<UnlockFormValues>({
        defaultValues: { reason: '' },
        resolver: zodResolver(UnlockSchema),
    })

    const [postUnlock, { isLoading }] = usePostUnlockMutation()

    const onSubmit = async (values: UnlockFormValues) => {
        if (!ownerId) return
        try {
            await postUnlock({ userId:ownerId, reason: values.reason }).unwrap()
            successMess('Mở khóa tài khoản thành công')
            reset()
            onSuccess?.()
        } catch { }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='flex-between p-3 bg-green-50 border border-green-200 rounded-md mb-3'>
                    <span className='flex items-center gap-2 text-green-700 font-medium'>
                        <UnlockOutlined />
                        Mở khóa tài khoản: <strong>{ownerName ?? '--'}</strong>
                    </span>
                </div>

                <div className='flex flex-col gap-3'>
                    <FormTextArea
                        control={control}
                        name='reason'
                        placeholder='Nhập lý do mở khóa tài khoản...'
                        label={
                            <span>
                                Lý do mở khóa <span className='text-red-600'>*</span>
                            </span>
                        }
                    />
                </div>

                <div className='bg-blue-50 mt-3 p-3 text-blue-700 rounded-md text-sm'>
                    Sau khi mở khóa, tài khoản <strong>{ownerName ?? '--'}</strong> sẽ có thể thực hiện giao dịch bình thường trở lại.
                </div>

                <div className='flex justify-end gap-2 mt-4'>
                    <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
                    <ButtonComponent
                        htmlType='submit'
                        loading={isLoading}
                        content='Xác nhận mở khóa'
                    />
                </div>
            </form>
        </div>
    )
}

export default DialogUnlock
