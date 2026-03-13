import { useRef, useState } from 'react'
import { Control, UseFormHandleSubmit } from 'react-hook-form'
import { PolicyType, FeeComponentType } from '@pages/fee-management-v3/schemas/FeeManagement.schema'
import FormAddPolicy from '@pages/fee-management-v3/components/FormAddPolicy'
import InforPolicy, { InfoPolicyRef } from '@pages/fee-management-v3/components/InfoPolicy'
import { usePostFeeComponentPoliciesMutation, useGetFeeComponentByIdQuery, usePutFeeComponentPoliciesMutation } from '@pages/fee-management-v3/services/apiFeeComponent.api'
import { useMessage } from '@hooks/useMessage'
import { ButtonComponent, CardComponent, ModalComponent } from '@components/index'
import { Spin, Steps } from 'antd'
import FeeComponentManagement from '@pages/fee-management-v3/fee-component-management/FeeComponentManagement'

interface StepPolicyModalProps {
    open: boolean
    onClose: () => void
    controlAdd: Control<PolicyType>
    handleSubmitAdd: UseFormHandleSubmit<PolicyType>
    handleSaveAddFee: (data: PolicyType) => Promise<string | undefined>
    loadingNewPolicy: boolean
    resetAdd: () => void
}

const StepPolicyModal = ({
    open,
    onClose,
    controlAdd,
    handleSubmitAdd,
    handleSaveAddFee,
    loadingNewPolicy,
    resetAdd
}: StepPolicyModalProps) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [newPolicyId, setNewPolicyId] = useState<string | undefined>()
    const [newComponentId, setNewComponentId] = useState<string | undefined>()
    const [isSubmittingComponent, setIsSubmittingComponent] = useState(false)
    const [isTierMode, setIsTierMode] = useState(false)

    const infoPolicyRef = useRef<InfoPolicyRef>(null)
    const infoPolicyRef3 = useRef<InfoPolicyRef>(null)
    const { successMess } = useMessage()

    const [postFeeComponent] = usePostFeeComponentPoliciesMutation()
    const [putFeeComponentPolicies] = usePutFeeComponentPoliciesMutation()

    const { data: step3ComponentData, isFetching: isFetchingComponent } = useGetFeeComponentByIdQuery(
        newComponentId ?? '',
        { skip: !newComponentId || currentStep !== 2 }
    )

    const handleClose = () => {
        setCurrentStep(0)
        setNewPolicyId(undefined)
        setNewComponentId(undefined)
        setIsTierMode(false)
        resetAdd()
        onClose()
    }

    const handleStep1Submit = handleSubmitAdd(async (data: PolicyType) => {
        const id = await handleSaveAddFee(data)
        console.log(id)
        if (id) {
            setNewPolicyId(id)
            setCurrentStep(1)
        }
    })


    const handleFormSubmit = async (data: FeeComponentType): Promise<string | undefined> => {
        const payload = {
            feePolicyId: newPolicyId,
            componentType: data.componentType,
            baseOn: data.baseOn,
            baseComponentType: null,
            calculationMethod: data.calculationMethod,
            fixedAmount: data.fixedAmount ?? 0,
            percentage: data.percentage ?? 0,
            roundMode: data.roundMode,
            minFee: data.minFee ?? 0,
            maxFee: data.maxFee ?? 0,
            payerType: data.payerType,
            payerObjectType: null,
            payerObjectId: null,
            beneficiaryType: data.beneficiaryType,
            beneficiaryObjectType: null,
            beneficiaryObjectId: null
        }
        const response = await postFeeComponent(payload).unwrap()

        return response?.data?.id
    }

    const handleStep2Save = async () => {
        setIsSubmittingComponent(true)
        try {
            await infoPolicyRef.current?.submit()
        } finally {
            setIsSubmittingComponent(false)
        }
    }

    const handleStep3Save = async () => {
        setIsSubmittingComponent(true)
        try {
            await infoPolicyRef3.current?.update()
        } catch {
        } finally {
            setIsSubmittingComponent(false)
        }
    }

    const handleUpdateFeeComponent = async (data: FeeComponentType, componentId?: string) => {
        const payload = {
            componentType: data.componentType,
            baseOn: data.baseOn,
            baseComponentType: null,
            calculationMethod: data.calculationMethod,
            fixedAmount: data.fixedAmount ?? 0,
            percentage: data.percentage ?? 0,
            roundMode: data.roundMode,
            minFee: data.minFee ?? 0,
            maxFee: data.maxFee ?? 0,
            payerType: data.payerType,
            payerObjectType: null,
            payerObjectId: null,
            beneficiaryType: data.beneficiaryType,
            beneficiaryObjectType: null,
            beneficiaryObjectId: null
        }
        await putFeeComponentPolicies({
            id: componentId ?? newComponentId!,
            body: payload
        }).unwrap()
    }

    const handleSuccess = (id?: string) => {
        if (id) setNewComponentId(id)
        if (isTierMode) {
            setCurrentStep(2)
        } else {
            handleClose()
        }
    }

    const handleStep3Success = () => {
        handleClose()
    }

    const steps = [
        { title: 'Thông tin chính sách' },
        { title: 'Thêm thành phần phí' },
        ...(isTierMode ? [{ title: 'Thêm phí bậc thang ' }] : [])
    ]

    const footer =
        currentStep === 0 ? (
            <div className='flex justify-between'>
                <ButtonComponent onClick={handleClose}>Cancel</ButtonComponent>
                <ButtonComponent type='primary' onClick={handleStep1Submit} loading={loadingNewPolicy}>
                    Tạo & Tiếp theo →
                </ButtonComponent>
            </div>
        ) : currentStep === 1 ? (
            <div className='flex justify-end'>
                {/* <ButtonComponent onClick={() => setCurrentStep(0)}>← Quay lại</ButtonComponent> */}
                <ButtonComponent type='primary' onClick={handleStep2Save} loading={isSubmittingComponent}>
                    Tạo & Tiếp theo →
                </ButtonComponent>
            </div>
        ) : (<div className='flex justify-end'>
            {/* <ButtonComponent onClick={() => setCurrentStep(0)}>← Quay lại</ButtonComponent> */}
            <ButtonComponent type='primary' onClick={handleStep3Save} loading={isSubmittingComponent}>
                Lưu lại
            </ButtonComponent>
        </div>)

    return (
        <ModalComponent
            title='Thêm chính sách mới'
            open={open}
            onCancel={handleClose}
            centered
            destroyOnClose
            width='75%'
            footer={footer}
            styles={{
                header: { background: 'none' },
                content: { background: '#fafafa' },
                body: { maxHeight: '70vh', overflowY: 'auto' }
            }}
        >
            <CardComponent>

                <Steps
                    current={currentStep}
                    items={steps}
                    className='mb-4'
                    size='small'
                />

                {currentStep === 0 && (
                    <FormAddPolicy
                        control={controlAdd}
                        handleSubmit={handleSubmitAdd}
                        onSubmit={async () => { }}
                        isCreate
                    />
                )}

                {currentStep === 1 && (
                    <Spin spinning={false}>
                        <InforPolicy
                            ref={infoPolicyRef}
                            selectedRow={null}
                            combinedInitialData={null}
                            onSubmit={handleFormSubmit}
                            onSuccess={handleSuccess}
                            policyId={newPolicyId}
                            arrListBaseOn={[]}
                            onTierModeChange={setIsTierMode}
                        />
                    </Spin>
                )}
                {currentStep === 2 && (
                    <Spin spinning={isFetchingComponent}>
                        <InforPolicy
                            ref={infoPolicyRef3}
                            selectedRow={step3ComponentData ?? null}
                            combinedInitialData={null}
                            onSubmit={undefined}
                            onUpdate={handleUpdateFeeComponent}
                            onSuccess={handleStep3Success}
                            policyId={newPolicyId}
                            arrListBaseOn={[]}
                        />
                    </Spin>
                )}
            </CardComponent>
        </ModalComponent>
    )
}

export default StepPolicyModal
