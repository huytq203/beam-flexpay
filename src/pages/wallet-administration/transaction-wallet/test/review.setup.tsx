import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { TransactionReviewPanel } from '../components/TransactionReviewPanel'
import { renderAs } from './transaction.setup'

export const CODE = 'TXN20261008000456'

type Json = Record<string, unknown>

export const snapshot = (
  status: string,
  allowedActions: {
    mode: string
    status: string
    requiredFields: string[]
  }[]
) => ({
  success: true,
  data: { transactionCode: CODE, status, allowedActions }
})

export const MARK = {
  mode: 'MARK_REVIEW',
  status: 'REVIEW',
  requiredFields: ['reason']
}
export const approveAction = (bank: boolean) => ({
  mode: 'REVIEW_APPROVE',
  status: 'POSTED',
  requiredFields: [
    'authCode',
    'settlementId',
    'note',
    ...(bank ? ['bankConfirmation'] : [])
  ]
})
export const rejectAction = (bank: boolean) => ({
  mode: 'REVIEW_REJECT',
  status: 'FAILED',
  requiredFields: ['option', 'reason', ...(bank ? ['bankConfirmation'] : [])]
})

export const result = (over: Json = {}) => ({
  success: true,
  data: {
    transactionCode: CODE,
    newStatus: 'REVIEW',
    reviewDecision: 'REVIEW',
    updatedBy: 'van.hanh.a',
    ...over
  }
})

/** Ghi lại body của mọi POST tới `/transactions/{code}/{suffix}`. */
export const record = (suffix: string, response: () => Response) => {
  const bodies: Json[] = []
  const calls = { count: 0 }
  server.use(
    http.post(`*/transactions/${CODE}/${suffix}`, async ({ request }) => {
      calls.count += 1
      const text = await request.text()
      bodies.push(text ? (JSON.parse(text) as Json) : {})
      return response()
    })
  )
  return { bodies, calls }
}

export const json = (body: object, status = 200) =>
  HttpResponse.json(body, { status })

export const renderPanel = (
  permissions: string[],
  username = 'van.hanh.a',
  props: { type?: string; status?: string } = {}
) =>
  renderAs(
    <TransactionReviewPanel
      transactionCode={CODE}
      transactionType={props.type ?? 'CASH_IN'}
      journalStatus={props.status ?? 'PENDING'}
    />,
    permissions,
    username
  )

export const fill = (label: RegExp | string, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value }
  })

export const fillDate = (label: RegExp, value: string) => {
  fill(label, value)
  fireEvent.keyDown(screen.getByLabelText(label), {
    key: 'Enter',
    code: 'Enter'
  })
  fireEvent.blur(screen.getByLabelText(label))
}
