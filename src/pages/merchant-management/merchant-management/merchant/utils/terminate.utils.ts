import type { ContentMerchant } from '@type/merchant'

/** BE chỉ nhận mã hoặc tên merchant, không phân biệt hoa thường; kiểm sớm để không tốn OTP. */
export const matchesMerchantConfirmation = (
  merchant: Pick<ContentMerchant, 'code' | 'name'>,
  text: string
): boolean => {
  const typed = text.trim().toLowerCase()
  return (
    typed.length > 0 &&
    [merchant.code, merchant.name].some(
      (value) => value.trim().toLowerCase() === typed
    )
  )
}
