import {
  FEEMANAGEMENT_V4,
  MERCHANT,
  ROLEMANAGEMENT_V2,
  TRANSACTIONMANAGEMENT,
  WALLETADMINISTRATION
} from '@constants/routersConstant'
import { ACTION, MODULE, type Action, type Module } from './modules'

export interface ScreenAccess {
  readonly path: string
  readonly aliasPaths?: readonly string[]
  readonly module: Module
  /** Nếu có, bắt buộc đúng action này mới được mở route và hiện trên sidebar. */
  readonly accessAction?: Action
  readonly actions: Readonly<Record<string, Action>>
}

/** Bộ action chuẩn có mặt trên mọi screen trong registry. */
export const DEFAULT_SCREEN_ACTIONS = {
  view: ACTION.VIEW,
  create: ACTION.CREATE,
  edit: ACTION.UPDATE,
  delete: ACTION.DELETE,
  update: ACTION.UPDATE,
  full: ACTION.FULL
} as const satisfies Readonly<Record<string, Action>>

export const SCREENS = {
  TRANSACTION_MANAGEMENT: {
    path: TRANSACTIONMANAGEMENT,
    module: MODULE.TRANSACTION,
    accessAction: ACTION.FULL,
    actions: { ...DEFAULT_SCREEN_ACTIONS }
  },
  USER_ACCOUNT: {
    path: `${ROLEMANAGEMENT_V2}/user-account`,
    module: MODULE.USER,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewDetail: ACTION.VIEW,
      assignRoles: ACTION.UPDATE,
      resetPassword: ACTION.UPDATE
    }
  },
  // Route đang đấu chéo tên path và component; quyền gắn theo màn thực tế.
  ROLE_MANAGEMENT: {
    path: `${ROLEMANAGEMENT_V2}/permission-management`,
    module: MODULE.ROLE,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      assignPermissions: ACTION.UPDATE,
      viewPermissions: ACTION.VIEW,
      viewMembers: ACTION.VIEW
    }
  },
  PERMISSION_MANAGEMENT: {
    path: `${ROLEMANAGEMENT_V2}/role-management`,
    module: MODULE.PERMISSION,
    actions: { ...DEFAULT_SCREEN_ACTIONS }
  },
  TRANSACTION_WALLET: {
    path: `${TRANSACTIONMANAGEMENT}/transaction-wallet`,
    aliasPaths: [`${WALLETADMINISTRATION}/transaction-wallet`],
    module: MODULE.TRANSACTION,
    accessAction: ACTION.FULL,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewDetail: ACTION.VIEW
    }
  },
  FROZEN_TRANSACTIONS: {
    path: `${TRANSACTIONMANAGEMENT}/frozen-transactions`,
    module: MODULE.TRANSACTION,
    accessAction: ACTION.FULL,
    actions: { ...DEFAULT_SCREEN_ACTIONS }
  },
  SYSTEM_LEDGER: {
    path: `${TRANSACTIONMANAGEMENT}/system-ledger`,
    module: MODULE.TRANSACTION,
    accessAction: ACTION.FULL,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewDetail: ACTION.VIEW
    }
  },
  WITHDRAW_HISTORY: {
    path: `${TRANSACTIONMANAGEMENT}/withdraw-history`,
    module: MODULE.TRANSACTION,
    accessAction: ACTION.FULL,
    actions: { ...DEFAULT_SCREEN_ACTIONS }
  },
  EWALLET_MANAGEMENT: {
    path: `${WALLETADMINISTRATION}/e-walletManagement`,
    module: MODULE.WALLET,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewDetail: ACTION.VIEW,
      lock: ACTION.UPDATE,
      unlock: ACTION.UPDATE,
      freeze: ACTION.UPDATE,
      cancel: ACTION.DELETE
    }
  },
  CONFIRM_EKYC: {
    path: `${WALLETADMINISTRATION}/confirm-eKYC`,
    module: MODULE.ADMIN,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      approve: ACTION.FULL
    }
  },
  MERCHANT_DASHBOARD: {
    path: `${MERCHANT}/dashboard-merchant`,
    module: MODULE.MERCHANT,
    actions: { ...DEFAULT_SCREEN_ACTIONS }
  },
  MERCHANT_MANAGEMENT: {
    path: `${MERCHANT}/merchant-management`,
    module: MODULE.MERCHANT,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewDetail: ACTION.VIEW
    }
  },
  BUSINESS_WALLET_ACCOUNT: {
    path: `${MERCHANT}/business-wallet-account`,
    module: MODULE.MERCHANT,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewDetail: ACTION.VIEW
    }
  },
  MERCHANT_ORDER: {
    path: `${MERCHANT}/merchant-order`,
    module: MODULE.MERCHANT,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      viewQr: ACTION.VIEW
    }
  },
  FEE_POLICY: {
    path: `${FEEMANAGEMENT_V4}/fee-managementV4`,
    module: MODULE.FEE,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      approve: ACTION.UPDATE,
      toggleActive: ACTION.UPDATE
    }
  },
  FEE_ASSIGNMENT: {
    path: `${FEEMANAGEMENT_V4}/fee-assignmentV4`,
    module: MODULE.FEE,
    actions: {
      ...DEFAULT_SCREEN_ACTIONS,
      approve: ACTION.UPDATE,
      toggleActive: ACTION.UPDATE
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
