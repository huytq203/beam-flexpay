import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { SettlementConfigDto } from '../types/settlementConfig.types'

export const cfg = (
  over: Partial<SettlementConfigDto> = {}
): SettlementConfigDto => ({
  subMerchantId: 'sub-1',
  configuredAtThisLevel: true,
  active: true,
  settlementMode: { value: 'MANUAL_ONLY', source: 'SUB' },
  autoFrequency: { value: 'DAILY', source: 'SYSTEM', inherited: true },
  holdbackDays: { value: 2, source: 'SUB' },
  pendingChangeId: null,
  ...over
})

export const renderWithStore = (
  ui: ReactElement,
  permissions: string[],
  initialEntry = '/'
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>
      </Provider>
    )
  }
}
