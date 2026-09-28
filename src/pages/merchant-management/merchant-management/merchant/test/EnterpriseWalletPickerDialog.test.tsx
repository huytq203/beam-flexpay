import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { EnterpriseWalletPickerDialog } from '../components/EnterpriseWalletPickerDialog'

const wallet = {
  id: 'wallet-1',
  legalName: 'Công ty Sao Việt',
  registeredEmail: 'finance@example.com',
  taxCode: '0301234567',
  businessType: 'ENTERPRISE' as const,
  verificationStatus: 'VERIFIED' as const
}

describe('EnterpriseWalletPickerDialog', () => {
  it('loads wallets from paginated Merchant API and selects a verified row', async () => {
    const requests: string[] = []
    server.use(http.get('*/enterprise-wallets', ({ request }) => {
      requests.push(request.url)
      const page = Number(new URL(request.url).searchParams.get('page'))
      return HttpResponse.json({
        data: {
          content: page === 0
            ? [wallet, { ...wallet, id: 'wallet-draft', legalName: 'Ví chưa xác minh', verificationStatus: 'DRAFT' }]
            : [{ ...wallet, id: 'wallet-2', legalName: 'Công ty Trang Hai' }],
          totalElements: 11,
          totalPages: 2,
          number: page,
          size: 10
        },
        success: true
      })
    }))
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <Provider store={createAppStore()}>
        <EnterpriseWalletPickerDialog open selectedId='' onSelect={onSelect} onCancel={vi.fn()} />
      </Provider>
    )

    expect(await screen.findByText('Công ty Sao Việt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chọn ví Ví chưa xác minh' })).toBeDisabled()
    expect(new URL(requests[0]).searchParams.get('page')).toBe('0')
    expect(new URL(requests[0]).searchParams.get('verificationStatus')).toBeNull()

    await user.click(screen.getByTitle('2'))
    expect(await screen.findByText('Công ty Trang Hai')).toBeInTheDocument()
    await waitFor(() => expect(new URL(requests.at(-1) ?? '').searchParams.get('page')).toBe('1'))

    await user.click(screen.getByRole('button', { name: 'Chọn ví Công ty Trang Hai' }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'wallet-2' }))
  })
})
