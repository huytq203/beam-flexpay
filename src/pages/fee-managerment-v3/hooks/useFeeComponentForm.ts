import { useState } from 'react'
import { useMessage } from '@hooks/useMessage'
import {
    useDeleteFeeComponentPoliciesMutation,
    usePostFeeComponentPoliciesMutation,
    usePutFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { FeeComponentType } from '../FeeManagement.schema'
import { feePolicyComponent } from '@type/feePoliciesComponent'

interface UseFeeComponentFormOptions {
    feePolicyId?: string
    onSuccess?: () => void
    setSelectedRow?: (row: feePolicyComponent | null) => void
}

export const useFeeComponentForm = ({
    feePolicyId,
    onSuccess,
    setSelectedRow
}: UseFeeComponentFormOptions) => {
    const { successMess, errorMess } = useMessage()
    const [updateComponentId, setUpdateComponentId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [openDialog, setOpenDialog] = useState(false)

    const [postFeeComponent, { isLoading: loadPostComponent }] =
        usePostFeeComponentPoliciesMutation()

    const [putFeeComponentPolicies, { isLoading: putFeeComponentPoliciesLoading }] =
        usePutFeeComponentPoliciesMutation()

    const [deleteFeeComponent, { isLoading: deleteFeeComponentLoading }] =
        useDeleteFeeComponentPoliciesMutation()

    const transformPayload = (data: FeeComponentType) => ({
        feePolicyId,
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
    })

    const handleFormSubmit = async (data: FeeComponentType) => {
        try {
            const payload = transformPayload(data)
            await postFeeComponent(payload).unwrap()
            successMess('Thêm thành phần phí thành công')
            onSuccess?.()
        } catch (error: any) {
            errorMess(error?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const handleUpdateFeeComponent = async (data: FeeComponentType) => {
        try {
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
                id: updateComponentId,
                body: payload
            }).unwrap()
            successMess('Cập nhật thành công')
            onSuccess?.()
        } catch (error: any) {
            errorMess(error?.data?.message || 'Cập nhật thất bại')
            throw error
        }

    }

    const handleDelete = async (id: string | null) => {
        try {
            if (!id) return
            if (setSelectedRow) {
                setSelectedRow(null)
            }
            await deleteFeeComponent(id).unwrap()
            setOpenDialog(false)
            successMess('Xoá thành công!')
        } catch (error) {
            errorMess('Lỗi xoá!')
        }
    }

    return {
        // State
        updateComponentId,
        setUpdateComponentId,
        deletingId,
        setDeletingId,
        openDialog,
        setOpenDialog,

        // API handlers
        handleFormSubmit,
        handleUpdateFeeComponent,
        handleDelete,

        // Loading states
        isSubmitting: loadPostComponent || putFeeComponentPoliciesLoading,
        isDeleting: deleteFeeComponentLoading
    }
}
