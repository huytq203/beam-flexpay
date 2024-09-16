import { t } from 'i18next'

import { IPageSearch, PageMeta } from './api'

export enum viewMode {
  'lock' = 'lock',
  'unlock' = 'unlock',
  'view' = 'view',
  'create' = 'create',
  'update' = 'update',
  'refund' = 'refund',
  'notify' = 'notify',
  'freeze' = 'freeze',
  'configuration' = 'configuration',
  'delete' = 'delete',
  'history' = 'history'
}




export enum pageEnum {
  'directDeposit' = 'directDeposit',
  'eWalletTransferMoney' = 'eWalletTransferMoney',
  'omipayPayment' = 'omipayPayment',
  'accountBankPayment' = 'accountBankPayment',
  'withdrawMoney' = 'withdrawMoney',
  'limitAndRegulations' = 'limitAndRegulations',
  'customerCancel' = 'customerCancel',
  'feeSettings' = 'feeSettings',
  notificationManagement = "notificationManagement",
  internalGroupWallet = "internalGroupWallet",
  'bankManagement' = 'bankManagement',
}

export enum APPLICABLE_OBJECTS {
  ALL  = 'ALL',
  SYSTEM = 'SYSTEM',
  PERSONAL_ACCOUNT = 'PERSONAL_ACCOUNT',
  ACCOUNT_GROUP = 'ACCOUNT_GROUP'
}

export const objects = [
  {
    value: APPLICABLE_OBJECTS.SYSTEM,
    label: t`policy-management.payment.system`
  },
  {
    value: APPLICABLE_OBJECTS.ACCOUNT_GROUP,
    label: t`policy-management.payment.accountGroup`
  },
  {
    value: APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
    label: t`policy-management.payment.personalAccount`
  }
]

export interface IPolicySearch extends IPageSearch {
  depositMethod?: string | number[]
  applicableObject?: string
  applicableObjectId?: number
}

export interface IPolicyTable {
  applicableObject: string
  createdAt: string
  depositMethod: string
  endDate: string
  id: number
  receiverFeeMax: null
  receiverFeeMin: number
  receiverFixedFee: number
  receiverFlexibleFee: number
  startDate: string
  transactionFrom: number
  transactionTo: number
  transferorFeeMax: number
  transferorFeeMin: number
  transferorFixedFee: number
  transferorFlexibleFee: number
  updatedAt: string
  applicableObjectId?: number
  applicableObjectName?: string
  depositMethods?: string
  depositMethodIds?: number[]
}

export interface IPolicyForm {
  applicableObject: string
  applicableObjectId?: number
  transactionFrom?: number
  transactionTo?: number
  transferorFlexibleFee?: number
  transferorFixedFee?: number
  transferorFeeMin?: number
  transferorFeeMax?: number
  receiverFlexibleFee?: number
  receiverFixedFee?: number
  receiverFeeMin?: number
  receiverFeeMax?: number
  depositMethod: string
  startDate: string
  endDate: string
  valueTypeUpdate: string[]
  valueTypeDelete: string[]
}

export interface IPolicyResponse {
  data: IPolicyTable[]
  meta: PageMeta
}

export type SearchType = {
  page: number
  take: number
  accountGroup?: string
  depositMethod?: string[]
  applicableObject?: string
  applicableObjectId?: string[] | number[] | any
}

export type SearchValueType = {
  accountGroupSearch: string
  privateAccountSearch: string
}

export interface UserInformationInterface {
  id: number | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: null
  email: string
  fullName: string
  active: number | null
  phoneNumber: null
  avatar: null
}

export interface HistoryInterface {
  id: number | null
  user: UserInformationInterface
  userNameCreate: string
  historyType: string
  valueType: string
  oldValue: null
  newValue: string | null
  createTime: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface IPolicy<T> {
  data: T
  meta: PageMeta
}

export enum history_type {
  UPDATE_HISTORY = 'UPDATE_HISTORY',
  DELETE_HISTORY = 'DELETE_HISTORY'
}
