import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import BankAccount from '../pages/BankAccount'

beforeEach(() => server.use(
  http.get('*/merchants', () => HttpResponse.json({ data: { content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }], totalElements: 1 } })),
  http.get('*/merchant-bank-accounts', () => HttpResponse.json({ data: { content: [{ id: 'bank-1', merchantId: 'merchant-1', level: 'MASTER', bankCode: 'VCB', accountNumber: '0071000124821', accountName: 'Công ty A', isDefault: true, status: 'ACTIVE', linkStatus: 'LINKED', holdMode: false }], totalElements: 1, number: 0, size: 20 } })),
  http.get('*/fee/banks', () => HttpResponse.json({ data: { content: [{ code: 'VCB', name: 'Vietcombank' }], totalElements: 1 } })),
  http.get('*/sub-merchants', () => HttpResponse.json({ data: { content: [{ id: 'sub-1', merchantId: 'merchant-1', code: 'S001', name: 'Chi nhánh A' }], totalElements: 1 } }))
))

const renderPage = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(<Provider store={store}><MemoryRouter><BankAccount /></MemoryRouter></Provider>)
}

describe('BankAccount API', () => {
  it('hiển thị tài khoản thật và che số tài khoản', async () => {
    renderPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW])
    expect(await screen.findByText('Công ty A')).toBeInTheDocument()
    expect(screen.getByText('Merchant A')).toBeInTheDocument()
    expect(screen.getByText('••••4821')).toBeInTheDocument()
    expect(screen.queryByText('0071000124821')).toBeNull()
    expect(screen.getByRole('button', { name: 'Làm mới dữ liệu' })).toBeInTheDocument()
  })

  it('chỉ hiện nút thêm khi có quyền quản lý', async () => {
    renderPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW])
    await screen.findByText('Công ty A')
    expect(screen.queryByRole('button', { name: 'Thêm tài khoản' })).toBeNull()
  })

  it('mở form tạo theo contract ngân hàng', async () => {
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW, PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE])
    await screen.findByText('Công ty A')
    await user.click(screen.getByRole('button', { name: /Thêm tài khoản/ }))
    expect(await screen.findByRole('dialog', { name: 'Thêm tài khoản ngân hàng' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Ngân hàng' })).toBeInTheDocument()
  })

  it('yêu cầu OTP trước khi tạo tài khoản theo contract BE', async () => {
    let challengeRequested = false
    let createdBody: unknown
    server.use(
      http.post('*/sensitive-operations/otp-challenge', async ({ request }) => {
        expect(await request.json()).toMatchObject({ operation: 'BANK_ACCOUNT_CHANGE' })
        challengeRequested = true
        return HttpResponse.json({ data: { otpSessionId: 'session-1', maskedRecipient: '******5678', expiresInSeconds: 180, canResendAfterSeconds: 30 }, success: true })
      }),
      http.post('*/merchant-bank-accounts', async ({ request }) => { createdBody = await request.json(); return HttpResponse.json({ data: {}, success: true }) })
    )
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW, PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE])
    await screen.findByText('Công ty A')
    await user.click(screen.getByRole('button', { name: /Thêm tài khoản/ }))
    await user.click(screen.getByRole('combobox', { name: 'Ngân hàng' }))
    await user.click(await screen.findByText('Vietcombank (VCB)'))
    await user.type(screen.getByLabelText(/^Số tài khoản/), '0071000124821')
    await user.type(screen.getByLabelText(/^Tên chủ tài khoản/), 'Công ty A')
    await user.click(within(screen.getByRole('dialog', { name: 'Thêm tài khoản ngân hàng' })).getByRole('button', { name: 'Thêm mới' }))
    expect(await screen.findByText(/Mã OTP đã gửi tới/)).toBeInTheDocument()
    expect(challengeRequested).toBe(true)
    expect(createdBody).toBeUndefined()
    await user.type(screen.getByLabelText('Mã OTP'), '123456')
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() => expect(createdBody).toMatchObject({ merchantId: 'merchant-1', bankCode: 'VCB', accountName: 'CÔNG TY A', otp: { otpSessionId: 'session-1', otp: '123456' } }))
    expect(createdBody).not.toHaveProperty('allowDifferentHolderName')
  })

  it('TK Master tích "dùng tên khác pháp nhân" thì gửi allowDifferentHolderName=true', async () => {
    let createdBody: unknown
    server.use(
      http.post('*/sensitive-operations/otp-challenge', () => HttpResponse.json({ data: { otpSessionId: 'session-1', maskedRecipient: '******5678', expiresInSeconds: 180, canResendAfterSeconds: 30 }, success: true })),
      http.post('*/merchant-bank-accounts', async ({ request }) => { createdBody = await request.json(); return HttpResponse.json({ data: {}, success: true }) })
    )
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW, PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE])
    await screen.findByText('Công ty A')
    await user.click(screen.getByRole('button', { name: /Thêm tài khoản/ }))
    await user.click(screen.getByRole('combobox', { name: 'Ngân hàng' }))
    await user.click(await screen.findByText('Vietcombank (VCB)'))
    await user.type(screen.getByLabelText(/^Số tài khoản/), '0071000124821')
    await user.type(screen.getByLabelText(/^Tên chủ tài khoản/), 'Nguyen Van B')
    await user.click(screen.getByRole('checkbox', { name: /tên khác tên pháp nhân/ }))
    await user.click(within(screen.getByRole('dialog', { name: 'Thêm tài khoản ngân hàng' })).getByRole('button', { name: 'Thêm mới' }))
    await user.type(await screen.findByLabelText('Mã OTP'), '123456')
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() => expect(createdBody).toMatchObject({ merchantId: 'merchant-1', accountName: 'NGUYEN VAN B', allowDifferentHolderName: true }))
  })
})
