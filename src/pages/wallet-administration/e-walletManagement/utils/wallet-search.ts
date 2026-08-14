import type { StatusEKYCLabel } from '../constants/StatusEKYC.constant'
import type { FormSearchValues } from '../types/ResponseWalletAccount.type'

type VerifyEKYCFormValue = keyof typeof StatusEKYCLabel

export type WalletSearchInputValues = Omit<
  FormSearchValues,
  'verifyEKYC'
> & {
  verifyEKYC?: VerifyEKYCFormValue
}

export const buildWalletSearchFilters = ({
  verifyEKYC,
  ...filters
}: WalletSearchInputValues): FormSearchValues => {
  if (verifyEKYC === undefined) return filters

  return {
    ...filters,
    verifyEKYC: verifyEKYC === 'true'
  }
}
