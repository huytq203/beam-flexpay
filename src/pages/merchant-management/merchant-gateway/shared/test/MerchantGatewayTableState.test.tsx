import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MerchantGatewayTableState } from '../MerchantGatewayTableState'

describe('MerchantGatewayTableState', () => {
  it.each([
    ['loading', 'Đang tải dữ liệu'],
    ['error', 'Không thể tải dữ liệu'],
    ['empty', 'Chưa có cấu hình']
  ] as const)('render %s state', (state, label) => {
    render(
      <MerchantGatewayTableState
        state={state}
        rows={[]}
        columns={[]}
        rowKey='id'
      />
    )

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('render success rows', () => {
    render(
      <MerchantGatewayTableState
        state='success'
        rows={[{ id: '1', name: 'Highlands Coffee' }]}
        columns={[{ title: 'Merchant', dataIndex: 'name' }]}
        rowKey='id'
      />
    )

    expect(screen.getByText('Highlands Coffee')).toBeInTheDocument()
  })
})
