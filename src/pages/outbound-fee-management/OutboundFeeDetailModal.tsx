import React from 'react'
import { Alert, Descriptions, Modal, Spin, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useOutboundFeeFindOneQuery } from '@services/outboundFeeService'
import {
  OutboundFeeApplicationType,
  OutboundFeeMethod,
  OutboundFeeProvider,
  OutboundFeeTransactionType
} from '@type/outbound-fee'
import {
  convertLocalStringNumber,
  convertMiniPercentToPercent,
  getVNDateTimeStringFromUTCTimeString
} from '@utils/helperFunctions'
import { Options } from '@constants/options'
import {
  getOutboundFeeStatusColor,
  getOutboundFeeStatusLabel
} from '@constants/outbound-fee-status'

interface OutboundFeeDetailModalProps {
  visible: boolean
  onClose: () => void
  outboundFeeId?: string
}

const OutboundFeeDetailModal = ({ visible, onClose, outboundFeeId }: OutboundFeeDetailModalProps) => {
  const { t } = useTranslation()

  const { data: outboundFee, isLoading, error } = useOutboundFeeFindOneQuery(
    { id: outboundFeeId! },
    { skip: !outboundFeeId || !visible }
  )

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return '-'
    return `${convertLocalStringNumber(value)} VND`
  }

  const formatPercent = (value?: number | null) => {
    if (value === undefined || value === null) return '-'
    // Handle 0 case - convertMiniPercentToPercent returns empty string for 0
    if (value === 0) return '0%'
    const result = convertMiniPercentToPercent(value)
    return result || '0%'
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '-'
    return getVNDateTimeStringFromUTCTimeString(dateString)
  }

  const getApplicationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [OutboundFeeApplicationType.SYSTEM]: t('labels.system'),
      [OutboundFeeApplicationType.INDIVIDUAL]: t('labels.individual'),
      [OutboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup')
    }
    return labels[type] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [OutboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
      [OutboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
      [OutboundFeeTransactionType.PAYMENT]: t('labels.payment'),
      [OutboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
      [OutboundFeeTransactionType.REFUND]: t('labels.refund')
    }
    return labels[type] || type
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      [Options.ALL]: t('labels.all'),
      // Deposit methods
      [OutboundFeeMethod.ATM_CARD]: t('labels.atmCard'),
      [OutboundFeeMethod.QR_CODE]: t('labels.qrCode'),
      [OutboundFeeMethod.BANK_ACCOUNT_IB]: t('labels.bankAccountIb'),
      // Withdrawal methods
      [OutboundFeeMethod.ATM_IBFT]: t('labels.atmCardIbft'),
      [OutboundFeeMethod.BANK_ACCOUNT_IBFT]: t('labels.bankAccountIbft'),
      // Payment/Refund methods
      [OutboundFeeMethod.EWALLET]: t('labels.ewallet'),
      [OutboundFeeMethod.BANK_COUNT]: t('labels.bankAccount'),
      [OutboundFeeMethod.VISA_INTERNATIONAL]: t('labels.visaInternational'),
      [OutboundFeeMethod.MASTER_INTERNATIONAL]: t('labels.masterInternational'),
      [OutboundFeeMethod.JCB_INTERNATIONAL]: t('labels.jcbInternational'),
      [OutboundFeeMethod.AMEX_INTERNATIONAL]: t('labels.amexInternational')
    }
    return labels[method] || method
  }

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      [Options.ALL]: t('labels.all'),
      [OutboundFeeProvider.NAPAS]: t('labels.napas'),
      [OutboundFeeProvider.VPB]: t('labels.vpb')
    }
    return labels[provider] || provider
  }

  const renderMethodTags = (methods: string[]): React.ReactNode => {
    if (methods.includes(Options.ALL) || methods.includes('all')) {
      return <Tag color="orange">{t('labels.all')}</Tag>
    }
    return methods.map(method => (
      <Tag key={method} color="orange">{getMethodLabel(method)}</Tag>
    ))
  }

  const renderProviderTags = (providers: string[]): React.ReactNode => {
    if (providers.includes(Options.ALL) || providers.includes('all')) {
      return <Tag color="purple">{t('labels.all')}</Tag>
    }
    return providers.map(provider => (
      <Tag key={provider} color="purple">{getProviderLabel(provider)}</Tag>
    ))
  }

  const renderBankTags = (banks?: Array<{ id: number; name: string }>): React.ReactNode => {
    if (!banks || banks.length === 0) {
      return <span>{t('labels.all')}</span>
    }
    return banks.map(bank => (
      <Tag key={bank.id} color="cyan">{bank.name}</Tag>
    ))
  }

  const getActiveStatusTag = (active?: number): React.ReactNode => {
    const isActive = active === 1
    return (
      <Tag color={isActive ? 'success' : 'error'}>
        {isActive ? t('labels.active') : t('labels.inactive')}
      </Tag>
    )
  }

  return (
    <Modal
      title={t('labels.outboundFeeDetail')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="outbound-fee-detail-modal"
    >
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      )}

      {error && (
        <Alert
          type="error"
          message={t('messages.loadDataFailed')}
          className="mb-4"
        />
      )}

      {outboundFee && (
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <Descriptions
            title={t('labels.basicInfo')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.applicableTarget')}>
              <Tag color="blue">{getApplicationTypeLabel(outboundFee.applicationType)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.activeStatus')}>
              {getActiveStatusTag(outboundFee.active)}
            </Descriptions.Item>

            {outboundFee.applicationType === 'account_group' && (
              <Descriptions.Item label={t('labels.accountGroup')}>
                {outboundFee.accountGroupName || t('labels.nodata')}
              </Descriptions.Item>
            )}

            {outboundFee.applicationType === 'individual' && (
              <Descriptions.Item label={t('labels.customer')}>
                {outboundFee.fullname ? `${outboundFee.fullname} - ${outboundFee.phoneNumber}` : outboundFee.phoneNumber || t('labels.nodata')}
              </Descriptions.Item>
            )}

            <Descriptions.Item label={t('labels.transactionType')}>
              <Tag color="green">{getTransactionTypeLabel(outboundFee.transactionType)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.method')}>
              {renderMethodTags(outboundFee.methods)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.bank')}>
              {renderBankTags(outboundFee.banks)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.provider')}>
              {renderProviderTags(outboundFee.providers)}
            </Descriptions.Item>
          </Descriptions>

          {outboundFee.status && (
            <Descriptions
              title={t('labels.approvalStatus')}
              bordered
              column={2}
              size="middle"
            >
              <Descriptions.Item label={t('labels.status')}>
                <Tag color={getOutboundFeeStatusColor(outboundFee.status)}>
                  {getOutboundFeeStatusLabel(outboundFee.status)}
                </Tag>
              </Descriptions.Item>

              {outboundFee.approvedAt && (
                <Descriptions.Item label={t('labels.approvedAt')}>
                  {formatDateTime(outboundFee.approvedAt)}
                </Descriptions.Item>
              )}

              {outboundFee.rejectedAt && (
                <Descriptions.Item label={t('labels.rejectedAt')}>
                  {formatDateTime(outboundFee.rejectedAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* Thông tin gói phí */}
          <Descriptions
            title={t('labels.feePackageInfo')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.chargeWithin')}>
              {outboundFee.chargeWithin !== undefined && outboundFee.chargeWithin !== null
                ? <Tag color={outboundFee.chargeWithin ? 'success' : 'error'}>
                  {outboundFee.chargeWithin ? 'Có' : 'Không'}
                </Tag>
                : t('labels.nodata')
              }
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.priceRange')}>
              {outboundFee.priceFrom !== undefined && outboundFee.priceTo !== undefined
                ? `${formatCurrency(outboundFee.priceFrom)} - ${formatCurrency(outboundFee.priceTo)}`
                : t('labels.nodata')
              }
            </Descriptions.Item>
          </Descriptions>

          {/* Phí người chuyển */}
          <Descriptions
            title={t('labels.payerFees')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.payerFlexibleFee')}>
              {formatPercent(outboundFee.payerFlexibleFeeMpct)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.payerFixedFee')}>
              {formatCurrency(outboundFee.payerFixedFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.payerMinFee')}>
              {formatCurrency(outboundFee.payerMinFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.payerMaxFee')}>
              {formatCurrency(outboundFee.payerMaxFee)}
            </Descriptions.Item>
          </Descriptions>

          {/* Phí người nhận */}
          <Descriptions
            title={t('labels.receiverFees')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.receiverFlexibleFee')}>
              {formatPercent(outboundFee.receiverFlexibleFeeMpct)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.receiverFixedFee')}>
              {formatCurrency(outboundFee.receiverFixedFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.receiverMinFee')}>
              {formatCurrency(outboundFee.receiverMinFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.receiverMaxFee')}>
              {formatCurrency(outboundFee.receiverMaxFee)}
            </Descriptions.Item>
          </Descriptions>

          {/* Thời gian */}
          <Descriptions
            title={t('labels.applicableTime')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.createdTime')}>
              {formatDateTime(outboundFee.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.startTime')}>
              {formatDateTime(outboundFee.startDate)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.endTime')}>
              {formatDateTime(outboundFee.endDate)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  )
}

export default OutboundFeeDetailModal
