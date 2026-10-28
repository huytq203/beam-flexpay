import { MessageProvider } from '@/app/hooks/MessageProvider'
import { PATHS } from '@constants/pathConstant'
import { renderWithProviders } from '@/test/render'
import { FeeDomain } from '@components/fee/feeDomain'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeeConfig from '../FeeConfig'
import InputCostConfig from '../InputCostConfig'
import MerchantFeeConfig from '../MerchantFeeConfig'
import { getFormFieldRules, POLICY_KIND } from '../constants/feeConfigFields'
import { FEE_SCREEN, visibleServiceTypesFor } from '../constants/feeScreen'
import { HIDDEN_SERVICE_TYPES_BY_POLICY_KIND } from '../constants/policyKindServiceTypes'
import { withoutHiddenServiceTypes } from '@utils/fee-execution'
import {
  buildEmptyForm,
  buildEmptyFormForScreen
} from '../hooks/useFeeConfigForm'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'

const mockUseFeeConfigDetail = vi.hoisted(() => vi.fn())

vi.mock('../hooks/useFeeConfigDetail', () => ({
  useFeeConfigDetail: mockUseFeeConfigDetail
}))

const LocationProbe = () => (
  <div data-testid='path'>{useLocation().pathname}</div>
)

const MERCHANT_LIST = PATHS.MERCHANT_FEE.LIST
const MERCHANT_CREATE = PATHS.MERCHANT_FEE.CREATE

const savedValues = (
  feeDomain: FeeConfigFormValues['feeDomain'],
  serviceType: string
): FeeConfigFormValues => ({
  ...buildEmptyForm(feeDomain),
  name: 'Chính sách đã lưu',
  serviceType,
  validFrom: '2026-09-11T08:30:00.000'
})

/** Kết quả `useFeeConfigDetail` của một chính sách đã lưu. */
const savedDetail = (
  policyKind: 'CUSTOMER_FEE' | 'INPUT_COST',
  feeDomain: FeeConfigFormValues['feeDomain'],
  serviceType: string
) => ({
  values: savedValues(feeDomain, serviceType),
  snapshot: { policyId: 'p1', componentIds: [], assignmentId: null },
  feeCode: null,
  isEditable: true,
  policyKind,
  isLoading: false,
  isError: false
})

const createDetail = {
  values: null,
  snapshot: null,
  feeCode: null,
  isEditable: true,
  policyKind: null,
  isLoading: false,
  isError: false
}

const renderScreens = (route: string) =>
  renderWithProviders(
    <MessageProvider>
      <LocationProbe />
      <Routes>
        <Route
          path={PATHS.FEE_V4.POLICY_EDIT(':id')}
          element={<FeeConfig />}
        />
        <Route
          path={PATHS.FEE_V4.POLICY_CREATE}
          element={<FeeConfig />}
        />
        <Route
          path={PATHS.FEE_V4.INPUT_COST_EDIT(':id')}
          element={<InputCostConfig />}
        />
        <Route
          path={PATHS.MERCHANT_FEE.EDIT(':id')}
          element={<MerchantFeeConfig />}
        />
        <Route
          path={MERCHANT_CREATE}
          element={<MerchantFeeConfig />}
        />
        <Route
          path={MERCHANT_LIST}
          element={<div>Danh sách ĐVCNTT</div>}
        />
      </Routes>
    </MessageProvider>,
    { route }
  )

/** Mở ô "Loại giao dịch" và trả về nhãn các lựa chọn đang hiện. */
const openServiceTypeOptions = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: /Loại giao dịch/ }))
  const listbox = await screen.findByRole('listbox')
  return within(listbox)
    .getAllByRole('option')
    .map((option) => option.getAttribute('aria-label') ?? option.textContent)
}

describe('màn tạo / sửa theo screen: chuyển hướng chéo màn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chính sách miền MERCHANT mở qua màn phí chung chuyển sang màn ĐVCNTT', () => {
    mockUseFeeConfigDetail.mockReturnValue(
      savedDetail(
        'CUSTOMER_FEE',
        FeeDomain.MERCHANT,
        'MERCHANT_VA_BILL_COLLECTION'
      )
    )

    renderScreens(PATHS.FEE_V4.POLICY_EDIT('p1'))

    expect(screen.getByTestId('path')).toHaveTextContent(
      PATHS.MERCHANT_FEE.EDIT('p1')
    )
    expect(screen.getByTestId('path')).toHaveTextContent(
      '/secure-panel/merchant/fee-config/edit/p1'
    )
  })

  it('chính sách miền EWALLET mở qua màn ĐVCNTT chuyển sang màn phí chung', () => {
    mockUseFeeConfigDetail.mockReturnValue(
      savedDetail('CUSTOMER_FEE', FeeDomain.EWALLET, 'EWALLET_DEPOSIT')
    )

    renderScreens(PATHS.MERCHANT_FEE.EDIT('p1'))

    expect(screen.getByTestId('path')).toHaveTextContent(
      PATHS.FEE_V4.POLICY_EDIT('p1')
    )
  })

  it('chính sách INPUT_COST mở qua màn ĐVCNTT chuyển sang màn phí đầu vào', () => {
    mockUseFeeConfigDetail.mockReturnValue(
      savedDetail('INPUT_COST', FeeDomain.BANK, 'EWALLET_DEPOSIT')
    )

    renderScreens(PATHS.MERCHANT_FEE.EDIT('p1'))

    expect(screen.getByTestId('path')).toHaveTextContent(
      PATHS.FEE_V4.INPUT_COST_EDIT('p1')
    )
  })

  it('chính sách đúng màn thì ở lại, không chuyển hướng', () => {
    mockUseFeeConfigDetail.mockReturnValue(
      savedDetail('CUSTOMER_FEE', FeeDomain.MERCHANT, 'PAYOUT_BANK_TRANSFER')
    )

    renderScreens(PATHS.MERCHANT_FEE.EDIT('p1'))

    expect(screen.getByTestId('path')).toHaveTextContent(
      PATHS.MERCHANT_FEE.EDIT('p1')
    )
    expect(screen.getByDisplayValue('Chính sách đã lưu')).toBeInTheDocument()
  })
})

describe('màn tạo theo screen: ô Loại giao dịch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFeeConfigDetail.mockReturnValue(createDetail)
  })

  it('màn ĐVCNTT chỉ có Thu hộ VA và Chi hộ chuyển khoản', async () => {
    renderScreens(MERCHANT_CREATE)

    const options = await openServiceTypeOptions()

    expect(options).toEqual(['Thu hộ VA', 'Chi hộ chuyển khoản ngân hàng'])
  })

  it('màn phí chung không có hai loại của ĐVCNTT', async () => {
    renderScreens(PATHS.FEE_V4.POLICY_CREATE)

    const options = await openServiceTypeOptions()

    // Danh sách ảo của antd chỉ dựng vài dòng đầu trong jsdom nên chỉ kiểm điều kiện cần.
    expect(options).toContain('Nạp tiền ví')
    expect(options).not.toContain('Thu hộ VA')
    expect(options).not.toContain('Chi hộ chuyển khoản ngân hàng')
  })
})

describe('màn tạo theo screen: giá trị khởi tạo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFeeConfigDetail.mockReturnValue(createDetail)
  })

  it('màn ĐVCNTT chọn sẵn Thu hộ VA và hiện phạm vi theo merchant', () => {
    renderScreens(MERCHANT_CREATE)

    expect(
      screen
        .getByRole('combobox', { name: /Loại giao dịch/ })
        .closest('.ant-select')
    ).toHaveTextContent('Thu hộ VA')
    expect(screen.getByText('Tất cả merchant')).toBeInTheDocument()
    expect(screen.queryByText('Tất cả khách hàng')).not.toBeInTheDocument()
  })

  it('màn phí chung vẫn để trống loại giao dịch', () => {
    renderScreens(PATHS.FEE_V4.POLICY_CREATE)

    expect(
      screen
        .getByRole('combobox', { name: /Loại giao dịch/ })
        .closest('.ant-select')
    ).not.toHaveTextContent('Thu hộ VA')
    expect(screen.queryByText('Tất cả merchant')).not.toBeInTheDocument()
  })

  it('buildEmptyFormForScreen: ĐVCNTT điền sẵn miền và loại, màn khác như buildEmptyForm', () => {
    expect(buildEmptyFormForScreen(FEE_SCREEN.MERCHANT_FEE)).toMatchObject({
      feeDomain: FeeDomain.MERCHANT,
      serviceType: 'MERCHANT_VA_BILL_COLLECTION'
    })
    expect(buildEmptyFormForScreen(FEE_SCREEN.CUSTOMER_FEE)).toEqual(
      buildEmptyForm()
    )
    expect(buildEmptyFormForScreen(FEE_SCREEN.INPUT_COST)).toEqual(
      buildEmptyForm()
    )
  })
})

describe('luồng ví giữ nguyên danh sách loại giao dịch', () => {
  const serviceTypes = getFormFieldRules(FeeDomain.EWALLET, '').serviceTypes

  it.each([
    [FEE_SCREEN.CUSTOMER_FEE, POLICY_KIND.CUSTOMER_FEE],
    [FEE_SCREEN.INPUT_COST, POLICY_KIND.INPUT_COST]
  ] as const)(
    '%s: cùng kết quả với cách lọc cũ theo policyKind',
    (screenKey, kind) => {
      for (const current of [
        undefined,
        'EWALLET_REFUND',
        'PAYOUT_BANK_TRANSFER'
      ]) {
        expect(
          visibleServiceTypesFor(screenKey, serviceTypes, current)
        ).toEqual(
          withoutHiddenServiceTypes(
            serviceTypes,
            current,
            HIDDEN_SERVICE_TYPES_BY_POLICY_KIND[kind]
          )
        )
      }
    }
  )
})

describe('màn ĐVCNTT: nút quay lại', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFeeConfigDetail.mockReturnValue(createDetail)
  })

  it('"Về danh sách" đưa về danh sách ĐVCNTT', async () => {
    renderScreens(MERCHANT_CREATE)

    await userEvent.click(screen.getByRole('button', { name: /Về danh sách/ }))

    expect(screen.getByTestId('path')).toHaveTextContent(MERCHANT_LIST)
    expect(screen.getByText('Danh sách ĐVCNTT')).toBeInTheDocument()
  })

  it('"Huỷ" cũng đưa về danh sách ĐVCNTT', async () => {
    renderScreens(MERCHANT_CREATE)

    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }))

    expect(screen.getByTestId('path')).toHaveTextContent(MERCHANT_LIST)
  })
})
