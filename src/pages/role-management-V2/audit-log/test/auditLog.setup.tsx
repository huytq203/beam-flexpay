import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { suppressAntPseudoElementWarning } from '@/pages/merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import AuditLogPage from '../pages/AuditLogPage'

suppressAntPseudoElementWarning()

export const AUDIT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

export const record = (overrides: Record<string, unknown> = {}) => ({
  id: AUDIT_ID,
  entityName: 'merchants',
  entityId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  action: 'LOCK',
  actorType: 'ewallet-admin',
  actorId: '5d3b6a4e-1f0a-4c1a-9b9e-2f8f3a3b1c11',
  actorUsername: 'admin.hung',
  source: 'flex.merchant',
  ipAddress: '10.0.12.34',
  requestId: '9a1f4c1e-0d1a-4f7e-8f55-1c1d7f0b2a10',
  reason: 'Nghi ngờ gian lận',
  oldData: '{"status":"ACTIVE","name":"A"}',
  newData: '{"status":"LOCKED","name":"A"}',
  occurredAt: '2026-10-20T14:32:10',
  ...overrides
})

export const page = (content: unknown[], totalElements = content.length) =>
  HttpResponse.json({
    data: { content, totalElements, number: 0, size: 20 },
    success: true
  })

export const VIEW_ONLY = [PERMISSION.AUDIT_VIEW]
export const WITH_EXPORT = [PERMISSION.AUDIT_VIEW, PERMISSION.AUDIT_EXPORT]

afterEach(() => sessionStorage.clear())
beforeEach(() => {
  server.use(
    http.get('*/audit-logs', () => page([record()])),
    http.get('*/audit-logs/:id', () =>
      HttpResponse.json({ data: record(), success: true })
    )
  )
})

export const renderPage = (permissions: string[] = VIEW_ONLY) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<AuditLogPage />, { store })
}
