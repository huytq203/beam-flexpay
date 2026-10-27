import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetAccountByIdQuery } from '../../../../app/services/apiWalletAccount.api'
import { useGetEKYCSearchQuery } from '@services/apiEKYC'

const useDetailUser = () => {
  const [activeKey, setActiveKey] = useState('1')
  const { id } = useParams()

  // currentData không giữ lại dữ liệu của id trước khi URL đổi.
  const { currentData: getAccountById } = useGetAccountByIdQuery(id ?? '', {
    skip: !id,
    // Danh sách đã chủ động tải mới trước khi điều hướng; dùng cache đó để tránh gọi lặp.
    refetchOnMountOrArgChange: false
  })
  const ownerUsername = getAccountById?.ownerUsername

  const payload = {
    keyword: ownerUsername
  }
  const { data: getEKYCById } = useGetEKYCSearchQuery(payload, {
    skip: !ownerUsername || getAccountById?.ownerType === 'SYSTEM'
  })
  const linkedBanks = getAccountById?.linkedBanks

  return {
    activeKey,
    setActiveKey,
    getAccountById,
    getEKYCById,
    linkedBanks
  }
}

export default useDetailUser
