import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'

import KeyConnectionPage from '../pages/KeyConnectionPage'

beforeEach(() => {
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }],
          totalElements: 1,
          number: 0,
          size: 100
        }
      })
    ),
    http.get('*/merchant-api-credentials', () =>
      HttpResponse.json({
        data: {
          content: [
            {
              id: 'key-1',
              merchantId: 'merchant-1',
              clientId: 'client-public',
              name: 'Key sản xuất',
              status: 'ACTIVE',
              ipWhitelist: ['203.113.1.10']
            }
          ],
          totalElements: 1,
          number: 0,
          size: 20
        }
      })
    )
  )
})

const renderPage = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<KeyConnectionPage />, { store })
}

describe('KeyConnectionPage API', () => {
  it('lọc theo Merchant và trạng thái khi bấm Tìm kiếm, rồi xóa cả hai bộ lọc', async () => {
    const user = userEvent.setup()
    const requests: URL[] = []
    server.use(
      http.get('*/merchant-api-credentials', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json({
          data: { content: [], totalElements: 0, number: 0, size: 20 }
        })
      })
    )
    renderPage([PERMISSION.API_CREDENTIAL_VIEW])
    await screen.findByRole('button', { name: 'Tìm kiếm' })
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    await user.click(screen.getByLabelText('Merchant'))
    await user.click(await screen.findByLabelText('Chọn Merchant Merchant A'))
    await waitFor(() =>
      expect(screen.getByLabelText('Merchant')).toHaveValue('M001 — Merchant A')
    )
    fireEvent.mouseDown(
      screen
        .getAllByLabelText('Lọc trạng thái key')[0]
        .querySelector('.ant-select-selector')!
    )
    await user.click(
      await screen.findByText('Đã thu hồi', {
        selector: '.ant-select-item-option-content'
      })
    )
    expect(requests.at(-1)?.searchParams.get('merchantId')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('merchantId')).toBe('merchant-1')
      expect(requests.at(-1)?.searchParams.get('status')).toBe('REVOKED')
    })
    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('merchantId')).toBeNull()
      expect(requests.at(-1)?.searchParams.get('status')).toBeNull()
    })
  })

  it('thu hồi key qua API sau khi nhập lý do hợp lệ', async () => {
    const user = userEvent.setup()
    let revokedBody: unknown
    server.use(
      http.post(
        '*/merchant-api-credentials/key-1/revoke',
        async ({ request }) => {
          revokedBody = await request.json()
          return HttpResponse.json({ data: { id: 'key-1', status: 'REVOKED' } })
        }
      )
    )
    renderPage([
      PERMISSION.API_CREDENTIAL_VIEW,
      PERMISSION.API_CREDENTIAL_MANAGE
    ])
    await screen.findByText('client-public')
    await user.click(screen.getByRole('button', { name: 'Thu hồi' }))
    const dialog = screen.getByRole('dialog', { name: 'Thu hồi key' })
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Lý do thu hồi' }),
      'Ngắn'
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận thu hồi' })
    )
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'tối thiểu 10 ký tự'
    )
    expect(revokedBody).toBeUndefined()
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Lý do thu hồi' }),
      ' do key bị lộ'
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận thu hồi' })
    )
    await waitFor(() =>
      expect(revokedBody).toEqual({ reason: 'Ngắn do key bị lộ' })
    )
  })

  it('bấm thao tác trên dòng không làm bung phần chi tiết', async () => {
    const user = userEvent.setup()
    renderPage([
      PERMISSION.API_CREDENTIAL_VIEW,
      PERMISSION.API_CREDENTIAL_MANAGE
    ])
    await screen.findByText('client-public')
    await user.click(screen.getByRole('button', { name: 'Thu hồi' }))
    expect(
      screen.getByRole('dialog', { name: 'Thu hồi key' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xem chi tiết key' })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('hiển thị credential từ API, không lộ secret trên danh sách', async () => {
    renderPage([PERMISSION.API_CREDENTIAL_VIEW])
    expect(await screen.findByText('client-public')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    expect(screen.getByText('Merchant A')).toBeInTheDocument()
    expect(screen.getByText('203.113.1.10')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Làm mới dữ liệu' })
    ).toBeInTheDocument()
  })

  it('chỉ hiện thao tác sửa và tạo khi có quyền', async () => {
    renderPage([PERMISSION.API_CREDENTIAL_VIEW])
    await screen.findByText('client-public')
    expect(screen.queryByRole('button', { name: 'Tạo key' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Xoay key' })).toBeNull()
  })

  it('hiển thị secret đúng một lần sau khi tạo', async () => {
    const user = userEvent.setup()
    let createdBody: unknown
    server.use(
      http.post('*/merchant-api-credentials', async ({ request }) => {
        createdBody = await request.json()
        return HttpResponse.json({
          data: {
            credential: {
              id: 'key-2',
              merchantId: 'merchant-1',
              clientId: 'new-client',
              status: 'ACTIVE',
              ipWhitelist: []
            },
            secretKey: 'secret-once'
          }
        })
      })
    )
    renderPage([
      PERMISSION.API_CREDENTIAL_VIEW,
      PERMISSION.API_CREDENTIAL_MANAGE
    ])
    await screen.findByText('client-public')
    await user.click(screen.getByRole('button', { name: 'Tạo key' }))
    expect(screen.getByText('Sub-merchant · kế thừa')).toBeInTheDocument()
    expect(screen.getByText('Terminal · kế thừa')).toBeInTheDocument()
    const createDialog = screen.getByRole('dialog', { name: 'Tạo key kết nối' })
    await user.click(
      within(createDialog).getByLabelText(/Chọn Master Merchant/)
    )
    await user.click(await screen.findByLabelText('Chọn Merchant Merchant A'))
    await waitFor(() =>
      expect(screen.getByLabelText(/Chọn Master Merchant/)).toHaveValue(
        'M001 — Merchant A'
      )
    )
    await user.click(
      within(createDialog).getByRole('button', { name: 'Tạo key' })
    )
    expect(await screen.findByText('secret-once')).toBeInTheDocument()
    expect(screen.getByText('new-client')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sao chép Client ID / Merchant Key' })
    ).toHaveClass('ant-typography-copy')
    expect(
      screen.getByRole('button', { name: 'Sao chép Secret Key' })
    ).toHaveClass('ant-typography-copy')
    expect(createdBody).toMatchObject({
      merchantId: 'merchant-1',
      ipWhitelist: []
    })
    expect(createdBody).not.toHaveProperty('clientId')
    expect(createdBody).not.toHaveProperty('secretKey')
  })

  it('hiển thị vòng đời và chi tiết key đã thu hồi từ API', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/merchant-api-credentials', () =>
        HttpResponse.json({
          data: {
            content: [
              {
                id: 'key-revoked',
                merchantId: 'merchant-1',
                clientId: 'M_MC000001_XVO1FF',
                name: 'connect halotech',
                ipWhitelist: ['100.66.126.10'],
                status: 'REVOKED',
                version: 4,
                expiresAt: null,
                lastUsedAt: null,
                rotatedAt: '2026-09-24T14:54:12.463422',
                previousSecretExpiresAt: null,
                revokedAt: '2026-09-24T15:05:06.582837',
                revokedBy: 'huytq',
                revokeReason: 'okeeeeeeeeee',
                createdAt: '2026-09-24T14:32:03.90044',
                updatedAt: '2026-09-24T15:05:06.594483'
              }
            ],
            totalElements: 1,
            number: 0,
            size: 20
          }
        })
      )
    )
    renderPage([PERMISSION.API_CREDENTIAL_VIEW])
    expect(await screen.findByText('connect halotech')).toBeInTheDocument()
    expect(screen.getByText('Phiên bản v4')).toBeInTheDocument()
    expect(screen.getByText('100.66.126.10')).toBeInTheDocument()
    expect(screen.getByText('Đã kết thúc')).toBeInTheDocument()
    await user.click(screen.getByText('connect halotech'))
    expect(screen.queryByText('okeeeeeeeeee')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xem chi tiết key' }))
    expect(await screen.findByText('okeeeeeeeeee')).toBeInTheDocument()
    expect(screen.getByText('huytq')).toBeInTheDocument()
    expect(screen.getByText('Không đặt hạn')).toBeInTheDocument()
  })
})
