import { Children, createElement } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import AppLayout from '@components/layout/AppLayout'
import AuthLayout from '@components/layout/AuthLayout'
import {
  AUTHENTICATION,
  BANKANDCONNECT,
  FORBIDDENERROR,
  ROLEMANAGEMENT,
  ROLEMANAGEMENT_V2,
  WALLETADMINISTRATION,
  MERCHANT,
  TRANSACTIONMANAGEMENT,
  FEEMANAGEMENT_V4,
} from '@constants/routersConstant'

import ForgotPassword from '@pages/auth/forgot-password/ForgotPassword'
import Login from '@pages/auth/login/Login'
import NotFound from '@pages/auth/not-found/NotFound'
import ResetPassword from '@pages/auth/reset-password/ResetPassword'
import VerifyToken from '@pages/auth/verify-token/VerifyToken'
import ForbiddenError from '@pages/error/ForbiddenError'
import FeeManagementV4 from '@pages/fee-management-v4/fee-management/FeeManagement'
import UserManagement from '@pages/role-management-V2/user-management/UserManagement'
import { PermissionManagement } from '@pages/role-management-V2/permission-management/PermissionManagement'
import RoleManagement from '@pages/role-management-V2/role-management/RoleManagement'
import EwalletManagement from '@pages/wallet-administration/e-walletManagement/EwalletManagement'
import DetailUser from '@pages/wallet-administration/e-walletManagement/DetailUser'
import ConfirmRKYC from '@pages/wallet-administration/confirm-ekyc/ConfirmEKYC'
import MerchantManagement from '@pages/merchant-management/merchanr-management/MerchantManagement'
import MerchantDetail from '@pages/merchant-management/merchanr-management/MerchantDetail'
import CreateMerchant from '@pages/merchant-management/merchanr-management/CreateMerchant'
import OrderFeature from '@pages/merchant-management/merchant-order/OrderFeature'
import OrderQrFeature from '@pages/merchant-management/merchant-order/OrderQrFeature'
import DashBoardMerchant from '@pages/merchant-management/dashboard-merchant/DashBoard'
import TestPage from '@pages/test/TestPage'
import TransactionManagement from '@pages/wallet-administration/transaction-wallet/TransactionManagement'
import FrozenTransactions from '@pages/transaction-management/frozen-transactions/FrozenTransactions'
import SystemLedgerManagement from '@pages/transaction-management/system-ledger/SystemLedgerManagement'
import DetailSystemLedger from '@pages/transaction-management/system-ledger/DetailSystemLedger'
import WithdrawHistory from '@pages/transaction-management/withdraw-history/WithdrawHistory'
import RefundManagement from '@pages/transaction-management/refund-management/RefundManagement'
import DetailTransaction from '@pages/wallet-administration/transaction-wallet/DetailTransaction'
import AddFeePolicy from '@pages/fee-management-v4/fee-management/AddFeePolicy'
import FeeAssignmentManagementV4 from '@pages/fee-management-v4/fee-assignment/FeeAssignmentManagement'
import FeeAssignAdd from '@pages/fee-management-v4/fee-assignment/components/FeeAssignAdd'
// import FeeAssignmentManagement from '@pages/fee-management-v3/fee-assignment/FeeAssignmentManagement'


const authentication = {
  path: AUTHENTICATION,
  element: createElement(AuthLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: AUTHENTICATION + '/login',
      element: createElement(Login)
    },
    {
      path: AUTHENTICATION + '/forgot-password',
      element: createElement(ForgotPassword)
    },
    {
      path: AUTHENTICATION + '/reset-password',
      element: createElement(ResetPassword)
    },
    {
      path: AUTHENTICATION + '/forget-password',
      element: createElement(ForgotPassword)
    },
    {
      path: AUTHENTICATION + '/verify-token',
      element: createElement(VerifyToken)
    },
  ]
}



const forbidden = {
  path: FORBIDDENERROR,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FORBIDDENERROR,
      element: createElement(ForbiddenError)
    }
  ]
}



const feeManagementV4 = {
  path: FEEMANAGEMENT_V4,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: FEEMANAGEMENT_V4 + '/fee-managementV4',
          element: createElement(FeeManagementV4)
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-managementV4/:mode',
          element: createElement(AddFeePolicy)
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-managementV4/:mode/:id',
          element: createElement(AddFeePolicy)
        },
      ]
    },
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: FEEMANAGEMENT_V4 + '/fee-assignmentV4',
          element: createElement(FeeAssignmentManagementV4)
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-assignmentV4/create',
          element: createElement(FeeAssignAdd)
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-assignmentV4/:mode/:id',
          element: createElement(FeeAssignAdd)
        },
      ]
    }
  ]
}

const roleManagementV2 = {
  path: ROLEMANAGEMENT_V2,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: ROLEMANAGEMENT_V2 + '/user-account',
          element: createElement(UserManagement)
        }

      ]
    },
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: ROLEMANAGEMENT_V2 + '/permission-management',
          element: createElement(PermissionManagement)
        }

      ]
    },
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: ROLEMANAGEMENT_V2 + '/role-management',
          element: createElement(RoleManagement)
        }

      ]
    },
  ]

}
const walletAministration = {
  path: WALLETADMINISTRATION,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: WALLETADMINISTRATION + '/e-walletManagement',
          element: createElement(EwalletManagement)
        },
        {
          path: WALLETADMINISTRATION + '/e-walletManagement/:id',
          element: createElement(DetailUser)
        }

      ]
    },


    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: WALLETADMINISTRATION + '/confirm-eKYC',
          element: createElement(ConfirmRKYC)
        },
      ]
    },
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: WALLETADMINISTRATION + '/transaction-wallet',
          element: createElement(TransactionManagement),
        },
      ]
    },

  ]
}

const merchantManagement = {
  path: MERCHANT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: MERCHANT,
      children: [
        {
          path: MERCHANT + '/dashboard-merchant',
          element: createElement(DashBoardMerchant),
        },
        {
          path: MERCHANT + '/merchant-management',
          element: createElement(MerchantManagement),
        },
        {
          path: MERCHANT + '/merchant-management/create',
          element: createElement(CreateMerchant),
        },
        {
          path: MERCHANT + '/merchant-management/create/:id',
          element: createElement(CreateMerchant),
        },
        {
          path: MERCHANT + '/merchant-management/detail/:id',
          element: createElement(MerchantDetail),
        },
        {
          path: MERCHANT + '/merchant-management/:id',
          element: createElement(MerchantDetail),
        },
        {
          path: MERCHANT + '/merchant-order',
          element: createElement(OrderFeature),
        },
        {
          path: MERCHANT + '/merchant-order/qr/:id',
          element: createElement(OrderQrFeature),
        },
      ]
    }
  ]

}

const transactionManagement = {
  path: TRANSACTIONMANAGEMENT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/transaction-wallet',
          element: createElement(TransactionManagement)
        },
        {
          path: TRANSACTIONMANAGEMENT + '/transaction-wallet/:id',
          element: createElement(DetailTransaction)
        }

      ]
    },

    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/frozen-transactions',
          element: createElement(FrozenTransactions)
        },
      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/refund-management',
          element: createElement(RefundManagement)
        }

      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/system-ledger',
          element: createElement(SystemLedgerManagement)
        },
        {
          path: TRANSACTIONMANAGEMENT + '/system-ledger/:id',
          element: createElement(DetailSystemLedger)
        }
      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/withdraw-history',
          element: createElement(WithdrawHistory)
        }
      ]
    }
  ]
}

export const WalletRoutes = createBrowserRouter([
  {
    path: '/',
    element: createElement(Navigate, { to: AUTHENTICATION + '/login', replace: true })
  },
  authentication,
  forbidden,
  feeManagementV4,
  roleManagementV2,
  walletAministration,
  merchantManagement,
  transactionManagement,
  {
    path: '/test',
    element: createElement(TestPage),
  },
  {
    path: '/secure-panel/*',
    element: createElement(NotFound),
  }
])
