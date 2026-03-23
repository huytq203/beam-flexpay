import { ButtonComponent, CardComponent, ModalComponent } from "@components/index"
import FormChoosePolicy from "./FormChoosePolicy"
import { useForm } from "react-hook-form"
import { feeAssignSchema, FeeAssignType } from "../schemas/feeAssign.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { FeeAssignment } from "@pages/fee-management-v4/fee-assignment/constants/feeAssignment"
import useHandle from "../hook/useHandle"
import { useEffect, useState, useRef } from "react"
import FormFieldAssign from "./FormFieldAssign"
import * as Icons from '@components/icons'
import { ComponentDetail } from "./ComponentDetail"
import { feePolicyComponent } from "@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent"
import { useGetFeePolicyByIdQuery } from "@services/apiFeePoliciesServices"
import { skipToken } from "@reduxjs/toolkit/query"
import { useParams } from "react-router-dom"

interface FormInforAddProps {
    svg: (
        href: string,
        options?: {
            size?: number
            width?: number
            height?: number
            className?: string
        }
    ) => JSX.Element
    id: string | undefined
    handlePutAssign: (data: FeeAssignType) => Promise<void>
    handlePostAssign: (data: FeeAssignType) => Promise<void>
    onPolicySelected?: (feePolicyId: string) => void
    editData?: FeeAssignment // Data from API for edit mode
    isCreate?: boolean
}

const DEFAULT_FORM_VALUES: FeeAssignType = {
    feePolicyId: '',
    merchantId: null,
    bankCode: '',
    paymentMethod: '',
    cardType: '',
    serviceType: '',
    customerGroup: '',
    status: '',
    applyType: '',
    account: '',
}

export const FormInforAdd = ({
    svg,
    id,
    handlePutAssign,
    handlePostAssign,
    onPolicySelected,
    editData,
    isCreate
}: FormInforAddProps) => {
    // Create independent form control for this component
    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm<FeeAssignType>({
        resolver: zodResolver(feeAssignSchema),
        defaultValues: DEFAULT_FORM_VALUES
    })
    const { handleChoosePolicy, dataFeePolicyComponent,feeDomain } = useHandle()
    const [openModal, setOpenModal] = useState(false)
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('')
    const [isEdit, setIsEdit] = useState(false)
    const { data: policyData } = useGetFeePolicyByIdQuery(selectedPolicyId || skipToken)

    const isInitialized = useRef<string | null>(null)
    const { mode } = useParams()
    useEffect(() => {
        if (mode === 'edit') {
            setIsEdit(true)
        }
        else {
            setIsEdit(false)
        }
    }, [mode])
    useEffect(() => {
        if (editData && id && isInitialized.current !== id) {
            reset({
                feePolicyId: editData.feePolicyId || '',
                merchantId: editData.merchantId || null,
                bankCode: editData.bankCode || '',
                paymentMethod: editData.paymentMethod || '',
                cardType: editData.cardType || '',
                serviceType: editData.serviceType || '',
                customerGroup: editData.customerGroup || '',
                status: editData.status || '',
                applyType: '',
                account: ''
            })
            if (editData.feePolicyId) {
                setSelectedPolicyId(editData.feePolicyId)
                handleChoosePolicy(editData.feePolicyId)
            }
            isInitialized.current = id
        }
    }, [editData, id, handleChoosePolicy, reset])

    const handleLocalPolicySelect = (feePolicyId: string) => {
        setValue('feePolicyId', feePolicyId, { shouldValidate: true })
        setSelectedPolicyId(feePolicyId)
        handleChoosePolicy(feePolicyId)
        onPolicySelected?.(feePolicyId)
    }

    return (
        <div className="space-y-3">
          
                    <>
                        <form
                            id='formAssign'
                            onSubmit={handleSubmit(id ? handlePutAssign : handlePostAssign)}
                            className="bg-white p-5 border rounded-lg"
                        >
                            <div className='flex md:flex-row flex-col justify-between items-start md:items-center mb-3 pb-2 '>
                               {!isEdit&& <p className="text-[16px] font-medium">1. Thiết lập phí</p>}
                                <div className='flex flex-col items-end'>
                                    <div className="flex items-center gap-3">
                                        {policyData?.name && !isEdit && (
                                            <span className="text-blue-600 font-medium">Chính sách: {policyData.name}</span>
                                        )}
                                        {errors.feePolicyId && (
                                            <p className='text-red-500 text-sm mt-1'>
                                                {errors.feePolicyId.message}
                                            </p>
                                        )}
                                        <ButtonComponent
                                            content='Chọn chính sách phí'
                                            onClick={() => setOpenModal(true)}
                                            hidden={(id && true) || false}
                                            icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
                                        />
                                    </div>

                                </div>
                            </div>
                            <FormFieldAssign
                                control={control}
                                setValue={setValue}
                                feeDomain={feeDomain}
                                watch={watch}
                            />
                        </form>

                        {/* {isCreate ?? (
                            <div className='flex justify-end mt-3'>
                                <ButtonComponent
                                    form='formAssign'
                                    htmlType='submit'
                                    content='Lưu lại'
                                    icon={<Icons.SaveOutlined />}
                                />
                            </div>
                        )} */}

                    </>

            {selectedPolicyId && dataFeePolicyComponent && dataFeePolicyComponent.length > 0 && !isEdit &&
                <CardComponent>
                    <>
                        <h3 className="text-[16px] font-medium mb-2">2. Thông tin thành phần</h3>
                        {dataFeePolicyComponent.map((data: feePolicyComponent) => (
                            <ComponentDetail
                                key={data.id}
                                data={data}
                                setOpenModalDetail={() => { }}
                                selectedId={selectedPolicyId}
                            />
                        ))}
                    </>
                </CardComponent>
            }
            <ModalComponent
                title={'Chọn chính sách phí'}
                width={{ xs: "100% ", md: "70%" }}
                open={openModal}
                onOk={() => {
                    setOpenModal(false)
                }}
                onCancel={() => {
                    setOpenModal(false)
                }}
                okText='Xác nhận'
                cancelText='Hủy'
                modalText={
                    <FormChoosePolicy
                        onSelect={handleLocalPolicySelect}
                        defaultSelectedId={selectedPolicyId}
                        serviceType={watch('serviceType')}
                        dataFeePolicyComponent={dataFeePolicyComponent}
                    />
                }
            />
        </div>
    )
}
export default FormInforAdd