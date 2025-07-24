import { IconName } from '@components/button-action/ButtonAction'
import { viewMode } from '@type/permission'
import { useCallback } from 'react'

const actionToViewModeMap: Record<IconName, viewMode> = {
  update: viewMode.update,
  delete: viewMode.delete,
  permission: viewMode.permission,
  view: viewMode.view
}

export const useActionHandler = <T extends { id: string }>(
  handleModal: (mode: viewMode, id?: string) => void
) => {
  const handleActionClick = useCallback(
    (action: IconName, record: T) => {
      const mode = actionToViewModeMap[action]
      if (mode !== undefined) {
        handleModal(mode, record.id)
      }
    },
    [handleModal]
  )

  return handleActionClick
}
