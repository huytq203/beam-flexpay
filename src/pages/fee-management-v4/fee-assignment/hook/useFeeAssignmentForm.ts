import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import {
    useGetAssignByIdQuery,
    usePostAssignMutation,
    usePutAssignMutation
} from '@services/apiFeeAssignment'
import {
    useDeleteFeeComponentPoliciesMutation,
    useGetFeeComponentPoliciesByIdQuery,
    useGetFeeComponentByIdQuery
} from '@services/apiFeeComponent'
import { useGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { FeeAssignment } from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { feePolicyComponent } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import { useFeeComponentForm } from '../hook/useFeeComponentForm'
import { feeAssignSchema, FeeAssignType } from '../schemas/feeAssign.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { PATHS } from '@constants/pathConstant'
import { useGetFeePolicyByIdQuery } from '@services/apiFeePoliciesServices'

// Form type excludes server-generated fields
export type FeeAssignmentFormData = Omit<FeeAssignment, 'id' | 'createdAt' | 'updatedBy' | 'createdBy' | 'updatedAt'> & {
    assignScope?: string
    applyType?: string
    account?: string
    applyDate?: string
    createDate?: string
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

    // Hooks
    const formRef = useRef<FormRef>(null)
    const navigate = useNavigate()
    const { successMess, errorMess } = useMessage()
    const { id } = useParams()

    // Form
    const {
        control,
        handleSubmit,
        setValue,
        reset: resetFormAdd,
        formState: { errors }
    } = useForm<FeeAssignType>({
        resolver: zodResolver(feeAssignSchema),
        defaultValues: DEFAULT_FORM_VALUES
    })

    const { data: dataAssignById } = useGetAssignByIdQuery(id!, { skip: !id })
    // Theo dõi giá trị feePolicyId từ form, fallback về dataAssignById khi mới load
    const formFeePolicyId = useWatch({ control, name: 'feePolicyId' })
    const feePolicyId = formFeePolicyId || dataAssignById?.feePolicyId

    const { data: feeComponentData } = useGetFeeComponentPoliciesByIdQuery(
        feePolicyId!,
        { skip: !feePolicyId }
    )

    // Query để lấy dữ liệu component cho DIRECT method
    const { data: feeComponentById, isFetching: isFetchingComponent } = useGetFeeComponentByIdQuery(
        selectedComponent?.id ?? '',
        {
            skip: !selectedComponent?.id || selectedComponent?.calculationMethod !== 'DIRECT'
        }
    )

    // Query để lấy dữ liệu tier cho PROGRESSIVE_TIER và FLAT_TIER
    const { data: editTierData, isFetching: isFetchingTier } = useGetFeeComponentTierQuery(
        selectedComponent?.id ?? '',
        {
            skip:
                !selectedComponent?.id ||
                (selectedComponent?.calculationMethod !== 'PROGRESSIVE_TIER' &&
                    selectedComponent?.calculationMethod !== 'FLAT_TIER')
        }
    )

    const { data: policyData } = useGetFeePolicyByIdQuery(

        feePolicyId, {
        skip: !feePolicyId
    }
    )
    const [deleteComponent, { isLoading: loadingDeleteComponent }] =
        useDeleteFeeComponentPoliciesMutation()
    const [postAssign, { isLoading: loadingPostAssign }] = usePostAssignMutation()
    const [putAssign, { isLoading: loadingPutAssign }] = usePutAssignMutation()


    const {
        setUpdateComponentId,
        handleUpdateFeeComponent,
        isSubmitting
    } = useFeeComponentForm(true)

    const combinedInitialData = useMemo(() => {
        if (!selectedComponent) return null

        // Nếu đang fetch, trả về null để tránh hiển thị cache cũ
        if (selectedComponent.calculationMethod === 'DIRECT') {
            if (isFetchingComponent) return null
            return feeComponentById ?? null
        } else {
            if (isFetchingTier) return null
            return editTierData ?? null
        }
    }, [selectedComponent, feeComponentById, editTierData, isFetchingComponent, isFetchingTier])

    useEffect(() => {
        if (dataAssignById) {
            resetFormAdd({
                feePolicyId: dataAssignById.feePolicyId,
                merchantId: dataAssignById.merchantId,
                bankCode: dataAssignById.bankCode || '',
                paymentMethod: dataAssignById.paymentMethod || '',
                cardType: dataAssignById.cardType || '',
                serviceType: dataAssignById.serviceType,
                customerGroup: dataAssignById.customerGroup || '',
                status: dataAssignById.status,
                applyType: '',
                account: ''
            })
        }
    }, [dataAssignById, resetFormAdd])

    // Handlers
    const handleNavigateBack = () => {
        navigate(PATHS.FEE_V4.FEE_ASSIGNMENT)
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

    const handlePostAssign = async (data: FeeAssignType) => {
        // Kiểm tra feePolicyId trước khi submit
        if (!data.feePolicyId || data.feePolicyId.trim() === '') {
            errorMess('Vui lòng chọn chính sách phí')
            return
        }

        try {
            const payload = {
                feePolicyId: data.feePolicyId,
                merchantId: data.merchantId,
                bankCode: data.bankCode,
                paymentMethod: data.paymentMethod,
                cardType: data.cardType,
                serviceType: data.serviceType,
                customerGroup: data.customerGroup || '',
                status: data.status,
            }
            await postAssign(payload).unwrap()
            successMess('Thêm mới thành công!')
            resetFormAdd()
        } catch {

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
        } catch {
            errorMess('Xóa thất bại!')
        }
    }

    const handlePutAssign = async (data: FeeAssignType) => {
        // Kiểm tra feePolicyId trước khi submit
        if (!data.feePolicyId || data.feePolicyId.trim() === '') {
            errorMess('Vui lòng chọn chính sách phí')
            return
        }

        try {
            const payload = {
                merchantId: null,
                bankCode: data.bankCode,
                paymentMethod: data.paymentMethod,
                cardType: data.cardType,
                serviceType: data.serviceType,
                customerGroup: data.customerGroup || '',
                status: data.status
            }
            await putAssign({ id, body: payload }).unwrap()
            successMess('Cập nhật thành công!')
            resetFormAdd()
        } catch {

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
        setValue,
        errors,

        // Data
        id,
        feeComponentData,
        combinedInitialData,
        dataAssignById,
        policyData,

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
