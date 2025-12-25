import { GUTTER } from '@constants/appConstant'
import { BankSelection } from '@pages/system-management/bank-management/bank-selection/BankSelection'
import {
  useCreateInternalWalletMutation,
  useLazyGetListWalletInternalGroupsQuery,
  useUpdateInternalWalletMutation
} from '@services/apiInternalWallet'
import { useBankFindOneQuery } from '@services/cmsBank'
import { BankCmsFindAllApiArg } from '@type/application'
import { viewMode } from '@type/customer'
import { InternalWallet, InternalWalletGroup } from '@type/internalWallet'
import { blockArrowValue, blockLetterDecimal } from '@utils/helperFunctions'
import { Button, Col, Form, Input, Row, Select, notification } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  selectedInternalWallet?: InternalWallet
  onCancel: VoidFunction
  mode: viewMode
}

const limit = 10

function InternalWalletForm({
  selectedInternalWallet,
  isShow,
  onCancel,
  title,
  mode
}: props) {
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
  const [selectedWalletGroup, setSelectedWalletGroup] =
    useState<InternalWalletGroup>()
  const { data: DetailData } = useBankFindOneQuery({ id: selectedInternalWallet?.bankId?.toString() || '' })
  const [searchLinkBank, setSearchLinkBank] = useState<BankCmsFindAllApiArg>({
    page: 1,
    take: 10,
    type: 'LINK'
  })

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

  useEffect(() => {
    if (mode === viewMode.update) {
      form.setFieldValue('bank', DetailData?.tradingName)
    }
  }, [DetailData])

  useEffect(() => {
    switch (mode) {
      case viewMode.create:
      case viewMode.update:

        form.setFieldsValue(selectedInternalWallet)
        setSelectedWalletGroup(selectedInternalWallet?.balanceInternalGroup)
    }
  }, [selectedInternalWallet])

  const handleSubmitForm = useCallback(
    (values: any) => {
      const { walletNumber, name, balanceInternalGroupId, bank } = values
      const body = {
        walletNumber,
        name,
        internalWalletGroupId: balanceInternalGroupId,
        bankId: bank
      }
      ;(mode === viewMode.update
        ? updateInternalWallet({ id: selectedInternalWallet.id, body }).unwrap()
        : createInternalWallet(body).unwrap()
      ).then(() => {
        notification.success({
          message:
            mode === viewMode.update
              ? t('internal-wallet.messages.success-edit-wallet-account')
              : t('internal-wallet.messages.success-create-wallet-account')
        })
        form.resetFields()
        onCancel()
      })
    },
    [mode]
  )

  return (
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
        <Input disabled />
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
          disabled={mode != viewMode.create}
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
              label={`${x.walletGroup}`}
              value={x.id}
              key={`wallet-group-${x.id}`}
            >
              {x.walletGroup}
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
          disabled
          placeholder={t`internal-wallet.placeholders.group_name`.toString()}
        />
      </Form.Item>
      {/* Số ví nội bộ */}
      <Form.Item
        label={t('internal-wallet.walletNumber')}
        name='walletNumber'
        rules={[
          {
            required: true,
            message: t('internal-wallet.wallet_number_required').toString()
          }
        ]}
      >
        <Input
          prefix={`${selectedWalletGroup?.walletGroup ?? 'XXX'}.`}
          placeholder={t`internal-wallet.placeholders.wallet_number`.toString()}
          onKeyDown={blockArrowValue}
          onKeyPress={blockLetterDecimal}
          disabled={mode != viewMode.create}
        />
      </Form.Item>
      {/* Tên ví nội bộ */}
      <Form.Item
        label={t('internal-wallet.walletName')}
        rules={[
          {
            required: true,
            message: t('internal-wallet.wallet_name_required').toString()
          },
          {
            min: 5,
            max: 255,
            message: t('messages.minMaxFormValidate', {
              min: 5,
              max: 255
            }).toString()
          }
        ]}
        name='name'
      >
        <Input
          placeholder={t`internal-wallet.placeholders.wallet_name`.toString()}
        />
      </Form.Item>
      <Form.Item
        label={t('internal-wallet.bank-name')}
        name='bank'
      >
        <BankSelection
          placeholder={t`internal-wallet.placeholders.bank-name`.toString()}
          onClear={() => {
            setSearchLinkBank({
              ...searchLinkBank,
              page: 1,
              keyword: undefined
            })
          }}
          isId={true}
          type='LINK'
          disabled={mode != viewMode.create}
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
  )
}

export default InternalWalletForm


