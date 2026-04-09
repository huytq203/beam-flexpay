import usePagination from '@hooks/usePagination'
import { useGetFeeComponentPoliciesByIdQuery } from '@services/apiFeeComponent'
import React from 'react'
import { FeeComponent } from '../types/FeeComponent.types'
import { skipToken } from '@reduxjs/toolkit/query/react'

interface Props{
    id:string|undefined
}
const useFetchDataComponent = ({id}:Props) => {

    const{page,pageSize,setPage,setPageSize}=usePagination()
    const {data:feeComponentData,isLoading:feeComponentLoading}=useGetFeeComponentPoliciesByIdQuery(id ?? skipToken)
    const dataSource=feeComponentData?.map((item:FeeComponent)=>{
        return {
            ...item,
            key:item.id
        }
    })
    const total=feeComponentData?.length
  return {
    dataSource,
    feeComponentLoading,
    page,
    pageSize,
    setPage,
    setPageSize,
    total
  }
}

export default useFetchDataComponent