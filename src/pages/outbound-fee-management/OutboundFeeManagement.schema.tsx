import ButtonApprover from '@components/button-approver/ButtonApprover'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonReject from '@components/button-reject/ButtonReject'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import ButtonView from '@components/button-view/ButtonView'
import CellContent from '@components/cell-content/CellContent'
import { GUTTER } from '@constants/appConstant'
import { Options } from '@constants/options'
import { getOutboundFeeStatusColor, getOutboundFeeStatusLabel } from '@constants/outbound-fee-status'
import { TFunction } from '@type/common'
import {
  OutboundFeeApplicationType,
  OutboundFeeMethod,
  OutboundFeeProvider,
  OutboundFeeStatus,
  OutboundFeeTransactionType,
  OutboundFeeType
} from '@type/outbound-fee'
import {
  convertLocalStringNumber,
  convertMiniPercentToPercent,
  getVNDateTimeStringFromUTCTimeString
} from '@utils/helperFunctions'
import { Col, Row, Tag, Tooltip } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { useMemo } from 'react'

export const useOutboundFeeColumns = (
  t: TFunction,
  onView?: (record: OutboundFeeType) => void,
  onEdit?: (record: OutboundFeeType) => void,
  onDelete?: (record: OutboundFeeType) => void,
  onApprove?: (record: OutboundFeeType) => void,
  onReject?: (record: OutboundFeeType) => void,
  currentPage?: number,
  pageSize?: number
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
    [OutboundFeeMethod.BANK_ACCOUNT_IB]: t('labels.bankAccount'),
    [OutboundFeeMethod.ATM_IBFT]: t('labels.atmCard'),
    [OutboundFeeMethod.BANK_ACCOUNT_IBFT]: t('labels.bankAccount'),
    [OutboundFeeMethod.BANK_COUNT]: t('labels.bankAccount'),
    [OutboundFeeMethod.EWALLET]: t('labels.ewallet'),
    [OutboundFeeMethod.VISA_INTERNATIONAL]: t('labels.visaInternational'),
    [OutboundFeeMethod.MASTER_INTERNATIONAL]: t('labels.masterInternational'),
    [OutboundFeeMethod.JCB_INTERNATIONAL]: t('labels.jcbInternational'),
    [OutboundFeeMethod.AMEX_INTERNATIONAL]: t('labels.amexInternational')
  }
  const provider: Record<string, string> = {
    [Options.ALL]: t('labels.all'),
    [OutboundFeeProvider.VPBANK]: 'VPBank',
    [OutboundFeeProvider.NAPAS]: 'NAPAS'
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
        title: 'Phí người chuyển',
        align: 'center',
        children: [
          {
            title: t('labels.flexibleFee'),
            align: 'center',
            width: 120,
            dataIndex: 'payerFlexibleFeeMpct',
            render: (value) => (
              <CellContent isDash={true} data={`${convertMiniPercentToPercent(value)}`} />
            )
          },
          {
            title: t('labels.fixedFee'),
            align: 'center',
            width: 140,
            dataIndex: 'payerFixedFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.minFee'),
            align: 'center',
            width: 140,
            dataIndex: 'payerMinFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.maxFee'),
            align: 'center',
            width: 140,
            dataIndex: 'payerMaxFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          }
        ]
      },
      {
        title: 'Phí người nhận',
        align: 'center',
        children: [
          {
            title: t('labels.flexibleFee'),
            align: 'center',
            width: 120,
            dataIndex: 'receiverFlexibleFeeMpct',
            render: (value) => (
              <CellContent isDash={true} data={`${convertMiniPercentToPercent(value)}`} />
            )
          },
          {
            title: t('labels.fixedFee'),
            align: 'center',
            width: 140,
            dataIndex: 'receiverFixedFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.minFee'),
            align: 'center',
            width: 140,
            dataIndex: 'receiverMinFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
            )
          },
          {
            title: t('labels.maxFee'),
            align: 'center',
            width: 140,
            dataIndex: 'receiverMaxFee',
            render: (value) => (
              <CellContent isDash={true} data={`${convertLocalStringNumber(value)} VND`} />
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
        title: t('labels.status'),
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 140,
        render: (status: OutboundFeeStatus) => {
          if (!status) {
            return <CellContent isDash={true} data="-" />
          }
          return (
            <Tag color={getOutboundFeeStatusColor(status)}>
              {getOutboundFeeStatusLabel(status)}
            </Tag>
          )
        }
      },
      {
        title: t('labels.action'),
        key: 'action',
        align: 'center',
        fixed: 'right',
        width: 250,
        render: (_value: any, record: OutboundFeeType) => {
          const isPendingApproval = record.status === OutboundFeeStatus.PENDING_APPROVAL

          return (
            <Row
              gutter={GUTTER}
              justify="center"
            >
              {/* View button - always visible */}
              <Col>
                <ButtonView
                  onClick={async () => {
                    onView?.(record)
                  }}
                />
              </Col>

              {/* Edit button - only visible when status is pending_approval */}
              {isPendingApproval && (
                <Col>
                  <ButtonUpdate
                    module="fee-management"
                    onClick={async () => {
                      onEdit?.(record)
                    }}
                  />
                </Col>
              )}

              {/* Approve button - only visible when status is pending_approval */}
              {isPendingApproval && (
                <Col>
                  <ButtonApprover
                    module="outbound_fee"
                    size="small"
                    type="text"
                    onClick={async () => {
                      onApprove?.(record)
                    }}
                  />
                </Col>
              )}

              {/* Reject button - only visible when status is pending_approval */}
              {isPendingApproval && onReject && (
                <Col>
                  <ButtonReject
                    module="outbound_fee"
                    size="small"
                    type="text"
                    danger
                    onClick={async () => {
                      onReject?.(record)
                    }}
                  />
                </Col>
              )}

              {/* Delete button - only visible when status is pending_approval */}
              {isPendingApproval && (
                <Col>
                  <ButtonDelete
                    module="fee-management"
                    onClick={async () => {
                      onDelete?.(record)
                    }}
                  />
                </Col>
              )}
            </Row>
          )
        }
      }
    ],
    [t, onView, onEdit, onDelete, onApprove, onReject, currentPage, pageSize]
  )
}
