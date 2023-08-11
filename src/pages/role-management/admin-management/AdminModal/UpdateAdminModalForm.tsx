import { GUTTER } from '@constants/appConstant'
import { useUserFindOneQuery, useUserUpdateMutation } from '@services/cmsUser'
import { UserDetailDto } from '@type/application'
import { Button, Col, Form, Input, Row, Spin, notification } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type UpdateAdminModalFormType = {
  id: string | number
  onCancel: () => void
}

export const UpdateAdminModalForm = ({
  id,
  onCancel
}: UpdateAdminModalFormType) => {
  const { t: trans } = useTranslation()

  const { data: user, isLoading } = useUserFindOneQuery(
    { id: +id },
    { skip: !!!id }
  )

  const [fnUpdate, { isLoading: updateLoading }] = useUserUpdateMutation()

  const [form] = Form.useForm<UserDetailDto>()

  const onSubmit = async (values: UserDetailDto) => {
    await fnUpdate({
      id: id.toString(),
      updateUserDto: values
    })
      .unwrap()
      .then(() => {
        notification.success({ message: trans`messages.update-success` })
        onCancel()
      })
  }

  useEffect(() => {
    if (user) {
      form.setFieldValue('id', user.id)
      form.setFieldValue('fullName', user.fullName)
      form.setFieldValue('email', user.email)
      form.setFieldValue('phoneNumber', user.phoneNumber)
    }
  }, [user?.id])

  return (
    <Spin spinning={isLoading || updateLoading}>
      <Form
        layout='vertical'
        form={form}
        onFinish={onSubmit}
      >
        <Form.Item
          name='fullName'
          label={`${trans('admin-management.label.userName')}`}
          rules={[
            {
              required: true,
              message: trans`error_message.fullname_required`.toString()
            }
          ]}
        >
          <Input
            placeholder={trans(
              'admin-management.placeholder.userNamePlaceholder'
            ).toString()}
          />
        </Form.Item>
        <Form.Item
          initialValue={user?.email}
          name='email'
          label={`${trans('admin-management.label.email')}`}
        >
          <Input
            placeholder={trans(
              'admin-management.placeholder.emailPlaceholder'
            ).toString()}
            disabled
          />
        </Form.Item>
        <Form.Item
          initialValue={user?.phoneNumber}
          name='phoneNumber'
          label={`${trans('admin-management.label.phoneNumber')}`}
        >
          <Input
            placeholder={trans(
              'admin-management.placeholder.phoneNumberPlaceholder'
            ).toString()}
            disabled
          />
        </Form.Item>
        <Row
          gutter={GUTTER}
          justify='end'
        >
          <Col>
            <Button onClick={() => onCancel()}>
              {trans('admin-management.button.cancel')}
            </Button>
          </Col>
          <Col>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type='primary'
                  htmlType='submit'
                  disabled={
                    form.getFieldsError().filter(({ errors }) => errors.length)
                      .length > 0
                  }
                >
                  {trans('admin-management.button.save')}
                </Button>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Spin>
  )
}
