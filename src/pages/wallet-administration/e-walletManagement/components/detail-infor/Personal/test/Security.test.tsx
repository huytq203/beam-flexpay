import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/useMessage'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, http } from 'msw'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { Security } from '../Security'

const USER_ID = 'customer-1'

const activeDevice = {
  id: 'device-row-1',
  deviceId: 'AB12CD34',
  deviceName: 'iPhone 15 Pro',
  deviceModel: 'iPhone16,1',
  platform: 'IOS',
  osVersion: '17.2',
  appVersion: '1.0.3',
  status: 'ACTIVE',
  bindingMethod: 'SMS_OTP',
  boundFromIp: '10.0.0.7',
  lastUsedAt: '2026-08-14 09:12:00',
  expiresAt: '2026-11-12 09:12:00',
  createdAt: '2026-05-01 08:00:00',
  expired: false,
  faceId: {
    registered: true,
    status: 'ACTIVE',
    keyAlgorithm: 'ECDSA_P256',
    registeredAt: '2026-05-01 08:05:00',
    lastUsedAt: '2026-08-14 09:12:00',
    totalSuccessCount: 42,
    totalFailureCount: 1,
    consecutiveFailures: 0
  }
}

const deviceResponse = (devices: typeof activeDevice[]) => ({
  data: {
    userId: USER_ID,
    username: '0912345678',
    totalDevices: devices.length,
    devices
  }
})

const renderSecurity = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  const result = render(
    <Provider store={store}>
      <MessageProvider>
        <Security userId={USER_ID} />
      </MessageProvider>
    </Provider>
  )

  return { ...result, user: userEvent.setup() }
}

describe('Security', () => {
  it('hiển thị skeleton trong lúc tải rồi render thiết bị và FaceID', async () => {
    server.use(
      http.get('*/users/customers/customer-1/devices', async () => {
        await delay(60)
        return HttpResponse.json(deviceResponse([activeDevice]))
      })
    )

    renderSecurity(['EWALLET:USER:VIEW'])

    expect(screen.getByLabelText('Đang tải thông tin bảo mật')).toBeInTheDocument()
    expect(await screen.findByText('iPhone 15 Pro')).toBeInTheDocument()
    expect(screen.getByText('FaceID đang hoạt động')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Đăng xuất tất cả thiết bị' })
    ).not.toBeInTheDocument()
  })

  it('hiển thị trạng thái rỗng riêng biệt khi chưa có thiết bị', async () => {
    server.use(
      http.get('*/users/customers/customer-1/devices', () =>
        HttpResponse.json(deviceResponse([]))
      )
    )

    renderSecurity(['EWALLET:USER:VIEW'])

    expect(await screen.findByText('Chưa ghi nhận thiết bị')).toBeInTheDocument()
  })

  it('hiển thị trạng thái đang phát triển khi thông tin chưa khả dụng', async () => {
    let requestCount = 0
    server.use(
      http.get('*/users/customers/customer-1/devices', () => {
        requestCount += 1
        return requestCount === 1
          ? HttpResponse.json({ detail: 'service unavailable' }, { status: 503 })
          : HttpResponse.json(deviceResponse([activeDevice]))
      })
    )
    renderSecurity(['EWALLET:USER:VIEW'])

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Tính năng đang phát triển'
    )
    expect(
      screen.queryByRole('button', { name: 'Thử lại' })
    ).not.toBeInTheDocument()
    expect(requestCount).toBe(1)
  })

  it('xác nhận trước khi logout-all và làm mới danh sách thiết bị', async () => {
    let logoutRequestCount = 0
    let hasLoggedOut = false
    server.use(
      http.get('*/users/customers/customer-1/devices', () =>
        HttpResponse.json(
          deviceResponse(
            hasLoggedOut
              ? [{ ...activeDevice, status: 'REVOKED' }]
              : [activeDevice]
          )
        )
      ),
      http.post('*/users/customers/customer-1/logout-all', () => {
        logoutRequestCount += 1
        hasLoggedOut = true
        return HttpResponse.json({
          data: {
            userId: USER_ID,
            revokedDeviceCount: 1,
            sessionCleared: true,
            revokedAt: '2026-08-17 15:30:00'
          }
        })
      })
    )
    const { user } = renderSecurity(['EWALLET:USER:FULL'])

    await screen.findByText('iPhone 15 Pro')
    await user.click(
      screen.getByRole('button', { name: 'Đăng xuất tất cả thiết bị' })
    )

    expect(screen.getByText('Xác nhận đăng xuất tất cả thiết bị')).toBeInTheDocument()
    expect(logoutRequestCount).toBe(0)

    await user.click(screen.getByRole('button', { name: 'Đăng xuất tất cả' }))

    await waitFor(() => expect(logoutRequestCount).toBe(1))
    expect(await screen.findByText('Đã thu hồi')).toBeInTheDocument()
  })

  it('không gọi API hoặc hiển thị dữ liệu khi thiếu quyền USER', async () => {
    const requestSpy = vi.fn()
    server.use(
      http.get('*/users/customers/customer-1/devices', () => {
        requestSpy()
        return HttpResponse.json(deviceResponse([activeDevice]))
      })
    )

    const { container } = renderSecurity(['EWALLET:WALLET:VIEW'])

    await act(async () => {})
    expect(requestSpy).not.toHaveBeenCalled()
    expect(container).toBeEmptyDOMElement()
  })
})
