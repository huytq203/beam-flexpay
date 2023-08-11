import { viewMode } from '@type/policyManagement'
import { Button, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

type DeleteAdminModalType = {
  onCancel: () => void
  toggleFee?: (value: any, type: viewMode) => void
}

export const DeleteFeePackageModal = ({
  onCancel,
  toggleFee
}: DeleteAdminModalType) => {
  const { t: trans } = useTranslation()

  const onDelete = async () => {
    toggleFee && toggleFee({}, viewMode.delete)
    onCancel()
  }

  return (
    <>
      <Text>{trans('policy-management.payment.feePackageDeleteConfirm')}</Text>
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
        >
          {trans('admin-management.button.delete')}
        </Button>
      </div>
    </>
  )
}
