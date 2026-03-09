import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { CustomerBalanceDetailDto } from '@type/application'
import {
  convertLocalStringNumber,
  getDate,
  getStatusAccountText,
  getStatusText,
  getTagAccountStatusColor,
  getTagColor
} from '@utils/helperFunctions'
import { Col, Row, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface IItemResult {
  title?: string
  data?: any
  extra?: JSX.Element | ReactNode | null | string
  noStyle?: boolean
}

const { Text } = Typography

type CustomerInformationProps = {
  customer?: CustomerBalanceDetailDto
}
function CustomerInformation(props: CustomerInformationProps) {
  const { customer } = props
  const { t: trans } = useTranslation()

  const ItemResult = ({ title, data, extra, noStyle }: IItemResult) => {
    return (
      <Row
        gutter={GUTTER}
        className={noStyle ? '' : 'mb-30'}
      >
        <Col
          xs={24}
          md={10}
        >
          <Text className='fw-600'>{title}</Text>
        </Col>
        <Col
          xs={24}
          md={10}
        >
          {data ? <Text> {data}</Text> : <Text>{trans('labels.nodata')}</Text>}
          {extra || null}
        </Col>
      </Row>
    )
  }

  return (
    <div className='detail-information mt-20'>
      {customer && (
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            md={14}
          >
            <ItemResult
              title={trans('labels.accountName').toString()}
              data={customer?.fullName}
            />
            <ItemResult
              title={trans('labels.accountType').toString()}
              data='Cá Nhân'
            />
            <ItemResult
              title={trans('labels.status').toString()}
              data={
                <Tag
                  color={getTagColor(customer.active)}
                  className='text-capitalize'
                >
                  {getStatusText(customer.active)}
                </Tag>
              }
            />
            <ItemResult
              title={trans('labels.dateOfBirth').toString()}
              data={
                customer?.birthDay
                  ? dayjs(customer.birthDay, TimeFormat).format(TimeFormat)
                  : undefined
              }
            />
            <ItemResult
              title={trans('labels.email').toString()}
              data={customer?.email}
            />
            <ItemResult
              title={trans('labels.IdNumber').toString()}
              data={customer?.identityNumber}
            />
            <ItemResult
              title={trans('labels.dateOfIdNumber').toString()}
              data={getDate(customer?.dateOfIdentityIssuance)}
            />
            <ItemResult
              title={trans('labels.placeOfIdNumber').toString()}
              data={customer?.placeOfIdentityIssuance}
            />
            {/* <ItemResult
              title={trans('labels.nationality').toString()}
              data={customer?.}
            /> */}
            <ItemResult
              title={trans('labels.province').toString()}
              data={customer?.province}
              noStyle
            />
          </Col>
          <Col
            xs={24}
            md={10}
          >
            <ItemResult
              title={trans('labels.district').toString()}
              data={customer?.district}
            />
            <ItemResult
              title={trans('labels.ward').toString()}
              data={customer?.village}
            />
            {/* <ItemResult
              title={trans('labels.career').toString()}
              data={customer?.career}
            /> */}
            {/* <ItemResult
              title={trans('labels.position').toString()}
              data={customer?.position}
            /> */}
            <ItemResult
              title={trans`labels.walletNo`.toString()}
              data={customer.phoneNumber}
            />
            <ItemResult
              title={trans('labels.verifiedAccount').toString()}
              data={
                <Tag
                  color={getTagAccountStatusColor(customer.status)}
                  className='text-capitalize'
                >
                  {getStatusAccountText(customer.status)}
                </Tag>
              }
            />
            {/* <ItemResult
              title={trans('labels.security').toString()}
              data={customer?.security}
            /> */}
            <ItemResult
              title={trans('labels.totalBalance').toString()}
              data={
                customer?.balances
                  ? convertLocalStringNumber(
                      customer?.balances?.[0]?.availableMoney +
                        customer?.balances?.[0]?.freezedMoney
                    )
                  : '0'
              }
            />
            <ItemResult
              title={trans('labels.availableBalances').toString()}
              data={
                customer?.balances?.[0]?.availableMoney
                  ? convertLocalStringNumber(
                      customer?.balances?.[0]?.availableMoney
                    )
                  : '0'
              }
            />
            <ItemResult
              title={trans('labels.lockedBalance').toString()}
              data={
                customer?.balances?.[0]?.freezedMoney ||
                customer?.balances?.[0]?.freezedMoney !== 0
                  ? convertLocalStringNumber(
                      customer?.balances?.[0]?.freezedMoney
                    )
                  : '0'
              }
              noStyle
            />
          </Col>
        </Row>
      )}
    </div>
  )
}

export default CustomerInformation
