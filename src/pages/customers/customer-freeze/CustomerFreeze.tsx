import { GUTTER } from '@constants/appConstant'
import FreezeAccountForm from '@pages/transfer/freeze-account/freeze-account-form/FreezeAccountForm'
import { useFreezeBalanceHistoryCreateMutation } from '@services/cmsService'
import { CreateFreezeBalanceHistoryDto } from '@type/application'
import { Button, Col, Form, Row, notification } from 'antd'
import { useTranslation } from 'react-i18next'

interface IProps {
  account: any
  closeModal: () => void
}

function CustomerFreeze({ account, closeModal }: IProps) {
  const [form] = Form.useForm()
  const { t } = useTranslation()

  const [fnCreate, { isLoading }] = useFreezeBalanceHistoryCreateMutation()

  const onFreeze = async (values: any) => {
    const record: CreateFreezeBalanceHistoryDto = {
      customerAccountNumber: account?.accountNumber,
      freezeMoney: values.freezeBalanceRequest,
      reason: values.reason
    }

    fnCreate({
      createFreezeBalanceHistoryDto: record
    })
      .unwrap()
      .then(() => {
        notification.success({
          message: t('freezeAndUnfreezeAccount.successFreeze')
        })
        closeModal()
      })
  }

  return (
    <Form
      form={form}
      onFinish={onFreeze}
      labelCol={{ span: 8 }}
      labelAlign='left'
    >
      <FreezeAccountForm
        detail={account}
        history={false}
      />
      <Row
        justify='end'
        gutter={GUTTER}
      >
        <Col>
          <Button
            onClick={closeModal}
            loading={isLoading}
          >
            {t('admin-management.button.cancel')}
          </Button>
        </Col>
        <Col>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={isLoading}
              disabled={account?.balances?.length < 1}
            >
              {t('freezeAndUnfreezeAccount.submit')}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
export default CustomerFreeze
