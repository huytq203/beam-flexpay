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
  legalRepresentativeName: 'Nguyễn Văn A'
}

describe('EnterpriseWalletPickerDialog', () => {
  it('loads wallets from selectable-wallets (1-based page, query) and selects a row', async () => {
    const requests: string[] = []
    server.use(
      http.get('*/merchants/selectable-wallets', ({ request }) => {
        requests.push(request.url)
        const page = Number(new URL(request.url).searchParams.get('page'))
        return HttpResponse.json({
          data: {
            content:
              page === 1
                ? [wallet]
                : [
                    {
                      ...wallet,
                      id: 'wallet-2',
                      legalName: 'Công ty Trang Hai'
                    }
                  ],
            totalElements: 11,
            totalPages: 2,
            number: page - 1,
            size: 10
          },
          success: true
        })
      })
    )
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <Provider store={createAppStore()}>
        <EnterpriseWalletPickerDialog
          open
          selectedId=''
          onSelect={onSelect}
          onCancel={vi.fn()}
        />
      </Provider>
    )

    expect(await screen.findByText('Công ty Sao Việt')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(new URL(requests[0]).searchParams.get('page')).toBe('1')
    expect(new URL(requests[0]).searchParams.get('query')).toBeNull()

    await user.click(screen.getByTitle('2'))
    expect(await screen.findByText('Công ty Trang Hai')).toBeInTheDocument()
    await waitFor(() =>
      expect(new URL(requests.at(-1) ?? '').searchParams.get('page')).toBe('2')
    )

    await user.click(
      screen.getByRole('button', { name: 'Chọn ví Công ty Trang Hai' })
    )
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'wallet-2' })
    )
  })

  it('sends the search keyword as query to selectable-wallets', async () => {
    const queries: (string | null)[] = []
    server.use(
      http.get('*/merchants/selectable-wallets', ({ request }) => {
        queries.push(new URL(request.url).searchParams.get('query'))
        return HttpResponse.json({
          data: {
            content: [wallet],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10
          },
          success: true
        })
      })
    )
    const user = userEvent.setup()
    render(
      <Provider store={createAppStore()}>
        <EnterpriseWalletPickerDialog
          open
          selectedId=''
          onSelect={vi.fn()}
          onCancel={vi.fn()}
        />
      </Provider>
    )

    await screen.findByText('Công ty Sao Việt')
    await user.type(screen.getByLabelText('Tìm ví doanh nghiệp'), '0301')
    await waitFor(() => expect(queries.at(-1)).toBe('0301'), { timeout: 3000 })
  })
})
