import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import type { ContentMerchant } from '@type/merchant'
import { MerchantColumn } from '../column'

const merchant = {
  id: 'merchant-1',
  name: 'Merchant A',
  code: 'M001',
  status: 'ACTIVE'
} as unknown as ContentMerchant

describe('cột thao tác màn Merchant', () => {
  it('module chưa phát hành nên vẫn hiện hành động', () => {
    render(
      <Provider store={createAppStore()}>
        <Table
          rowKey='id'
          dataSource={[merchant]}
          pagination={false}
          columns={MerchantColumn({ onEdit: vi.fn(), onView: vi.fn() })}
        />
      </Provider>
    )

    expect(screen.getByLabelText('Xem chi tiết merchant')).toBeInTheDocument()
    expect(screen.getByLabelText('Sửa merchant')).toBeInTheDocument()
  })
})
