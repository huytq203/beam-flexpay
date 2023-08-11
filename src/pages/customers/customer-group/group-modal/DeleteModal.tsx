import Loading from '@components/loading/Loading'
import { useLazyDeleteAccountGroupQuery } from '@services/apiAccountGroup'
import { STATUS_CODE } from '@type/api'
import { Button, message, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  onCancel: () => void
  selectedId: number | undefined
  refetch: () => void
}
const DeleteModal = ({ refetch, onCancel, selectedId }: IProps) => {
  const [isLoading, setLoading] = useState(false)
  const { t } = useTranslation()
  const [deleteAccountGroup] = useLazyDeleteAccountGroupQuery()

  const onDelete = async () => {
    setLoading(true)
    if (selectedId) {
      const data = await deleteAccountGroup(selectedId)
      if ((data.data = STATUS_CODE.SUCCESS)) {
        message.destroy()
        message.success(t`customer-group.message.delete-success`)
        setLoading(false)
        refetch()
        onCancel()
      }
    }
  }

  return (
    <div>
      <Typography.Text className='d-block mb-20 f-14'>{t`customer-group.modal.delete-description`}</Typography.Text>
      <div style={{ textAlign: 'end' }}>
        <Button
          className='mr-10'
          onClick={onCancel}
        >{t`customer-group.modal.cancel-button`}</Button>
        <Button
          type='primary'
          loading={isLoading}
          onClick={onDelete}
        >{t`customer-group.modal.delete-button`}</Button>
      </div>
    </div>
  )
}

export default DeleteModal
