import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { MerchantGatewayTableState } from '../MerchantGatewayTableState'
import type { MerchantGatewayTableStateProps } from '../merchantGateway.types'

type GatewayRow = { id: string; name: string }

// @ts-expect-error Error state must require a retry callback.
const invalidErrorState: MerchantGatewayTableStateProps<GatewayRow> = {
  state: 'error',
  rows: [],
  columns: [],
  rowKey: 'id'
}

void invalidErrorState

describe('MerchantGatewayTableState', () => {
  it.each([
    ['loading', 'Đang tải dữ liệu'],
    ['empty', 'Chưa có cấu hình']
  ] as const)('render %s state', (state, label) => {
    renderWithProviders(
      <MerchantGatewayTableState<GatewayRow>
        state={state}
        rows={[]}
        columns={[]}
        rowKey='id'
      />
    )

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('retries an error state', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <MerchantGatewayTableState<GatewayRow>
        state='error'
        rows={[]}
        columns={[]}
        rowKey='id'
        onRetry={onRetry}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('render success rows', () => {
    renderWithProviders(
      <MerchantGatewayTableState<GatewayRow>
        state='success'
        rows={[{ id: '1', name: 'Highlands Coffee' }]}
        columns={[{ title: 'Merchant', dataIndex: 'name' }]}
        rowKey='id'
      />
    )

    expect(screen.getByText('Highlands Coffee')).toBeInTheDocument()
  })
})
