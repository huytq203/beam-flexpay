import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetAccountByIdQuery } from '../../../../app/services/apiWalletAccount.api'
import { useGetEKYCByIdQuery, useGetEKYCSearchQuery } from '@services/apiEKYC'

const useDetailUser = () => {

  const [activeKey, setActiveKey] = useState('1')
  const { id } = useParams()


  const { data: getAccountById } = useGetAccountByIdQuery(id)
  const ownerUsername=getAccountById?.ownerUsername

  const payload={
    keyword:ownerUsername,
  }
  const {data:getEKYCById}=useGetEKYCSearchQuery(payload,{skip:!ownerUsername})
  const linkedBanks=getAccountById?.linkedBanks
  
  return {
    activeKey,
    setActiveKey,
    getAccountById,
    getEKYCById,
    linkedBanks
  }
}

export default useDetailUser
