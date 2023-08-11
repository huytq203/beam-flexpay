import { useDeleteTransactionLimitMutation } from '@services/limitRegulationService'
import { Button, Col, notification, Row, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

type ModalContentType = {
  refetch?: () => void
  onCancel: () => void
  id?: number
}

const { Text } = Typography

export const DeleteModalContent = ({
  onCancel,
  id,
  refetch
}: ModalContentType) => {
  const { t: trans } = useTranslation()

  const [deleteLimitAndRegulations, { isLoading }] =
    useDeleteTransactionLimitMutation()

  const onDelete = async () => {
    if (id) {
      const data: any = await deleteLimitAndRegulations(id)
      if (data?.data?.statusCode === 201 || data?.data?.statusCode === 200) {
        notification.success({
          message: trans('messages.successDeleteLimitAndRegulations')
        })
        onCancel()
        refetch && refetch()
      }
    }
  }

  return (
    <>
      <>
        <Text>
          {trans('policy-management.limitAndRegulations.deleteConfirm')}
        </Text>
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
    </>
  )
}
