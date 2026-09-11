import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import CommonInfor from '../CommonInfor'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { ContentEKYC } from '@type/apiResponseEKYC'
import { StatusKey } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'
import { BankLinkStatusEnum } from '../constants/AccountBank.constant'

const OWNER_ID = 'bc948626-2c8f-4f41-a866-7540d59a7e07'

const accountData = {
  id: 'wallet-001',
  ownerId: OWNER_ID,
  ownerUsername: '0900000001',
  ownerType: 'USER',
  currency: 'VND',
  balance: 1000000,
  holdBalance: 200000,
  availableBalance: 800000,
  status: StatusKey.ACTIVE,
  createdAt: '2026-08-01T03:00:00Z'
} as unknown as AcountItem

const ekycData = {
  fullName: 'NGUYEN VAN A',
  username: '0900000001',
  email: 'nguyenvana@example.com',
  occupation: 'Kỹ sư',
  position: 'Trưởng phòng',
  status: 'VERIFIED',
  faceMatchScore: 92
} as unknown as ContentEKYC

const bankLink = (overrides: Record<string, unknown> = {}) => ({
  id: 'link-001',
  bankCode: 'VCB',
  linkType: 'ACCOUNT',
  cardNumberMask: null,
  accountNumberMask: '******6789',
  accountName: 'NGUYEN VAN A',
  status: BankLinkStatusEnum.ACTIVE,
  isDefault: true,
  isSalaryAccount: true,
  linkedAt: '2026-08-01T03:00:00Z',
  ...overrides
})

const mockDisplayInfo = (
  body: Record<string, unknown>,
  onRequest?: (userId: string) => void
) => {
  server.use(
    http.get('*/user-wallets/:userId/display-info', ({ params }) => {
      onRequest?.(params.userId as string)
      return HttpResponse.json({ data: { userId: OWNER_ID, ...body } })
    })
  )
}

describe('CommonInfor', () => {
  it('hiển thị email, nghề nghiệp và chức vụ từ hồ sơ eKYC', () => {
    mockDisplayInfo({ salaryAdvanceEnabled: false, linkedBanks: [] })

    renderWithProviders(<CommonInfor accountData={accountData} ekycData={ekycData} />)

    expect(screen.getByText('nguyenvana@example.com')).toBeInTheDocument()
    expect(screen.getByText('Kỹ sư')).toBeInTheDocument()
    expect(screen.getByText('Trưởng phòng')).toBeInTheDocument()
  })

  it('gọi display-info bằng ownerId và hiển thị trạng thái ứng lương, tài khoản nhận lương, liên kết ngân hàng', async () => {
    const onRequest = vi.fn()
    mockDisplayInfo({ salaryAdvanceEnabled: true, linkedBanks: [bankLink()] }, onRequest)

    renderWithProviders(<CommonInfor accountData={accountData} ekycData={ekycData} />)

    expect(await screen.findByText('Đang bật')).toBeInTheDocument()
    expect(await screen.findAllByText('Đã liên kết')).toHaveLength(2)
    expect(onRequest).toHaveBeenCalledWith(OWNER_ID)
  })

  it('coi là chưa liên kết khi status của liên kết không còn hiệu lực', async () => {
    mockDisplayInfo({
      salaryAdvanceEnabled: false,
      linkedBanks: [bankLink({ status: 'UNLINKED' })]
    })

    renderWithProviders(<CommonInfor accountData={accountData} ekycData={ekycData} />)

    expect(await screen.findAllByText('Chưa liên kết')).toHaveLength(3)
  })

  it('hiện lối thử lại cho từng trường khi display-info lỗi', async () => {
    server.use(
      http.get('*/user-wallets/:userId/display-info', () =>
        HttpResponse.json({ success: false, message: 'INTERNAL_ERROR' }, { status: 500 })
      )
    )

    renderWithProviders(<CommonInfor accountData={accountData} ekycData={ekycData} />)

    expect(await screen.findByRole('button', { name: 'Tải lại Ứng lương' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tải lại Liên kết NH' })).toBeInTheDocument()
  })

  it('hiển thị số dư đầy đủ và trạng thái ví theo tông dùng chung', async () => {
    mockDisplayInfo({ salaryAdvanceEnabled: true, linkedBanks: [bankLink()] })

    renderWithProviders(<CommonInfor accountData={accountData} ekycData={ekycData} />)

    expect(screen.getByText('1,000,000 ₫')).toBeInTheDocument()
    expect(screen.getByText('800,000 ₫')).toBeInTheDocument()
    expect(screen.getByText('200,000 ₫')).toBeInTheDocument()
    expect(screen.getByText('Hoạt động')).toHaveClass('success-status')
  })
})
