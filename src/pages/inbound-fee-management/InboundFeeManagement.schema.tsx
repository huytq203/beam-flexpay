import ButtonView from '@components/button-view/ButtonView'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CellContent from '@components/cell-content/CellContent'
import { GUTTER } from '@constants/appConstant'
import { Options } from '@constants/options'
import { TFunction } from '@type/common'
import {
  InboundFeeApplicationType,
  InboundFeeMethod,
  InboundFeeProvider,
  InboundFeeTransactionType,
  InboundFeeType
} from '@type/inbound-fee'
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

export const useInboundFeeColumns = (
  t: TFunction,
  onView?: (record: InboundFeeType) => void,
  onEdit?: (record: InboundFeeType) => void,
  onDelete?: (record: InboundFeeType) => void
): ColumnsType<InboundFeeType> => {
  const applicationType: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [InboundFeeApplicationType.SYSTEM]: t('labels.system'),
    [InboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup'),
    [InboundFeeApplicationType.INDIVIDUAL]: t('labels.individual')
  }

  const transactionType: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [InboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
    [InboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
    [InboundFeeTransactionType.PAYMENT]: t('labels.payment'),
    [InboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
    [InboundFeeTransactionType.REFUND]: t('labels.refund')
  }

  const method: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [InboundFeeMethod.ATM_CARD]: t('labels.atmCard'),
    [InboundFeeMethod.QR_CODE]: t('labels.qrCode'),
    [InboundFeeMethod.BANK_ACCOUNT]: t('labels.bankAccount'),
    [InboundFeeMethod.EWALLET]: t('labels.ewallet'),
    [InboundFeeMethod.VISA_INTERNATIONAL]: t('labels.visaInternational'),
    [InboundFeeMethod.MASTER_INTERNATIONAL]: t('labels.masterInternational'),
    [InboundFeeMethod.JCB_INTERNATIONAL]: t('labels.jcbInternational'),
    [InboundFeeMethod.AMEX_INTERNATIONAL]: t('labels.amexInternational')
  }
  const provider: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [InboundFeeProvider.VIETQR]: t('labels.vietqr'),
    [InboundFeeProvider.NAPAS]: t('labels.napas'),
    [InboundFeeProvider.VPB]: t('labels.vpb')
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
        title: t('labels.feeInfo'),
        align: 'center',
        children: [
          {
            title: t('labels.flexibleFee'),
            align: 'center',
            width: 120,
            dataIndex: 'flexibleFeeMpct',
            render: (value) => (
              <CellContent data={`${convertMiniPercentToPercent(value)}`} />
            )
          },
          {
            title: t('labels.fixedFee'),
            align: 'center',
            width: 140,
            dataIndex: 'fixedFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.minFee'),
            align: 'center',
            width: 140,
            dataIndex: 'minFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.maxFee'),
            align: 'center',
            width: 140,
            dataIndex: 'maxFee',
            render: (value) => (
              <CellContent data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.vat'),
            align: 'center',
            width: 100,
            dataIndex: 'vat',
            render: (value) => (
              <CellContent data={value !== undefined && value !== null ? `${value}%` : '-'} />
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
        render: (value: any, record: InboundFeeType) => (
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