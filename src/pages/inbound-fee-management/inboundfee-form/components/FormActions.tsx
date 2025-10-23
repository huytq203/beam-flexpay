import { Button, Col, Row } from 'antd'
import { useTranslation } from 'react-i18next'

interface FormActionsProps {
  isEdit: boolean
  loading: boolean
  onCancel: () => void
}

const FormActions = ({ isEdit, loading, onCancel }: FormActionsProps) => {
  const { t } = useTranslation()

  return (
    <Row justify="end" className="mt-6" gutter={[8, 0]}>
      <Col>
        <Button onClick={onCancel} size="large">
          {t('buttons.back')}
        </Button>
      </Col>
      <Col>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
        >
          {isEdit ? t('buttons.update') : t('buttons.setupFee')}
        </Button>
      </Col>
    </Row>
  )
}

export default FormActions