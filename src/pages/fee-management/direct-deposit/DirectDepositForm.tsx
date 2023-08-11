import ButtonCancel from '@components/button-cancel/ButtonCancel'
import ButtonSubmit from '@components/button-submit/ButtonSubmit'
import { GUTTER } from '@constants/appConstant'
import { modalConfig } from '@utils/constants'
import { Col, Form, FormInstance, Modal, Row } from 'antd'
import FeePackageForm from '../FeePackageForm'
import { useEffect } from 'react'

type formProp = {
  open: boolean
  close: () => void
  values: any
  setValues: (values: any) => void
}

const DirectDepositForm = ({ close, open, values, setValues }: formProp) => {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    setValues(form.getFieldsValue())
    close()
  }

  useEffect(() => {
    form.setFieldsValue(values)
  }, [values])

  return (
    <Modal
      open={open}
      onCancel={close}
      {...modalConfig}
      width={800}
    >
      <FeePackageForm
        form={form}
        onSubmit={handleSubmit}
        receiver={false}
      />
      <Row
        justify='end'
        gutter={GUTTER}
      >
        <Col>
          <ButtonCancel onClick={close} />
        </Col>
        <Col>
          <Form.Item shouldUpdate>
            {() => (
              <ButtonSubmit
                onClick={handleSubmit}
                disabled={
                  form.getFieldsError().filter(({ errors }) => errors.length)
                    .length > 0
                }
              />
            )}
          </Form.Item>
        </Col>
      </Row>
    </Modal>
  )
}
export default DirectDepositForm
