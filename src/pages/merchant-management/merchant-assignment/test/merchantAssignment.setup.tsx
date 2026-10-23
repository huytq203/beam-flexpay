import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { suppressAntPseudoElementWarning } from '../../sub-merchant-management/sub-merchant/test/domTestSetup'
import { AssignmentListPanel } from '../components/AssignmentListPanel'
import { AssignmentFormDialog } from '../components/AssignmentFormDialog'
import { AssignmentRemoveDialog } from '../components/AssignmentRemoveDialog'
import type {
  AdminAssignment,
  AssignmentScope
} from '../types/merchantAssignment.types'

suppressAntPseudoElementWarning()

export const SCOPE: AssignmentScope = {
  level: 'master',
  id: 'm1',
  label: 'Master Công ty Cà phê Mộc (MC0001)'
}

export const ASSIGNMENTS: AdminAssignment[] = [
  {
    adminUserId: 'u-sales-1',
    assignedAt: '2026-10-22T10:15:30',
    assignedBy: 'u-admin'
  },
  {
    adminUserId: 'u-sales-2',
    assignedAt: '2026-10-21T08:00:00',
    assignedBy: null
  }
]

const USERS: Record<string, Record<string, unknown>> = {
  'u-sales-1': {
    id: 'u-sales-1',
    username: 'sales.an',
    firstName: 'An',
    lastName: 'Nguyễn'
  },
  'u-sales-2': {
    id: 'u-sales-2',
    username: 'sales.binh',
    firstName: 'Bình',
    lastName: 'Trần'
  },
  'u-admin': {
    id: 'u-admin',
    username: 'admin.root',
    firstName: null,
    lastName: null
  }
}

const envelope = (data: unknown) => HttpResponse.json({ data, success: true })

afterEach(() => sessionStorage.clear())
beforeEach(() => {
  server.use(
    http.get('*/merchants/m1/assignments', () => envelope(ASSIGNMENTS)),
    http.get('*/users/managers/:id', ({ params }) => {
      const user = USERS[String(params.id)]
      return user ? envelope(user) : new HttpResponse(null, { status: 404 })
    }),
    http.get('*/users/managers', () =>
      envelope({
        content: [
          { ...USERS['u-sales-1'], email: 'an@beam.vn', enabled: true },
          { ...USERS['u-sales-2'], email: 'binh@beam.vn', enabled: true }
        ],
        totalElements: 2,
        number: 0,
        size: 10
      })
    )
  )
})

export const VIEW_ONLY = [PERMISSION.MERCHANT_ASSIGNMENT_VIEW]
export const MANAGE = [
  PERMISSION.MERCHANT_ASSIGNMENT_VIEW,
  PERMISSION.MERCHANT_ASSIGNMENT_MANAGE
]

const renderWithStore = (ui: React.ReactNode, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

/** Panel danh sách kèm hai hộp thoại, giống cách trang nối chúng. */
export const renderPanel = (
  permissions: string[] = MANAGE,
  onAssign = (_rows: readonly AdminAssignment[]) => {},
  onRemove = (_row: AdminAssignment) => {}
) =>
  renderWithStore(
    <AssignmentListPanel
      scope={SCOPE}
      onAssign={onAssign}
      onRemove={onRemove}
    />,
    permissions
  )

export const renderAssignDialog = (onClose = () => {}) =>
  renderWithStore(
    <AssignmentFormDialog
      scope={SCOPE}
      assigned={[ASSIGNMENTS[0]]}
      onClose={onClose}
    />,
    MANAGE
  )

export const renderRemoveDialog = (onClose = () => {}) =>
  renderWithStore(
    <AssignmentRemoveDialog
      scope={SCOPE}
      assignment={ASSIGNMENTS[0]}
      onClose={onClose}
    />,
    MANAGE
  )
