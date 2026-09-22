import { type RouteObject } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { WalletRoutes } from '@/routes'
import headerTitle from '@/app/languages/vi/headerTitle.json'

const flattenRoutePaths = (routes: readonly RouteObject[]): string[] =>
  routes.flatMap((route) => [
    ...(route.path ? [route.path] : []),
    ...flattenRoutePaths(route.children ?? [])
  ])

describe('merchant hierarchy routes', () => {
  it('registers list, create, edit and detail routes for both entities', () => {
    const paths = flattenRoutePaths(WalletRoutes.routes)

    expect(paths).toEqual(
      expect.arrayContaining([
        '/secure-panel/merchant/sub-merchant',
        '/secure-panel/merchant/sub-merchant/create',
        '/secure-panel/merchant/sub-merchant/edit/:id',
        '/secure-panel/merchant/sub-merchant/detail/:id',
        '/secure-panel/merchant/terminal',
        '/secure-panel/merchant/terminal/create',
        '/secure-panel/merchant/terminal/edit/:id',
        '/secure-panel/merchant/terminal/detail/:id'
      ])
    )
  })

  it('có tiêu đề shell ổn định cho mọi route Sub-merchant và Terminal', () => {
    const titles = headerTitle['header-title']

    expect(titles).toMatchObject({
      '/secure-panel/merchant/sub-merchant': 'Danh sách sub-merchant',
      '/secure-panel/merchant/sub-merchant/create': 'Thêm Sub-merchant',
      '/secure-panel/merchant/sub-merchant/edit/*': 'Cập nhật Sub-merchant',
      '/secure-panel/merchant/sub-merchant/detail/*': 'Chi tiết Sub-merchant',
      '/secure-panel/merchant/terminal': 'Quản lý Terminal',
      '/secure-panel/merchant/terminal/create': 'Thêm Terminal',
      '/secure-panel/merchant/terminal/edit/*': 'Cập nhật Terminal',
      '/secure-panel/merchant/terminal/detail/*': 'Chi tiết Terminal'
    })
  })
})
