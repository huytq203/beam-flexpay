import dayjs from 'dayjs'
import StatusBadge from '@components/status-badge/StatusBadge'
import { WalletIcon } from '@components/icons'
import { TYPEDATE } from '@constants/date.constant'
import { formatCurrency } from '@utils/formatNumber'
import { ContentEKYC } from '@type/apiResponseEKYC'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { StatusKey } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'
import {
  BANK_LINK_STATE_CONFIG,
  EKYC_DOCUMENT_SLOTS,
  EKYC_STATUS_CONFIG,
  EkycStatusEnum,
  FACE_MATCH_THRESHOLD,
  SALARY_ADVANCE_STATE_CONFIG,
  WALLET_STATUS_CONFIG,
  type StatusDisplayConfig
} from '../constants/CommonInfor.constant'
import useWalletDisplayInfo from '../hooks/useWalletDisplayInfo'
import AsyncStatusValue from './AsyncStatusValue'
import { InfoDivider, InfoList, InfoRow, InfoSectionHeader, InfoSubHeading } from './InfoPanel'

const EMPTY = '--'

const faceMatchClass = (score?: number | null) => {
  if (score == null) return 'text-muted-foreground'
  if (score >= FACE_MATCH_THRESHOLD.GOOD) return 'amount-positive'
  if (score >= FACE_MATCH_THRESHOLD.FAIR) return 'amount-caution'
  return 'amount-negative'
}

interface AsyncStatusRow {
  label: string
  status: string
  config: Record<string, StatusDisplayConfig>
}

interface WalletInfoCardProps {
  data?: AcountItem
  ekyc?: ContentEKYC
}

const WalletInfoCard = ({ data, ekyc }: WalletInfoCardProps) => {
  const displayInfo = useWalletDisplayInfo(data?.ownerId)

  if (!data) return null

  const ekycStatus = ekyc?.profileStatus ?? EkycStatusEnum.NOT_VERIFIED
  const availableBalance = data.availableBalance ?? data.balance - data.holdBalance
  const verifiedAt = ekyc?.verifiedAt ? dayjs(ekyc.verifiedAt).format(TYPEDATE.fullTime) : EMPTY

  const asyncRows: AsyncStatusRow[] = [
    {
      label: 'Ứng lương',
      status: displayInfo.salaryAdvanceState,
      config: SALARY_ADVANCE_STATE_CONFIG
    },
    // {
    //   label: 'TK nhận lương',
    //   status: displayInfo.salaryAccountState,
    //   config: BANK_LINK_STATE_CONFIG
    // },
    {
      label: 'Liên kết NH',
      status: displayInfo.bankLinkState,
      config: BANK_LINK_STATE_CONFIG
    }
  ]

  return (
    <>
      <InfoSectionHeader icon={<WalletIcon weight='fill' size={20} />} title='Thông tin ví' />
      <InfoDivider />

      <InfoList>
        <InfoRow label='Mã ví' value={data.id} />
        <InfoRow
          label='Trạng thái ví'
          value={<StatusBadge status={data.status} config={WALLET_STATUS_CONFIG} />}
        />
        {data.status === StatusKey.LOCKED && (
          <InfoRow
            label='Lý do khóa'
            value={data.lockedReason || EMPTY}
            valueClassName='amount-negative'
          />
        )}
        <InfoRow
          label='Trạng thái eKYC'
          value={<StatusBadge status={ekycStatus} config={EKYC_STATUS_CONFIG} />}
        />

        {asyncRows.map((row) => (
          <InfoRow
            key={row.label}
            label={row.label}
            value={
              <AsyncStatusValue
                status={row.status}
                config={row.config}
                fieldLabel={row.label}
                isLoading={displayInfo.isLoading}
                isError={displayInfo.isError}
                isEmpty={displayInfo.isEmpty}
                onRetry={displayInfo.refetch}
              />
            }
          />
        ))}

        <InfoDivider />

        <InfoRow label='Tổng số dư' value={formatCurrency(data.balance)} emphasis='amount' />
        <InfoRow
          label='Số dư khả dụng'
          value={formatCurrency(availableBalance)}
          emphasis='amount'
          valueClassName='amount-positive'
        />
        <InfoRow
          label='Số dư đóng băng'
          value={formatCurrency(data.holdBalance)}
          emphasis='amount'
          valueClassName='amount-negative'
        />

        <InfoDivider />

        <InfoRow label='Ngày mở ví' value={dayjs(data.createdAt).format(TYPEDATE.fullTime)} />
        <InfoRow label='Ngày xác thực' value={verifiedAt} />

        <InfoDivider />
        <InfoSubHeading>Thông tin xác thực eKYC</InfoSubHeading>

        <InfoRow
          label='Trạng thái'
          value={<StatusBadge status={ekycStatus} config={EKYC_STATUS_CONFIG} />}
        />
        <InfoRow
          label='Độ chính xác AI'
          value={ekyc?.faceMatchScore != null ? `${ekyc.faceMatchScore}%` : EMPTY}
          emphasis='amount'
          valueClassName={faceMatchClass(ekyc?.faceMatchScore)}
        />
      </InfoList>

      <div className='mt-4 flex justify-between gap-4'>
        {EKYC_DOCUMENT_SLOTS.map((slot) => (
          <div key={slot.key} className='flex flex-1 flex-col items-center gap-2'>
            <div className='flex h-24 w-full items-center justify-center rounded-md border border-border bg-muted text-[12px] text-muted-foreground'>
              {slot.boxLabel}
            </div>
            <span className='text-xs text-muted-foreground'>{slot.caption}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default WalletInfoCard
