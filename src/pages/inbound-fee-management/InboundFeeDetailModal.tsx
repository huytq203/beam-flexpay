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

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return t('labels.nodata')
    return `${convertLocalStringNumber(value)} VND`
  }

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return t('labels.nodata')
    return convertMiniPercentToPercent(value)
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return t('labels.nodata')
    return getVNDateTimeStringFromUTCTimeString(dateString)
  }

  const getApplicationTypeLabel = (type: string) => {
    const labels = {
      [InboundFeeApplicationType.SYSTEM]: t('labels.system'),
      [InboundFeeApplicationType.INDIVIDUAL]: t('labels.individual'),
      [InboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup')
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      [InboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
      [InboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
      [InboundFeeTransactionType.PAYMENT]: t('labels.payment'),
      [InboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
      [InboundFeeTransactionType.REFUND]: t('labels.refund')
    }
    return labels[type as keyof typeof labels] || type
  }

  const getMethodLabel = (method: string) => {
    const labels = {
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
    return labels[method as keyof typeof labels] || method
  }

  const getProviderLabel = (provider: string) => {
    const labels = {
      [Options.ALL]: t('labels.all'),
      [InboundFeeProvider.VIETQR]: t('labels.vietqr'),
      [InboundFeeProvider.NAPAS]: t('labels.napas'),
      [InboundFeeProvider.VPB]: t('labels.vpb')
    }
    return labels[provider as keyof typeof labels] || provider
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
              <Tag color="orange">{getMethodLabel(inboundFee.method)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.bank')}>
              {inboundFee.bankName || t('labels.all')}
            </Descriptions.Item>

            <Descriptions.Item label={t('labels.provider')}>
              <Tag color="purple">{getProviderLabel(inboundFee.provider)}</Tag>
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
              {formatPercent(inboundFee.vat)}
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
