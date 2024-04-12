import { t } from 'i18next'

export enum CUSTOMER_SERCURITY_METHODS {
  OTP_METHOD = 'OTP_METHOD',
  TRANSACTION_LIMIT = 'TRANSACTION_LIMIT'
}

export enum APPLICABLE_OBJECTS {
  SYSTEM = 'SYSTEM',
  PERSONAL_ACCOUNT = 'PRIVATE_ACCOUNT',
  ACCOUNT_GROUP = 'ACCOUNT_GROUP',
  ACCOUNT_TYPE = 'ACCOUNT_TYPE',
  PRIVATE_ACCOUNT = 'PRIVATE_ACCOUNT'
}

export enum LIMIT_TYPE {
  LIMIT_MIN = 'LIMIT_MIN',
  LIMIT_MAX = 'LIMIT_MAX'
}

export enum VALUE_LIMIT_TYPE {
  VALUE = 'VALUE',
  TIMES = 'TIMES',
  TIMETYPEAPPLY = 'TIMETYPEAPPLY'
}

export enum TIME_TYPE_APPLY {
  TIMES = 'TIMES',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR'
}

export enum TRANSACTION_TYPE {
  DEPOSIT = 'DEPOSIT',
  FEE = 'FEE',
  VAT = 'VAT',
  WITHDRAWAL = 'WITHDRAWAL',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  TOTAL_LIMIT = 'TOTAL_LIMIT'
}

export const objects = [
  {
    value: APPLICABLE_OBJECTS.SYSTEM,
    name: t`policy-management.payment.system`
  },
  {
    value: APPLICABLE_OBJECTS.ACCOUNT_TYPE,
    name: t`policy-management.payment.accountGroup`
  },
  {
    value: APPLICABLE_OBJECTS.PRIVATE_ACCOUNT,
    name: t`policy-management.payment.personalAccount`
  }
]

export const limitTypeOptions = [
  {
    value: LIMIT_TYPE.LIMIT_MIN,
    label: t`policy-management.limitAndRegulations.minLimit`.toString()
  },
  {
    value: LIMIT_TYPE.LIMIT_MAX,
    label: t`policy-management.limitAndRegulations.maxLimit`.toString()
  }
]

export const transactionType = [
  {
    value: TRANSACTION_TYPE.DEPOSIT,
    label: t`policy-management.limitAndRegulations.recharge`.toString()
  },
  {
    value: TRANSACTION_TYPE.WITHDRAW,
    label: t`policy-management.limitAndRegulations.withDraw`.toString()
  },
  {
    value: TRANSACTION_TYPE.TRANSFER,
    label: t`policy-management.limitAndRegulations.transferMoney`.toString()
  },
  {
    value: TRANSACTION_TYPE.PAYMENT,
    label: t`policy-management.limitAndRegulations.payment`.toString()
  },
  {
    value: TRANSACTION_TYPE.FEE,
    label: t`policy-management.limitAndRegulations.fee`.toString()
  },
  {
    value: TRANSACTION_TYPE.VAT,
    label: t`policy-management.limitAndRegulations.vat`.toString()
  },
  // TODO: Hidden TOTAL_LIMIT
  // {
  //   value: TRANSACTION_TYPE.TOTAL_LIMIT,
  //   label:
  //     t`policy-management.limitAndRegulations.totalLimitTransaction`.toString()
  // }
]

export const limitValueTypeOptions = [
  {
    value: VALUE_LIMIT_TYPE.VALUE,
    label: t`policy-management.limitAndRegulations.value`.toString()
  },
  {
    value: VALUE_LIMIT_TYPE.TIMES,
    label: t`policy-management.limitAndRegulations.count`.toString()
  }
  // {
  //   value: VALUE_LIMIT_TYPE.TIMETYPEAPPLY,
  //   label: t`policy-management.limitAndRegulations.timeTypeApply`.toString()
  // }
]

export const limitTimeTypeOptions = [
  {
    value: TIME_TYPE_APPLY.TIMES,
    label: t`policy-management.limitAndRegulations.times`.toString()
  },
  {
    value: TIME_TYPE_APPLY.DAY,
    label: t`policy-management.limitAndRegulations.day`.toString()
  },
  {
    value: TIME_TYPE_APPLY.WEEK,
    label: t`policy-management.limitAndRegulations.week`.toString()
  },
  {
    value: TIME_TYPE_APPLY.MONTH,
    label: t`policy-management.limitAndRegulations.month`.toString()
  },
  {
    value: TIME_TYPE_APPLY.YEAR,
    label: t`policy-management.limitAndRegulations.year`.toString()
  }
]
