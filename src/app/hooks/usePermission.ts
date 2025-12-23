import {
  BANKANDCONNECT,
  CUSTOMERS,
  CUSTOMERTRANSACTION,
  FEEMANAGEMENT,
  FEEMANAGEMENT_V3,
  INTERNAL,
  PERSONALWALLET,
  REPAYMENTANDDISBURSE,
  REPORTS,
  ROLEMANAGEMENT,
  ROLEMANAGEMENT_V2
} from '@constants/routersConstant'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from './hook'

interface IMapping {
  pathName: string[]
  permission: string
}

const MappingRouterPermission: IMapping[] = [
  {
    pathName: [ROLEMANAGEMENT + '/admin-account'],
    permission: 'ROLE:FULL'
  },
  {
    pathName: [ROLEMANAGEMENT + '/manage-group-permissions'],
    permission: 'PERMISSION:FULL'
  },
  {
    pathName: [PERSONALWALLET + '/customers-group'],
    permission: 'customer_group:view'
  },
  {
    pathName: [
      PERSONALWALLET + CUSTOMERS + '/list',
      PERSONALWALLET + CUSTOMERS + '/lookup',
      PERSONALWALLET + CUSTOMERS + '/cancel',
      PERSONALWALLET + CUSTOMERS + '/ekyc',
      PERSONALWALLET + CUSTOMERS + '/freeze-account',
      PERSONALWALLET + CUSTOMERS + '/un-freeze-account'
    ],
    permission: 'customer:view'
  },
  {
    pathName: [
      PERSONALWALLET + CUSTOMERTRANSACTION + '/transfer-history',
      PERSONALWALLET + CUSTOMERTRANSACTION + '/napas-token'
    ],
    permission: 'customer_transaction:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/direct-deposit'],
    permission: 'direct_deposit:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/payment'],
    permission: 'wallet_payment:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/e-wallet-transfer-money'],
    permission: 'wallet_transfer:viewssss'
  },
  {
    pathName: [FEEMANAGEMENT + '/account-bank-payment'],
    permission: 'bank_payment:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/withdraw-money'],
    permission: 'withdraw_money:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/limit-regulations'],
    permission: 'transaction_limit:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/form-setting'],
    permission: 'transaction_limit:view'
  },
  {
    pathName: [BANKANDCONNECT + '/banks'],
    permission: 'FEE:FULL'
  },
  {
    pathName: [BANKANDCONNECT + '/notification-management'],
    permission: 'FEE:FULL'
  },
  {
    pathName: [REPAYMENTANDDISBURSE + '/dashboard'],
    permission: 'payment_transaction:view'
  },
  {
    pathName: [REPAYMENTANDDISBURSE + '/sms-metrics'],
    permission: 'sms_stat:view'
  },

  {
    pathName: [
      REPAYMENTANDDISBURSE + '/repayment/partner-contact',
      REPAYMENTANDDISBURSE + '/repayment/invoice-query',
      REPAYMENTANDDISBURSE + '/repayment/repayment-transaction',
      REPAYMENTANDDISBURSE + '/repayment/payment-service',
      REPAYMENTANDDISBURSE + '/disburse/disburse-transaction',
      REPAYMENTANDDISBURSE + '/disburse/disburse-partner-contact',
      REPAYMENTANDDISBURSE + '/disburse/disburse-invoice-query'
    ],
    permission: 'repayment:view'
  },
  {
    pathName: [
      REPORTS + INTERNAL + '/accounts',
      REPORTS + INTERNAL + '/detail-account'
    ],
    permission: 'PERMISSION:FULL'
  },
  {
    pathName: [
      FEEMANAGEMENT_V3 + '/fee-management',
      FEEMANAGEMENT_V3 + '/create',
      FEEMANAGEMENT_V3 + '/edit'
    ],
    permission: "FEE:FULL"
  },
  {
    pathName: [
      FEEMANAGEMENT_V3 + '/fee-assignment',
      FEEMANAGEMENT_V3 + '/fee-assignment/create',
      FEEMANAGEMENT_V3 + '/fee-assignment/edit'
    ],
    permission: "FEE:FULL"
  },
  {
    pathName:[
      ROLEMANAGEMENT_V2 + '/admin-account'
    ],
    permission:'ROLE:FULL'
  }
]

const usePermission = (): boolean => {
  const location = useLocation()
  const [isAccess, setAccess] = useState<boolean>(true)
  const { permissions } = useAppSelector((state) => state.auth.profile)
 

  const getPermissionAccess = (): boolean => {
    if (!permissions || permissions.length === 0) {
      return true
    }
    if (location.pathname === '/') {
      return true
    }


    const hasPermission = (requiredPermission: string): boolean => {
      return permissions.some(
        (p) =>
          p === requiredPermission ||
          p.endsWith(`:${requiredPermission}`) ||
          p.includes(`:${requiredPermission}:`)
      )
    }

    const result = MappingRouterPermission.find(
      (item) =>
        item.pathName.some(
          (path) => location.pathname === path || location.pathname.startsWith(path + '/')
        ) &&
        hasPermission(item.permission)
    )

    return !!result
  }

  useEffect(() => {
    const hasAccess = getPermissionAccess()
    setAccess(hasAccess)
  }, [location.pathname, permissions])

  return isAccess
}

export default usePermission

