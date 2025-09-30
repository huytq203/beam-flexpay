import { Modal, Descriptions, Spin, Alert, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useOutboundFeeFindOneQuery } from '@services/outboundFeeService'
import { OutboundFeeApplicationType, OutboundFeeFindOneApiResponse, OutboundFeeMethod, OutboundFeeProvider } from '@type/outbound-fee'
import { OutboundFeeTransactionType } from '@type/outbound-fee'
import { convertLocalStringNumber, convertMiniPercentToPercent } from '@utils/helperFunctions'
import { Options } from '@constants/options'

interface OutboundFeeDetailModalProps {
  open: boolean
  onCancel: () => void
  outboundFeeId?: string
}

const OutboundFeeDetailModal = ({ open, onCancel, outboundFeeId }: OutboundFeeDetailModalProps) => {
  const { t } = useTranslation()

  const { data: outboundFee, isLoading, error } = useOutboundFeeFindOneQuery(
    { id: outboundFeeId! },
    { skip: !outboundFeeId || !open }
  )

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return t('labels.nodata')
    return `${convertLocalStringNumber(value)} VND`
  }

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return t('labels.nodata')
    return `${convertMiniPercentToPercent(value)}`
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return t('labels.nodata')
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const formatChargeWithin = (value: boolean) => {
    return value ? t('labels.feeInside') : t('labels.feeOutside')
  }

  const getApplicationTypeLabel = (type: string) => {
    const labels = {
      [OutboundFeeApplicationType.SYSTEM]: t('labels.system'),
      [OutboundFeeApplicationType.INDIVIDUAL]: t('labels.individual'),
      [OutboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup')
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      [OutboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
      [OutboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
      [OutboundFeeTransactionType.PAYMENT]: t('labels.payment'),
      [OutboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
      [OutboundFeeTransactionType.REFUND]: t('labels.refund')
    }
    return labels[type as keyof typeof labels] || type
  }

  const getMethodLabel = (method: string) => {
    const labels = {
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
    return labels[method as keyof typeof labels] || method
  }

  const getProviderLabel = (provider: string) => {
    const labels = {
      [Options.ALL]: t('labels.all'),
      [OutboundFeeProvider.VIETQR]: t('labels.vietqr'),
      [OutboundFeeProvider.NAPAS]: t('labels.napas'),
      [OutboundFeeProvider.VPB]: t('labels.vpb')
    }
    return labels[provider as keyof typeof labels] || provider
  }

  return (
    <Modal
      title={t('labels.outboundFeeDetail')}
      open={open}
      onCancel={onCancel}
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

            {outboundFee.applicationType === 'account_group' && (
              <Descriptions.Item label={t('labels.accountGroup')}>
                {outboundFee.accountGroupName || t('labels.nodata')}
              </Descriptions.Item>
            )}

            {outboundFee.applicationType === 'individual' && (
              <Descriptions.Item label={t('labels.customer')}>
                {outboundFee.fullname || t('labels.nodata')}
              </Descriptions.Item>
            )}

            <Descriptions.Item label={t('labels.transactionType')}>
              <Tag color="green">{getTransactionTypeLabel(outboundFee.transactionType)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.method')}>
              <Tag color="orange">{getMethodLabel(outboundFee.method)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.bank')}>
              {outboundFee.bankName || t('labels.nodata')}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.provider')}>
              <Tag color="purple">{getProviderLabel(outboundFee.provider)}</Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* Thông tin gói phí */}
          <Descriptions
            title={t('labels.feePackageInfo')}
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label={t('labels.chargeWithin')}>
              <Tag color={outboundFee.chargeWithin ? 'success' : 'warning'}>
                {formatChargeWithin(outboundFee.chargeWithin)}
              </Tag>
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
            <Descriptions.Item label={t('labels.flexibleFee')}>
              {formatPercent(outboundFee.payerFlexibleFeeMpct)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.fixedFee')}>
              {formatCurrency(outboundFee.payerFixedFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.minFee')}>
              {formatCurrency(outboundFee.payerMinFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.maxFee')}>
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
            <Descriptions.Item label={t('labels.flexibleFee')}>
              {formatPercent(outboundFee.receiverFlexibleFeeMpct)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.fixedFee')}>
              {formatCurrency(outboundFee.receiverFixedFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.minFee')}>
              {formatCurrency(outboundFee.receiverMinFee)}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.maxFee')}>
              {formatCurrency(outboundFee.receiverMaxFee)}
            </Descriptions.Item>
          </Descriptions>

          {/* Thời gian áp dụng */}
          <Descriptions
            title={t('labels.applicableTime')}
            bordered
            column={2}
            size="middle"
          >
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