import { useState } from 'react'
import { CardComponent, type PickedEntity } from '@components/index'
import { AssignmentFormDialog } from '../components/AssignmentFormDialog'
import { AssignmentListPanel } from '../components/AssignmentListPanel'
import { AssignmentRemoveDialog } from '../components/AssignmentRemoveDialog'
import { AssignmentScopeBar } from '../components/AssignmentScopeBar'
import type {
  AdminAssignment,
  AssignmentScope
} from '../types/merchantAssignment.types'
import { toMasterScope, toSubScope } from '../utils/merchantAssignment.utils'

const buildScope = (
  merchant?: PickedEntity,
  sub?: PickedEntity
): AssignmentScope | undefined => {
  if (sub) return toSubScope(sub)
  if (merchant) return toMasterScope(merchant)
  return undefined
}

export default function MerchantAssignmentPage() {
  const [merchant, setMerchant] = useState<PickedEntity>()
  const [sub, setSub] = useState<PickedEntity>()
  const [assigning, setAssigning] = useState<readonly AdminAssignment[] | null>(
    null
  )
  const [removing, setRemoving] = useState<AdminAssignment | null>(null)
  const scope = buildScope(merchant, sub)

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <AssignmentScopeBar
          merchant={merchant}
          sub={sub}
          onMerchantChange={(next) => {
            setMerchant(next)
            setSub(undefined)
          }}
          onSubChange={setSub}
        />
      </CardComponent>
      <AssignmentListPanel
        scope={scope}
        onAssign={setAssigning}
        onRemove={setRemoving}
      />
      {scope && assigning && (
        <AssignmentFormDialog
          key={scope.id}
          scope={scope}
          assigned={assigning}
          onClose={() => setAssigning(null)}
        />
      )}
      {scope && removing && (
        <AssignmentRemoveDialog
          key={`${scope.id}:${removing.adminUserId}`}
          scope={scope}
          assignment={removing}
          onClose={() => setRemoving(null)}
        />
      )}
    </main>
  )
}
