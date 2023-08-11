import { useDeleteGroupPermissionMutation } from '@services/apiGroupPermissionService'
import { Button, notification, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

type DeleteConfirmModalType = {
  refetch: () => void
  onCancel: () => void
  id: string
}

export const DeleteConfirmModal = ({
  onCancel,
  id,
  refetch
}: DeleteConfirmModalType) => {
  const { t: trans } = useTranslation()

  const [deleteGroupPermission, { isLoading }] =
    useDeleteGroupPermissionMutation()

  const onDelete = async () => {
    const data: any = await deleteGroupPermission(id)
    if (data.data.statusCode === 200) {
      notification.success({
        message: trans('messages.successDeleteGroupPermission')
      })
    }
    onCancel()
    refetch()
  }

  return (
    <>
      <Text style={{ textAlign: 'center' }}>
        {trans('manage-group-permissions.popupAndModal.deleteConfirmText')}
      </Text>
      <div style={{ textAlign: 'end', marginTop: '8px' }}>
        <Button
          className='mr-10'
          onClick={() => {
            onCancel()
          }}
        >
          {trans('manage-group-permissions.button.cancel')}
        </Button>
        <Button
          type='primary'
          loading={isLoading}
          onClick={onDelete}
        >
          {trans('manage-group-permissions.form.permission.delete')}
        </Button>
      </div>
    </>
  )
}
