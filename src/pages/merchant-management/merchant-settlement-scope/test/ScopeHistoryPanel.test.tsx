import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import { ScopeHistoryPanel } from '../components/ScopeHistoryPanel'

/** Dòng lịch sử đúng contract BE: camelCase, `snapshot` là object hoặc null. */
const historyRow = (
  id: string,
  changedAt: string,
  reason: string,
  snapshot: Record<string, unknown> | null
) => ({
  id,
  level: 'MASTER',
  targetId: 'm-1',
  targetCode: 'M1',
  targetName: 'Master 1',
  changedAt,
  changedBy: 'u-1',
  changedByName: 'admin95',
  reason,
  snapshot
})

/** Bọc mảng thành Page của Spring (`content` + tổng số), như BE trả. */
const page = (
  content: unknown[],
  totalElements: number,
  number: number,
  size: number
) => ({
  data: {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / size),
    size,
    number,
    first: number === 0,
    last: (number + 1) * size >= totalElements,
    empty: content.length === 0
  }
})

const renderPanel = () =>
  renderWithStore(
    <ScopeHistoryPanel
      initialMaster={{ id: 'm-1', code: 'M1', name: 'Master 1' }}
    />,
    [PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW]
  )

describe('ScopeHistoryPanel', { timeout: 20000 }, () => {
  it('đọc Page camelCase, diễn giải snapshot object, dòng null là kế thừa, hiện tên người thực hiện', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get('*/settlement-config/history', ({ request }) => {
        query = new URL(request.url).searchParams
        return HttpResponse.json(
          page(
            [
              historyRow(
                'h2',
                '2026-10-23T02:00:00Z',
                'Gỡ cấu hình riêng',
                null
              ),
              historyRow('h1', '2026-10-22T03:15:30Z', 'Điều chỉnh chu kỳ', {
                settlementMode: 'AUTOMATIC',
                holdbackDays: 3
              })
            ],
            2,
            0,
            10
          )
        )
      })
    )
    renderPanel()
    expect(
      await screen.findByText('Không còn cấu hình riêng (kế thừa)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Chế độ: Kế thừa → Tự động theo chu kỳ')
    ).toBeInTheDocument()
    expect(
      screen.getByText('T+N (ngày chờ): Kế thừa → 3 ngày')
    ).toBeInTheDocument()
    expect(screen.getAllByText('admin95')).toHaveLength(2)
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    expect(query?.get('level')).toBe('MASTER')
    expect(query?.get('targetId')).toBe('m-1')
    // BE đánh trang từ 1.
    expect(query?.get('page')).toBe('1')
    expect(query?.get('size')).toBe('10')
  })

  it('phân trang ở server: dòng cuối trang so với dòng đầu trang sau, chuyển trang gửi page mới', async () => {
    const requests: URLSearchParams[] = []
    // 11 dòng: h11 (mới nhất) … h1; holdbackDays = số thứ tự để thấy rõ diff.
    const all = Array.from({ length: 11 }, (_, i) => {
      const n = 11 - i
      return historyRow(
        `h${n}`,
        `2026-10-${String(n + 10).padStart(2, '0')}T00:00:00Z`,
        `Lần ${n}`,
        { holdbackDays: n }
      )
    })
    server.use(
      http.get('*/settlement-config/history', ({ request }) => {
        const params = new URL(request.url).searchParams
        requests.push(params)
        const p = Number(params.get('page'))
        const s = Number(params.get('size'))
        const slice = all.slice((p - 1) * s, p * s)
        return HttpResponse.json(page(slice, all.length, p - 1, s))
      })
    )
    renderPanel()
    // Dòng cuối trang 1 là h2 (2 ngày); dòng cũ hơn liền kề là h1 (1 ngày) ở trang 2.
    expect(
      await screen.findByText('T+N (ngày chờ): 1 ngày → 2 ngày')
    ).toBeInTheDocument()
    // Lời gọi lấy 1 dòng kế tiếp: size=1, page = 10 + 1.
    expect(
      requests.some(
        (q) => q.get('size') === '1' && q.get('page') === '11'
      )
    ).toBe(true)

    await userEvent.click(screen.getByTitle('2'))
    expect(await screen.findByText('Lần 1')).toBeInTheDocument()
    expect(
      requests.some((q) => q.get('size') === '10' && q.get('page') === '2')
    ).toBe(true)
  })
})
