import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { Can } from '../Can'

const renderWithPermissions = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <Can screen='ROLE_MANAGEMENT' action='delete'>
        <button type='button'>Xoá</button>
      </Can>
    </Provider>
  )
}

describe('Can', () => {
  it('đủ quyền thì render children', () => {
    renderWithPermissions(['EWALLET:ROLE:DELETE'])
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeInTheDocument()
  })

  it('thiếu quyền thì không render gì', () => {
    renderWithPermissions(['EWALLET:ROLE:VIEW'])
    expect(screen.queryByRole('button', { name: 'Xoá' })).toBeNull()
  })

  it('super-admin luôn thấy hành động', () => {
    renderWithPermissions(['EWALLET:ADMIN:FULL'])
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeInTheDocument()
  })
})
