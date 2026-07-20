import React from 'react'
import { dataSearch } from '../types/FeeManagement.type'
import { PolicyType } from '../schemas/FeeManagement.schema'
import { usePostNewPolicyMutation } from '@services/apiFeePoliciesServices'
import { useMessage } from '@hooks/useMessage'
import { useNavigate } from 'react-router-dom'
import { useGetFeePolicyByIdQuery, usePatchActivateFeeMutation, usePatchDeactivateFeeMutation, usePutFeePolicyMutation } from '@services/apiFeePolicy.api'
import { PATHS } from '@constants/pathConstant'
import { useDeleteFeeComponentPoliciesMutation } from '@services/apiFeeComponent'
import { skipToken } from '@reduxjs/toolkit/query/react'

interface UseHandleProps {
    setFilters?: React.Dispatch<React.SetStateAction<Partial<dataSearch>>>
    setPage?: React.Dispatch<React.SetStateAction<number>>
    reset?: () => void
    id?: string
    setOpenDialog?: React.Dispatch<React.SetStateAction<boolean>>
}

const useHandleAddFeePolicy = ({ setFilters, setPage, reset, id, setOpenDialog }: UseHandleProps) => {

    const { successMess } = useMessage()
    const navigate = useNavigate()
    const [loadingId, setLoadingId] = React.useState<string | null>(null)

    const [postNewPolicy] = usePostNewPolicyMutation()
    const [putFeePolicy] = usePutFeePolicyMutation()
    const [patchActivateFee, { isLoading: isLoadingPatchActivateFee }] = usePatchActivateFeeMutation()
    const [patchDeactivateFee, { isLoading: isLoadingPatchDeactivateFee }] = usePatchDeactivateFeeMutation()
    const [deleteFeeComponentPolicies, { isLoading: isLoadingDeleteFeeComponentPolicies }] = useDeleteFeeComponentPoliciesMutation()
    const { data: dataFeePolicyById, isLoading: isLoadingFeePolicyById, isFetching: isFetchingFeePolicyById } = useGetFeePolicyByIdQuery(id ?? skipToken)

    const handleSearch = (data: dataSearch) => {
        const dataValue = {
            ...data,
            keyword: data.keyword || '',
        }
        setFilters?.(dataValue)
        setPage?.(1)
    }

    const handleReset = () => {
        setFilters?.({} as dataSearch)
        setPage?.(1)
        reset?.()
    }

    const handleAdd = async (data: PolicyType, mode?: boolean) => {
        try {
            const res = await postNewPolicy(data).unwrap()
            if (res) {
                successMess('Thêm mới chính sách phí thành công')
                reset?.()
                // Gán id response lên URL
                if (mode) {
                    navigate(`${res?.data?.id}`, { replace: true })
                }
            }
        } catch {

        }

    }

    const handleEdit = async (data: PolicyType, idPolicy?: string) => {
        try {
            if (!idPolicy) return
            const res = await putFeePolicy({ id: idPolicy, body: data }).unwrap()
            if (res) {
                successMess('Cập nhật chính sách phí thành công')
                reset?.()
                navigate(PATHS.FEE_V4.FEE_MANAGEMENT)
                // Gán id response lên URL
                // if (mode) {
                //     navigate(`${res?.data?.id}`, { replace: true })
                // }
            }
        } catch {

        }

    }

    const handleDelete = async (idPolicy: string) => {
        try {
            const res = await deleteFeeComponentPolicies(idPolicy).unwrap()
            if (res) {
                successMess('Xóa chính sách phí thành công')
                setOpenDialog?.(false)
            }
        } catch {

        }
    }
    const handleActive = async (id: string) => {
        try {
            setLoadingId(id)
            const res = await patchActivateFee(id).unwrap()
            if (res) {
                successMess('Kích hoạt chính sách phí thành công')
            }
        } catch {

        } finally {
            setLoadingId(null)
        }
    }

    const handleInactive = async (id: string) => {
        try {
            setLoadingId(id)
            const res = await patchDeactivateFee(id).unwrap()
            if (res) {
                successMess('Hủy kích hoạt chính sách phí thành công')
            }
        } catch {

        } finally {
            setLoadingId(null)
        }
    }

    return {
        handleSearch,
        handleReset,
        handleAdd,
        handleEdit,
        handleDelete,
        dataFeePolicyById,
        isLoadingFeePolicyById,
        isFetchingFeePolicyById,
        handleActive,
        handleInactive,
        isLoadingPatchActivateFee,
        isLoadingPatchDeactivateFee,
        loadingId,
        isLoadingDeleteFeeComponentPolicies
    }
}

export default useHandleAddFeePolicy