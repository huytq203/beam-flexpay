import { objectOptionsNotify } from '@constants/options'
import { useCreateNotifySaleFeeMutation } from '@services/apiSaleFeeService'
import { ISaleFeeType } from '@type/saleFeeType'
import { formatObject } from '@utils/helperFunctions'
import { Button, Col, Form, Input, notification, Row, Select } from 'antd'
import { useTranslation } from 'react-i18next'

interface IProps {
  onCancel: () => void
  selectedItem: ISaleFeeType
}

function NotifyForm({ onCancel, selectedItem }: IProps) {
  const { t } = useTranslation()
  const [createNotifySaleFee, { isLoading }] = useCreateNotifySaleFeeMutation()

  const onSubmit = async (value: any) => {
    const data: any = await createNotifySaleFee(selectedItem.id)
    if (data.data.statusCode === 201) {
      notification.success({
        message: t('messages.successCreateNotify')
      })
    }
    onCancel()
  }

  return (
    <Form
      layout='vertical'
      onFinish={onSubmit}
    >
      <Form.Item
        initialValue={t`management.sales-fee.placeholders.title`.toString()}
        name='title'
        label={t`management.sales-fee.title-notify`}
      >
        <Select
          suffixIcon={null}
          disabled
          placeholder={t`management.sales-fee.placeholders.title`.toString()}
          maxLength={255}
        />
      </Form.Item>
      <Form.Item
        name='childProduct'
        initialValue={selectedItem?.product?.name}
        label={t`management.sales-fee.childProduct`}
      >
        <Select
          suffixIcon={null}
          disabled
          placeholder={t`management.sales-fee.placeholders.childProduct`.toString()}
        />
      </Form.Item>
      <Form.Item
        name='apply'
        initialValue={formatObject(selectedItem.applicableObject)}
        label={t`management.sales-fee.apply`}
      >
        <Select
          suffixIcon={null}
          disabled
          options={objectOptionsNotify}
          placeholder={t`management.sales-fee.placeholders.apply`.toString()}
        />
      </Form.Item>
      <Row className='justify-end'>
        <Col>
          <Button
            className='mr-10'
            onClick={onCancel}
          >{t`buttons.cancel`}</Button>
          <Button
            loading={isLoading}
            type='primary'
            htmlType='submit'
          >{t`buttons.create-notify`}</Button>
        </Col>
      </Row>
    </Form>
  )
}
export default NotifyForm
