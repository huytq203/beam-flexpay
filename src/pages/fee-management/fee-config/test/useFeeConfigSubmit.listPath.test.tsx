import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PATHS } from '@constants/pathConstant'
import { FEE_SCREEN } from '../constants/feeScreen'
import { useFeeConfigSubmit } from '../hooks/useFeeConfigSubmit'
import { buildEmptyForm } from '../hooks/useFeeConfigForm'

const mocks = vi.hoisted(() => ({
  setup: vi.fn(),
  update: vi.fn(),
  post: vi.fn(),
  put: vi.fn()
}))

vi.mock('@services/apiFeePolicy.api', () => ({
  useSetupFeePolicyMutation: () => [mocks.setup, { isLoading: false }],
  useUpdateFeePolicyConfigMutation: () => [mocks.update, { isLoading: false }]
}))
vi.mock('@services/apiFeeAssignment', () => ({
  usePostAssignMutation: () => [mocks.post, { isLoading: false }],
  usePutAssignMutation: () => [mocks.put, { isLoading: false }]
}))
vi.mock('@hooks/useMessage', () => ({
  useMessage: () => ({ successMess: vi.fn() })
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/start']}>{children}</MemoryRouter>
)

const renderSubmit = (
  screen: (typeof FEE_SCREEN)[keyof typeof FEE_SCREEN],
  snapshot: Parameters<typeof useFeeConfigSubmit>[0] = null
) =>
  renderHook(
    () => ({
      submit: useFeeConfigSubmit(snapshot, screen),
      path: useLocation().pathname
    }),
    { wrapper }
  )

const values = {
  ...buildEmptyForm(),
  name: 'Chính sách',
  serviceType: 'EWALLET_DEPOSIT',
  validFrom: '2026-10-01T08:30:00.000'
}

describe('useFeeConfigSubmit: về đúng danh sách của màn sau khi lưu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.setup.mockResolvedValue({ data: { policy: { id: 'p1' } } })
    mocks.post.mockResolvedValue({ data: {} })
    mocks.update.mockResolvedValue({ data: {} })
  })

  it('tạo ở màn ĐVCNTT quay về danh sách ĐVCNTT', async () => {
    const { result } = renderSubmit(FEE_SCREEN.MERCHANT_FEE)

    await act(() => result.current.submit.submit(values))

    expect(result.current.path).toBe(PATHS.MERCHANT_FEE.LIST)
  })

  it('sửa ở màn ĐVCNTT quay về danh sách ĐVCNTT', async () => {
    const { result } = renderSubmit(FEE_SCREEN.MERCHANT_FEE, {
      policyId: 'p1',
      componentIds: [],
      assignmentId: null
    })

    await act(() => result.current.submit.submit(values))

    expect(result.current.path).toBe(PATHS.MERCHANT_FEE.LIST)
  })

  it('tạo ở màn phí chung vẫn về danh sách phí chung', async () => {
    const { result } = renderSubmit(FEE_SCREEN.CUSTOMER_FEE)

    await act(() => result.current.submit.submit(values))

    expect(result.current.path).toBe(PATHS.FEE_V4.POLICY_LIST)
  })

  it('tạo ở màn phí đầu vào vẫn về danh sách phí đầu vào', async () => {
    const { result } = renderSubmit(FEE_SCREEN.INPUT_COST)

    await act(() => result.current.submit.submit(values))

    expect(result.current.path).toBe(PATHS.FEE_V4.INPUT_COST_LIST)
  })
})
