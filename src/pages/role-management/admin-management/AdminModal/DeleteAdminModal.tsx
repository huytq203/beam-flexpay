import { useDeleteAdminMutation } from '@services/apiAdminAccountService'
import { MutationResponseType } from '@type/admin'
import { Button, notification, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

type DeleteAdminModalType = {
  refetch: () => void
  onCancel: () => void
  id: string
}

export const DeleteAdminModal = ({
  onCancel,
  id,
  refetch
}: DeleteAdminModalType) => {
  const { t: trans } = useTranslation()

  const [deleteAdmin, { isLoading }] = useDeleteAdminMutation()

  const onDelete = async () => {
    const data: any = await deleteAdmin(id)
    if (data.data.statusCode === 200) {
      notification.success({
        message: trans('messages.successDeleteAdminAccount')
      })
    }
    onCancel()
    refetch()
  }

  return (
    <>
      <Text>{trans('admin-management.modalContent.delete')}</Text>
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
