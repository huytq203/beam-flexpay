import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { ContentMerchant } from '@type/merchant'
import { MerchantColumn } from '../column'

const merchant = {
  id: 'merchant-1',
  name: 'Merchant A',
  code: 'M001',
  status: 'ACTIVE'
} as unknown as ContentMerchant

describe('cột thao tác màn Merchant', () => {
  const renderColumns = (permissions: string[]) => {
    const store = createAppStore()
    store.dispatch(savePermissions(permissions))

    render(
      <Provider store={store}>
        <Table
          rowKey='id'
          dataSource={[merchant]}
          pagination={false}
          columns={MerchantColumn({ onEdit: vi.fn(), onView: vi.fn() })}
        />
      </Provider>
    )
  }

  it('không quyền thì ẩn hành động', () => {
    renderColumns([])
    expect(screen.queryByLabelText('Xem chi tiết merchant')).toBeNull()
    expect(screen.queryByLabelText('Sửa merchant')).toBeNull()
  })

  it('phân biệt quyền xem và cập nhật merchant', () => {
    renderColumns(['EWALLET:MERCHANT:VIEW'])
    expect(screen.getByLabelText('Xem chi tiết merchant')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sửa merchant')).toBeNull()
  })
})
