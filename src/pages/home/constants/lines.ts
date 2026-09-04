/**
 * Bảng định danh tuyến. Khoá là khoá phân hệ suy ra từ `navigationItems`
 * (`group:<nhãn nhóm>` khi mục có groupLabel, ngược lại `item:<key>`), nên khi
 * thêm phân hệ mới chỉ cần thêm một dòng ở đây; phân hệ chưa khai báo vẫn hiện
 * trên bản đồ với danh tính dự phòng thay vì biến mất.
 */
export interface LineIdentity {
  token: string
  code: string
  description: string
  elevatedRisk?: boolean
}

export const LINE_REGISTRY: Record<string, LineIdentity> = {
  'item:secure-panel/transaction-management': {
    token: 'transaction',
    code: 'GD',
    description: 'Tra soát, xử lý và đối chiếu dòng tiền'
  },
  'item:secure-panel/wallet-administration': {
    token: 'wallet',
    code: 'VI',
    description: 'Tài khoản cá nhân và xác minh danh tính'
  },
  'item:secure-panel/role-v2': {
    token: 'role',
    code: 'PQ',
    description: 'Tài khoản nội bộ và phạm vi truy cập',
    elevatedRisk: true
  },
  'group:Quản lý merchant': {
    token: 'merchant',
    code: 'MC',
    description: 'ĐVCNTT và ví doanh nghiệp'
  },
  'item:secure-panel/fee-v4': {
    token: 'fee',
    code: 'PH',
    description: 'Chính sách và phạm vi áp dụng phí',
    elevatedRisk: true
  }
}

export const FALLBACK_LINE: LineIdentity = {
  token: 'wallet',
  code: '••',
  description: 'Các màn hình được cấp cho tài khoản hiện tại'
}

/** Thứ tự ưu tiên khi gán tuyến vào nan quạt hình học của bản đồ. */
export const LINE_TOKENS = [
  'transaction',
  'wallet',
  'role',
  'merchant',
  'fee'
] as const
