export const address =
  /^[a-zA-Z_ÀÁÂÃÈÉÊẾÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ_0-9\, ]+$/
export const bankCode = /^[A-Z]{4}$/
export const hyperLink =
  /\b((https?|ftp|file):\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[-A-Za-z0-9+&@#\/%=~_|])\b/
export const bankName =
  /^[a-zA-Z_ÀÁÂÃÈÉÊẾÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ_0-9-!/ ]+$/
export const templateFormatBody = {
  depositLinkBank: /.*(amount|cardName).*(amount|cardName).*/,
  depositCardPhone: /.*(amount|phoneNumber).*(amount|phoneNumber).*/,
  depositFail: /.*(amount|cardName).*(amount|cardName).*/,
  chargeCardPhoneNumber:
    /.*(amount|phoneNumber).*(amount|phoneNumber).*/,
  chargeData3G: /.*(networkName).*(dataAmount).*(phoneNumber).*/,

  withdrawLinkBank: /.*(amount|bankName).*(amount|bankName).*/,
  withdrawUnlinkBank:
    /.*(amount|fullName|cardCode).*(amount|fullName|cardCode).*(amount|fullName|cardCode).*/,
  linkBank: /.*(bankName).*/,
  unLinkBank: /.*(bankName).*/,
  paymentBill:
    /.*(amount|supplierName|billCode).*(amount|supplierName|billCode).*(amount|supplierName|billCode).*/,
  payment3G:
    /.*(networkName|price|dataCode|seriCode).*[\n]?.*(networkName|price|dataCode|seriCode).*[\n]?.*(networkName|price|dataCode|seriCode).*[\n]?.*(networkName|price|dataCode|seriCode).*/,
  transferMover:
    /.*(amount|recipientPhoneNumber).*(amount|recipientPhoneNumber).*/,
  transferReceive: /.*(amount).*/,

  paymentCardPhone:
    /.*(networkName|parValue|phoneCode|seriCode).*[\n]?.*(networkName|parValue|phoneCode|seriCode).*[\n]?.*(networkName|parValue|phoneCode|seriCode).*[\n]?.*(networkName|parValue|phoneCode|seriCode).*/,
  loginWarning:
    /.*(deviceName|timeLogin|location).*[\n]?.*(deviceName|timeLogin|location).*[\n]?.*(deviceName|timeLogin|location).*[\n]?.*/
}

export const templateFormatTitle = {
  payment3G: /.*(networkName).*/,
  transferMover: /.*(recipientPhoneNumber).*/,
  transferReceive: /.*(transferAccount).*/,
  depositCardPhone: /.*(bankName).*/,
  chargeCardPhoneNumber: /.*(networkName).*/,
  chargeData3G: /.*(networkName).*/,
  paymentCardPhone: /.*(networkName).*/
}
