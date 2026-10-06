import { ConfigProvider } from 'antd'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { EkycCancelAction } from '../EkycCancelAction'

const makeRecord = (overrides: Partial<EKYCListItem> = {}): EKYCListItem =>
  ({
    fullName: 'Nguyễn Văn A',
    profileId: 'profile-1',
    profileStatus: 'VERIFIED',
    attempts: [],
    ...overrides
  }) as EKYCListItem

const renderAction = (
  record: EKYCListItem,
  permissions = ['EWALLET:ADMIN:FULL']
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  render(
    <Provider store={store}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <MessageProvider>
          <EkycCancelAction record={record} />
        </MessageProvider>
      </ConfigProvider>
    </Provider>
  )
}

const cancelButton = () =>
  screen.queryByRole('button', { name: 'Hủy eKYC Nguyễn Văn A' })

describe('EkycCancelAction', () => {
  it('gọi API hủy bằng profileId rồi đóng dialog', async () => {
    const calls: { id: string; body: unknown }[] = []
    server.use(
      http.post(
        '*/verified-kyc-profiles/:id/cancel',
        async ({ params, request }) => {
          calls.push({ id: String(params.id), body: await request.json() })
          return HttpResponse.json({ data: 'profile-1', success: true })
        }
      )
    )
    renderAction(makeRecord())
    fireEvent.click(cancelButton()!)
    fireEvent.click(await screen.findByRole('button', { name: 'Hủy eKYC' }))
    expect(
      await screen.findByText('Lý do phải từ 10 ký tự trở lên')
    ).toBeInTheDocument()
    expect(calls).toHaveLength(0)
    fireEvent.change(screen.getByLabelText(/Lý do hủy/), {
      target: { value: '  Khách yêu cầu hủy eKYC  ' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Hủy eKYC' }))
    await waitFor(() =>
      expect(calls).toEqual([
        { id: 'profile-1', body: { reason: 'Khách yêu cầu hủy eKYC' } }
      ])
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  it('giữ dialog và báo lỗi khi BE từ chối', async () => {
    server.use(
      http.post('*/verified-kyc-profiles/:id/cancel', () =>
        HttpResponse.json(
          { success: false, detail: 'Hồ sơ đã hết hạn, không thể hủy' },
          { status: 400 }
        )
      )
    )
    renderAction(makeRecord())
    fireEvent.click(cancelButton()!)
    fireEvent.change(await screen.findByLabelText(/Lý do hủy/), {
      target: { value: 'Khách yêu cầu hủy eKYC' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Hủy eKYC' }))
    expect(
      await screen.findByText('Hồ sơ đã hết hạn, không thể hủy')
    ).toBeInTheDocument()
  })

  it.each([
    ['hồ sơ chưa xác thực', { profileStatus: null }],
    ['hồ sơ đã thu hồi', { profileStatus: 'INVALID' }],
    ['thiếu profileId', { profileId: null }]
  ])('ẩn icon với %s', (_, overrides) => {
    renderAction(makeRecord(overrides))
    expect(cancelButton()).toBeNull()
  })

  it('ẩn icon khi thiếu quyền', () => {
    renderAction(makeRecord(), ['EWALLET:TRANSACTION:VIEW'])
    expect(cancelButton()).toBeNull()
  })
})
