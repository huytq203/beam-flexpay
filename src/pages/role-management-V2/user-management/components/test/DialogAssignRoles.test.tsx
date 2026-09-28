import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import DialogAssignRoles from '../DialogAssignRoles'

describe('DialogAssignRoles', () => {
  it('lấy mô tả làm nhãn nhóm quyền và có ô tìm kiếm', async () => {
    const keywords: string[] = []
    server.use(
      http.get('*/roles/search', ({ request }) => {
        const keyword = new URL(request.url).searchParams.get('keyword') ?? ''
        keywords.push(keyword)
        const roles = [
          {
            id: 'role-1',
            name: 'OPERATIONS',
            description: 'Vận hành giao dịch'
          },
          { id: 'role-2', name: 'ACCOUNTING', description: 'Kế toán' }
        ].filter((role) => role.name.includes(keyword))
        return HttpResponse.json({
          success: true,
          data: {
            content: roles,
            totalElements: roles.length,
            number: 0,
            size: 1000
          }
        })
      })
    )
    renderWithProviders(
      <MessageProvider>
        <DialogAssignRoles
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />
      </MessageProvider>
    )
    expect(await screen.findByText('Vận hành giao dịch')).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Mô tả' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Tên nhóm quyền' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Tìm nhóm quyền' })
    ).toBeInTheDocument()
    await userEvent
      .setup()
      .type(
        screen.getByRole('textbox', { name: 'Tìm nhóm quyền' }),
        'ACCOUNTING'
      )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => expect(keywords).toContain('ACCOUNTING'))
    expect(await screen.findByText('Kế toán')).toBeInTheDocument()
    expect(screen.queryByText('Vận hành giao dịch')).not.toBeInTheDocument()
  })
})
