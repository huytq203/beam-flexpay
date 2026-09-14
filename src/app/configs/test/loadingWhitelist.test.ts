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
})
