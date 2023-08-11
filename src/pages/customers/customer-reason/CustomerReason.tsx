import { useToggleActiveMutation } from '@services/customerService'
import { viewMode } from '@type/customer'
import { getLabelButton } from '@utils/helperFunctions'
import { Button, Form } from 'antd'
import FormItem from 'antd/es/form/FormItem'
import TextArea from 'antd/es/input/TextArea'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type PropsType = {
  mode: viewMode
  userId: string
  closeModal: () => void
  refetch: () => void
}

function CustomerReason(props: PropsType) {
  const { t } = useTranslation()

  const { mode, userId, closeModal, refetch } = props
  const [toggleActive] = useToggleActiveMutation()

  const [form] = Form.useForm()

  const getDescription = useMemo(() => {
    switch (mode) {
      case viewMode.unlock:
        return 'Tài khoản này đang bị khóa, vui lòng cung cấp lí do để mở khóa tài khoản.'
      case viewMode.lock:
        return 'Tài khoản này sẽ bị vô hiệu hóa. Vui lòng cung cấp lí do để khóa tài khoản.'
      case viewMode.view:
        return 'Tất cả thông tin cá nhân của người dùng.'
      default:
        return null
    }
  }, [mode])

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      await toggleActive({ userId, ...values })
      form.resetFields()
      closeModal()
      refetch()
    })
  }

  return (
    <Form
      className='reason'
      layout='vertical'
      form={form}
    >
      <p className='f-10 fw-600'>{getDescription}</p>
      <FormItem
        name='reason'
        label='Lý do'
        rules={[
          { required: true, message: t('messages.reasonRequired').toString() }
        ]}
      >
        <TextArea />
      </FormItem>
      <div style={{ textAlign: 'end' }}>
        <Button
          className='mr-10'
          onClick={() => {
            form.resetFields()
            closeModal()
          }}
        >
          Hủy
        </Button>
        <Button
          type='primary'
          onClick={handleSubmit}
        >
          {getLabelButton(mode)}
        </Button>
      </div>
    </Form>
  )
}

export default CustomerReason
