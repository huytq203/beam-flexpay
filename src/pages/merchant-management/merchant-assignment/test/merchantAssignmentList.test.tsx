import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { describeAssignmentError } from '../utils/assignmentError.utils'
import { MANAGE, VIEW_ONLY, renderPanel } from './merchantAssignment.setup'

// Máy dev chậm: dựng bảng antd có thể vượt 5 giây mặc định.
vi.setConfig({ testTimeout: 30000 })

describe('danh sách Sales phụ trách', () => {
  it('hiển thị cột # cùng tên người phụ trách tra từ danh bạ admin', async () => {
    renderPanel()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    const row = (await screen.findByText('Nguyễn An')).closest('tr')!
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(within(row).getByText('sales.an')).toBeInTheDocument()
    expect(await screen.findByText('Trần Bình')).toBeInTheDocument()
    expect(screen.getByText('2 người phụ trách')).toBeInTheDocument()
  })

  it('báo trống khi chưa ai được gán', async () => {
    server.use(
      http.get('*/merchants/m1/assignments', () =>
        HttpResponse.json({ data: [], success: true })
      )
    )
    renderPanel()
    expect(
      await screen.findByText('Chưa có Sales nào được gán phụ trách')
    ).toBeInTheDocument()
  })

  it('báo lỗi bằng detail của BE và cho thử lại', async () => {
    server.use(
      http.get('*/merchants/m1/assignments', () =>
        HttpResponse.json(
          { message: 'RESOURCE_NOT_FOUND', detail: 'Merchant không tìm thấy' },
          { status: 404 }
        )
      )
    )
    renderPanel()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Merchant không tìm thấy'
    )
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })

  it('chỉ có quyền xem thì ẩn nút gán và gỡ', async () => {
    renderPanel(VIEW_ONLY)
    await screen.findByText('Nguyễn An')
    expect(screen.queryByRole('button', { name: /Gán Sales/ })).toBeNull()
    expect(screen.queryByLabelText('Gỡ phụ trách')).toBeNull()
  })

  it('có quyền MANAGE thì hiện nút gán và gỡ từng dòng', async () => {
    renderPanel(MANAGE)
    await screen.findByText('Nguyễn An')
    expect(screen.getByRole('button', { name: /Gán Sales/ })).toBeEnabled()
    expect(screen.getAllByLabelText('Gỡ phụ trách')).toHaveLength(2)
  })
})

describe('đổi mã lỗi BE sang tiếng Việt', () => {
  it('403 giữ nguyên detail của BE để phân biệt vai trò và phạm vi', () => {
    const error = {
      data: {
        message: 'ADMIN_PERMISSION_DENIED',
        detail: 'Chỉ Super Admin và Admin mới được gán Sales phụ trách'
      }
    }
    expect(describeAssignmentError(error, 'x')).toBe(
      'Chỉ Super Admin và Admin mới được gán Sales phụ trách'
    )
  })

  it('500 dùng câu dự phòng và lỗi validate gộp thông báo từng trường', () => {
    expect(
      describeAssignmentError(
        { data: { message: 'INTERNAL_SERVER_ERROR', detail: 'Lỗi hệ thống' } },
        'Không thể gỡ'
      )
    ).toBe('Không thể gỡ')
    expect(
      describeAssignmentError(
        {
          data: {
            message: 'VALIDATION_ERROR',
            data: { reason: 'Lý do gán không được để trống' }
          }
        },
        'x'
      )
    ).toBe('Lý do gán không được để trống')
  })
})
