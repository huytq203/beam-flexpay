import { Button, notification, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { viewMode } from '@type/admin'
import { getLabelButton } from '@utils/helperFunctions'
import {
  useLockAdminMutation,
  useUnLockAdminMutation
} from '@services/apiAdminAccountService'

const { Text } = Typography

type LockAndUnlockAdminModalType = {
  onCancel: () => void
  mode: viewMode
  id: string
  refetch: () => void
}

export const LockAndUnlockAdminModal = ({
  onCancel,
  mode,
  id,
  refetch
}: LockAndUnlockAdminModalType) => {
  const { t: trans } = useTranslation()

  const [lockAdmin, { isLoading: loadingLock }] = useLockAdminMutation()
  const [unlockAdmin, { isLoading: loadingUnlock }] = useUnLockAdminMutation()

  const getModalContent = (mode: viewMode) => {
    switch (mode) {
      case viewMode.unlock:
        return <Text> {trans('admin-management.modalContent.unlock')}</Text>
      default:
        return <Text> {trans('admin-management.modalContent.lock')}</Text>
    }
  }

  const getLoadingMode = (mode: viewMode) => {
    switch (mode) {
      case viewMode.unlock:
        return loadingUnlock
      default:
        return loadingLock
    }
  }

  const handleConfirm = async () => {
    if (mode === viewMode.lock) {
      const data: any = await lockAdmin(id)
      if (data.data.statusCode === 200) {
        notification.success({
          message: trans('messages.successLockAdminAccount')
        })
      }
    }
    if (mode === viewMode.unlock) {
      const data: any = await unlockAdmin(id)
      if (data.data.statusCode === 200) {
        notification.success({
          message: trans('messages.successUnlockAdminAccount')
        })
      }
    }
    onCancel()
    refetch()
  }

  return (
    <>
      {getModalContent(mode)}
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
          onClick={handleConfirm}
          loading={getLoadingMode(mode)}
        >
          {getLabelButton(mode)}
        </Button>
      </div>
    </>
  )
}
