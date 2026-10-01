import {
  FEEMANAGEMENT_V4,
  MERCHANT,
  ROLEMANAGEMENT_V2,
  TRANSACTIONMANAGEMENT,
  WALLETADMINISTRATION
} from '@constants/routersConstant'
import { PERMISSION, type PermissionCode } from './permission-codes'

export interface ScreenAccess {
  readonly path: string
  readonly aliasPaths?: readonly string[]
  /** Nếu có, bắt buộc đúng mã này mới được mở route và hiện trên sidebar. */
  readonly accessPermission?: PermissionCode
  /**
   * Mã quyền đầy đủ cho từng hành động của màn. Khớp tuyệt đối theo chuỗi —
   * không ghép tiền tố ở runtime, đổi mã thì sửa tại `permission-codes.ts`.
   */
  readonly actions: Readonly<Record<string, PermissionCode>>
}

/** Sáu hành động chuẩn có mặt trên mọi screen, khai theo từng module. */
const ADMIN_ACTIONS = {
  view: PERMISSION.ADMIN_VIEW,
  create: PERMISSION.ADMIN_CREATE,
  edit: PERMISSION.ADMIN_UPDATE,
  delete: PERMISSION.ADMIN_DELETE,
  update: PERMISSION.ADMIN_UPDATE,
  full: PERMISSION.ADMIN_FULL
} as const

const USER_ACTIONS = {
  view: PERMISSION.USER_VIEW,
  create: PERMISSION.USER_CREATE,
  edit: PERMISSION.USER_UPDATE,
  delete: PERMISSION.USER_DELETE,
  update: PERMISSION.USER_UPDATE,
  full: PERMISSION.USER_FULL
} as const

const ROLE_ACTIONS = {
  view: PERMISSION.ROLE_VIEW,
  create: PERMISSION.ROLE_CREATE,
  edit: PERMISSION.ROLE_UPDATE,
  delete: PERMISSION.ROLE_DELETE,
  update: PERMISSION.ROLE_UPDATE,
  full: PERMISSION.ROLE_FULL
} as const

const PERMISSION_ACTIONS = {
  view: PERMISSION.PERMISSION_VIEW,
  create: PERMISSION.PERMISSION_CREATE,
  edit: PERMISSION.PERMISSION_UPDATE,
  delete: PERMISSION.PERMISSION_DELETE,
  update: PERMISSION.PERMISSION_UPDATE,
  full: PERMISSION.PERMISSION_FULL
} as const

const TRANSACTION_ACTIONS = {
  view: PERMISSION.TRANSACTION_VIEW,
  create: PERMISSION.TRANSACTION_CREATE,
  edit: PERMISSION.TRANSACTION_UPDATE,
  delete: PERMISSION.TRANSACTION_DELETE,
  update: PERMISSION.TRANSACTION_UPDATE,
  full: PERMISSION.TRANSACTION_FULL
} as const

const WALLET_ACTIONS = {
  view: PERMISSION.WALLET_VIEW,
  create: PERMISSION.WALLET_CREATE,
  edit: PERMISSION.WALLET_UPDATE,
  delete: PERMISSION.WALLET_DELETE,
  update: PERMISSION.WALLET_UPDATE,
  full: PERMISSION.WALLET_FULL
} as const

const MERCHANT_ACTIONS = {
  view: PERMISSION.MERCHANT_VIEW,
  create: PERMISSION.MERCHANT_CREATE,
  edit: PERMISSION.MERCHANT_UPDATE,
  delete: PERMISSION.MERCHANT_DELETE,
  update: PERMISSION.MERCHANT_UPDATE,
  full: PERMISSION.MERCHANT_FULL
} as const

const FEE_ACTIONS = {
  view: PERMISSION.FEE_VIEW,
  create: PERMISSION.FEE_CREATE,
  edit: PERMISSION.FEE_UPDATE,
  delete: PERMISSION.FEE_DELETE,
  update: PERMISSION.FEE_UPDATE,
  full: PERMISSION.FEE_FULL
} as const

/** Tên sáu hành động chuẩn, dùng để kiểm tra registry khai đủ. */
export const DEFAULT_SCREEN_ACTION_IDS = [
  'view',
  'create',
  'edit',
  'delete',
  'update',
  'full'
] as const

export const SCREENS = {
  TRANSACTION_MANAGEMENT: {
    path: TRANSACTIONMANAGEMENT,
    accessPermission: PERMISSION.TRANSACTION_FULL,
    actions: { ...TRANSACTION_ACTIONS }
  },
  USER_ACCOUNT: {
    path: `${ROLEMANAGEMENT_V2}/user-account`,
    actions: {
      ...USER_ACTIONS,
      viewDetail: PERMISSION.USER_VIEW,
      assignRoles: PERMISSION.USER_UPDATE,
      resetPassword: PERMISSION.USER_UPDATE
    }
  },
  // Route đang đấu chéo tên path và component; quyền gắn theo màn thực tế.
  ROLE_MANAGEMENT: {
    path: `${ROLEMANAGEMENT_V2}/permission-management`,
    actions: {
      ...ROLE_ACTIONS,
      assignPermissions: PERMISSION.ROLE_UPDATE,
      viewPermissions: PERMISSION.ROLE_VIEW,
      viewMembers: PERMISSION.ROLE_VIEW
    }
  },
  PERMISSION_MANAGEMENT: {
    path: `${ROLEMANAGEMENT_V2}/role-management`,
    actions: { ...PERMISSION_ACTIONS }
  },
  TRANSACTION_WALLET: {
    path: `${TRANSACTIONMANAGEMENT}/transaction-wallet`,
    aliasPaths: [`${WALLETADMINISTRATION}/transaction-wallet`],
    accessPermission: PERMISSION.TRANSACTION_FULL,
    actions: {
      ...TRANSACTION_ACTIONS,
      viewDetail: PERMISSION.TRANSACTION_VIEW
    }
  },
  FROZEN_TRANSACTIONS: {
    path: `${TRANSACTIONMANAGEMENT}/frozen-transactions`,
    accessPermission: PERMISSION.TRANSACTION_FULL,
    actions: { ...TRANSACTION_ACTIONS }
  },
  SYSTEM_LEDGER: {
    path: `${TRANSACTIONMANAGEMENT}/system-ledger`,
    accessPermission: PERMISSION.TRANSACTION_FULL,
    actions: {
      ...TRANSACTION_ACTIONS,
      viewDetail: PERMISSION.TRANSACTION_VIEW
    }
  },
  WITHDRAW_HISTORY: {
    path: `${TRANSACTIONMANAGEMENT}/withdraw-history`,
    accessPermission: PERMISSION.TRANSACTION_FULL,
    actions: { ...TRANSACTION_ACTIONS }
  },
  EWALLET_MANAGEMENT: {
    path: `${WALLETADMINISTRATION}/e-walletManagement`,
    actions: {
      ...WALLET_ACTIONS,
      viewDetail: PERMISSION.WALLET_VIEW,
      lock: PERMISSION.WALLET_UPDATE,
      unlock: PERMISSION.WALLET_UPDATE,
      freeze: PERMISSION.WALLET_UPDATE,
      cancel: PERMISSION.WALLET_DELETE
    }
  },
  CONFIRM_EKYC: {
    path: `${WALLETADMINISTRATION}/confirm-eKYC`,
    actions: {
      ...ADMIN_ACTIONS,
      view: PERMISSION.ADMIN_FULL,
      approve: PERMISSION.ADMIN_FULL
    }
  },
  MERCHANT_DASHBOARD: {
    path: `${MERCHANT}/dashboard-merchant`,
    actions: { ...MERCHANT_ACTIONS }
  },
  MERCHANT_MANAGEMENT: {
    path: `${MERCHANT}/merchant-management`,
    actions: {
      view: PERMISSION.MERCHANT_API_VIEW,
      create: PERMISSION.MERCHANT_API_CREATE,
      edit: PERMISSION.MERCHANT_API_UPDATE,
      update: PERMISSION.MERCHANT_API_UPDATE,
      delete: PERMISSION.ADMIN_FULL,
      full: PERMISSION.ADMIN_FULL,
      approve: PERMISSION.MERCHANT_API_APPROVE,
      export: PERMISSION.MERCHANT_API_EXPORT,
      lock: PERMISSION.MERCHANT_API_LOCK,
      unlock: PERMISSION.MERCHANT_API_UNLOCK,
      viewDetail: PERMISSION.MERCHANT_API_VIEW
    }
  },
  MERCHANT_BANK_ACCOUNT: {
    path: `${MERCHANT}/bank-account`,
    actions: {
      view: PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
      create: PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE,
      edit: PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE,
      update: PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE,
      delete: PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE,
      full: PERMISSION.ADMIN_FULL,
      viewDetail: PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
      /** Mở số tài khoản đầy đủ ở cột "Số tài khoản" (NĐ 13/2023). */
      viewFullNumber: PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW,
      lock: PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE,
      unlock: PERMISSION.MERCHANT_BANK_ACCOUNT_MANAGE
    }
  },
  MERCHANT_KEY_CONNECTION: {
    path: `${MERCHANT}/key-connection`,
    actions: {
      view: PERMISSION.API_CREDENTIAL_VIEW,
      create: PERMISSION.API_CREDENTIAL_MANAGE,
      edit: PERMISSION.API_CREDENTIAL_MANAGE,
      update: PERMISSION.API_CREDENTIAL_MANAGE,
      delete: PERMISSION.API_CREDENTIAL_MANAGE,
      full: PERMISSION.ADMIN_FULL
    }
  },
  MERCHANT_PAYMENT_METHOD: {
    path: `${MERCHANT}/payment-method`,
    actions: {
      view: PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW,
      create: PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE,
      edit: PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE,
      update: PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE,
      delete: PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE,
      full: PERMISSION.ADMIN_FULL
    }
  },
  MERCHANT_NOTIFICATION: {
    path: `${MERCHANT}/notification`,
    actions: {
      view: PERMISSION.MERCHANT_NOTIFICATION_VIEW,
      create: PERMISSION.MERCHANT_NOTIFICATION_MANAGE,
      edit: PERMISSION.MERCHANT_NOTIFICATION_MANAGE,
      update: PERMISSION.MERCHANT_NOTIFICATION_MANAGE,
      delete: PERMISSION.MERCHANT_NOTIFICATION_MANAGE,
      full: PERMISSION.ADMIN_FULL
    }
  },
  BUSINESS_WALLET_ACCOUNT: {
    path: `${MERCHANT}/business-wallet-account`,
    actions: {
      ...MERCHANT_ACTIONS,
      approve: PERMISSION.ENTERPRISE_WALLET_KYB_APPROVE,
      reject: PERMISSION.ENTERPRISE_WALLET_KYB_APPROVE,
      viewDetail: PERMISSION.MERCHANT_VIEW
    }
  },
  MERCHANT_SUB_MERCHANT: {
    path: `${MERCHANT}/sub-merchant`,
    actions: {
      view: PERMISSION.SUB_MERCHANT_VIEW,
      create: PERMISSION.SUB_MERCHANT_CREATE,
      edit: PERMISSION.SUB_MERCHANT_UPDATE,
      update: PERMISSION.SUB_MERCHANT_UPDATE,
      delete: PERMISSION.ADMIN_FULL,
      full: PERMISSION.ADMIN_FULL,
      viewDetail: PERMISSION.SUB_MERCHANT_VIEW,
      lock: PERMISSION.MERCHANT_API_LOCK,
      unlock: PERMISSION.MERCHANT_API_UNLOCK
    }
  },
  MERCHANT_TERMINAL: {
    path: `${MERCHANT}/terminal`,
    actions: {
      view: PERMISSION.TERMINAL_VIEW,
      create: PERMISSION.TERMINAL_CREATE,
      edit: PERMISSION.TERMINAL_UPDATE,
      update: PERMISSION.TERMINAL_UPDATE,
      delete: PERMISSION.ADMIN_FULL,
      full: PERMISSION.ADMIN_FULL,
      viewDetail: PERMISSION.TERMINAL_VIEW,
      lock: PERMISSION.TERMINAL_LOCK_UNLOCK,
      unlock: PERMISSION.TERMINAL_LOCK_UNLOCK
    }
  },
  MERCHANT_USER: {
    path: `${MERCHANT}/user`,
    actions: {
      view: PERMISSION.MERCHANT_USER_VIEW,
      create: PERMISSION.MERCHANT_USER_CREATE,
      edit: PERMISSION.MERCHANT_USER_UPDATE,
      update: PERMISSION.MERCHANT_USER_UPDATE,
      delete: PERMISSION.ADMIN_FULL,
      full: PERMISSION.ADMIN_FULL,
      lock: PERMISSION.MERCHANT_USER_LOCK,
      resetPassword: PERMISSION.MERCHANT_USER_RESET_PASSWORD,
      // Backend yêu cầu quyền tạo cho thao tác gửi lại liên kết kích hoạt.
      resendActivation: PERMISSION.MERCHANT_USER_CREATE,
      // Đổi phạm vi Merchant/Sub-merchant không áp dụng ngay mà tạo đề xuất chờ duyệt.
      proposeScope: PERMISSION.MERCHANT_USER_SCOPE_PROPOSAL_CREATE,
      viewDetail: PERMISSION.MERCHANT_USER_VIEW
    }
  },
  MERCHANT_ROLE: {
    path: `${MERCHANT}/user-role`,
    actions: {
      view: PERMISSION.MERCHANT_PERMISSION_GROUP_VIEW,
      create: PERMISSION.MERCHANT_PERMISSION_GROUP_MANAGE,
      edit: PERMISSION.MERCHANT_PERMISSION_GROUP_MANAGE,
      update: PERMISSION.MERCHANT_PERMISSION_GROUP_MANAGE,
      delete: PERMISSION.MERCHANT_PERMISSION_GROUP_MANAGE,
      full: PERMISSION.ADMIN_FULL,
      viewDetail: PERMISSION.MERCHANT_PERMISSION_GROUP_VIEW
    }
  },
  MERCHANT_ORDER: {
    path: `${MERCHANT}/merchant-order`,
    actions: {
      ...MERCHANT_ACTIONS,
      viewQr: PERMISSION.MERCHANT_VIEW
    }
  },
  /**
   * Màn gộp cấu hình phí: danh sách, tạo và sửa dùng chung một tiền tố đường
   * dẫn nên chỉ cần một khai báo. Quyền dùng lại họ FEE hiện có, backend không
   * phải cấp mã mới.
   */
  FEE_CONFIG: {
    path: `${FEEMANAGEMENT_V4}/fee-policy`,
    actions: {
      ...FEE_ACTIONS,
      approve: PERMISSION.FEE_UPDATE,
      toggleActive: PERMISSION.FEE_UPDATE
    }
  },
  FEE_POLICY: {
    path: `${FEEMANAGEMENT_V4}/fee-managementV4`,
    actions: {
      ...FEE_ACTIONS,
      approve: PERMISSION.FEE_UPDATE,
      toggleActive: PERMISSION.FEE_UPDATE
    }
  },
  FEE_ASSIGNMENT: {
    path: `${FEEMANAGEMENT_V4}/fee-assignmentV4`,
    actions: {
      ...FEE_ACTIONS,
      approve: PERMISSION.FEE_UPDATE,
      toggleActive: PERMISSION.FEE_UPDATE
    }
  },
  /** Chính sách phí phía ngân hàng — tách màn để đối soát, quyền dùng chung họ FEE. */
  FEE_BANK_POLICY: {
    path: `${FEEMANAGEMENT_V4}/fee-bankV4`,
    actions: {
      ...FEE_ACTIONS,
      approve: PERMISSION.FEE_UPDATE,
      toggleActive: PERMISSION.FEE_UPDATE
    }
  },
  /**
   * Bảng đối soát chỉ đọc — dùng lại mã quyền FEE hiện có, BE không phải cấp mã
   * mới. Chỉ khai `view`/`full`: màn này không tạo, sửa hay xóa gì, nên quyền
   * FEE:CREATE một mình không được mở nó ra.
   */
  FEE_SCHEDULE: {
    path: `${FEEMANAGEMENT_V4}/fee-scheduleV4`,
    actions: {
      view: PERMISSION.FEE_VIEW,
      full: PERMISSION.FEE_FULL
    }
  }
} as const satisfies Record<string, ScreenAccess>

export type ScreenId = keyof typeof SCREENS
export type ScreenActionId<S extends ScreenId> =
  keyof (typeof SCREENS)[S]['actions']

const matchesPathPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

/** Route con kế thừa màn có tiền tố dài nhất. */
export const findScreenByPath = (
  pathname: string
): ScreenAccess | undefined => {
  let matchedScreen: ScreenAccess | undefined
  let matchedLength = -1

  for (const screen of Object.values(SCREENS) as ScreenAccess[]) {
    const candidates = [screen.path, ...(screen.aliasPaths ?? [])]

    for (const candidate of candidates) {
      if (
        matchesPathPrefix(pathname, candidate) &&
        candidate.length > matchedLength
      ) {
        matchedScreen = screen
        matchedLength = candidate.length
      }
    }
  }

  return matchedScreen
}
