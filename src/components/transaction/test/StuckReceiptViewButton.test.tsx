import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { StuckReceiptViewButton } from '../StuckReceiptViewButton'

const CODE = 'FW26IHYGP'
const URL = 'https://bucket.s3.ap-southeast-1.amazonaws.com/receipt.png?sig=1'

const renderButton = (permissions = ['EWALLET:EWALLET:FULL']) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  render(
    <Provider store={store}>
      <MessageProvider>
        <StuckReceiptViewButton transactionCode={CODE} />
      </MessageProvider>
    </Provider>
  )
  return userEvent.setup({ delay: null })
}

const mockReceipt = (data: object, status = 200) => {
  const counter = { calls: 0 }
  server.use(
    http.get(`*/transactions/${CODE}/receipt`, () => {
      counter.calls += 1
      return HttpResponse.json(status === 200 ? { data } : data, { status })
    })
  )
  return counter
}

afterEach(() => vi.restoreAllMocks())

describe('StuckReceiptViewButton', () => {
  it('chỉ gọi API khi bấm, mỗi lần bấm lấy link mới và mở tab mới với noopener', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const receipt = mockReceipt({ receiptUrl: URL })
    const user = renderButton()

    expect(receipt.calls).toBe(0)
    await user.click(screen.getByRole('button', { name: 'Xem biên lai' }))
    await waitFor(() => expect(open).toHaveBeenCalledTimes(1))
    expect(open).toHaveBeenCalledWith(URL, '_blank', 'noopener,noreferrer')

    await user.click(
      await screen.findByRole('button', { name: /Xem biên lai/ })
    )
    await waitFor(() => expect(receipt.calls).toBe(2))
  })

  it('data rỗng: báo chưa có biên lai và không mở tab', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    mockReceipt({})
    const user = renderButton()
    await user.click(screen.getByRole('button', { name: 'Xem biên lai' }))

    expect(await screen.findByText('Giao dịch chưa có biên lai')).toBeVisible()
    expect(open).not.toHaveBeenCalled()
  })

  it('lỗi 400 hiện nguyên văn detail', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    mockReceipt(
      { message: 'BUSINESS_ERROR', detail: 'Không đọc được biên lai' },
      400
    )
    const user = renderButton()
    await user.click(screen.getByRole('button', { name: 'Xem biên lai' }))

    expect(await screen.findByText('Không đọc được biên lai')).toBeVisible()
    expect(open).not.toHaveBeenCalled()
  })

  it('ẩn khi thiếu EWALLET:FULL', () => {
    renderButton(['EWALLET:TRANSACTION:VIEW'])

    expect(screen.queryByRole('button', { name: 'Xem biên lai' })).toBeNull()
  })
})
