import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  ASSIGNMENTS,
  MANAGE,
  VIEW_ONLY,
  envelope,
  renderOverview,
  renderPanel,
  renderSubPanel
} from './merchantAssignment.setup'

vi.setConfig({ testTimeout: 30000 })

describe('Sales kế thừa ở Sub-merchant', () => {
  it('gửi includeInherited=true, gắn nhãn và không cho gỡ dòng kế thừa', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get('*/sub-merchants/s1/assignments', ({ request }) => {
        query = new URL(request.url).searchParams
        return envelope([
          { ...ASSIGNMENTS[0], inheritedFromMaster: false },
          { ...ASSIGNMENTS[1], inheritedFromMaster: true }
        ])
      })
    )
    renderSubPanel()
    const inherited = (await screen.findByText('Trần Bình')).closest('tr')!
    expect(query?.get('includeInherited')).toBe('true')
    expect(within(inherited).getByText('Kế thừa từ Master')).toBeInTheDocument()
    expect(within(inherited).queryByLabelText('Gỡ phụ trách')).toBeNull()
    expect(screen.getAllByLabelText('Gỡ phụ trách')).toHaveLength(1)
  })
})

describe('quyền quản lý phân công lấy từ /merchant-assignments/me', () => {
  it('ẩn nút gán và gỡ khi BE báo không quản lý được dù có quyền MANAGE', async () => {
    server.use(
      http.get('*/merchant-assignments/me', () =>
        envelope({ canManageAssignments: false, roles: ['SALES'] })
      )
    )
    renderPanel(MANAGE)
    await screen.findByText('Nguyễn An')
    await vi.waitFor(() =>
      expect(screen.queryByRole('button', { name: /Gán Sales/ })).toBeNull()
    )
    expect(screen.queryByLabelText('Gỡ phụ trách')).toBeNull()
  })
})

describe('danh sách mọi phân công', () => {
  it('gọi /merchant-assignments với page 1 và hiển thị tên do BE trả sẵn', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get('*/merchant-assignments', ({ request }) => {
        query = new URL(request.url).searchParams
        return envelope({
          content: [
            {
              level: 'SUB',
              merchantId: 'm1',
              merchantCode: 'MC1',
              merchantName: 'Cà phê Mộc',
              subMerchantId: 's1',
              subMerchantCode: 'SB1',
              subMerchantName: 'Quầy 1',
              adminUserId: 'u-sales-1',
              adminFullName: 'Nguyễn An',
              adminUsername: 'sales.an',
              adminEmail: 'an@beam.vn',
              assignedAt: '2026-10-22T10:15:30',
              assignedBy: 'u-admin',
              assignedByName: 'Admin Root'
            }
          ],
          totalElements: 1,
          number: 1,
          size: 20
        })
      })
    )
    renderOverview(VIEW_ONLY)
    const row = (await screen.findByText('Nguyễn An')).closest('tr')!
    expect(query?.get('page')).toBe('1')
    expect(query?.get('size')).toBe('20')
    expect(within(row).getByText('Quầy 1')).toBeInTheDocument()
    expect(within(row).getByText('Admin Root')).toBeInTheDocument()
    expect(screen.getByText('1 dòng gán')).toBeInTheDocument()
  })

  it('gửi search và level khi bấm Tìm kiếm', async () => {
    const user = userEvent.setup()
    const queries: URLSearchParams[] = []
    server.use(
      http.get('*/merchant-assignments', ({ request }) => {
        queries.push(new URL(request.url).searchParams)
        return HttpResponse.json({
          data: { content: [], totalElements: 0, number: 1, size: 20 }
        })
      })
    )
    renderOverview()
    await screen.findByText('Chưa có dòng gán nào khớp bộ lọc')
    await user.type(screen.getByLabelText('Từ khóa'), 'an')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await vi.waitFor(() => expect(queries.at(-1)?.get('search')).toBe('an'))
  })
})
