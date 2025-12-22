import { GUTTER } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import {
  // useUserGetMyInfoQuery,
  useUserUpdateMutation
} from '@services/cmsService'
import { CustomModalProps } from '@type/api'
import { updateLayout } from '@utils/events'
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  notification
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RootState } from 'src/app/store'
import '../style.scss'

function EmployeeProfile(props: CustomModalProps) {
  const { onClose, open } = props
  const { t } = useTranslation()
  const [form] = useForm()
  const { accessToken, profile } = useAppSelector(
    (state: RootState) => state.auth
  )
  // const getProfile = useUserGetMyInfoQuery(undefined, {
  //   skip: !accessToken
  // })
  const [changeProfile] = useUserUpdateMutation()

  const handleUpdate = async () => {
    await changeProfile({
      id: form.getFieldsValue()['id'],
      updateUserDto: {
        fullName: form.getFieldsValue()['fullName']
      }
    }).unwrap()
    notification.success({ message: t('messages.changeProfileSuccess') })
    updateLayout()
    onClose()
  }

  useEffect(() => {
    form.setFieldsValue(profile)
  }, [profile])

  // useEffect(() => {
  //   if (open) getProfile.refetch().then((res) => form.setFieldsValue(res.data))
  // }, [open])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={t('employee.profile')}
      centered
      maskClosable={false}
    >
      <Form
        form={form}
        initialValues={{
          email: '',
          fullName: '',
          status: true
        }}
        layout='vertical'
        className='w-100'
      >
        <Form.Item
          name='id'
          hidden
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='email'
          label={t('employee.email')}
        >
          <Input
            type='email'
            readOnly
            value={profile.email}
            variant='borderless'
          />
        </Form.Item>
        <Form.Item
          name='fullName'
          label={t('employee.fullName')}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='status'
          label={t('employee.status')}
        >
          <Select
            variant='borderless'
            disabled
            suffixIcon={null}
            defaultValue={true}
            options={[
              {
                label: t('employee.active'),
                value: true
              },
              {
                label: t('employee.deactive'),
                value: false
              }
            ]}
          />
        </Form.Item>
        <Row
          gutter={GUTTER}
          justify='end'
        >
          <Col>
            <Form.Item>
              <Button
                onClick={onClose}
                className='wx-100'
              >
                {t('buttons.cancel')}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button
                type='primary'
                onClick={handleUpdate}
                className='wx-100'
              >
                {t('buttons.update')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default EmployeeProfile
