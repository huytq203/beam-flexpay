import React from 'react'
import { dataSearch, FeePolicyFormValues } from '../utils/FeeManagement.type'
import { usePostNewPolicyMutation } from '@services/apiFeePoliciesServices'
import { useMessage } from '@hooks/useMessage'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetFeePolicyByIdQuery, usePutFeePolicyMutation } from '@services/apiFeePolicy.api'
import { PATHS } from '@constants/pathConstant'

interface UseHandleProps {
    setFilters?: React.Dispatch<React.SetStateAction<dataSearch>>
    setPage?: React.Dispatch<React.SetStateAction<number>>
    reset?: () => void
    id?: string
}

const useHandle = ({ setFilters, setPage, reset, id }: UseHandleProps) => {

    const { successMess } = useMessage()

    const navigate = useNavigate()


    const [postNewPolicy, { isLoading: isLoadingPostNewPolicy }] = usePostNewPolicyMutation()
    const [putFeePolicy, { isLoading: isLoadingPutFeePolicy }] = usePutFeePolicyMutation()
    const { data: dataFeePolicyById, isLoading: isLoadingFeePolicyById, isFetching: isFetchingFeePolicyById } = useGetFeePolicyByIdQuery(id, {
        skip: !id
    })

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

    const handleAdd = async (data: FeePolicyFormValues, mode?: boolean) => {
        try {
            const res = await postNewPolicy(data).unwrap()
            console.log(res)
            if (res) {
                successMess('Thêm mới chính sách phí thành công')
                reset?.()
                // Gán id response lên URL
                if (mode) {
                    navigate(`${res?.data?.id}`, { replace: true })
                }
            }
        } catch (error) {

        }

    }

    const handleEdit = async (data: FeePolicyFormValues,idPolicy?:string) => {
        try {
            if(!idPolicy) return
            console.log(data)
            const res = await putFeePolicy({id:idPolicy,body:data}).unwrap()
            if (res) {
                successMess('Cập nhật chính sách phí thành công')
                reset?.()
                navigate(PATHS.FEE_V4.FEE_MANAGEMENT)
                // Gán id response lên URL
                // if (mode) {
                //     navigate(`${res?.data?.id}`, { replace: true })
                // }
            }
        } catch (error) {

        }

    }

    const handleDelete = () => {

    }

    return {
        handleSearch,
        handleReset,
        handleAdd,
        handleEdit,
        handleDelete,
        dataFeePolicyById,
        isLoadingFeePolicyById,
        isFetchingFeePolicyById
    }
}

export default useHandle