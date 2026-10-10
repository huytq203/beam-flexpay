import { useState } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TransactionReviewPanel } from '../components/TransactionReviewPanel'
import { useResetTransactionSnapshot } from '../hooks/useTransactionSnapshot'
import { FULL, renderAs } from './transaction.setup'
import {
  CODE,
  approveAction,
  json,
  record,
  rejectAction,
  snapshot
} from './review.setup'

const OTHER_CODE = 'TXN-OTHER'

function Harness() {
  const [code, setCode] = useState(CODE)
  useResetTransactionSnapshot(code)
  return (
    <>
      <button
        type='button'
        onClick={() => setCode(code === CODE ? OTHER_CODE : CODE)}
      >
        đổi giao dịch
      </button>
      {code === CODE && (
        <TransactionReviewPanel
          transactionCode={CODE}
          transactionType='CASH_IN'
          journalStatus='PENDING'
        />
      )}
    </>
  )
}

describe('useResetTransactionSnapshot', () => {
  it('quay lại giao dịch không còn snapshot cũ', async () => {
    record('refresh', () =>
      json(
        snapshot('REVIEW', [
          approveAction(false),
          rejectAction(false)
        ]) as object
      )
    )
    renderAs(<Harness />, FULL, 'nguoi.duyet')
    await userEvent.click(
      await screen.findByRole('button', { name: /Kiểm tra trạng thái/ })
    )
    expect(
      await screen.findByRole('button', { name: /Từ chối$/ })
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'đổi giao dịch' }))
    await userEvent.click(screen.getByRole('button', { name: 'đổi giao dịch' }))

    await screen.findByRole('button', { name: /Kiểm tra trạng thái/ })
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Từ chối$/ })).toBeNull()
    )
  })
})
