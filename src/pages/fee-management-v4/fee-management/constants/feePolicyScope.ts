import { PATHS } from '@constants/pathConstant'

/** Hai màn chính sách phí dùng chung đủ bộ hành động create/edit/approve. */
export type FeePolicyScreenId = 'FEE_POLICY' | 'FEE_BANK_POLICY'

/**
 * Một màn quản lý chính sách phí được mô tả bằng phạm vi của nó. Phí ngân hàng
 * và phí ví dùng chung toàn bộ luồng cấu hình — khác nhau ở đúng miền phí, tiêu
 * đề và đường dẫn — nên tách phạm vi ra đây thay vì nhân đôi màn.
 */
export interface FeePolicyScope {
  /** Khoá `feeDomain` cho màn. Bỏ trống nghĩa là màn xem mọi miền phí. */
  lockedFeeDomain?: string
  screen: FeePolicyScreenId
  title: string
  description: string
  listPath: string
  createPath: string
  editPath: (id: string) => string
  createLabel: string
}

export const WALLET_FEE_SCOPE: FeePolicyScope = {
  screen: 'FEE_POLICY',
  title: 'Quản lý chính sách phí',
  description:
    'Biểu phí thu của người dùng và merchant, theo từng chiều tiền và loại dịch vụ.',
  listPath: PATHS.FEE_V4.FEE_MANAGEMENT,
  createPath: PATHS.FEE_V4.ADD_FEE_POLICY,
  editPath: PATHS.FEE_V4.EDIT_FEE_POLICY,
  createLabel: 'Thêm chính sách phí'
}

export const BANK_FEE_SCOPE: FeePolicyScope = {
  lockedFeeDomain: 'BANK',
  screen: 'FEE_BANK_POLICY',
  title: 'Phí nhà cung cấp đối tác/bank',
  description:
    'Phần Phí nhà cung cấp đối tác/bank được hưởng, tách riêng để đối soát. Miền phí cố định là Ngân hàng.',
  listPath: PATHS.FEE_V4.BANK_FEE_MANAGEMENT,
  createPath: PATHS.FEE_V4.ADD_BANK_FEE_POLICY,
  editPath: PATHS.FEE_V4.EDIT_BANK_FEE_POLICY,
  createLabel: 'Thêm chính sách Phí nhà cung cấp đối tác/bank'
}
