import { PERMISSION } from '@/app/permissions'
import type { ApplicableFeeRule } from '@/app/schemas/applicable-fee-rule.schema'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MerchantFeeRulesCard } from '../components/MerchantFeeRulesCard'
import {
  detailMerchant,
  mockMerchantDetail,
  renderMerchantDetail
} from './merchantDetail.setup'

const mocks = vi.hoisted(() => ({ exportFile: vi.fn() }))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

// Schema query bắt `merchantId` là uuid, nên dùng id đúng dạng ở các case gọi API.
const MERCHANT_ID = '5b0e2c1d-3f4a-4c6b-8d7e-9a1b2c3d4e5f'
const MERCHANT_NAME = 'Công ty A'
const TITLE = 'Quy tắc phí thu hộ / chi hộ dành riêng cho merchant này'
const EMPTY_TEXT =
  'Merchant này chưa có quy tắc phí riêng — đang áp dụng biểu phí chung.'

const rule: ApplicableFeeRule = {
  assignmentId: '7b1f3c2a-8f4e-4a1b-9c33-7d9a1e5b0f22',
  feePolicyId: '1c9d4e77-2b60-4f0a-b1d8-5a2c9e3f4a10',
  feePolicyName: 'Phí thu hộ QR',
  appliedObjectType: 'ACCOUNT',
  customerGroup: null,
  serviceType: null,
  paymentMethod: null,
  cardType: null,
  bankCode: null,
  componentType: 'TRANSACTION_FEE',
  tierFrom: 0,
  tierTo: null,
  formula: '0.8%',
  minFee: null,
  maxFee: null,
  createdAt: null,
  validFrom: null,
  validTo: null,
  effectiveStatus: 'ACTIVE'
}

const createPage = (content: ApplicableFeeRule[]) => ({
  content,
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false,
    sort: { empty: true, sorted: false, unsorted: true }
  },
  totalElements: content.length,
  totalPages: content.length > 0 ? 1 : 0,
  size: 10,
  number: 0,
  numberOfElements: content.length,
  first: true,
  last: true,
  empty: content.length === 0,
  sort: { empty: true, sorted: false, unsorted: true }
})

const mockRules = (
  content: ApplicableFeeRule[],
  onRequest?: (url: URL) => void
) =>
  server.use(
    http.get('*/fee/customer-segments', () => HttpResponse.json({ data: [] })),
    http.get('*/fee/applicable-rules', ({ request }) => {
      const url = new URL(request.url)
      onRequest?.(url)
      return HttpResponse.json({ data: createPage(content) })
    })
  )

const renderCard = () =>
  renderWithProviders(
    <MessageProvider>
      <MerchantFeeRulesCard
        merchantId={MERCHANT_ID}
        merchantLabel={MERCHANT_NAME}
      />
    </MessageProvider>
  )

describe('MerchantFeeRulesCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gửi merchantId cùng subject MERCHANT và miền MERCHANT', async () => {
    const urls: URL[] = []
    mockRules([], (url) => urls.push(url))
    renderCard()

    await waitFor(() => expect(urls.length).toBeGreaterThan(0))
    for (const url of urls) {
      expect(url.searchParams.get('subjectType')).toBe('MERCHANT')
      expect(url.searchParams.get('subjectId')).toBe(MERCHANT_ID)
      // Thiếu merchantId thì backend thêm `merchantId IS NULL` và mất bản gán riêng.
      expect(url.searchParams.get('merchantId')).toBe(MERCHANT_ID)
      expect(url.searchParams.get('appliedObjectTypes')).toBe(
        'ACCOUNT,CUSTOMER_GROUP'
      )
      expect(url.searchParams.get('feeDomain')).toBe('MERCHANT')
    }
  })

  it('hiện tiêu đề và empty state khi API trả rỗng', async () => {
    mockRules([])
    renderCard()

    expect(await screen.findByText(EMPTY_TEXT)).toBeInTheDocument()
    expect(screen.getByText(TITLE)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xuất CSV/ })).toBeDisabled()
  })

  it('dòng ACCOUNT hiện "Merchant cụ thể" kèm tên merchant', async () => {
    mockRules([rule])
    renderCard()

    expect(await screen.findByText('Merchant cụ thể')).toBeInTheDocument()
    expect(screen.getByText(MERCHANT_NAME)).toBeInTheDocument()
    expect(screen.queryByText('Tài khoản')).not.toBeInTheDocument()
  })

  it('dòng CUSTOMER_GROUP hiện "Nhóm merchant"', async () => {
    mockRules([
      { ...rule, appliedObjectType: 'CUSTOMER_GROUP', customerGroup: 'VIP' }
    ])
    renderCard()

    expect(await screen.findByText('Nhóm merchant')).toBeInTheDocument()
    expect(screen.queryByText('Nhóm khách hàng')).not.toBeInTheDocument()
  })

  it('xuất CSV gửi cùng bộ tham số, không kèm page/size', async () => {
    const user = userEvent.setup()
    mockRules([rule])
    renderCard()

    await screen.findByText('Merchant cụ thể')
    await user.click(screen.getByRole('button', { name: /Xuất CSV/ }))

    expect(mocks.exportFile).toHaveBeenCalledWith({
      subjectType: 'MERCHANT',
      subjectId: MERCHANT_ID,
      merchantId: MERCHANT_ID,
      appliedObjectTypes: 'ACCOUNT,CUSTOMER_GROUP',
      feeDomain: 'MERCHANT'
    })
  })
})

describe('MerchantDetail — khối quy tắc phí', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('người không có quyền xem MERCHANT_FEE_CONFIG không thấy khối, không có lỗi', async () => {
    let ruleCalls = 0
    mockMerchantDetail()
    server.use(
      http.get('*/fee/applicable-rules', () => {
        ruleCalls += 1
        return HttpResponse.json({ data: createPage([]) })
      })
    )
    renderMerchantDetail([PERMISSION.MERCHANT_API_VIEW])

    // Chờ hồ sơ tải xong rồi mới khẳng định khối vắng mặt.
    await screen.findByRole('heading', { name: detailMerchant.name })
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(ruleCalls).toBe(0)
  })

  it('người có quyền xem thấy khối đặt sau thẻ phân khúc', async () => {
    mockMerchantDetail()
    server.use(
      http.get('*/merchants/m1', () =>
        HttpResponse.json({
          data: { ...detailMerchant, id: MERCHANT_ID },
          success: true
        })
      ),
      http.get(`*/fee/customer-segments/subjects/MERCHANT/${MERCHANT_ID}`, () =>
        HttpResponse.json({ data: null })
      ),
      http.get('*/fee/applicable-rules', () =>
        HttpResponse.json({ data: createPage([]) })
      )
    )
    renderMerchantDetail([PERMISSION.FEE_VIEW])

    const title = await screen.findByText(TITLE)
    expect(await screen.findByText(EMPTY_TEXT)).toBeInTheDocument()
    const segmentTitle = screen.getByText('Phân khúc khách hàng')
    expect(
      segmentTitle.compareDocumentPosition(title) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})
