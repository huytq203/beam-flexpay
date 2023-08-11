import { useLazyDeleteDirectDepositQuery } from '@services/apiDirectDeposit'
import { STATUS_CODE } from '@type/api'
import { showSuccessMessage } from '@utils/helperFunctions'
import { Button, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

type DeleteAdminModalType = {
  refetch?: () => void
  onCancel: () => void
  policyId?: number
}

export const DeletePolicyModal = ({
  onCancel,
  policyId,
  refetch
}: DeleteAdminModalType) => {
  const { t: trans } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const [deleteDirectDeposit] = useLazyDeleteDirectDepositQuery()

  const onDelete = async () => {
    setIsLoading(true)
    if (policyId) {
      const result = (await deleteDirectDeposit(policyId)) as {
        data: { statusCode: number }
      }
      if (
        result.data.statusCode === STATUS_CODE.CREATED ||
        result.data.statusCode === STATUS_CODE.SUCCESS
      ) {
        showSuccessMessage(
          trans`policy-management.payment.messages.delete-success`
        )
        setIsLoading(false)
        refetch && refetch()
      }
    }
    onCancel()
  }

  return (
    <>
      <Text>{trans('policy-management.payment.feePolicyDeleteConfirm')}</Text>
      <div style={{ textAlign: 'end', marginTop: '8px' }}>
        <Button
          className='mr-10'
          onClick={() => {
            onCancel()
          }}
        >
          {trans('admin-management.button.cancel')}
        </Button>
        <Button
          type='primary'
          onClick={onDelete}
          loading={isLoading}
        >
          {trans('admin-management.button.delete')}
        </Button>
      </div>
    </>
  )
}
