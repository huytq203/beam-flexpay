import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LedgerEntry, LedgerPage } from '@type/systemLedger'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SystemLedgerManagement from '../SystemLedgerManagement'

const ROUTE = '/secure-panel/transaction-management/system-ledger'

const mocks = vi.hoisted(() => ({
  state: {} as {
    data?: LedgerPage
    isError?: boolean
    isLoading?: boolean
  },
  refetch: vi.fn()
}))

vi.mock('@services/apiSystemLedger', () => ({
  useGetLedgerEntriesQuery: () => ({
    data: mocks.state.data,
    isError: mocks.state.isError ?? false,
    isLoading: mocks.state.isLoading ?? false,
    isFetching: false,
    refetch: mocks.refetch
  })
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportLedgerEntriesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

const line = (
  id: string,
  direction: LedgerEntry['direction'],
  amount: number,
  glCode: string
) =>
  ({
    id,
    journalCode: 'JRN-3200F612-8D2',
    transactionType: 'P2P_TRANSFER',
    direction,
    amount,
    balanceAfter: 1_000_000,
    createdAt: '2026-10-20T09:41:27',
    transaction: { id: 'tx-uuid-1', transactionCode: 'FW26RJBS8' },
    account: { ownerType: 'SYSTEM', glCode }
  }) as LedgerEntry

const page = (debitAmount: number, creditAmount: number): LedgerPage => ({
  content: [
    line('fee', 'CREDIT', 2_000, 'REV_USER_FEE'),
    line('sender', 'DEBIT', 50_002_000, 'USER_WALLET_VND')
  ],
  totalElements: 2,
  summary: { totalCount: 2, debitAmount, creditAmount }
})

const renderScreen = (route = ROUTE) =>
  renderWithProviders(
    <MessageProvider>
      <SystemLedgerManagement />
    </MessageProvider>,
    { route }
  )

describe('Sổ cái: trạng thái và đối soát Nợ/Có', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state = {}
  })

  afterEach(() => sessionStorage.clear())

  it('báo Cân khi tổng Nợ bằng tổng Có', () => {
    mocks.state.data = page(50_002_000, 50_002_000)
    renderScreen()

    expect(screen.getByText('Cân')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('nêu số tiền lệch và chiều lệch khi Nợ khác Có', () => {
    mocks.state.data = page(157_817_347, 148_001_798)
    renderScreen()

    const tile = screen.getByRole('status')
    expect(within(tile).getByText('9,815,549 ₫')).toBeInTheDocument()
    expect(within(tile).getByText(/Nợ lớn hơn Có/)).toBeInTheDocument()
  })

  it('không so hai bên khi đang lọc theo một chiều', () => {
    mocks.state.data = page(157_817_347, 0)
    renderScreen(`${ROUTE}?direction=DEBIT`)

    expect(screen.getByText('Bỏ lọc chiều để so hai bên')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('tải lỗi thì báo lỗi, không hiện số cũ và cho thử lại', async () => {
    const user = userEvent.setup()
    mocks.state = { data: page(1, 1), isError: true }
    renderScreen()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Không tải được sổ cái.'
    )
    expect(screen.queryByText('FW26RJBS8')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xuất CSV/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(mocks.refetch).toHaveBeenCalled()
  })

  it('ghi số tiền vào đúng cột Nợ / Có và chỉ in mã giao dịch ở dòng đầu bút toán', () => {
    mocks.state.data = page(50_002_000, 50_002_000)
    renderScreen()

    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent)
    const debitIndex = headers.indexOf('Nợ (₫)')
    const creditIndex = headers.indexOf('Có (₫)')
    const [, senderRow, feeRow] = screen.getAllByRole('row')
    const cells = (row: HTMLElement) => within(row).getAllByRole('cell')

    expect(cells(senderRow)[debitIndex]).toHaveTextContent('50,002,000')
    expect(cells(senderRow)[creditIndex]).toBeEmptyDOMElement()
    expect(cells(feeRow)[creditIndex]).toHaveTextContent('2,000')
    expect(cells(feeRow)[debitIndex]).toBeEmptyDOMElement()
    expect(screen.getAllByText('FW26RJBS8')).toHaveLength(1)
  })
})
