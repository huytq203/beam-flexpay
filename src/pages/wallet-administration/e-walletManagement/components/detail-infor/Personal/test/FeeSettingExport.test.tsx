import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/useMessage'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FeeSetting } from '../FeeSetting'

const WALLET_ID = '6f1a0f7e-6b0b-4a3f-9b2e-9f0d4a4c1b21'
const OWNER_ID = '9d3e5f4a-8b6c-4a21-8c32-7e9f4b2d6a53'
const POLICY_ID = 'c0a80101-0000-4000-8000-000000000abc'

const rule = {
  assignmentId: 'a0a80101-0000-4000-8000-000000000001',
  feePolicyId: POLICY_ID,
  feePolicyName: 'Biểu phí ví chuẩn',
  appliedObjectType: 'ALL',
  customerGroup: null,
  serviceType: null,
  paymentMethod: null,
  cardType: null,
  bankCode: null,
  componentType: 'TRANSACTION_FEE',
  tierFrom: 0,
  tierTo: null,
  formula: '0.5%',
  minFee: null,
  maxFee: null,
  createdAt: null,
  validFrom: null,
  validTo: null,
  effectiveStatus: 'ACTIVE'
}

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  getRules: vi.fn(),
  isEmpty: false
}))

vi.mock('@/app/services/apiApplicableFeeRule', () => ({
  useGetApplicableFeeRulesQuery: (
    params: Record<string, unknown>,
    options?: { skip?: boolean }
  ) => {
    if (!options?.skip) mocks.getRules(params)
    // `size: 100` là truy vấn nguồn cho ô Chính sách phí, không phải bảng.
    const isPolicyOptionsQuery = params.size === 100
    const isEmptyResult = mocks.isEmpty && !isPolicyOptionsQuery
    return {
      data: {
        content: isEmptyResult ? [] : [rule],
        totalElements: isEmptyResult ? 0 : 1
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn()
    }
  }
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportApplicableFeeRulesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@services/apiFeeBank', () => ({
  useGetBankQuery: () => ({
    data: { data: { content: [{ code: 'VCB', name: 'Vietcombank' }] } }
  })
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

const renderTab = () =>
  renderWithProviders(
    <MessageProvider>
      <FeeSetting
        walletId={WALLET_ID}
        walletLabel='0962341913'
        subjectId={OWNER_ID}
      />
    </MessageProvider>
  )

describe('Tab Cấu hình phí — xuất CSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isEmpty = false
  })

  it('nói rõ quy tắc không ghim điều kiện vẫn nằm trong kết quả', () => {
    renderTab()

    expect(
      screen.getByText(/bản gán để trống một ô nghĩa là áp dụng cho tất cả/i)
    ).toBeInTheDocument()
  })

  it('gửi bộ lọc kèm phạm vi ví, không kèm page/size', async () => {
    const user = userEvent.setup()
    renderTab()

    await user.click(screen.getByLabelText('Ngân hàng'))
    await user.click(await screen.findByTitle('Vietcombank'))
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await user.click(screen.getByRole('button', { name: /Xuất CSV/i }))

    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith({
        subjectType: 'USER',
        subjectId: OWNER_ID,
        appliedObjectTypes: 'ACCOUNT,CUSTOMER_GROUP',
        feeDomain: 'EWALLET',
        bankCode: 'VCB'
      })
    )
  })

  it('đổ danh sách chính sách từ chính quy tắc của ví', async () => {
    const user = userEvent.setup()
    renderTab()

    await user.click(screen.getByLabelText('Chính sách phí'))

    expect(await screen.findByTitle('Biểu phí ví chuẩn')).toBeInTheDocument()
  })

  it('nói rõ bảng rỗng là do bộ lọc chứ không phải ví chưa có quy tắc', async () => {
    const user = userEvent.setup()
    mocks.isEmpty = true
    renderTab()

    await user.click(screen.getByLabelText('Loại thẻ'))
    await user.click(await screen.findByTitle('Quốc tế'))
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    const status = await screen.findByRole('status')
    expect(
      within(status).getByText('Không có quy tắc phí khớp bộ lọc')
    ).toBeInTheDocument()
  })
})
