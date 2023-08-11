import { GUTTER } from '@constants/appConstant'
import { CustomCheckBox } from '@pages/role-management/Component/CustomCheckbox/CheckBox'
import { useCreateAdminMutation } from '@services/apiAdminAccountService'
import {
  useLazyGetDetailGroupPermissionQuery,
  useLazyGetListGroupPermissionQuery
} from '@services/apiGroupPermissionService'
import { GroupPermissionData } from '@type/permission'
import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Row,
  Select,
  Spin,
  Modal
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CreateAdminModalType = {
  onCancel: () => void
  refetch: () => void
}

type SubmitValue = {
  active: boolean
  email: string
  fullName: string
  phoneNumber: string
}

type SearchParam = {
  page: number
  take: number
}

const { Option } = Select

export const CreateAdminModalForm = ({
  onCancel,
  refetch
}: CreateAdminModalType) => {
  const [search, setSearch] = useState<SearchParam>({
    page: 1,
    take: 10
  })
  const [visibleDropDown, setVisibleDropDown] = useState<boolean>(false)
  const [dropDownData, setDropDownData] = useState<GroupPermissionData[]>([])
  const [loadingDropDown, setLoadingDropDown] = useState<boolean>(false)
  const [loadingScroll, setLoadingScroll] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [isSelect, setIsSelect] = useState<boolean>(false)
  const [initListId, setInitListId] = useState<number[]>([])
  const [listIdUnchecked, setListIdUnchecked] = useState<number[]>([])
  const [listIdChecked, setListIdChecked] = useState<number[]>([])
  const [listChecked, setListChecked] = useState<string[]>([])
  const [initListChecked, setInitListChecked] = useState<string[]>([])
  const [listUnchecked, setListUnchecked] = useState<string[]>([])
  const [isEmpty, setIsEmpty] = useState<boolean>(false)

  const { t: trans } = useTranslation()
  const [form] = useForm()

  const [createAdmin, { isLoading: loadingSubmit }] = useCreateAdminMutation()

  const [trigger, { data: ListGroupPermission, isLoading: loadingList }] =
    useLazyGetListGroupPermissionQuery()

  const [
    triggerGetDetail,
    {
      data: detailGroupPermission,
      isSuccess: successDetail,
      isLoading: loadingDetail
    }
  ] = useLazyGetDetailGroupPermissionQuery()

  const onSubmit = async (values: SubmitValue) => {
    const { fullName, email, phoneNumber } = values
    if (values.fullName.trim() === '') {
      form.setFields([
        {
          name: 'fullName',
          errors: [trans('messages.required').toString()]
        }
      ])
      return
    }
    const payload = {
      fullName,
      email,
      phoneNumber,
      permissionIds: listIdChecked
    }
    if (listIdChecked.length === 0) {
      setIsEmpty(true)
      return
    }
    const data: any = await createAdmin(payload)
    if (data.data.statusCode === 201) {
      notification.success({
        message: trans('messages.successCreateAdminAccount')
      })
    }
    setInitListId([])
    setListIdUnchecked([])
    setListIdChecked([])
    onCancel()
    refetch()
  }

  useEffect(() => {
    if (listChecked.length > 0) {
      setIsEmpty(false)
    }
  }, [listChecked])

  const openDropDown = async (open: boolean) => {
    setLoadingDropDown(true)
    let dupDropDownData = [...dropDownData]
    if (dropDownData.length === 0 && open) {
      setVisibleDropDown(true)
      const data = await trigger(search)
      if (data.isSuccess && !data.isLoading) {
        data?.data?.data.map((el) => {
          dupDropDownData.push(el)
        })
      }
      setDropDownData(dupDropDownData)
    } else if (!open && dropDownData.length !== 0 && !loadingScroll) {
      setVisibleDropDown(false)
    } else {
      setVisibleDropDown(true)
    }
    setLoadingDropDown(false)
  }

  const onScroll = async (e: any) => {
    setLoadingScroll(true)
    const target = e.target
    let dupDropDownData = [...dropDownData]
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (ListGroupPermission?.meta.hasNextPage) {
        setSearch({ ...search, page: search.page + 1 })
        const data = await trigger({
          page: search.page + 1,
          take: 10
        })
        if (data.isSuccess && !data.isLoading) {
          data?.data?.data.map((el) => {
            dupDropDownData.push(el)
          })
        }
        setDropDownData(dupDropDownData)
      }
    }
    setLoadingScroll(false)
  }

  const onSelect = useCallback(
    async (value: string) => {
      setIsSelect(true)
      setSelectedId(value)
      if (value) {
        await triggerGetDetail(value)
      }
      setIsSelect(false)
    },
    [selectedId]
  )

  const optionList = () => {
    return (
      <>
        {loadingDropDown ? (
          <div style={{ height: 35, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : (
          <>
            {dropDownData.map((el: GroupPermissionData, index: number) => (
              <Option
                key={index}
                value={el.id}
              >
                {el.name}
              </Option>
            ))}
            {loadingList ? (
              <div style={{ height: 35, textAlign: 'center', width: '100%' }}>
                <Spin />
              </div>
            ) : null}
          </>
        )}
      </>
    )
  }

  const handleClose = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        centered: true,
        title: trans`labels.confirmClose`,
        content: trans('labels.createUserCancel'),
        okText: trans('buttons.cancel'),
        cancelText: trans('buttons.no'),
        onOk: onCancel
      })
    } else {
      onCancel()
    }
  }

  return (
    <div>
      <Form
        form={form}
        layout='vertical'
        onFinish={onSubmit}
      >
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            md={8}
            lg={5}
          >
            <Form.Item
              name='fullName'
              label={`${trans('admin-management.label.userName')}:`}
              rules={[
                {
                  required: true,
                  message: trans('messages.isRequiredFormValidate').toString()
                },
                {
                  min: 8,
                  max: 250,
                  message: trans('messages.minMaxFormValidate', {
                    min: 8,
                    max: 250
                  }).toString()
                }
              ]}
            >
              <Input
                placeholder={trans(
                  'admin-management.placeholder.userNamePlaceholder'
                ).toString()}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={8}
            lg={5}
          >
            <Form.Item
              name='email'
              label={`${trans('admin-management.label.email')}:`}
              rules={[
                {
                  required: true,
                  message: trans('messages.isRequiredFormValidate').toString()
                },
                {
                  pattern: new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
                  message: trans('messages.emailCorrectFormat').toString()
                }
              ]}
            >
              <Input
                placeholder={trans(
                  'admin-management.placeholder.emailPlaceholder'
                ).toString()}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={8}
            lg={5}
          >
            <Form.Item
              name='phoneNumber'
              label={`${trans('admin-management.label.phoneNumber')}:`}
              rules={[
                {
                  required: true,
                  message: trans('messages.isRequiredFormValidate').toString()
                },
                {
                  pattern: new RegExp(
                    /^(\\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6]|9[0-4|6-9])([0-9]{7})$/
                  ),
                  message: trans('messages.phoneNumberCorrectFormat').toString()
                }
              ]}
            >
              <Input
                placeholder={trans(
                  'admin-management.placeholder.phoneNumberPlaceholder'
                ).toString()}
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={8}
            lg={5}
          >
            <Form.Item
              name='active'
              label={`${trans('admin-management.label.permissionGroup')}:`}
              rules={[
                {
                  required: true,
                  message: trans('messages.isRequiredFormValidate').toString()
                }
              ]}
            >
              <Select
                onSelect={onSelect}
                onPopupScroll={onScroll}
                placeholder={trans(
                  'admin-management.placeholder.permissionGroupPlaceholder'
                )}
                onDropdownVisibleChange={(open) => openDropDown(open)}
                open={visibleDropDown}
              >
                {optionList()}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <div
          style={{ maxHeight: 600, overflowY: 'scroll', overflowX: 'hidden' }}
        >
          {detailGroupPermission ? (
            <CustomCheckBox
              listUnchecked={listUnchecked}
              setListUnchecked={setListUnchecked}
              setInitListChecked={setInitListChecked}
              initListChecked={initListChecked}
              listChecked={listChecked}
              setListChecked={setListChecked}
              setInitListId={setInitListId}
              isSelect={isSelect}
              detailGroupPermission={detailGroupPermission}
              listIdChecked={listIdChecked}
              setListIdChecked={setListIdChecked}
              listIdUnchecked={listIdUnchecked}
              setListIdUnchecked={setListIdUnchecked}
              successDetail={successDetail}
              loadingDetail={loadingDetail}
            />
          ) : (
            <div>{trans('messages.groupPermissionRequired').toString()}</div>
          )}
        </div>
        {isEmpty ? (
          <div style={{ fontWeight: 600, color: 'red', marginTop: 20 }}>
            {trans('messages.accountPermissionsRequired')}
          </div>
        ) : null}
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='mr-10'
              onClick={handleClose}
            >
              {trans('admin-management.button.cancel')}
            </Button>
          </Col>

          <Col>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loadingSubmit}
                  disabled={
                    !form.isFieldsTouched(true) ||
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
    </div>
  )
}
