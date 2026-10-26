import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BankAccount from '../pages/BankAccount'

export const masterAccount = {
  id: 'bank-2',
  version: 3,
  merchantId: 'merchant-1',
  subMerchantId: null,
  owningMerchantId: 'merchant-1',
  level: 'MASTER',
  bankCode: 'TCB',
  accountNumber: '1903456789012',
  accountName: 'CONG TY A',
  branchName: null,
  isDefault: false,
  holderNameExempt: false,
  status: 'ACTIVE',
  linkStatus: 'LINKED',
  linkFailureReason: null,
  holdMode: false,
  holdModeReason: null,
  holdModeChangedAt: null,
  payable: true,
  createdAt: '2026-10-01T08:00:00',
  updatedAt: '2026-10-02T08:00:00'
}

/** Danh sách Merchant, ngân hàng và tài khoản dùng chung cho các test màn TK. */
export const mockBankAccountList = (rows: object[] = [masterAccount]) =>
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }],
          totalElements: 1
        }
      })
    ),
    http.get('*/fee/banks', () =>
      HttpResponse.json({
        data: {
          content: [{ code: 'TCB', name: 'Techcombank' }],
          totalElements: 1
        }
      })
    ),
    http.get('*/merchant-bank-accounts', () =>
      HttpResponse.json({
        data: {
          content: rows,
          totalElements: rows.length,
          number: 0,
          size: 20
        }
      })
    )
  )

export const renderBankAccountPage = (
  permissions: string[],
  route = '/bank-account'
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[route]}>
          <BankAccount />
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}
