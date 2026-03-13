import React from 'react'
import { dataSearch, FeePolicyFormValues } from '../types/FeeManagement.type'
import { usePostNewPolicyMutation } from '@services/apiFeePoliciesServices'
import { useMessage } from '@hooks/useMessage'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetFeePolicyByIdQuery } from '@services/apiFeePolicy.api'

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

    const { data: dataFeePolicyById, isLoading:isLoadingFeePolicyById ,isFetching:isFetchingFeePolicyById} = useGetFeePolicyByIdQuery(id,{
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

    const handleAdd = async (data: FeePolicyFormValues) => {
        try {
            const res = await postNewPolicy(data).unwrap()
            console.log(res)
            if (res ) {
                successMess('Thêm mới chính sách phí thành công')
                reset?.()
                // Gán id response lên URL
                navigate(`${res?.data?.id}`, { replace: true })
            }
        } catch (error) {

        }

    }

    const handleEdit = () => {


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