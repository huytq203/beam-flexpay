import { FormInput, FormRadio, FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogRefund = () => {
    const { control } = useForm()
    return (
        <div>
            <form>
                <div className="flex flex-col gap-3">
                    <p>Giao dịch gốc : <span className='font-medium'>500,000 VND</span> </p>
                    <FormRadio control={control} name='a' label='Loại hoàn tiền' options={[
                        {
                            label: 'Toàn phần', value: '1'
                        },
                        {
                            label: 'Một phần', value: '2'
                        },
                    ]} />
                    <FormInput control={control} name='' label='Số tiền hoàn' placeholder='Nhập số tiền hoàn...'/>
                    <FormTextArea control={control} name='' label='Lý do hoàn tiền' placeholder='Nhập lý do...' />

                </div>
            </form>
        </div>
    )
}

export default DialogRefund
