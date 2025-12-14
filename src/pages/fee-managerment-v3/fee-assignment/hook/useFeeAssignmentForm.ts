import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import {
    useGetAssignByIdQuery,
    usePostAssignMutation,
    usePutAssignMutation
} from '@services/apiFeeAssignment'
import {
    useDeleteFeeComponentPoliciesMutation,
    useGetFeeComponentPoliciesByIdQuery
} from '@services/apiFeeComponent'
import { useGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { FeeAssignment } from '@type/feeAssignment'
import { feePolicyComponent } from '@type/feePoliciesComponent'
import { useFeeComponentForm } from '@pages/fee-managerment-v3/hooks/useFeeComponentForm'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'

// Form type excludes server-generated fields
export type FeeAssignmentFormData = Omit<FeeAssignment, 'id' | 'createdAt' | 'updatedBy' | 'createdBy' | 'updatedAt'>

const DEFAULT_FORM_VALUES: FeeAssignmentFormData = {
    feePolicyId: '',
    merchantId: null,
    bankCode: '',
    paymentMethod: '',
    cardType: '',
    serviceType: '',
    customerGroup: '',
    status: ''
}

interface FormRef {
    submit: () => void
    update: () => void
    reset: () => void
    submitAllTiers: (feeComponentId?: string) => Promise<void>
    updateAllTiers: () => Promise<void>
}

export const useFeeAssignmentForm = () => {
    // State
    const [openDialog, setOpenDialog] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [openModalDetail, setOpenModalDetail] = useState(false)
    const [selectedComponent, setSelectedComponent] = useState<feePolicyComponent | null>(null)
    const [componentToDelete, setComponentToDelete] = useState<feePolicyComponent | null>(null)

    // Form ref for FormAddFeeComponent
    const formRef = useRef<FormRef>(null)

    // Hooks
    const navigate = useNavigate()
    const { successMess, errorMess } = useMessage()
    const { id } = useParams()

    // Form
    const {
        control,
        handleSubmit,
        setValue,
        reset: resetFormAdd
    } = useForm<FeeAssignmentFormData>({
        defaultValues: DEFAULT_FORM_VALUES
    })

    // API queries
    const { data: dataAssignById } = useGetAssignByIdQuery(id)
    const feePolicyId = dataAssignById?.feePolicyId

    const { data: feeComponentData } = useGetFeeComponentPoliciesByIdQuery(
        feePolicyId!,
        { skip: !feePolicyId }
    )

    const { data: editTierData } = useGetFeeComponentTierQuery(
        selectedComponent?.id ?? '',
        { skip: !selectedComponent?.id }
    )

    // Mutations
    const [deleteComponent, { isLoading: loadingDeleteComponent }] =
        useDeleteFeeComponentPoliciesMutation()
    const [postAssign, { isLoading: loadingPostAssign }] = usePostAssignMutation()
    const [putAssign, { isLoading: loadingPutAssign }] = usePutAssignMutation()

    // Fee component form hook
    const {
        updateComponentId,
        setUpdateComponentId,
        handleUpdateFeeComponent,
        isSubmitting
    } = useFeeComponentForm({
        feePolicyId: feePolicyId,
        onSuccess: () => {
            setOpenModalDetail(false)
            setSelectedComponent(null)
        },
        setSelectedRow: setSelectedComponent
    })

    // Combined initial data for edit modal
    const combinedInitialData = useMemo(() => {
        if (!selectedComponent) return null
        if (editTierData && editTierData.length > 0) {
            const tiers = editTierData.map((item: any) => ({
                id: item.id,
                minValue: item.minValue,
                maxValue: item.maxValue,
                roundMode: item.roundMode,
                minFee: item.minFee,
                maxFee: item.maxFee,
                fixedAmount: item.fixedAmount,
                percentage: item.percentage
            }))
            return { ...selectedComponent, tiers }
        }
        return selectedComponent
    }, [selectedComponent, editTierData])

    // Effects
    useEffect(() => {
        if (dataAssignById) {
            resetFormAdd(dataAssignById)
        }
    }, [dataAssignById, resetFormAdd])

    // Handlers
    const handleNavigateBack = () => {
        navigate(FEEMANAGEMENR_V3 + '/fee-assignment')
    }

    const handleEditComponent = (data: feePolicyComponent) => {
        setSelectedComponent(data)
        setUpdateComponentId(data.id)
    }

    const handleSaveAddFee = () => {
        formRef.current?.update()
    }

    const handleSelectPolicy = (feePolicyId: string) => {
        setValue('feePolicyId', feePolicyId)
    }

    const handlePostAssign = async (data: FeeAssignmentFormData) => {
        try {
            await postAssign(data).unwrap()
            successMess('Thêm mới thành công!')
            resetFormAdd()
        } catch (error: any) {
            errorMess(error?.message || 'Có lỗi xảy ra')
        }
    }

    const handleOpenDeleteDialog = (data: feePolicyComponent) => {
        setComponentToDelete(data)
        setOpenDialog(true)
    }

    const handleDeleteAssign = async () => {
        if (!componentToDelete) return
        try {
            await deleteComponent(componentToDelete.id).unwrap()
            successMess('Xóa thành công!')
            setComponentToDelete(null)
            setOpenDialog(false)
        } catch (error) {
            errorMess('Xóa thất bại!')
        }
    }

    const handlePutAssign = async (data: FeeAssignmentFormData) => {
        try {
            const payload = {
                merchantId: null,
                bankCode: data.bankCode,
                paymentMethod: data.paymentMethod,
                cardType: data.cardType,
                serviceType: data.serviceType,
                customerGroup: data.customerGroup,
                status: data.status
            }
            await putAssign({ id, body: payload }).unwrap()
            successMess('Cập nhật thành công!')
            resetFormAdd()
        } catch (error: any) {
            errorMess(error?.message || 'Có lỗi xảy ra')
        }
    }

    const handleCloseModalDetail = () => {
        setOpenModalDetail(false)
        setSelectedComponent(null)
    }

    return {
        // State
        openDialog,
        setOpenDialog,
        openModal,
        setOpenModal,
        openModalDetail,
        setOpenModalDetail,
        selectedComponent,
        componentToDelete,

        // Refs
        formRef,

        // Form
        control,
        handleSubmit,

        // Data
        id,
        feeComponentData,
        combinedInitialData,

        // Handlers
        handleNavigateBack,
        handleEditComponent,
        handleSaveAddFee,
        handleSelectPolicy,
        handlePostAssign,
        handleOpenDeleteDialog,
        handleDeleteAssign,
        handlePutAssign,
        handleCloseModalDetail,
        handleUpdateFeeComponent,

        // Loading states
        loadingDeleteComponent,
        loadingPostAssign,
        loadingPutAssign,
        isSubmitting
    }
}
