import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import DialogUserDetail from '../DialogUserDetail'

describe('DialogUserDetail', () => {
  it('hiển thị đầy đủ dấu vết tạo và cập nhật từ Keycloak attributes', async () => {
    server.use(
      http.get('*/users/managers/manager-1', () =>
        HttpResponse.json({
          data: {
            id: 'manager-1',
            username: 'nguyenvana',
            email: 'vana@beamewa.com.vn',
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            phoneNumber: '0912345678',
            enabled: true,
            emailVerified: true,
            createdTimestamp: '2026-08-01T08:00:00',
            createdAt: '2026-08-01T08:05:00',
            createdBy: 'root.admin',
            updatedAt: '2026-08-10T09:15:30',
            updatedBy: 'admin.cms',
            groups: ['ACCOUNTANT']
          }
        })
      )
    )

    renderWithProviders(<DialogUserDetail userId='manager-1' />)

    expect(await screen.findByText('Dấu vết thao tác')).toBeInTheDocument()
    expect(screen.getByText('01/08/2026 08:05:00')).toBeInTheDocument()
    expect(screen.getByText('root.admin')).toBeInTheDocument()
    expect(screen.getByText('10/08/2026 09:15:30')).toBeInTheDocument()
    expect(screen.getByText('admin.cms')).toBeInTheDocument()
  })
})
