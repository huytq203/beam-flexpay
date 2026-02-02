import { useMemo } from 'react'
import { ButtonComponent } from '@components/index'
import { ModeAction } from './useRoleManagementUI'
import { RoleDataItem } from '@type/roleManagementV2'

interface UseRoleManagementDialogParams {
  modeAction: ModeAction
  selectedPermission: RoleDataItem | undefined
  setOpenDialog: (value: boolean) => void
  handleDeletePermission: () => void
}

export const useRoleManagementDialog = ({
  modeAction,
  selectedPermission,
  setOpenDialog,
  handleDeletePermission
}: UseRoleManagementDialogParams) => {
  const typeFooter: Partial<Record<ModeAction, JSX.Element>> = useMemo(
    () => ({
      delete: (
        <div className='flex justify-end items-center gap-2'>
          <ButtonComponent
            type='default'
            content='Cancel'
            onClick={() => setOpenDialog(false)}
          />
          <ButtonComponent
            type='primary'
            danger
            content='Delete'
            onClick={handleDeletePermission}
          />
        </div>
      )
    }),
    [setOpenDialog, handleDeletePermission]
  )

  const typeText: Partial<Record<ModeAction, JSX.Element>> = useMemo(
    () => ({
      delete: (
        <span>
          Bạn có chắc chắn muốn <span className='font-bold'>xóa quyền</span>{' '}
          <span className='font-bold'>{selectedPermission?.name}</span> không?
          Hành động này không thể hoàn tác.
        </span>
      ),
      lock: (
        <span>
          Bạn có chắc chắn muốn <span className='font-bold'>khóa quyền</span>{' '}
          <span className='font-bold'>{selectedPermission?.name}</span> không?
          Quyền sẽ không thể sử dụng cho đến khi mở lại.
        </span>
      ),
      unlock: (
        <span>
          Bạn có chắc chắn muốn <span className='font-bold'>mở khóa quyền</span>{' '}
          <span className='font-bold'>{selectedPermission?.name}</span> không?
          Quyền này sẽ có thể hoạt động trở lại.
        </span>
      )
    }),
    [selectedPermission?.name]
  )

  return {
    typeFooter,
    typeText
  }
}
