import { useMemo } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { UserIcon } from '@components/icons'
import { ContentEKYC } from '@type/apiResponseEKYC'
import { TYPEDATE } from '@constants/date.constant'
import { GenderEnum, GenderLabel } from '../constants/CommonInfor.constant'
import { InfoDivider, InfoList, InfoRow, InfoSectionHeader } from './InfoPanel'

dayjs.extend(utc)

const EMPTY = '--'

const text = (value?: string | null) => value || EMPTY

const date = (value?: string | null) => {
  if (!value) return EMPTY
  const parsed = dayjs.utc(value).local()
  return parsed.isValid() ? parsed.format(TYPEDATE.date) : EMPTY
}

interface CustomerInfoCardProps {
  ekyc?: ContentEKYC
}

const CustomerInfoCard = ({ ekyc }: CustomerInfoCardProps) => {
  const rows = useMemo(
    () => [
      {
        label: 'Họ và tên',
        value: text(ekyc?.fullName),
        emphasis: 'strong' as const
      },
      { label: 'Số điện thoại', value: text(ekyc?.username) },
      { label: 'Email', value: text(ekyc?.email) },
      { label: 'Nghề nghiệp', value: text(ekyc?.occupation) },
      { label: 'Chức vụ', value: text(ekyc?.position) },
      { label: 'Loại giấy tờ', value: text(ekyc?.cardType) },
      { label: 'Số CCCD/CMND', value: text(ekyc?.idNumber) },
      { label: 'Ngày cấp', value: date(ekyc?.issueDate) },
      { label: 'Nơi cấp', value: text(ekyc?.issuePlace) },
      { label: 'Ngày hết hạn', value: date(ekyc?.expiryDate) },
      { label: 'Ngày sinh', value: date(ekyc?.dateOfBirth) },
      {
        label: 'Giới tính',
        value: GenderLabel[ekyc?.gender as GenderEnum] ?? text(ekyc?.gender)
      },
      { label: 'Quốc tịch', value: text(ekyc?.nationality) }
    ],
    [ekyc]
  )

  return (
    <>
      <InfoSectionHeader
        icon={
          <UserIcon
            weight='fill'
            size={20}
          />
        }
        title='Thông tin khách hàng'
      />
      <InfoDivider />

      <InfoList>
        {rows.map((row) => (
          <InfoRow
            key={row.label}
            label={row.label}
            value={row.value}
            emphasis={row.emphasis}
          />
        ))}
      </InfoList>

      <InfoDivider />
      <div>
        <p className='text-muted-foreground'>Quê quán</p>
        <p className='font-medium whitespace-pre-line text-foreground'>
          {text(ekyc?.placeOfOrigin)}
        </p>
      </div>

      <InfoDivider />
      <div>
        <p className='text-muted-foreground'>Địa chỉ thường trú</p>
        <p className='font-medium whitespace-pre-line text-foreground'>
          {text(ekyc?.currentAddress)}
        </p>
      </div>
    </>
  )
}

export default CustomerInfoCard
