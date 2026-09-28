import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  const renderColumns = (permissions: string[], status: ContentMerchant['status'] = 'ACTIVE') => {
    const store = createAppStore()
    store.dispatch(savePermissions(permissions))
    const onApprove = vi.fn()

    render(
      <Provider store={store}>
        <Table
          rowKey='id'
          dataSource={[{ ...merchant, status }]}
          pagination={false}
          columns={MerchantColumn({ onEdit: vi.fn(), onView: vi.fn(), onApprove })}
        />
      </Provider>
    )
    return onApprove
  }

  it('không quyền thì ẩn hành động', () => {
    renderColumns([])
    expect(screen.queryByLabelText('Xem chi tiết merchant')).toBeNull()
    expect(screen.queryByLabelText('Sửa merchant')).toBeNull()
  })

  it('phân biệt quyền xem và cập nhật merchant', () => {
    renderColumns(['MERCHANT:VIEW'])
    expect(screen.getByLabelText('Xem chi tiết merchant')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sửa merchant')).toBeNull()
  })

  it('chỉ hiện phê duyệt cho hồ sơ chờ duyệt và có quyền', () => {
    renderColumns(['MERCHANT:APPROVE'])
    expect(screen.queryByLabelText('Phê duyệt merchant Merchant A')).toBeNull()
  })

  it('hiện phê duyệt cho hồ sơ chờ duyệt đúng quyền', async () => {
    const onApprove = renderColumns(['MERCHANT:APPROVE'], 'PENDING_APPROVAL')
    await userEvent.setup().click(screen.getByLabelText('Phê duyệt merchant Merchant A'))
    expect(onApprove).toHaveBeenCalledWith(expect.objectContaining({ id: 'merchant-1' }))
  })
})
