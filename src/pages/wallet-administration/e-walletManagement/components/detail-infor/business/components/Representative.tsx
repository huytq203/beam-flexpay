import type { UploadFile } from '@components/form'
import type { EnterpriseWalletDto } from '@type/enterpriseWallet'
import { formatDate, formatText } from '../utils/enterprise-wallet-format'
import { EnterpriseDocumentList } from './EnterpriseDocumentList'
import { ProfileFields, ProfileHeading } from './ProfileFields'

interface RepresentativeProps {
  wallet: EnterpriseWalletDto
  resolveFileUrl: (file: UploadFile) => Promise<string>
}

const Representative = ({ wallet, resolveFileUrl }: RepresentativeProps) => (
  <>
    <ProfileHeading>Người đại diện pháp luật</ProfileHeading>
    <ProfileFields
      fields={[
        {
          label: 'Họ và tên',
          value: formatText(wallet.legalRepresentativeName)
        },
        {
          label: 'Số CCCD',
          value: formatText(wallet.legalRepresentativeIdNumber)
        }
      ]}
    />
    <ProfileHeading>Người quản lý ví</ProfileHeading>
    <ProfileFields
      fields={[
        { label: 'Họ và tên', value: formatText(wallet.managerName) },
        { label: 'Chức vụ', value: formatText(wallet.managerTitle) },
        { label: 'Số CCCD', value: formatText(wallet.managerIdNumber) },
        {
          label: 'Ngày hết hạn CCCD',
          value: formatDate(wallet.managerIdExpiryDate)
        },
        { label: 'Số điện thoại nhận OTP', value: formatText(wallet.otpPhone) }
      ]}
    />
    <hr className='mt-4 border-border' />
    <ProfileHeading>Ảnh CCCD</ProfileHeading>
    <EnterpriseDocumentList
      resolveFileUrl={resolveFileUrl}
      items={[
        { label: 'CCCD — Mặt trước', document: wallet.idCardFront },
        { label: 'CCCD — Mặt sau', document: wallet.idCardBack }
      ]}
    />
  </>
)

export default Representative
