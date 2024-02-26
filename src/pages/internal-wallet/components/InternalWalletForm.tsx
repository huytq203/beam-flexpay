import { GUTTER } from '@constants/appConstant'
import {
  useCreateInternalWalletMutation,
  useLazyGetListWalletGroupsQuery,
  useLazyGetListWalletInternalGroupsQuery,
  useUpdateInternalWalletMutation
} from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import { InternalWalletGroup } from '@type/internalWallet'
import { GroupPermissionData } from '@type/permission'
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
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
}

const limit = 10

function InternalWalletForm({ record, isShow, onCancel, title, mode }: props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [walletGroups, setWalletGroups] = useState<InternalWalletGroup[]>([])
  const [firstLoadWalletGroups, setFirstLoadWalletGroups] = useState(false)
  const [getWalletGroups] = useLazyGetListWalletInternalGroupsQuery()
  const [updateInternalWallet, { isLoading: updateLoading }] =
    useUpdateInternalWalletMutation()
  const [createInternalWallet, { isLoading: createLoading }] =
    useCreateInternalWalletMutation()
  const [walletGroupsPage, setWalletGroupsPage] = useState(1)
  const [walletGroupQuery, setWalletGroupQuery] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedWalletGroup, setSelectedWalletGroup] = useState<InternalWalletGroup>()

  const handleGetWalletGroups = useCallback(
    (page: number = 1, keyword: string = walletGroupQuery) => {
      if (page > totalPages) return
      getWalletGroups({ page, query: keyword, take: limit })
        .unwrap()
        .then((res) => {
          setTotalPages(res.meta.pageCount)
          setWalletGroupsPage(res.meta.page)
          setWalletGroups((state) =>
            page === 1 ? res.data : [...state, ...res.data]
          )
        })
    },
    [totalPages]
  )

  const handleSubmitForm = useCallback((values: any) => {
    const { walletNumber, name, balanceInternalGroupId } = values
    const body = { walletNumber, name, internalWalletGroupId: balanceInternalGroupId }
      ; (mode === viewMode.update
        ? updateInternalWallet({ id: record.id, body }).unwrap()
        : createInternalWallet(body).unwrap()
      ).then(() => {
        notification.success({
          message: mode === viewMode.update ? t('internal-wallet.messages.success-edit-wallet-account') : t('internal-wallet.messages.success-create-wallet-account')
        })
        form.resetFields()
        onCancel()
      })
  }, [mode])

  useEffect(() => {
    if (isShow && record && record.id && mode === viewMode.update)
      form.setFieldsValue({
        ...record,
        groupName: record?.balanceInternalGroup?.name ?? ''
      })
    setSelectedWalletGroup(record?.balanceInternalGroup)
    if (!isShow) form.resetFields()
  }, [isShow, record])

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form
        onFinish={handleSubmitForm}
        layout='vertical'
        form={form}
        initialValues={{ walletType: 'Ví nội bộ' }}
      >
        {/* Loại ví */}
        <Form.Item
          name='walletType'
          label={t('internal-wallet.walletType')}
        >
          <Input readOnly />
        </Form.Item>
        {/* Nhóm ví */}
        <Form.Item
          name='balanceInternalGroupId'
          label={t('internal-wallet.groupType')}
          initialValue={selectedWalletGroup?.walletGroup}
        >
          <Select
            onSelect={(id) => {
              const item = walletGroups.find((x) => x.id === id)
              setSelectedWalletGroup(item)
              form.setFields([{ name: 'groupName', value: item?.name ?? '' }])
            }}
            showSearch
            onSearch={(value) => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              timeoutRef.current = setTimeout(() => {
                setWalletGroupQuery(value)
                handleGetWalletGroups(1, value)
              }, 400)
            }}
            onPopupScroll={(e) => {
              const target = e.target as any
              const remainingScroll =
                target.scrollHeight -
                target.offsetHeight -
                Number(target.scrollTop) <
                20
              if (remainingScroll) {
                handleGetWalletGroups(walletGroupsPage + 1)
              }
            }}
            optionLabelProp={'label'}
            filterOption={false}
            placeholder={t`internal-wallet.placeholders.group_id`.toString()}
            onDropdownVisibleChange={(value) => {
              if (!firstLoadWalletGroups) handleGetWalletGroups()
              setFirstLoadWalletGroups(true)
            }}
          >
            {walletGroups?.map((x) => (
              <Select.Option
                label={`${x.name}`}
                value={x.id}
                key={`wallet-group-${x.id}`}
              >
                {x.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* Tên nhóm ví */}
        <Form.Item
          name='groupName'
          label={t('internal-wallet.groupNameTitle')}
        >
          <Input
            readOnly
            placeholder={t`internal-wallet.placeholders.group_name`.toString()}
          />
        </Form.Item>
        {/* Số ví nội bộ */}
        <Form.Item
          label={t('internal-wallet.walletNumber')}
          name='walletNumber'
        >
          <Input
            prefix={`${selectedWalletGroup?.walletGroup ?? "XXX"}.`}
            placeholder={t`internal-wallet.placeholders.wallet_number`.toString()}
          />
        </Form.Item>
        {/* Tên ví nội bộ */}
        <Form.Item
          label={t('internal-wallet.walletName')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.groupNameRequired').toString()
            },
            {
              min: 5,
              max: 20,
              message: t('messages.minMaxFormValidate', {
                min: 5,
                max: 255
              }).toString()
            },
          ]}
          name='name'
        >
          <Input
            placeholder={t`internal-wallet.placeholders.wallet_name`.toString()}
          />
        </Form.Item>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
              loading={createLoading || updateLoading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              htmlType='submit'
              className='btn-100'
              type='primary'
              loading={createLoading || updateLoading}
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default InternalWalletForm