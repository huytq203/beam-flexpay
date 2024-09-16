import { useLazyDeleteBankAccountQuery } from '@services/apiBankService'
import { STATUS_CODE } from '@type/api'
import { showSuccessMessage } from '@utils/helperFunctions'
import { Button } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  onCancel: () => void
  bankId?: number
  refetch?: () => void
}
function BankDeleteModal({ onCancel, bankId, refetch }: IProps) {
  const { t } = useTranslation()
  const [deleteBankAccount] = useLazyDeleteBankAccountQuery()

  const [isLoading, setLoading] = useState(false)

  const onDelete = async () => {
    setLoading(true)
    if (bankId) {
      const { data } = await deleteBankAccount(bankId)
      if (data && data === STATUS_CODE.SUCCESS) {
        showSuccessMessage(t`system-management.message.delete-success`)
      }
      setLoading(false)
      onCancel()
      refetch && refetch()
    }
  }

  return (
    <div>
      <span className='d-block mb-20'>
        {t`system-management.bank.placeholders.update-description`}
      </span>
      <div className='text-end'>
        <Button
          className='mr-10'
          onClick={onCancel}
        >{t`buttons.cancel`}</Button>
        <Button
          loading={isLoading}
          type='primary'
          onClick={onDelete}
        >{t`buttons.delete`}</Button>
      </div>
    </div>
  )
}

export default BankDeleteModal
