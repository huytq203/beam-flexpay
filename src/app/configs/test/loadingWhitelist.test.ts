import { describe, expect, it } from 'vitest'
import { isInWhiteList } from '@configs/fetchBaseQuery.types'

const EWALLET_PATH = '/secure-panel/wallet-administration/e-walletManagement'
const FEE_POLICY_PATH = '/secure-panel/fee-v4/fee-policy'

describe('whitelist của global loading', () => {
  it.each([
    `${FEE_POLICY_PATH}/create`,
    `${FEE_POLICY_PATH}/edit/fee-policy-id`
  ])('bỏ global loader khi tìm ví ở màn cấu hình phí %s', (pathname) => {
    expect(isInWhiteList('/wallet/accounts', pathname)).toBeDefined()
  })

  it('không whitelist danh sách ví ngoài màn cấu hình phí', () => {
    expect(
      isInWhiteList('/wallet/accounts', '/secure-panel/fee-v4/fee-assignmentV4')
    ).toBeUndefined()
  })

  it.each([
    '/fee/policies/search?feeDomain=EWALLET&includeConfiguration=true',
    '/fee/policies/export?feeDomain=EWALLET',
    '/fee/banks?page=1&size=100'
  ])('bỏ global loader cho API có loading cục bộ ở danh sách chính sách phí: %s', (url) => {
    expect(isInWhiteList(url, FEE_POLICY_PATH)).toBeDefined()
    expect(
      isInWhiteList(url, `${FEE_POLICY_PATH}/edit/policy-id`)
    ).toBeDefined()
  })

  it('không whitelist API danh sách phí ở màn không liên quan', () => {
    expect(
      isInWhiteList(
        '/fee/policies/search?feeDomain=EWALLET',
        '/secure-panel/transaction-management'
      )
    ).toBeUndefined()
  })

  it.each([
    '/fee/policy-assignments/by-policy/policy-id',
    '/fee/policy-components/by-policy/policy-id',
    '/fee/component-tiers/by-component/component-id'
  ])('không giữ whitelist cho API chi tiết cũ không còn dùng ở list: %s', (url) => {
    expect(isInWhiteList(url, FEE_POLICY_PATH)).toBeUndefined()
  })

  it('bỏ global loader cho bank-links ở màn chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/bank-links',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('không whitelist bank-links ngoài màn quản lý ví', () => {
    expect(
      isInWhiteList('/bank-links', '/secure-panel/transaction-management')
    ).toBeUndefined()
  })

  it('bỏ global loader cho display-info ở màn chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/user-wallets/69282920-fdeb-47f2-8d4c-d57201b76e5d/display-info',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('không whitelist display-info ngoài màn quản lý ví', () => {
    expect(
      isInWhiteList(
        '/user-wallets/69282920-fdeb-47f2-8d4c-d57201b76e5d/display-info',
        '/secure-panel/transaction-management'
      )
    ).toBeUndefined()
  })

  it('bỏ global loader cho export lịch sử giao dịch ở màn chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/wallet/transactions/export',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('bỏ global loader cho export liên kết ngân hàng có id nằm giữa URL', () => {
    expect(
      isInWhiteList(
        '/wallet/accounts/bc948626-2c8f-4f41-a866-7540d59a7e07/bank-links/export',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('bỏ global loader cho export quy tắc phí ở màn chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/fee/applicable-rules/export',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeDefined()
  })

  it('không whitelist URL export ngoài màn quản lý ví', () => {
    expect(
      isInWhiteList(
        '/wallet/freezes/export',
        '/secure-panel/transaction-management'
      )
    ).toBeUndefined()
  })

  it('vẫn giữ global loader cho request tải chi tiết ví', () => {
    expect(
      isInWhiteList(
        '/wallet/accounts/bc948626-2c8f-4f41-a866-7540d59a7e07',
        `${EWALLET_PATH}/bc948626-2c8f-4f41-a866-7540d59a7e07`
      )
    ).toBeUndefined()
  })

  it.each([
    ['/merchants', '/secure-panel/merchant/sub-merchant/create'],
    ['/merchants', '/secure-panel/merchant/user'],
    ['/merchants', '/secure-panel/merchant/user-role'],
    ['/merchants', '/secure-panel/merchant/key-connection'],
    ['/merchants', '/secure-panel/merchant/bank-account'],
    ['/sub-merchants', '/secure-panel/merchant/terminal/create'],
    ['/merchants/merchant-1', '/secure-panel/merchant/sub-merchant/edit/sub-1']
  ])('bỏ global loader cho dialog chọn Merchant: %s tại %s', (url, pathname) => {
    expect(isInWhiteList(url, pathname)).toBeDefined()
  })

  it('không whitelist API Merchant ở màn không có dialog chọn', () => {
    expect(
      isInWhiteList('/merchants', '/secure-panel/merchant/merchant-management')
    ).toBeUndefined()
    expect(
      isInWhiteList('/merchant-users', '/secure-panel/merchant/user')
    ).toBeUndefined()
  })
})

describe('whitelist global loading của màn Cấu hình phí đầu vào', () => {
  it.each([
    '/fee/policies/search?policyKind=INPUT_COST&includeConfiguration=true',
    '/fee/policies/export?policyKind=INPUT_COST',
    '/fee/banks?page=1&size=100'
  ])('bỏ global loader cho API có loading cục bộ: %s', (url) => {
    expect(
      isInWhiteList(url, '/secure-panel/fee-v4/fee-input-cost')
    ).toBeDefined()
  })
})

describe('whitelist global loading của màn Báo cáo phí đầu vào', () => {
  it.each([
    '/fee/input-cost-report/summary?from=2026-10-01&to=2026-10-23',
    '/fee/input-cost-report/transactions?from=2026-10-01&to=2026-10-23&page=1&size=20',
    '/fee/input-cost-report/export?from=2026-10-01&to=2026-10-23',
    '/fee/banks?page=1&size=100'
  ])('bỏ global loader cho API có loading cục bộ: %s', (url) => {
    expect(
      isInWhiteList(url, '/secure-panel/fee-v4/fee-input-cost-report')
    ).toBeDefined()
  })
})
