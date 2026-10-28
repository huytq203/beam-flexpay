import { type RouteObject } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { WalletRoutes } from '@/routes'
import { PATHS } from '@/app/constants/pathConstant'
import { resolveHeaderTitleKey } from '@/app/utils/header-title'
import headerTitle from '@/app/languages/vi/headerTitle.json'

const flattenRoutePaths = (routes: readonly RouteObject[]): string[] =>
  routes.flatMap((route) => [
    ...(route.path ? [route.path] : []),
    ...flattenRoutePaths(route.children ?? [])
  ])

const titles = headerTitle['header-title'] as Record<string, string>
const titleOf = (pathname: string): string | undefined => {
  const key = resolveHeaderTitleKey(pathname, (k) => k in titles)
  return key ? titles[key] : undefined
}

describe('route Cấu hình phí ĐVCNTT', () => {
  it('đăng ký ba route danh sách, tạo, sửa dưới khối merchant', () => {
    expect(flattenRoutePaths(WalletRoutes.routes)).toEqual(
      expect.arrayContaining([
        '/secure-panel/merchant/fee-config',
        '/secure-panel/merchant/fee-config/create',
        '/secure-panel/merchant/fee-config/edit/:id'
      ])
    )
  })

  it('header và breadcrumb có tiêu đề cho cả ba đường dẫn', () => {
    expect(titleOf(PATHS.MERCHANT_FEE.LIST)).toBe('Cấu hình phí ĐVCNTT')
    expect(titleOf(PATHS.MERCHANT_FEE.CREATE)).toBe(
      'Tạo chính sách phí ĐVCNTT'
    )
    expect(titleOf(PATHS.MERCHANT_FEE.EDIT('abc'))).toBe(
      'Sửa chính sách phí ĐVCNTT'
    )
  })
})
