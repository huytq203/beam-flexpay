import ButtonView from '@components/button-view/ButtonView'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CellContent from '@components/cell-content/CellContent'
import { GUTTER } from '@constants/appConstant'
import { Options } from '@constants/options'
import { TFunction } from '@type/common'
import {
  OutboundFeeApplicationType,
  OutboundFeeMethod,
  OutboundFeeProvider,
  OutboundFeeTransactionType,
  OutboundFeeType
} from '@type/outbound-fee'
import {
  convertLocalStringNumber,
  convertMiniPercentToPercent,
  getVNDateStringFromUTCTimeString,
  getVNEndOfDayStringFromUTCTimeString,
  getVNStartOfDayStringFromUTCTimeString
} from '@utils/helperFunctions'
import { Col, Row } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useMemo } from 'react'

export const useOutboundFeeColumns = (
  t: TFunction,
  onView?: (record: OutboundFeeType) => void,
  onEdit?: (record: OutboundFeeType) => void,
  onDelete?: (record: OutboundFeeType) => void
): ColumnsType<OutboundFeeType> => {
  const applicationType: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [OutboundFeeApplicationType.SYSTEM]: t('labels.system'),
    [OutboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup'),
    [OutboundFeeApplicationType.INDIVIDUAL]: t('labels.individual')
  }

  const transactionType: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [OutboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
    [OutboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
    [OutboundFeeTransactionType.PAYMENT]: t('labels.payment'),
    [OutboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
    [OutboundFeeTransactionType.REFUND]: t('labels.refund')
  }

  const method: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [OutboundFeeMethod.ATM_CARD]: t('labels.atmCard'),
    [OutboundFeeMethod.QR_CODE]: t('labels.qrCode'),
    [OutboundFeeMethod.BANK_ACCOUNT]: t('labels.bankAccount'),
    [OutboundFeeMethod.EWALLET]: t('labels.ewallet'),
    [OutboundFeeMethod.VISA_INTERNATIONAL]: t('labels.visaInternational'),
    [OutboundFeeMethod.MASTER_INTERNATIONAL]: t('labels.masterInternational'),
    [OutboundFeeMethod.JCB_INTERNATIONAL]: t('labels.jcbInternational'),
    [OutboundFeeMethod.AMEX_INTERNATIONAL]: t('labels.amexInternational')
  }
  const provider: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [OutboundFeeProvider.VIETQR]: t('labels.vietqr'),
    [OutboundFeeProvider.NAPAS]: t('labels.napas'),
    [OutboundFeeProvider.VPB]: t('labels.vpb')
  }

  return useMemo(
    () => [
      {
        title: t('labels.stt'),
        key: 'stt',
        align: 'center',
        fixed: 'left',
        width: 60,
        render: (_value, _record, index) => (
          <CellContent data={`${index + 1}`} />
        )
      },
      {
        title: t('labels.applicationType'),
        align: 'center',
        dataIndex: 'applicationType',
        key: 'applicationType',
        width: 150,
        render: (value) => {
          const label = applicationType[value]
          return <CellContent data={label} />
        }
      },
      {
        title: t('labels.transactionType'),
        dataIndex: 'transactionType',
        key: 'transactionType',
        align: 'center',
        width: 150,
        render: (value) => {
          const label = transactionType[value]
          return <CellContent data={label} />
        }
      },
      {
        title: t('labels.method'),
        dataIndex: 'method',
        key: 'method',
        align: 'center',
        width: 150,
        render: (value) => {
          const label = method[value]
          return <CellContent data={label} />
        }
      },
      {
        title: t('labels.bank'),
        dataIndex: 'bankName',
        key: 'bankName',
        align: 'center',
        width: 120,
        render: (value) => {
          return <CellContent data={value} />
        }
      },
      {
        title: t('labels.provider'),
        dataIndex: 'provider',
        key: 'provider',
        align: 'center',
        width: 120,
        render: (value) => {
          const label = provider[value]
          return <CellContent data={label} />
        }
      },
      {
        title: t('labels.accountGroup'),
        dataIndex: 'accountGroupName',
        key: 'accountGroupName',
        align: 'center',
        width: 150,
        render: (value) => {
          return <CellContent data={value} />
        }
      },
      {
        title: t('labels.chargeWithin'),
        dataIndex: 'chargeWithin',
        key: 'chargeWithin',
        align: 'center',
        width: 120,
        render: (value) => {
          return <CellContent data={value ? 'Có' : 'Không'} />
        }
      },
      {
        title: t('labels.priceRange'),
        key: 'priceRange',
        align: 'center',
        width: 200,
        render: (record) => {
          const from = record.priceFrom?.toLocaleString() || '0'
          const to = record.priceTo?.toLocaleString() || '0'
          return <CellContent data={`${from} - ${to} VND`} />
        }
      },
      {
        title: t('labels.payerFees'),
        align: 'center',
        children: [
          {
            title: t('labels.flexibleFee'),
            align: 'center',
            width: 120,
            dataIndex: 'payerFlexibleFeeMpct',
            render: (value) => (
              <CellContent data={`${convertMiniPercentToPercent(value)}`} />
            )
          },
          {
            title: t('labels.fixedFee'),
            align: 'center',
            width: 140,
            dataIndex: 'payerFixedFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.minFee'),
            align: 'center',
            width: 140,
            dataIndex: 'payerMinFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.maxFee'),
            align: 'center',
            width: 140,
            dataIndex: 'payerMaxFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          }
        ]
      },
      {
        title: t('labels.receiverFees'),
        align: 'center',
        children: [
          {
            title: t('labels.flexibleFee'),
            align: 'center',
            width: 120,
            dataIndex: 'receiverFlexibleFeeMpct',
            render: (value) => (
              <CellContent data={`${convertMiniPercentToPercent(value)}`} />
            )
          },
          {
            title: t('labels.fixedFee'),
            align: 'center',
            width: 140,
            dataIndex: 'receiverFixedFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.minFee'),
            align: 'center',
            width: 140,
            dataIndex: 'receiverMinFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.maxFee'),
            align: 'center',
            width: 140,
            dataIndex: 'receiverMaxFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          }
        ]
      },
      {
        title: t('labels.createdTime'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        width: 180,
        render: (value) => {
          return <CellContent data={getVNDateStringFromUTCTimeString(value)} />
        }
      },
      {
        title: t('labels.startTime'),
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
        width: 150,
        render: (value) => {
          return (
            <CellContent data={getVNStartOfDayStringFromUTCTimeString(value)} />
          )
        }
      },
      {
        title: t('labels.endTime'),
        dataIndex: 'endDate',
        key: 'endDate',
        align: 'center',
        width: 150,
        render: (value) => {
          return (
            <CellContent data={getVNEndOfDayStringFromUTCTimeString(value)} />
          )
        }
      },
      {
        title: t('labels.action'),
        key: 'action',
        align: 'center',
        fixed: 'right',
        width: 160,
        render: (value: any, record: OutboundFeeType) => (
          <Row
            gutter={GUTTER}
            justify='center'
          >
            <Col>
              <ButtonView
                onClick={async () => {
                  onView?.(record)
                }}
              />
            </Col>
            <Col>
              <ButtonUpdate
                module="fee-management"
                onClick={async () => {
                  onEdit?.(record)
                }}
              />
            </Col>
          </Row>
        )
      }
    ],
    [t, onView, onEdit, onDelete]
  )
}
