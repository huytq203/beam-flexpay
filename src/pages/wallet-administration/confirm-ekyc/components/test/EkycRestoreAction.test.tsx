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
import { EkycRestoreAction } from '../EkycRestoreAction'

const makeRecord = (overrides: Partial<EKYCListItem> = {}): EKYCListItem =>
  ({
    fullName: 'Nguyễn Văn A',
    profileId: 'profile-1',
    profileStatus: 'INVALID',
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
          <EkycRestoreAction record={record} />
        </MessageProvider>
      </ConfigProvider>
    </Provider>
  )
}

const restoreButton = () =>
  screen.queryByRole('button', { name: 'Mở lại eKYC Nguyễn Văn A' })
const cancelButton = () =>
  screen.queryByRole('button', { name: 'Hủy eKYC Nguyễn Văn A' })

describe('EkycRestoreAction', () => {
  it.each([
    ['VERIFIED', false, true],
    ['INVALID', true, false],
    ['REVERIFY_REQUIRED', false, false],
    ['EXPIRED', false, false],
    [null, false, false]
  ])(
    'profileStatus %s: hiện Mở lại=%s, Hủy=%s',
    (profileStatus, canRestore, canCancel) => {
      renderAction(makeRecord({ profileStatus }))
      expect(restoreButton() !== null).toBe(canRestore)
      expect(cancelButton() !== null).toBe(canCancel)
    }
  )

  it('ẩn nút khi thiếu quyền hoặc thiếu profileId', () => {
    renderAction(makeRecord(), ['EWALLET:TRANSACTION:VIEW'])
    expect(restoreButton()).toBeNull()
  })

  it('ẩn nút khi thiếu profileId', () => {
    renderAction(makeRecord({ profileId: null }))
    expect(restoreButton()).toBeNull()
  })

  it('xác nhận gọi đúng profileId, không body, chỉ gọi một lần khi bấm đúp', async () => {
    const calls: { id: string; body: string }[] = []
    server.use(
      http.post(
        '*/verified-kyc-profiles/:id/restore',
        async ({ params, request }) => {
          calls.push({ id: String(params.id), body: await request.text() })
          await new Promise((resolve) => setTimeout(resolve, 50))
          return HttpResponse.json({
            data: 'profile-1',
            success: true,
            detail: 'Khôi phục eKYC thành công'
          })
        }
      )
    )
    renderAction(makeRecord())
    fireEvent.click(restoreButton()!)
    expect(
      await screen.findByText(
        /Người dùng sẽ phải eKYC lại và sẽ nhận thông báo/
      )
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/Lý do/)).toBeNull()
    const ok = screen.getByRole('button', { name: 'Mở lại eKYC' })
    fireEvent.click(ok)
    fireEvent.click(ok)
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toEqual({ id: 'profile-1', body: '' })
    expect(
      await screen.findByText('Khôi phục eKYC thành công')
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(calls).toHaveLength(1)
  })

  it.each([
    [400, 'Chỉ hồ sơ eKYC đã bị hủy mới có thể khôi phục.'],
    [404, 'Tài nguyên không tồn tại']
  ])('giữ dialog và hiện detail khi BE trả %s', async (status, detail) => {
    server.use(
      http.post('*/verified-kyc-profiles/:id/restore', () =>
        HttpResponse.json({ success: false, detail }, { status })
      )
    )
    renderAction(makeRecord())
    fireEvent.click(restoreButton()!)
    fireEvent.click(await screen.findByRole('button', { name: 'Mở lại eKYC' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(detail)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
