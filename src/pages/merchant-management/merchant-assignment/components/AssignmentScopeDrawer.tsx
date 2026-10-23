import { useState } from 'react'
import { DrawerComponent } from '@components/index'
import type {
  AdminAssignment,
  AssignmentScope
} from '../types/merchantAssignment.types'
import { AssignmentFormDialog } from './AssignmentFormDialog'
import { AssignmentListPanel } from './AssignmentListPanel'
import { AssignmentRemoveDialog } from './AssignmentRemoveDialog'

interface Props {
  /** Đặt phạm vi để mở ngăn kéo; bỏ trống để đóng. */
  scope?: AssignmentScope
  onClose: () => void
}

/** Xem, gán và gỡ Sales phụ trách của một Master/Sub-merchant ngay từ danh sách. */
export function AssignmentScopeDrawer({ scope, onClose }: Props) {
  const [assigning, setAssigning] = useState<readonly AdminAssignment[] | null>(
    null
  )
  const [removing, setRemoving] = useState<AdminAssignment | null>(null)

  return (
    <DrawerComponent
      open={Boolean(scope)}
      title='Sales phụ trách'
      width='min(720px, 100vw)'
      destroyOnHidden
      onClose={onClose}
      afterOpenChange={(open) => {
        if (!open) {
          setAssigning(null)
          setRemoving(null)
        }
      }}
    >
      {scope && (
        <>
          <AssignmentListPanel
            scope={scope}
            onAssign={setAssigning}
            onRemove={setRemoving}
          />
          {assigning && (
            <AssignmentFormDialog
              key={scope.id}
              scope={scope}
              assigned={assigning}
              onClose={() => setAssigning(null)}
            />
          )}
          {removing && (
            <AssignmentRemoveDialog
              key={`${scope.id}:${removing.adminUserId}`}
              scope={scope}
              assignment={removing}
              onClose={() => setRemoving(null)}
            />
          )}
        </>
      )}
    </DrawerComponent>
  )
}
