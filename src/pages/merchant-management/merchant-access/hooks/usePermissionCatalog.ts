import {
  useListMerchantPermissionsQuery,
  type MerchantPermissionDto
} from '@/app/services/merchantAccessApi'
import type { MerchantPermission } from '../types/merchantAccess.types'

const CATEGORY_LABELS: Record<MerchantPermissionDto['category'], string> = {
  TRANSACTION: 'Giao dịch',
  REFUND: 'Hoàn tiền',
  DISPUTE: 'Tra soát / Khiếu nại',
  ORDER: 'Đơn hàng',
  FINANCE: 'Rút tiền & Tài chính',
  ADMINISTRATION: 'Quản trị',
  WALLET: 'Ví – Tài khoản ví'
}

const PERMISSION_LABELS: Record<string, string> = {
  VIEW_TRANSACTION: 'Xem giao dịch',
  EXPORT_TRANSACTION: 'Xuất Excel giao dịch',
  CREATE_REFUND: 'Tạo hoàn tiền',
  CANCEL_REFUND: 'Hủy hoàn tiền',
  APPROVE_REFUND: 'Duyệt hoàn tiền',
  VIEW_REFUND: 'Xem hoàn tiền',
  CREATE_DISPUTE: 'Tạo tra soát',
  REPLY_DISPUTE: 'Phản hồi tra soát',
  VIEW_DISPUTE: 'Xem khiếu nại',
  CREATE_ORDER: 'Tạo đơn hàng',
  CANCEL_ORDER: 'Hủy đơn hàng',
  VIEW_ORDER: 'Xem đơn hàng',
  CONFIRM_ORDER: 'Xác nhận đơn hàng',
  CREATE_WITHDRAWAL: 'Tạo rút tiền',
  VIEW_WITHDRAWAL: 'Xem rút tiền',
  EXPORT_WITHDRAWAL: 'Xuất Excel rút tiền',
  VIEW_BALANCE: 'Xem số dư',
  EXPORT_BALANCE: 'Xuất sổ phụ',
  VIEW_AUDIT_LOG: 'Xem nhật ký',
  MANAGE_USER: 'Quản lý User',
  MANAGE_SUB_MERCHANT: 'Quản lý Sub-merchant',
  MANAGE_PERMISSION_GROUP: 'Quản lý nhóm quyền',
  VIEW_WALLET: 'Xem ví và số dư ví',
  TOPUP_WALLET: 'Nạp tiền vào ví',
  WITHDRAW_WALLET: 'Rút tiền từ ví',
  TRANSFER_WALLET: 'Chuyển tiền từ ví',
  EXPORT_WALLET_STATEMENT: 'Xuất sao kê ví'
}

// Danh mục quyền gần như không đổi trong phiên: dùng lại cache thay vì gọi
// lại mỗi lần một modal mount (apiMerchant bật refetchOnMountOrArgChange).
export const usePermissionCatalog = () => {
  const query = useListMerchantPermissionsQuery(undefined, {
    refetchOnMountOrArgChange: false
  })
  const permissions: MerchantPermission[] = (query.data ?? []).map(
    ({ code, category }) => ({
      code,
      group: CATEGORY_LABELS[category] ?? category,
      label:
        PERMISSION_LABELS[code] ??
        code.replaceAll('_', ' ').toLocaleLowerCase('vi-VN'),
      description: code
    })
  )
  return { permissions, isLoading: query.isLoading }
}
