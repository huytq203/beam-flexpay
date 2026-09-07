import {
  BankAccountScope,
  BankAccountStatus,
  BankLinkStatus,
  WithdrawCycle,
  WithdrawMode,
  type BankAccountRow
} from '../types/bank-account.type'

/**
 * Dữ liệu dựng khung giao diện. BE mới có `GET`/`POST` `/merchant-bank-accounts`,
 * chưa có update/khóa nên phase này chưa đấu API — thay nguồn tại `useBankAccount`.
 */
export const MOCK_BANK_ACCOUNTS: BankAccountRow[] = [
  {
    id: 'bank-account-1',
    scope: BankAccountScope.MASTER,
    merchantName: 'Highlands Coffee',
    merchantCode: 'MC000142',
    masterMerchantCode: 'MC000142',
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    accountNumber: '0071000124821',
    accountName: 'NGUYEN VAN HAI',
    branchName: 'CN TP. Hồ Chí Minh',
    withdrawMode: WithdrawMode.AUTO,
    withdrawCycle: WithdrawCycle.T1,
    minAmount: 1_000_000,
    maxAmount: 500_000_000,
    status: BankAccountStatus.ACTIVE,
    linkStatus: BankLinkStatus.LINKED
  },
  {
    id: 'bank-account-2',
    scope: BankAccountScope.SUB,
    merchantName: 'HLC Nguyễn Huệ',
    merchantCode: 'SUB-0142-01',
    masterMerchantCode: 'MC000142',
    bankCode: 'TCB',
    bankName: 'Techcombank',
    accountNumber: '19033445567734',
    accountName: 'CTY CP VIET THAI INTL',
    branchName: 'CN Nguyễn Huệ',
    withdrawMode: WithdrawMode.MANUAL,
    minAmount: 500_000,
    maxAmount: 200_000_000,
    status: BankAccountStatus.ACTIVE,
    linkStatus: BankLinkStatus.LINKED
  },
  {
    id: 'bank-account-3',
    scope: BankAccountScope.MASTER,
    merchantName: 'Pharmacity',
    merchantCode: 'MC000151',
    masterMerchantCode: 'MC000151',
    bankCode: 'BIDV',
    bankName: 'BIDV',
    accountNumber: '21010000891092',
    accountName: 'CTY CP DUOC PHARMACITY',
    branchName: 'CN Quận 1',
    withdrawMode: WithdrawMode.AUTO,
    withdrawCycle: WithdrawCycle.T2,
    minAmount: 2_000_000,
    maxAmount: 800_000_000,
    status: BankAccountStatus.ACTIVE,
    linkStatus: BankLinkStatus.LINKED
  },
  {
    id: 'bank-account-4',
    scope: BankAccountScope.SUB,
    merchantName: 'HLC Landmark 81',
    merchantCode: 'SUB-0142-02',
    masterMerchantCode: 'MC000142',
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    accountNumber: '0071000124821',
    accountName: '(Kế thừa Master)',
    withdrawMode: WithdrawMode.AUTO,
    withdrawCycle: WithdrawCycle.T1,
    status: BankAccountStatus.ACTIVE,
    linkStatus: BankLinkStatus.LINKED
  },
  {
    id: 'bank-account-5',
    scope: BankAccountScope.MASTER,
    merchantName: 'Con Cưng',
    merchantCode: 'MC000163',
    masterMerchantCode: 'MC000163',
    bankCode: 'ACB',
    bankName: 'ACB',
    accountNumber: '18800012345567',
    accountName: 'CTY CP CON CUNG',
    branchName: 'CN Tân Bình',
    withdrawMode: WithdrawMode.MANUAL,
    status: BankAccountStatus.INACTIVE,
    linkStatus: BankLinkStatus.PENDING
  },
  {
    id: 'bank-account-6',
    scope: BankAccountScope.MASTER,
    merchantName: 'GS25 Việt Nam',
    merchantCode: 'MC000160',
    masterMerchantCode: 'MC000160',
    bankCode: 'MB',
    bankName: 'MB Bank',
    accountNumber: '90090012343341',
    accountName: 'CTY TNHH GS25 VN',
    branchName: 'CN Sài Gòn',
    withdrawMode: WithdrawMode.AUTO,
    withdrawCycle: WithdrawCycle.T1,
    minAmount: 1_000_000,
    maxAmount: 300_000_000,
    status: BankAccountStatus.ACTIVE,
    linkStatus: BankLinkStatus.FAILED
  }
]

export const SCOPE_LABEL: Record<BankAccountScope, string> = {
  [BankAccountScope.MASTER]: 'Master',
  [BankAccountScope.SUB]: 'Sub'
}

export const STATUS_LABEL: Record<BankAccountStatus, string> = {
  [BankAccountStatus.ACTIVE]: 'Đang dùng',
  [BankAccountStatus.INACTIVE]: 'Ngừng'
}

export const LINK_STATUS_LABEL: Record<BankLinkStatus, string> = {
  [BankLinkStatus.LINKED]: 'Đã liên kết',
  [BankLinkStatus.PENDING]: 'Chờ xác minh',
  [BankLinkStatus.FAILED]: 'Liên kết thất bại'
}

export const SCOPE_OPTIONS = [
  { value: BankAccountScope.MASTER, label: SCOPE_LABEL.MASTER },
  { value: BankAccountScope.SUB, label: SCOPE_LABEL.SUB }
]

export const STATUS_OPTIONS = [
  { value: BankAccountStatus.ACTIVE, label: STATUS_LABEL.ACTIVE },
  { value: BankAccountStatus.INACTIVE, label: STATUS_LABEL.INACTIVE }
]

export const LINK_STATUS_OPTIONS = [
  { value: BankLinkStatus.LINKED, label: LINK_STATUS_LABEL.LINKED },
  { value: BankLinkStatus.PENDING, label: LINK_STATUS_LABEL.PENDING },
  { value: BankLinkStatus.FAILED, label: LINK_STATUS_LABEL.FAILED }
]

export const WITHDRAW_CYCLE_OPTIONS = [
  { value: WithdrawCycle.T0, label: 'T+0 — trong ngày' },
  { value: WithdrawCycle.T1, label: 'T+1' },
  { value: WithdrawCycle.T2, label: 'T+2' },
  { value: WithdrawCycle.T3, label: 'T+3' }
]

export const MASTER_MERCHANT_OPTIONS = [
  { value: 'MC000142', label: 'Highlands Coffee · MC000142' },
  { value: 'MC000151', label: 'Pharmacity · MC000151' },
  { value: 'MC000163', label: 'Con Cưng · MC000163' },
  { value: 'MC000160', label: 'GS25 Việt Nam · MC000160' }
]

export const SUB_MERCHANT_OPTIONS = [
  { value: 'SUB-0142-01', label: 'HLC Nguyễn Huệ · SUB-0142-01' },
  { value: 'SUB-0142-02', label: 'HLC Landmark 81 · SUB-0142-02' }
]

export const BANK_OPTIONS = [
  { value: 'VCB', label: 'Vietcombank (VCB)' },
  { value: 'TCB', label: 'Techcombank (TCB)' },
  { value: 'BIDV', label: 'BIDV' },
  { value: 'ACB', label: 'ACB' },
  { value: 'MB', label: 'MB Bank (MB)' }
]

/** Che toàn bộ số tài khoản trừ 4 chữ số cuối. */
export const maskAccountNumber = (accountNumber: string): string =>
  `••••${accountNumber.slice(-4)}`

export const describeWithdraw = (row: BankAccountRow): string =>
  row.withdrawMode === WithdrawMode.AUTO && row.withdrawCycle
    ? `Tự động ${row.withdrawCycle}`
    : 'Thủ công'

/** Lớp dùng chung cho field trong modal — giữ nhãn/khoảng cách nhất quán. */
export const FORM_FIELD_CLASS = 'flex flex-col gap-1.5'
export const FORM_FIELD_FULL_CLASS = 'flex flex-col gap-1.5 md:col-span-2'
export const FORM_LABEL_CLASS = 'text-sm font-medium text-foreground'
