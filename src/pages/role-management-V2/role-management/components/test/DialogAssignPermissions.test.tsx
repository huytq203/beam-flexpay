import { describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import DialogAssignPermissions from '../DialogAssignPermissions'

describe('DialogAssignPermissions', () => {
  it('tải danh mục quyền theo createdAt DESC đúng contract BE', async () => {
    const permissionQueries: URLSearchParams[] = []
    server.use(
      http.get('*/roles/:roleId/permissions', () =>
        HttpResponse.json({ success: true, data: [] })
      ),
      http.get('*/permissions', ({ request }) => {
        permissionQueries.push(new URL(request.url).searchParams)
        return HttpResponse.json({
          success: true,
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0
          }
        })
      })
    )

    renderWithProviders(
      <MessageProvider>
        <DialogAssignPermissions
          roleId='role-1'
          onSuccess={vi.fn()}
        />
      </MessageProvider>
    )

    await waitFor(() => expect(permissionQueries).toHaveLength(1))
    expect(permissionQueries[0].get('sortBy')).toBe('createdAt')
    expect(permissionQueries[0].get('sortDirection')).toBe('DESC')
  })
})
