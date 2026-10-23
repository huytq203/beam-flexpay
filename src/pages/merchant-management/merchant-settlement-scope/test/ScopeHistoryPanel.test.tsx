import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import { ScopeHistoryPanel } from '../components/ScopeHistoryPanel'

describe('ScopeHistoryPanel', { timeout: 20000 }, () => {
  it('hiện cột # và diễn giải snapshot chuỗi JSON, dòng null là kế thừa', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get('*/settlement-config/history', ({ request }) => {
        query = new URL(request.url).searchParams
        return HttpResponse.json({
          data: [
            {
              id: 'h2',
              level: 'MASTER',
              target_id: 'm-1',
              changed_at: '2026-10-23T09:00:00.000+07:00',
              changed_by: 'u-1',
              reason: 'Gỡ cấu hình riêng',
              snapshot: null
            },
            {
              id: 'h1',
              level: 'MASTER',
              target_id: 'm-1',
              changed_at: '2026-10-22T10:15:30.123+07:00',
              changed_by: 'u-1',
              reason: 'Điều chỉnh chu kỳ',
              snapshot: '{"settlementMode":"AUTOMATIC","holdbackDays":3}'
            }
          ]
        })
      })
    )
    renderWithStore(
      <ScopeHistoryPanel
        initialMaster={{ id: 'm-1', code: 'M1', name: 'Master 1' }}
      />,
      [PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW]
    )
    expect(
      await screen.findByText('Không còn cấu hình riêng (kế thừa)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Chế độ: Kế thừa → Tự động theo chu kỳ')
    ).toBeInTheDocument()
    expect(
      screen.getByText('T+N (ngày chờ): Kế thừa → 3 ngày')
    ).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    expect(query?.get('level')).toBe('MASTER')
    expect(query?.get('targetId')).toBe('m-1')
  })
})
