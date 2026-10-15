import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay } from 'msw'
import { useSearchParams } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import SettlementConfigPage from '../pages/SettlementConfigPage'
import { cfg, renderWithStore } from './settlement.setup'

const VIEW = [PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW]

describe('SettlementConfigPage', { timeout: 20000 }, () => {
  it('chưa chọn Sub thì nhắc chọn và không gọi API cấu hình', async () => {
    let called = false
    server.use(
      http.get('*/sub-merchants/*/settlement-config', () => {
        called = true
        return HttpResponse.json({ data: cfg() })
      })
    )
    renderWithStore(<SettlementConfigPage />, VIEW)
    expect(
      await screen.findByText('Chọn Sub-merchant để xem cấu hình')
    ).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('có subId trên URL thì tải và hiện cấu hình đang hiệu lực', async () => {
    server.use(
      http.get('*/sub-merchants/sub-1', () =>
        HttpResponse.json({
          data: {
            id: 'sub-1',
            code: 'SUB-1',
            name: 'Chi nhánh 1',
            status: 'ACTIVE',
            merchantId: 'm-1'
          }
        })
      ),
      http.get('*/sub-merchants/sub-1/settlement-config', () =>
        HttpResponse.json({ data: cfg() })
      ),
      http.get('*/sub-merchants/sub-1/settlement-config/changes', () =>
        HttpResponse.json({ data: [] })
      )
    )
    renderWithStore(<SettlementConfigPage />, VIEW, '/?subId=sub-1')
    expect(
      await screen.findByText('Cấu hình đang hiệu lực')
    ).toBeInTheDocument()
    expect(await screen.findByText('Chưa có đề xuất')).toBeInTheDocument()
  })

  it('thiếu quyền xem thì không hiện nội dung trang', async () => {
    renderWithStore(<SettlementConfigPage />, [])
    expect(screen.queryByText('Chọn Sub-merchant để xem cấu hình')).toBeNull()
  })

  it('đổi sang Sub khác không giữ form của Sub cũ trong lúc tải', async () => {
    const user = userEvent.setup()
    const subResponse = (id: string) =>
      HttpResponse.json({
        data: { id, code: id, name: id, status: 'ACTIVE', merchantId: 'm-1' }
      })
    server.use(
      http.get('*/sub-merchants/sub-1', () => subResponse('sub-1')),
      http.get('*/sub-merchants/sub-2', () => subResponse('sub-2')),
      http.get('*/sub-merchants/sub-1/settlement-config', () =>
        HttpResponse.json({ data: cfg() })
      ),
      http.get('*/sub-merchants/sub-2/settlement-config', async () => {
        await delay(400)
        return HttpResponse.json({ data: cfg({ subMerchantId: 'sub-2' }) })
      }),
      http.get('*/sub-merchants/*/settlement-config/changes', () =>
        HttpResponse.json({ data: [] })
      )
    )
    const Switch = () => {
      const [, setParams] = useSearchParams()
      return (
        <button
          onClick={() => setParams({ subId: 'sub-2' })}
          type='button'
        >
          Đổi sang Sub 2
        </button>
      )
    }
    renderWithStore(
      <>
        <Switch />
        <SettlementConfigPage />
      </>,
      [
        PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW,
        PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_UPDATE
      ],
      '/?subId=sub-1'
    )
    await screen.findByLabelText('Lý do thay đổi')
    await user.click(screen.getByRole('button', { name: 'Đổi sang Sub 2' }))
    expect(screen.queryByLabelText('Lý do thay đổi')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Lưu cấu hình' })).toBeNull()
    await waitFor(() =>
      expect(screen.getByLabelText('Lý do thay đổi')).toBeInTheDocument()
    )
  })
})
