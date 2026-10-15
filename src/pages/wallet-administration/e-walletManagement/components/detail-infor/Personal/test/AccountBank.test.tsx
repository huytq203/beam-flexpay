import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import AccountBank from '../AccountBank'
import { buildBankLinkSearchFilters } from '../utils/bank-link-search'

const USER_ID = 'bc948626-2c8f-4f41-a866-7540d59a7e07'
const WALLET_ACCOUNT_ID = '0df48377-cb08-45c5-91f8-c02f6a859f86'

const bankLink = {
  id: '0df48377-cb08-45c5-91f8-c02f6a859f87',
  userId: USER_ID,
  bankCode: 'VCB',
  walletId: 'owner-user-001',
  accountName: 'NGUYEN VAN A',
  accountNumberMask: '******6789',
  cardNumberMask: '************1234',
  linkType: 'ACCOUNT',
  isDefault: true,
  status: 'ACTIVE',
  linkedAt: '2026-08-15T09:30:00',
  unlinkedAt: null
}

const createPage = () => ({
  content: [bankLink],
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false,
    sort: { empty: false, sorted: true, unsorted: false }
  },
  totalPages: 3,
  totalElements: 25,
  last: false,
  size: 10,
  number: 0,
  sort: { empty: false, sorted: true, unsorted: false },
  numberOfElements: 1,
  first: true,
  empty: false
})

const renderAccountBank = (component: React.ReactElement) => renderWithProviders(
  <MessageProvider>{component}</MessageProvider>
)

describe('AccountBank', () => {
  beforeEach(() => {
    server.use(
      http.get('https://api.vietqr.io/v2/banks', () => HttpResponse.json({
        code: '00',
        data: [{
          code: 'VCB',
          shortName: 'Vietcombank',
          logo: 'https://cdn.vietqr.io/img/VCB.png'
        }]
      }))
    )
  })

  it('gửi ownerId làm userId và hiển thị dữ liệu liên kết có phân trang', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const onUnlink = vi.fn()
    const onApprove = vi.fn()

    server.use(
      http.get('*/bank-links', ({ request }) => {
        const url = new URL(request.url)

        expect(url.searchParams.get('userId')).toBe(USER_ID)
        expect(url.searchParams.has('walletId')).toBe(false)
        expect(url.searchParams.get('page')).toBe('1')
        expect(url.searchParams.get('size')).toBe('10')
        expect(url.searchParams.get('sortBy')).toBe('linkedAt')
        expect(url.searchParams.get('sortDirection')).toBe('DESC')

        return HttpResponse.json({ data: createPage() })
      })
    )

    renderAccountBank(
      <AccountBank
        userId={USER_ID}
        walletAccountId={WALLET_ACCOUNT_ID}
        onUpdateBankLink={onUpdate}
        onUnlinkBankLink={onUnlink}
        onApproveBankLink={onApprove}
      />
    )

    expect(await screen.findByText('Vietcombank')).toBeInTheDocument()
    expect(
      screen.getAllByText('Tài khoản').find((element) => (
        element.classList.contains('bg-primary/10')
      ))
    ).toBeInTheDocument()
    expect(screen.getByText('Đang hoạt động')).toHaveClass('text-success-strong')
    expect(screen.getByText('******6789')).toBeInTheDocument()
    expect(screen.getByText('************1234')).toBeInTheDocument()
    expect(screen.getByText('NGUYEN VAN A')).toBeInTheDocument()
    expect(screen.getByText('15/08/2026 09:30:00')).toBeInTheDocument()
    expect(screen.getByText('Hiển thị 1-10/ 25 Bản ghi')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cập nhật liên kết ngân hàng' }))
    await user.click(screen.getByRole('button', { name: 'Phê duyệt xác thực liên kết ngân hàng' }))
    await user.click(screen.getByRole('button', { name: 'Hủy liên kết ngân hàng' }))

    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: bankLink.id }))
    expect(onUnlink).toHaveBeenCalledWith(expect.objectContaining({ id: bankLink.id }))
    expect(onApprove).toHaveBeenCalledWith(expect.objectContaining({ id: bankLink.id }))
  })

  it('gửi các bộ lọc nhập nhanh và luôn giữ userId của chủ ví', async () => {
    const user = userEvent.setup()
    let receivedFilteredRequest = false

    server.use(
      http.get('*/bank-links', ({ request }) => {
        const url = new URL(request.url)

        if (url.searchParams.get('bankCode')) {
          receivedFilteredRequest = true
          expect(url.searchParams.get('userId')).toBe(USER_ID)
          expect(url.searchParams.get('bankCode')).toBe('VCB')
          expect(url.searchParams.get('walletId')).toBe('wallet-001')
          expect(url.searchParams.get('linkType')).toBe('ACCOUNT')
          expect(url.searchParams.get('status')).toBe('ACTIVE')
          expect(url.searchParams.get('accountName')).toBe('NGUYEN VAN A')
          expect(url.searchParams.get('accountNumber')).toBe('123456789')
          expect(url.searchParams.get('page')).toBe('1')
        }

        return HttpResponse.json({ data: createPage() })
      })
    )

    renderAccountBank(
      <AccountBank
        userId={USER_ID}
        walletAccountId={WALLET_ACCOUNT_ID}
      />
    )
    await screen.findByText('Vietcombank')

    /** Chọn một option của antd Select qua nhãn của trường. */
    /**
     * Chọn option của antd Select. Phải nhắm vào `.ant-select-item-option-content`
     * vì rc-select còn dựng một listbox ẩn cho screen reader cũng mang role="option".
     */
    const selectOption = async (fieldLabel: string, optionLabel: string) => {
      await user.click(screen.getByLabelText(fieldLabel))
      const option = await screen.findByText(optionLabel, {
        selector: '.ant-select-item-option-content'
      })
      await user.click(option)
    }

    expect(screen.getByLabelText('Tài khoản ví')).toHaveAttribute('maxlength', '255')
    expect(screen.getByLabelText('Tên chủ tài khoản')).toHaveAttribute('maxlength', '255')
    expect(screen.getByLabelText('Số tài khoản đầy đủ')).toHaveAttribute('maxlength', '32')
    expect(screen.getByLabelText('Ngân hàng')).toHaveAttribute('role', 'combobox')
    expect(screen.getByLabelText('Loại liên kết')).toHaveAttribute('role', 'combobox')
    expect(screen.getByLabelText('Trạng thái')).toHaveAttribute('role', 'combobox')

    await selectOption('Ngân hàng', 'Vietcombank')
    await selectOption('Loại liên kết', 'Tài khoản')
    await selectOption('Trạng thái', 'Đang hoạt động')
    await user.type(screen.getByLabelText('Tài khoản ví'), 'wallet-001')
    await user.type(screen.getByLabelText('Tên chủ tài khoản'), 'NGUYEN VAN A')
    await user.type(screen.getByLabelText('Số tài khoản đầy đủ'), '123456789')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => expect(receivedFilteredRequest).toBe(true))
  })

  it('cảnh báo, hiển thị bank card và gọi API hủy liên kết sau khi xác nhận', async () => {
    const user = userEvent.setup()
    let unlinkedId = ''

    server.use(
      http.get('*/bank-links', () => HttpResponse.json({ data: createPage() })),
      http.post('*/bank-links/:id/unlink', ({ params }) => {
        unlinkedId = String(params.id)
        return HttpResponse.json({
          data: {
            userId: USER_ID,
            bankCode: 'VCB',
            unlinkedLinks: [{ ...bankLink, status: 'UNLINKED' }],
            bankSyncStatus: 'SUCCESS',
            unlinkedAt: '2026-08-15T10:00:00'
          }
        })
      })
    )

    renderAccountBank(
      <AccountBank
        userId={USER_ID}
        walletAccountId={WALLET_ACCOUNT_ID}
      />
    )
    await screen.findByText('Vietcombank')

    await user.click(screen.getByRole('button', { name: 'Hủy liên kết ngân hàng' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Hành động này không thể hoàn tác')
    expect(dialog).toHaveTextContent(
      'Người dùng sẽ không thể nạp hoặc rút tiền qua tài khoản này.'
    )

    const bankCard = screen.getByTestId('bank-unlink-card')
    expect(bankCard).not.toHaveTextContent('Tài khoản gỡ bỏ')
    expect(bankCard).toHaveTextContent('Vietcombank')
    expect(bankCard).toHaveTextContent('******6789')
    expect(bankCard).toHaveTextContent('NGUYEN VAN A')
    expect(await screen.findByRole('img', { name: 'Logo Vietcombank' })).toHaveAttribute(
      'src',
      'https://cdn.vietqr.io/img/VCB.png'
    )

    await user.click(screen.getByRole('button', { name: 'Xác nhận hủy liên kết' }))

    await waitFor(() => expect(unlinkedId).toBe(bankLink.id))
    await waitFor(() => expect(dialog).toHaveClass('ant-zoom-leave'))
  })

  it('chuẩn hóa dữ liệu và giữ nguyên các khoảng thời gian ISO', () => {
    expect(buildBankLinkSearchFilters({
      bankCode: '  VCB  ',
      walletId: ' ',
      linkedAtFrom: '2026-08-01T00:00:00.000',
      linkedAtTo: '2026-08-15T23:59:59.000',
      unlinkedAtFrom: '2026-08-16T00:00:00.000',
      unlinkedAtTo: '2026-08-20T23:59:59.000'
    })).toEqual({
      bankCode: 'VCB',
      walletId: undefined,
      linkType: undefined,
      status: undefined,
      accountName: undefined,
      accountNumber: undefined,
      linkedAtFrom: '2026-08-01T00:00:00.000',
      linkedAtTo: '2026-08-15T23:59:59.000',
      unlinkedAtFrom: '2026-08-16T00:00:00.000',
      unlinkedAtTo: '2026-08-20T23:59:59.000'
    })
  })
})
