import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import { MasterConfigListPanel } from '../components/MasterConfigListPanel'
import { ScopeRemovalDialog } from '../components/ScopeRemovalDialog'
import { masterView, systemView } from './scopeConfig.setup'

const VIEW = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW
const PREVIEW_URL = '*/merchants/m-1/settlement-config/removal-preview'

const ROW = {
  merchantId: 'm-1',
  merchantCode: 'MC0001',
  merchantName: 'Công ty Cà phê Mộc',
  merchantStatus: 'ACTIVE',
  source: 'OWN',
  active: true,
  settlementMode: { value: 'MANUAL_ONLY', source: 'MASTER' },
  autoFrequency: { value: 'DAILY', source: 'SYSTEM' },
  holdReason: { value: null, source: 'SYSTEM' },
  holdbackDays: { value: 2, source: 'MASTER' },
  version: 3,
  updatedAt: '2026-10-20T03:00:00Z',
  updatedBy: 'u-1'
}

describe('danh sách cấu hình quyết toán Master', { timeout: 30000 }, () => {
  it('gọi /settlement-config với page 1, gửi search/source và mở Master được bấm', async () => {
    const user = userEvent.setup()
    const queries: URLSearchParams[] = []
    const onOpen = vi.fn()
    server.use(
      http.get('*/settlement-config', ({ request }) => {
        queries.push(new URL(request.url).searchParams)
        return HttpResponse.json({
          data: {
            content: [ROW],
            totalElements: 1,
            totalPages: 1,
            size: 20,
            number: 1
          }
        })
      })
    )
    renderWithStore(<MasterConfigListPanel onOpen={onOpen} />, [VIEW])
    expect(await screen.findByText('Công ty Cà phê Mộc')).toBeInTheDocument()
    expect(screen.getByText('Cấu hình riêng')).toBeInTheDocument()
    expect(queries[0].get('page')).toBe('1')
    expect(screen.getByRole('button', { name: /Xuất CSV/ })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Từ khóa'), 'Mộc')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => expect(queries.at(-1)?.get('search')).toBe('Mộc'))

    await user.click(screen.getByLabelText('Xem cấu hình Master'))
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ merchantId: 'm-1' })
    )
  })
})

describe('xem trước gỡ cấu hình Master', { timeout: 30000 }, () => {
  it('requiresApproval: hiện reason nguyên văn và khóa nút gỡ', async () => {
    server.use(
      http.get(PREVIEW_URL, () =>
        HttpResponse.json({
          data: {
            current: masterView(),
            afterRemoval: systemView(),
            requiresApproval: true,
            reason: 'Cần quyền phê duyệt để gỡ cấu hình này'
          }
        })
      )
    )
    renderWithStore(
      <ScopeRemovalDialog
        masterId='m-1'
        onClose={() => {}}
      />,
      [VIEW]
    )
    expect(
      await screen.findByText('Cần quyền phê duyệt để gỡ cấu hình này')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gỡ cấu hình' })).toBeDisabled()
  })

  it('không cần phê duyệt thì cho gỡ', async () => {
    server.use(
      http.get(PREVIEW_URL, () =>
        HttpResponse.json({
          data: {
            current: masterView(),
            afterRemoval: systemView(),
            requiresApproval: false,
            reason: ''
          }
        })
      )
    )
    renderWithStore(
      <ScopeRemovalDialog
        masterId='m-1'
        onClose={() => {}}
      />,
      [VIEW]
    )
    await screen.findByLabelText('Hiện tại')
    expect(screen.getByRole('button', { name: 'Gỡ cấu hình' })).toBeEnabled()
  })
})
