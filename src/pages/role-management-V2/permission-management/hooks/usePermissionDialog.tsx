import { useMemo, useCallback } from 'react'
import { ButtonComponent } from '@components/index'
import { ModeAction } from './usePermissionUi'
import { PermissionItem } from '@type/permissionManagement'

interface UsePermissionDialogParams {
  modeAction: ModeAction
  selectRoleItem: PermissionItem | undefined
  setModalDialog: (value: boolean) => void
  handleDeleteRole: () => void
}

export const usePermissionDialog = ({
  modeAction,
  selectRoleItem,
  setModalDialog,
  handleDeleteRole
}: UsePermissionDialogParams) => {
  const getTypeFooter = useCallback(
    (
      onCancel: () => void,
      onOk: () => void
    ): Partial<Record<ModeAction, JSX.Element>> => ({
      delete: (
        <div className='flex justify-end items-center gap-2'>
          <ButtonComponent
            type='default'
            content='Cancel'
            onClick={onCancel}
          />
          <ButtonComponent
            type='primary'
            danger
            content='Delete'
            onClick={onOk}
          />
        </div>
      ),
      view: (
        <div className='flex justify-end items-center gap-2'>
          <ButtonComponent
            type='default'
            content='Cancel'
            onClick={onCancel}
          />
        </div>
      )
    }),
    []
  )

  const typeText: Partial<Record<ModeAction, JSX.Element>> = useMemo(
    () => ({
      delete: (
        <span>
          Bạn có chắc chắn muốn xóa nhóm quyền{' '}
          <span className='font-bold'>{selectRoleItem?.name}</span> không? Hành
          động này không thể hoàn tác.
        </span>
      ),
      lock: (
        <span>
          Bạn có chắc chắn muốn khóa nhóm quyền{' '}
          <span className='font-bold'>{selectRoleItem?.name}</span> không?
        </span>
      ),
      unlock: (
        <span>
          Bạn có chắc chắn muốn mở khóa{' '}
          <span className='font-bold'>{selectRoleItem?.name}</span> không?
        </span>
      )
    }),
    [selectRoleItem?.name]
  )

  return {
    getTypeFooter,
    typeText
  }
}
