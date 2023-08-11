import { useMakeRefundMutation } from '@services/refundService'
import { RefundListDataType } from '@type/refund'
import { Button, Col, notification, Row, Typography } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface Props {
  onCancel: () => void
  selectedItem?: RefundListDataType
  refetch: () => void
}

function ConfirmRefund({ onCancel, selectedItem, refetch }: Props) {
  const { t } = useTranslation()

  const [makeRefund, { isLoading }] = useMakeRefundMutation()

  const onSubmit = async (values: any) => {
    if (selectedItem) {
      const data: any = await makeRefund(selectedItem?.id)
      if (data.data.statusCode === 201) {
        notification.success({
          message: t('messages.successRefund')
        })
        refetch && refetch()
        onCancel()
      }
    }
  }

  return (
    <>
      <Row>
        <Col
          span={24}
          className='mb-10'
        >
          <Text className='fw-600'>
            {t('refund.confirmRefundModal.description')}
          </Text>
        </Col>
        <Col span={24}>
          <Col
            span={24}
            className='d-flex justify-end'
          >
            <Button
              className='mr-10'
              onClick={onCancel}
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              onClick={onSubmit}
              type='primary'
              htmlType='submit'
              loading={isLoading}
            >
              {t('buttons.refund')}
            </Button>
          </Col>
        </Col>
      </Row>
    </>
  )
}

export default ConfirmRefund
