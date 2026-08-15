import type { GetBankLinksRequest } from '@services/apiBankLink'

export type BankLinkSearchFilters = Pick<
  GetBankLinksRequest,
  | 'bankCode'
  | 'walletId'
  | 'linkType'
  | 'status'
  | 'accountName'
  | 'accountNumber'
  | 'linkedAtFrom'
  | 'linkedAtTo'
  | 'unlinkedAtFrom'
  | 'unlinkedAtTo'
>

const normalizeText = (value?: string): string | undefined => {
  const normalizedValue = value?.trim()
  return normalizedValue || undefined
}

export const buildBankLinkSearchFilters = (
  values: BankLinkSearchFilters
): BankLinkSearchFilters => ({
  bankCode: normalizeText(values.bankCode),
  walletId: normalizeText(values.walletId),
  linkType: normalizeText(values.linkType),
  status: normalizeText(values.status),
  accountName: normalizeText(values.accountName),
  accountNumber: normalizeText(values.accountNumber),
  linkedAtFrom: values.linkedAtFrom || undefined,
  linkedAtTo: values.linkedAtTo || undefined,
  unlinkedAtFrom: values.unlinkedAtFrom || undefined,
  unlinkedAtTo: values.unlinkedAtTo || undefined
})
