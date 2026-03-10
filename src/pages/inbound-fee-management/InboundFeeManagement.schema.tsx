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
  getVNDateTimeStringFromUTCTimeString
} from '@utils/helperFunctions'
import { Col, Row, Tooltip } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useMemo } from 'react'

export const useInboundFeeColumns = (
  t: TFunction,
  onView?: (record: InboundFeeType) => void,
  onEdit?: (record: InboundFeeType) => void,
  onDelete?: (record: InboundFeeType) => void,
  currentPage?: number,
  pageSize?: number
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
    [InboundFeeMethod.BANK_ACCOUNT_IB]: t('labels.bankAccount'),
    [InboundFeeMethod.ATM_IBFT]: t('labels.atmCard'),
    [InboundFeeMethod.BANK_ACCOUNT_IBFT]: t('labels.bankAccount'),
    [InboundFeeMethod.BANK_COUNT]: t('labels.bankAccount'),
    [InboundFeeMethod.EWALLET]: t('labels.ewallet'),
    [InboundFeeMethod.VISA_INTERNATIONAL]: t('labels.visaInternational'),
    [InboundFeeMethod.MASTER_INTERNATIONAL]: t('labels.masterInternational'),
    [InboundFeeMethod.JCB_INTERNATIONAL]: t('labels.jcbInternational'),
    [InboundFeeMethod.AMEX_INTERNATIONAL]: t('labels.amexInternational')
  }
  const provider: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
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
        render: (_value, _record, index) => {
          const stt = ((currentPage || 1) - 1) * (pageSize || 10) + index + 1
          return <CellContent isDash={true} data={`${stt}`} />
        }
      },
      {
        title: t('labels.applicationType'),
        align: 'center',
        dataIndex: 'applicationType',
        key: 'applicationType',
        width: 150,
        render: (value) => {
          const label = applicationType[value]
          return <CellContent isDash={true} data={label} />
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
          return <CellContent isDash={true} data={label} />
        }
      },
      {
        title: t('labels.method'),
        dataIndex: 'methods',
        key: 'methods',
        align: 'center',
        width: 150,
        render: (methods: string[]) => {
          if (!methods || methods.length === 0) {
            return <CellContent isDash={true} data="-" />
          }

          const firstMethodKey = methods[0]
          const firstMethodLabel = method[firstMethodKey] || firstMethodKey

          if (methods.length === 1) {
            return <CellContent isDash={true} data={firstMethodLabel} />
          }

          const methodList = methods.map(m => method[m] || m).join('\n')
          const displayText = `${firstMethodLabel},...`

          return (
            <Tooltip
              title={<div style={{ whiteSpace: 'pre-line' }}>{methodList}</div>}
              placement="topLeft"
            >
              <span style={{ cursor: 'pointer' }}>
                <CellContent isDash={true} data={displayText} />
              </span>
            </Tooltip>
          )
        }
      },
      {
        title: t('labels.bank'),
        dataIndex: 'banks',
        key: 'banks',
        align: 'center',
        width: 200,
        render: (banks: Array<{ id: number; name: string }>) => {
          if (!banks || banks.length === 0) {
            return <CellContent isDash={true} data="-" />
          }

          const firstBankName = banks[0].name

          if (banks.length === 1) {
            return <CellContent isDash={true} data={firstBankName} />
          }

          const bankList = banks.map(bank => bank.name).join('\n')
          const displayText = `${firstBankName},...`

          return (
            <Tooltip
              title={<div style={{ whiteSpace: 'pre-line' }}>{bankList}</div>}
              placement="topLeft"
            >
              <span style={{ cursor: 'pointer' }}>
                <CellContent isDash={true} data={displayText} />
              </span>
            </Tooltip>
          )
        }
      },
      {
        title: t('labels.provider'),
        dataIndex: 'providers',
        key: 'providers',
        align: 'center',
        width: 120,
        render: (providers: string[]) => {
          if (!providers || providers.length === 0) {
            return <CellContent isDash={true} data="-" />
          }

          const firstProviderKey = providers[0]
          const firstProviderLabel = provider[firstProviderKey] || firstProviderKey

          if (providers.length === 1) {
            return <CellContent isDash={true} data={firstProviderLabel} />
          }

          const providerList = providers.map(p => provider[p] || p).join('\n')
          const displayText = `${firstProviderLabel},...`

          return (
            <Tooltip
              title={<div style={{ whiteSpace: 'pre-line' }}>{providerList}</div>}
              placement="topLeft"
            >
              <span style={{ cursor: 'pointer' }}>
                <CellContent isDash={true} data={displayText} />
              </span>
            </Tooltip>
          )
        }
      },
      {
        title: t('labels.accountGroup'),
        dataIndex: 'accountGroupName',
        key: 'accountGroupName',
        align: 'center',
        width: 150,
        render: (value) => {
          return <CellContent isDash={true} data={value} />
        }
      },
      {
        title: t('labels.priceFrom'),
        dataIndex: 'priceFrom',
        key: 'priceFrom',
        align: 'center',
        width: 150,
        render: (value) => {
          const formattedValue = value?.toLocaleString() || '0'
          return <CellContent isDash={true} data={`${formattedValue} VND`} />
        }
      },
      {
        title: t('labels.priceTo'),
        dataIndex: 'priceTo',
        key: 'priceTo',
        align: 'center',
        width: 150,
        render: (value) => {
          const formattedValue = value?.toLocaleString() || '0'
          return <CellContent isDash={true} data={`${formattedValue} VND`} />
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
              <CellContent isDash={true} data={`${convertMiniPercentToPercent(value)}`} />
            )
          },
          {
            title: t('labels.fixedFee'),
            align: 'center',
            width: 140,
            dataIndex: 'fixedFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.minFee'),
            align: 'center',
            width: 140,
            dataIndex: 'minFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.maxFee'),
            align: 'center',
            width: 140,
            dataIndex: 'maxFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.vat'),
            align: 'center',
            width: 100,
            dataIndex: 'vatMpct',
            render: (value) => (
              <CellContent isDash={true}
                           data={value !== undefined && value !== null ? convertMiniPercentToPercent(value) : '-'} />
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
          return <CellContent isDash={true} data={getVNDateTimeStringFromUTCTimeString(value)} />
        }
      },
      {
        title: t('labels.startTime'),
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
        width: 180,
        render: (value) => {
          return (
            <CellContent isDash={true} data={getVNDateTimeStringFromUTCTimeString(value)} />
          )
        }
      },
      {
        title: t('labels.endTime'),
        dataIndex: 'endDate',
        key: 'endDate',
        align: 'center',
        width: 180,
        render: (value) => {
          return (
            <CellContent isDash={true} data={getVNDateTimeStringFromUTCTimeString(value)} />
          )
        }
      },
      {
        title: t('labels.action'),
        key: 'action',
        align: 'center',
        fixed: 'right',
        width: 160,
        render: (_value: any, record: InboundFeeType) => (
          <Row
            gutter={GUTTER}
            justify="center"
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
    [t, onView, onEdit, onDelete, currentPage, pageSize]
  )
}