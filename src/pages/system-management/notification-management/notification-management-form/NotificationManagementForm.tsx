import CustomSelect from '@components/custom-select/CustomSelect'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { applicableObjects, serviceTypes } from '@constants/options'
import { useLazyCustomerFindAllQuery } from '@services/cmsService'
import { APPLICABLE_OBJECTS } from '@type/policyManagement'
import {
  Col,
  Form,
  Modal,
  Row,
  Select,
  DatePicker,
  Switch,
  Input,
  Button
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const NotificationManagementForm = () => {
  const { t } = useTranslation()
  const form = Form.useFormInstance()
  const [triggerListAccount] = useLazyCustomerFindAllQuery()

  const [appKey, setAppKey] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )

  const getAppName = () => {
    switch (appKey) {
      case APPLICABLE_OBJECTS.SYSTEM:
        return {
          hidden: true
        }
      case APPLICABLE_OBJECTS.ACCOUNT_GROUP:
        return {
          name: 'accountGroup',
          label: t`policy-management.payment.selectAccountGroup`,
          rules: [
            {
              required: true,
              message:
                t`policy-management.depositManagement.validateRequired`.toString()
            }
          ]
        }
      case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
        return {
          name: 'accountNumber',
          label: t`policy-management.payment.inputAccount`,
          rules: [
            {
              required: true,
              message:
                t`policy-management.depositManagement.validateRequired`.toString()
            }
          ]
        }
    }
  }

  const handleSubmit = () => {}

  return (
    <Modal
      open={true}
      okText={t`notification-management.add`}
      cancelText={t`notification-management.close`}
      onOk={handleSubmit}
      // onCancel={close}
      centered
      width={1000}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          applicableObject: appKey,
          status: true
        }}
      >
        <Row gutter={GUTTER}>
          <Col flex='1'>
            <Form.Item
              name='applicableObject'
              label={t`policy-management.payment.applicableObject`}
            >
              <Select
                options={applicableObjects}
                onChange={(value) => setAppKey(value)}
              />
            </Form.Item>
            <Form.Item {...getAppName()}>
              <CustomSelect
                trigger={triggerListAccount}
                search={{
                  page: 1,
                  take: 10
                }}
                field='phoneNumber'
              />
            </Form.Item>
            <Form.Item
              label={t`notification-management.apply-date`}
              name='startDate'
            >
              <DatePicker
                showTime
                placeholder={t`notification-management.placeholders.date`.toString()}
                format={TimeFullFormat}
              />
            </Form.Item>
            <Form.Item
              label={t`notification-management.status`}
              name='status'
            >
              <Switch defaultChecked />
            </Form.Item>
          </Col>
          <Col flex='1'>
            <Form.Item
              label={t`notification-management.service`}
              name='serviceType'
              rules={[
                {
                  required: true,
                  message:
                    t`notification-management.message.service-required`.toString()
                }
              ]}
            >
              <Select options={serviceTypes} />
            </Form.Item>
            <Form.Item
              label={t`notification-management.text-title`}
              name='title'
            >
              <Input
                placeholder={t`notification-management.placeholders.text-title`.toString()}
              />
            </Form.Item>
            <Form.Item
              label={t`notification-management.content`}
              name='body'
            >
              <TextArea
                rows={5}
                placeholder={t`notification-management.placeholders.content`.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
export default NotificationManagementForm
