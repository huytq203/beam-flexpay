import React from 'react'
import { Alert, Descriptions, Modal, Spin, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useInboundFeeFindOneQuery } from '@services/inboundFeeService'
import {
  InboundFeeApplicationType,
  InboundFeeMethod,
  InboundFeeProvider,
  InboundFeeTransactionType
} from '@type/inbound-fee'
import {
  convertLocalStringNumber,
  convertMiniPercentToPercent,
  getVNDateTimeStringFromUTCTimeString
} from '@utils/helperFunctions'
import { Options } from '@constants/options'

interface InboundFeeDetailModalProps {
  visible: boolean
  onClose: () => void
  inboundFeeId?: string
}

const InboundFeeDetailModal = ({ visible, onClose, inboundFeeId }: InboundFeeDetailModalProps) => {
  const { t } = useTranslation()

  const { data: inboundFee, isLoading, error } = useInboundFeeFindOneQuery(
    { id: inboundFeeId! },
    { skip: !inboundFeeId || !visible }
  )

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return t('labels.nodata')
    return `${convertLocalStringNumber(value)} VND`
  }

  const formatPercent = (value?: number | null) => {
    if (value === undefined || value === null) return t('labels.nodata')
    return convertMiniPercentToPercent(value)
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return t('labels.nodata')
    return getVNDateTimeStringFromUTCTimeString(dateString)
  }

  const getApplicationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [InboundFeeApplicationType.SYSTEM]: t('labels.system'),
      [InboundFeeApplicationType.INDIVIDUAL]: t('labels.individual'),
      [InboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup')
    }
    return labels[type] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [InboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
      [InboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
      [InboundFeeTransactionType.PAYMENT]: t('labels.payment'),
      [InboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
      [InboundFeeTransactionType.REFUND]: t('labels.refund')
    }
    return labels[type] || type
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      [Options.ALL]: t('labels.all'),
      // Deposit methods
      [InboundFeeMethod.ATM_CARD]: t('labels.atmCard'),
      [InboundFeeMethod.QR_CODE]: t('labels.qrCode'),
      [InboundFeeMethod.BANK_ACCOUNT_IB]: t('labels.bankAccountIb'),
      // Withdrawal methods
      [InboundFeeMethod.ATM_IBFT]: t('labels.atmCardIbft'),
      [InboundFeeMethod.BANK_ACCOUNT_IBFT]: t('labels.bankAccountIbft'),
      // Payment/Refund methods
      [InboundFeeMethod.EWALLET]: t('labels.ewallet'),
      [InboundFeeMethod.BANK_COUNT]: t('labels.bankAccount'),
      [InboundFeeMethod.VISA_INTERNATIONAL]: t('labels.visaInternational'),
      [InboundFeeMethod.MASTER_INTERNATIONAL]: t('labels.masterInternational'),
      [InboundFeeMethod.JCB_INTERNATIONAL]: t('labels.jcbInternational'),
      [InboundFeeMethod.AMEX_INTERNATIONAL]: t('labels.amexInternational')
    }
    return labels[method] || method
  }

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      [Options.ALL]: t('labels.all'),
      [InboundFeeProvider.NAPAS]: t('labels.napas'),
      [InboundFeeProvider.VPB]: t('labels.vpb')
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
      title={t('labels.inboundFeeDetail')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="inbound-fee-detail-modal"
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

      {inboundFee && (
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <Descriptions
            title={t('labels.basicInfo')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.applicableTarget')}>
              <Tag color="blue">{getApplicationTypeLabel(inboundFee.applicationType)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.activeStatus')}>
              {getActiveStatusTag(inboundFee.active)}
            </Descriptions.Item>

            {inboundFee.applicationType === 'account_group' && (
              <Descriptions.Item label={t('labels.accountGroup')}>
                {inboundFee.accountGroupName || t('labels.nodata')}
              </Descriptions.Item>
            )}

            {inboundFee.applicationType === 'individual' && (
              <Descriptions.Item label={t('labels.customer')}>
                {inboundFee.fullname ? `${inboundFee.fullname} - ${inboundFee.phoneNumber}` : inboundFee.phoneNumber || t('labels.nodata')}
              </Descriptions.Item>
            )}

            <Descriptions.Item label={t('labels.transactionType')}>
              <Tag color="green">{getTransactionTypeLabel(inboundFee.transactionType)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.method')}>
              {renderMethodTags(inboundFee.methods)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.bank')}>
              {renderBankTags(inboundFee.banks)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.provider')}>
              {renderProviderTags(inboundFee.providers)}
            </Descriptions.Item>
          </Descriptions>

          {/* Thông tin gói phí */}
          <Descriptions
            title={t('labels.feePackageInfo')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.priceRange')}>
              {inboundFee.priceFrom !== undefined && inboundFee.priceTo !== undefined
                ? `${formatCurrency(inboundFee.priceFrom)} - ${formatCurrency(inboundFee.priceTo)}`
                : t('labels.nodata')
              }
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.vat')}>
              {formatPercent(inboundFee.vatMpct)}
            </Descriptions.Item>
          </Descriptions>

          {/* Phí giao dịch */}
          <Descriptions
            title={t('labels.feeInfo')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.flexibleFee')}>
              {formatPercent(inboundFee.flexibleFeeMpct)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.fixedFee')}>
              {formatCurrency(inboundFee.fixedFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.minFee')}>
              {formatCurrency(inboundFee.minFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.maxFee')}>
              {formatCurrency(inboundFee.maxFee)}
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
              {formatDateTime(inboundFee.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.startTime')}>
              {formatDateTime(inboundFee.startDate)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.endTime')}>
              {formatDateTime(inboundFee.endDate)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  )
}

export default InboundFeeDetailModal
