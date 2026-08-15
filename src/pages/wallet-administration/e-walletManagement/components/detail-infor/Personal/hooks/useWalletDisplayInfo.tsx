import { useMemo } from 'react'
import { useGetWalletDisplayInfoQuery } from '@services/apiUserInfo'
import { isActiveBankLinkStatus } from '../constants/AccountBank.constant'
import { BankLinkStateEnum, SalaryAdvanceStateEnum } from '../constants/CommonInfor.constant'

export interface WalletDisplayInfoView {
  /** Có ít nhất một liên kết ngân hàng còn hiệu lực. */
  bankLinkState: BankLinkStateEnum
  /** Ứng lương bật/tắt ở mức ví (salaryAdvanceEnabled). */
  salaryAdvanceState: SalaryAdvanceStateEnum
  /** Có thẻ/tài khoản được đánh dấu nhận lương (isSalaryAccount) và liên kết còn hiệu lực. */
  salaryAccountState: BankLinkStateEnum
  isLoading: boolean
  isError: boolean
  /** Chưa có ownerId nên không thể gọi API — hiển thị "--" thay vì trạng thái sai. */
  isEmpty: boolean
  refetch: () => void
}

/** Gọi /user-wallets/{ownerId}/display-info và quy về các trạng thái hiển thị của màn chi tiết ví. */
const useWalletDisplayInfo = (ownerId?: string): WalletDisplayInfoView => {
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useGetWalletDisplayInfoQuery(ownerId ?? '', { skip: !ownerId })

  return useMemo(() => {
    const linkedBanks = data?.linkedBanks ?? []
    const activeLinks = linkedBanks.filter((bank) => isActiveBankLinkStatus(bank.status))

    return {
      bankLinkState: activeLinks.length > 0
        ? BankLinkStateEnum.LINKED
        : BankLinkStateEnum.NOT_LINKED,
      salaryAdvanceState: data?.salaryAdvanceEnabled
        ? SalaryAdvanceStateEnum.ENABLED
        : SalaryAdvanceStateEnum.NOT_LINKED,
      salaryAccountState: activeLinks.some((bank) => bank.isSalaryAccount === true)
        ? BankLinkStateEnum.LINKED
        : BankLinkStateEnum.NOT_LINKED,
      isLoading,
      isError,
      isEmpty: !ownerId,
      refetch
    }
  }, [data, isLoading, isError, ownerId, refetch])
}

export default useWalletDisplayInfo
