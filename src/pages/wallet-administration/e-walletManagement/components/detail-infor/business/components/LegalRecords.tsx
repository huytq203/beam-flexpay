import type { UploadFile } from '@components/form'
import { TYPEDATE } from '@constants/date.constant'
import {
  EnterpriseWalletVerificationStatus,
  type EnterpriseWalletDto
} from '@type/enterpriseWallet'
import {
  BUSINESS_TYPE_LABEL,
  VERIFICATION_STATUS_LABEL
} from '../constants/enterpriseWallet.constant'
import { formatDate, formatText } from '../utils/enterprise-wallet-format'
import { EnterpriseDocumentList } from './EnterpriseDocumentList'
import {
  type ProfileField,
  ProfileFields,
  ProfileHeading
} from './ProfileFields'

interface LegalRecordsProps {
  wallet: EnterpriseWalletDto
  resolveFileUrl: (file: UploadFile) => Promise<string>
}

const buildFields = (wallet: EnterpriseWalletDto): ProfileField[] => {
  const fields: ProfileField[] = [
    {
      label: 'Tên doanh nghiệp (theo ĐKKD)',
      value: formatText(wallet.legalName),
      isWide: true
    },
    { label: 'Mã số thuế', value: formatText(wallet.taxCode) },
    {
      label: 'Loại hình',
      value: wallet.businessType
        ? BUSINESS_TYPE_LABEL[wallet.businessType]
        : formatText()
    },
    { label: 'Email đăng ký', value: formatText(wallet.registeredEmail) },
    {
      label: 'Trạng thái xác minh',
      value: VERIFICATION_STATUS_LABEL[wallet.verificationStatus]
    },
    {
      label: 'Địa chỉ trụ sở chính',
      value: formatText(wallet.headOfficeAddress),
      isWide: true
    },
    {
      label: 'Ngày tạo hồ sơ',
      value: formatDate(wallet.createdAt, TYPEDATE.fullTime)
    }
  ]
  if (
    wallet.verificationStatus === EnterpriseWalletVerificationStatus.REJECTED
  ) {
    fields.push({
      label: 'Lý do từ chối',
      value: formatText(wallet.kybRejectedReason),
      isWide: true
    })
  }
  return fields
}

const LegalRecords = ({ wallet, resolveFileUrl }: LegalRecordsProps) => (
  <>
    <ProfileFields fields={buildFields(wallet)} />
    <hr className='mt-4 border-border' />
    <ProfileHeading>Đính kèm hồ sơ</ProfileHeading>
    <EnterpriseDocumentList
      resolveFileUrl={resolveFileUrl}
      items={[
        { label: 'Giấy phép ĐKKD', document: wallet.businessLicense },
        { label: 'Giấy ủy quyền', document: wallet.authorizationLetter }
      ]}
    />
  </>
)

export default LegalRecords
