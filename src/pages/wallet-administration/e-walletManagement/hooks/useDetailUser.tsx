import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetAccountByIdQuery } from '../../../../app/services/apiWalletAccount.api'
import { useGetEKYCByIdQuery, useGetEKYCSearchQuery } from '@services/apiEKYC'

const useDetailUser = () => {

  const [activeKey, setActiveKey] = useState('1')
  const { id } = useParams()


  const { data: getAccountById } = useGetAccountByIdQuery(id)
  const ownerUsername=getAccountById?.data?.ownerUsername

  const payload={
    keyword:ownerUsername,
  }
  const {data:getEKYCById}=useGetEKYCSearchQuery(payload,{skip:!ownerUsername})

  

  return {
    activeKey,
    setActiveKey,
    getAccountById,
    getEKYCById
  }
}

export default useDetailUser
