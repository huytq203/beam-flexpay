import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import type { EnterpriseWalletDto } from '@type/enterpriseWallet'
import type { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { EnterpriseProfile } from '../components/EnterpriseProfile'

const WALLET_ID = 'cc688c64-b9b0-48c2-859d-f4f239ceb15d'

const account = (ownerType: string): AcountItem => ({
  id: 'fe386b34-1bc0-47ae-9cc2-c89a94b26c30',
  ownerId: WALLET_ID,
  ownerType,
  ownerUsername: 'Beamtech00002',
  createdAt: '2026-10-22T12:17:15',
  updatedAt: '2026-10-22T12:17:15',
  createdBy: 'system',
  updatedBy: 'system',
  glCode: 'MERCHANT_EWALLET_VND',
  currency: 'VND',
  totalDebit: 0,
  totalCredit: 0,
  balance: 0,
  holdBalance: 0,
  availableBalance: 0,
  version: 0,
  status: 'ACTIVE',
  enabled: true,
  checksum: ''
})

const document = (id: string, filename: string, contentType: string) => ({
  id,
  filename,
  contentType,
  sizeBytes: 1024,
  url: `https://files.test/${id}`,
  urlExpiresAt: '2099-01-01T00:00:00'
})

const wallet: EnterpriseWalletDto = {
  id: WALLET_ID,
  registeredEmail: 'hat50000@gmail.com',
  verificationStatus: 'VERIFIED',
  bankLinkStatus: 'BANK_UNLINKED',
  legalName: 'Beamtech00002',
  taxCode: '1234567892',
  businessType: 'ENTERPRISE',
  headOfficeAddress: 'định công, hà nội',
  legalRepresentativeName: 'Hồ văn hùng',
  legalRepresentativeIdNumber: '999999999999',
  managerName: 'Nguyễn Quản Lý',
  managerTitle: 'giám đốc',
  managerIdNumber: '888888888888',
  managerIdExpiryDate: '2026-10-31',
  otpPhone: null,
  businessLicense: document('license', 'hop_dong.pdf', 'application/pdf'),
  idCardFront: document('front', 'front.jpg', 'image/jpeg'),
  idCardBack: document('back', 'back.jpg', 'image/jpeg'),
  authorizationLetter: null,
  internalWallet: true,
  createdAt: '2026-10-21T13:28:28'
}

const mockDetail = (respond: () => Response) =>
  server.use(http.get(`*/enterprise-wallets/${WALLET_ID}`, respond))

describe('EnterpriseProfile', () => {
  it('hiển thị hồ sơ pháp lý và người đại diện từ API', async () => {
    mockDetail(() => HttpResponse.json({ data: wallet, success: true }))
    renderWithProviders(<EnterpriseProfile account={account('ENTERPRISE')} />)

    expect(await screen.findByText('1234567892')).toBeInTheDocument()
    expect(screen.getByText('Doanh nghiệp')).toBeInTheDocument()
    expect(screen.getByText('Đã xác minh')).toBeInTheDocument()
    expect(screen.getByText('hop_dong.pdf')).toBeInTheDocument()
    expect(screen.getByText('Chưa đính kèm')).toBeInTheDocument()

    await userEvent.click(screen.getByText('2. Người đại diện'))

    expect(screen.getByText('Hồ văn hùng')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Quản Lý')).toBeInTheDocument()
    expect(screen.getByText('31/10/2026')).toBeInTheDocument()
    expect(screen.getByText('front.jpg')).toBeInTheDocument()
  })

  it('không gọi API với ví không phải doanh nghiệp', () => {
    let called = false
    mockDetail(() => {
      called = true
      return HttpResponse.json({ data: wallet, success: true })
    })
    renderWithProviders(<EnterpriseProfile account={account('MERCHANT')} />)

    expect(
      screen.getByText('Ví này không có hồ sơ doanh nghiệp.')
    ).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('báo lỗi và cho thử lại khi API lỗi', async () => {
    mockDetail(() => HttpResponse.json({ success: false }, { status: 500 }))
    renderWithProviders(<EnterpriseProfile account={account('ENTERPRISE')} />)

    expect(
      await screen.findByText('Không tải được hồ sơ doanh nghiệp.')
    ).toBeInTheDocument()

    mockDetail(() => HttpResponse.json({ data: wallet, success: true }))
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByText('1234567892')).toBeInTheDocument()
  })
})
