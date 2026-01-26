import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetAccountByIdQuery } from '../service/apiWalletAccount.api'

const useDetailUser = () => {

  const [activeKey, setActiveKey] = useState('1')
  const { id } = useParams()


  const{data:getAccountById}= useGetAccountByIdQuery(id)
  return {
    activeKey,
    setActiveKey,
    getAccountById
  }
}

export default useDetailUser
