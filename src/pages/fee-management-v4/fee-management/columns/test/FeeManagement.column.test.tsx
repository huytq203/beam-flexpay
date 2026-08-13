import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/useMessage'
import type { FeePolicy } from '../../types/FeeManagement.type'
import { getColumnFeePolicy } from '../FeeManagement.column'

const policy = {
  id: 'fee-1',
  name: 'Phí chuyển tiền',
  status: 'INIT'
} as unknown as FeePolicy

const renderColumns = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MessageProvider>
        <Table
          rowKey='id'
          dataSource={[policy]}
          pagination={false}
          columns={getColumnFeePolicy({
            navigate: vi.fn(),
            handleActive: vi.fn(),
            handleInactive: vi.fn(),
            isLoadingPatchActivateFee: false,
            isLoadingPatchDeactivateFee: false,
            loadingId: ''
          })}
        />
      </MessageProvider>
    </Provider>
  )
}

describe('cột thao tác màn Chính sách phí', () => {
  it('ẩn hành động khi không có quyền FEE', () => {
    renderColumns([])
    expect(screen.queryByLabelText('Sửa chính sách')).toBeNull()
    expect(screen.queryByLabelText('Phê duyệt chính sách')).toBeNull()
  })

  it('FEE:UPDATE hiện các hành động cập nhật', () => {
    renderColumns(['EWALLET:FEE:UPDATE'])
    expect(screen.getByLabelText('Sửa chính sách')).toBeInTheDocument()
    expect(screen.getByLabelText('Phê duyệt chính sách')).toBeInTheDocument()
  })

  it('super-admin vẫn thấy hành động', () => {
    renderColumns(['EWALLET:ADMIN:FULL'])
    expect(screen.getByLabelText('Sửa chính sách')).toBeInTheDocument()
  })
})
