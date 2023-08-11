import { CustomUpdateCheckBox } from '@pages/role-management/Component/CustomCheckbox/UpdateCheckBox'
import {
  useUpdateAdminPermissionMutation,
  useViewDetailAccountQuery
} from '@services/apiAdminAccountService'
import {
  useGetDetailGroupPermissionQuery,
  useLazyGetDetailGroupPermissionQuery,
  useLazyGetListGroupPermissionQuery
} from '@services/apiGroupPermissionService'
import {
  GroupPermissionData,
  GroupType,
  PermissionGroupType,
  PermissionsType
} from '@type/permission'
import { Button, Form, notification, Select, Spin } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fakeData } from '../data'

type PermissionGroupPropsType = {
  onCancel: () => void
  data?: any
  id: string
  refetch: () => void
}

type SearchParam = {
  page: number
  take: number
}

export const PermissionGroupModal = ({
  onCancel,
  id,
  refetch
}: PermissionGroupPropsType) => {
  const [form] = Form.useForm()
  const { t: trans } = useTranslation()
  const { Option } = Select

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

  const { data: detailData } = useViewDetailAccountQuery(id)

  const [updateAdminPermission, { isLoading }] =
    useUpdateAdminPermissionMutation()

  const [
    trigger,
    {
      data: ListGroupPermission,
      isSuccess: successList,
      isLoading: loadingList
    }
  ] = useLazyGetListGroupPermissionQuery()

  const [
    triggerGetDetail,
    {
      data: detailGroupPermission,
      isSuccess: successDetail,
      isLoading: loadingDetail
    }
  ] = useLazyGetDetailGroupPermissionQuery()

  const openDropDown = useCallback(
    async (open: boolean) => {
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
      } else if (
        !open &&
        dropDownData.length !== 0 &&
        !loadingScroll &&
        ListGroupPermission?.data
      ) {
        setVisibleDropDown(false)
      } else {
        setVisibleDropDown(true)
      }
      setLoadingDropDown(false)
    },
    [dropDownData.length, dropDownData.length, loadingScroll]
  )

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
      setListIdUnchecked([])
      setListUnchecked([])
    },
    [selectedId]
  )

  const formatData = () => {
    let obj: any = {}
    fakeData.data.map((el: GroupType) => {
      el.groups.map((element: PermissionGroupType) => {
        element.permissions.map((item: PermissionsType) => {
          obj[item.permission] = item
        })
      })
    })
    const initId = detailData?.data?.permissions
      .map((el: string) => {
        if (obj[el]) {
          return (el = obj[el].realId)
        }
        return null
      })
      .filter((x) => x)
    setInitListId(initId as number[])
    setListIdChecked(initId as number[])
  }

  const onSubmit = async (values: any) => {
    if (listChecked.length === 0) {
      setIsEmpty(true)
      return
    }
    let payloadPermissionsArr: number[] = []
    let payloadListIdUnchecked: number[] = []
    if (selectedId) {
      payloadPermissionsArr = listIdChecked
      payloadListIdUnchecked = initListId.filter(
        (el: number) => !listIdChecked.includes(el)
      )
    }
    payloadPermissionsArr = listIdChecked.filter(
      (el: number) => !initListId.includes(el)
    )
    const payload = {
      id,
      permissionIds: payloadPermissionsArr,
      permissionDeleteIds:
        payloadListIdUnchecked.length > 0
          ? payloadListIdUnchecked
          : listIdUnchecked
    }
    const data: any = await updateAdminPermission(payload)
    if (data.data.statusCode === 200) {
      notification.success({
        message: trans('messages.successUpdateAdminAccount')
      })
    }
    setListChecked([])
    setInitListChecked([])
    setListUnchecked([])
    onCancel()
    refetch()
  }

  useEffect(() => {
    if (detailData?.data) {
      formatData()
      setInitListChecked(detailData?.data?.permissions)
      setListChecked(detailData?.data?.permissions)
    }
  }, [detailData?.data])

  useEffect(() => {
    if (listChecked.length > 0) {
      setIsEmpty(false)
    }
  }, [listChecked])

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

  return (
    <Form
      layout='vertical'
      form={form}
    >
      <Form.Item
        // initialValue={data?.permissionGroup}
        name='active'
        label={`${trans('admin-management.label.permissionGroup')}:`}
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
      <div
        style={{
          maxHeight: 600,
          overflowY: 'scroll',
          overflowX: 'hidden',
          marginBottom: 10
        }}
      >
        <CustomUpdateCheckBox
          listUnchecked={listUnchecked}
          setListUnchecked={setListUnchecked}
          setInitListChecked={setInitListChecked}
          initListChecked={initListChecked}
          listChecked={listChecked}
          setListChecked={setListChecked}
          isSelect={isSelect}
          detailGroupPermission={detailGroupPermission}
          listIdChecked={listIdChecked}
          setListIdChecked={setListIdChecked}
          listIdUnchecked={listIdUnchecked}
          setListIdUnchecked={setListIdUnchecked}
          successDetail={successDetail}
          loadingDetail={loadingDetail}
        />
      </div>
      {isEmpty ? (
        <div style={{ fontWeight: 600, color: 'red', marginTop: 20 }}>
          {trans('messages.accountPermissionsRequired')}
        </div>
      ) : null}
      <div style={{ textAlign: 'right' }}>
        <Button
          className='mr-10'
          onClick={() => onCancel()}
        >
          {trans('admin-management.button.cancel')}
        </Button>
        <Button
          type='primary'
          htmlType='submit'
          onClick={onSubmit}
          loading={isLoading}
        >
          {trans('admin-management.button.save')}
        </Button>
      </div>
    </Form>
  )
}
