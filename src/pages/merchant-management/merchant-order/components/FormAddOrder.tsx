import { useForm, Controller } from 'react-hook-form'
import { FormInput, FormInputNumber, FormSelect, FormTextArea } from '@components/form'
import { Radio } from 'antd'
import { forwardRef, useImperativeHandle } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderSchema, OrderFormValues } from '../schemas/Order.schema'
import { CardComponent } from '@components/index'

interface Props {
    onSubmit: (data: OrderFormValues) => void
    merchantOptions?: { label: string; value: string }[]
    isLoading?: boolean
}

export interface FormAddOrderRef {
    submit: () => void
    reset: () => void
}

const FormAddOrder = forwardRef<FormAddOrderRef, Props>(({ onSubmit, merchantOptions, isLoading }, ref) => {
    const { control, handleSubmit, watch, reset } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            merchantId: '',
            orderCode: `ORD-${Date.now()}`,
            amount: 0,
            description: '',
            purpose: '',
            currency: 'VND',
            bankCode: 'VPBANK'
        }
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)()
        },
        reset: () => {
            reset()
        }
    }))

    const selectedBank = watch('bankCode')

    const bankOptions = [
        { value: 'VPBANK', name: 'VPBank', desc: 'Virtual Account' },
        { value: 'VCB', name: 'Vietcombank', desc: 'QR Transfer' }
    ]

    return (

        <CardComponent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormSelect
                    name="merchantId"
                    control={control}
                    label={<span>Merchant <span className="text-red-500">*</span></span>}
                    options={merchantOptions ?? []}
                    placeholder="Select a merchant"
                    className="col-span-12 flex flex-col"
                />

                <FormInput
                    name="orderCode"
                    control={control}
                    label={<span>Order Code <span className="text-red-500">*</span></span>}
                    placeholder="ORD-XXXX"
                    className="col-span-12 flex flex-col"
                />

                <FormInputNumber
                    name="amount"
                    control={control}
                    label={<span>Amount (VND) <span className="text-red-500">*</span></span>}
                    placeholder="Enter amount"
                    className="col-span-12 flex flex-col"
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => (value ?? '').replace(/\$\s?|(,*)/g, '')}
                />

                <FormTextArea
                    name="description"
                    control={control}
                    label="Description"
                    placeholder="Enter order description (optional)"
                    className="col-span-12 flex flex-col"
                    rows={3}
                />

                <FormInput
                    name="purpose"
                    control={control}
                    label={<span>Purpose <span className="text-red-500">*</span></span>}
                    placeholder="Enter payment purpose"
                    className="col-span-12 flex flex-col"
                />

                <div className="flex flex-col">
                    <label className="font-medium mb-2">Bank <span className="text-red-500">*</span></label>
                    <Controller
                        name="bankCode"
                        control={control}
                        render={({ field }) => (
                            <Radio.Group {...field} className="grid grid-cols-2 gap-3">
                                {bankOptions.map((bank) => (
                                    <label
                                        key={bank.value}
                                        className={`border-2 rounded-lg cursor-pointer transition-colors text-center py-3 px-4 ${selectedBank === bank.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <Radio value={bank.value} className="hidden" />
                                        <p className={`text-[10px] font-medium ${selectedBank === bank.value ? 'text-blue-600' : 'text-gray-700'}`}>{bank.name}</p>
                                        <p className="text-[10px] text-gray-500">{bank.desc}</p>
                                    </label>
                                ))}
                            </Radio.Group>
                        )}
                    />
                </div>


            </form>
        </CardComponent>
    )
})

FormAddOrder.displayName = 'FormAddOrder'

export default FormAddOrder
