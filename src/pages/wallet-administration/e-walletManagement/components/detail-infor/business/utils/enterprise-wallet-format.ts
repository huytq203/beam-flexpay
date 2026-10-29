import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'
import type {
  EnterpriseWalletDocument,
  EnterpriseWalletDto
} from '@type/enterpriseWallet'

export const EMPTY_VALUE = '--'

export const formatText = (value?: string | null): string =>
  value?.trim() || EMPTY_VALUE

export const formatDate = (
  value?: string | null,
  pattern: string = TYPEDATE.date
): string => {
  if (!value) return EMPTY_VALUE
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(pattern) : EMPTY_VALUE
}

export const findEnterpriseDocument = (
  wallet: EnterpriseWalletDto | null | undefined,
  documentId: string
): EnterpriseWalletDocument | undefined =>
  [
    wallet?.businessLicense,
    wallet?.authorizationLetter,
    wallet?.idCardFront,
    wallet?.idCardBack
  ].find((item) => item?.id === documentId) ?? undefined
