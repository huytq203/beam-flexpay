import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { FullFormatTime, TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InternalWalletPayload } from '@type/internalWallet'
import {
  useGetListWalletsQuery,
  useUpdateInternalWalletMutation
} from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import InternalWalletModal from './InternalWalletModal'
import { openNotification } from '@configs/fetchBaseQueryCustom'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import {
  blockArrowValue,
  blockLetterDecimal,
  blockLetterDecimalAndDot,
  blockLetterValue
} from '@utils/helperFunctions'
import { pretty } from '@utils/qs'
import { numberAndDotValidation, numberValidation } from '@utils/constants'
import { pageEnum, viewMode as viewModeHistory } from '../../app/types/policyManagement';
import { AiFillEye, AiOutlineHistory } from 'react-icons/ai';
import { PolicyManagementModal } from '../policy-management/policy-management-modal/PolicyManagementModal';

function InternalWalletAccount() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [recordSelected, setRecordSelected] = useState<any | undefined>(
    undefined
  )
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [search, setSearch] = useState<InternalWalletPayload>({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt'
  })

  const [open, setOpen] = useState<boolean>(false);
  const [modeHistory, setModeHistory] = useState<viewModeHistory>(viewModeHistory.create);
  const [selectedId, setSelectedId] = useState<number>();
  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false);

  const onCloseConfirmModal = () => {
    setVisibleConfirmModal(false);
  };

  const onCancelHistory = () => {
    if (modeHistory === viewModeHistory.history || modeHistory === viewModeHistory.delete) {
      setOpen(false);
    } else {
      setVisibleConfirmModal(true);
    }
  }
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const { data: interWallet, refetch } = useGetListWalletsQuery(search)
  const [updateInternalWallet] = useUpdateInternalWalletMutation()

  const columns: ColumnsType<any> = [
    {
      title: t('internalWallet.walletType'),
      dataIndex: 'walletType',
      key: 'walletType',
      render: () => t`internal-wallet.wallet-internal`
    },
    {
      title: t('internalWallet.walletGroup'),
      dataIndex: 'walletGroup',
      key: 'walletGroup',
      render(value, record, index) {
        return record?.balanceInternalGroup?.walletGroup || '-'
      }
    },
    {
      title: t('internalWallet.walletNumber'),
      dataIndex: 'walletNumber',
      key: 'walletNumber',
      render(value, record, index) {
        return `${record.balanceInternalGroup.walletGroup}.${record.walletNumber}`
      }
    },
    {
      title: t('internalWallet.walletName'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('partner.createdBy'),
      dataIndex: 'createdBy',
      key: 'createdBy',
      render(value, record, index) {
        return value ? value?.fullName : '-'
      },
      align: 'center'
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      render(value, record, index) {
        return record?.updatedBy?.fullName ?? '-'
      }
    },
    {
      title: t('partner.updatedDate'),
      dataIndex: 'updatedAt',
      render: (value, record, index) =>
        moment(value).format(FullFormatTime).toString()
    },
    {
      title: t('labels.action'),
      key: 'actions',
      render(record) {
        return (
          <Space align='center'>
            <Tooltip
              placement='top'
              title={t('tooltips.viewHistory')}
            >
              <Button
                icon={<AiOutlineHistory />}
                onClick={() => {
                  setModeHistory(viewModeHistory.history);
                  setOpen(true);
                  setSelectedId(record.id);
                }}
              />
            </Tooltip>
            <ButtonUpdate
              onClick={() => {
                setMode(viewMode.update)
                setRecordSelected(record)
                addFormToggle()
              }}
              module='internalwallet'
            />
            <Tooltip
              placement='topLeft'
              title={record.active ? 'Khóa' : 'Mở khóa'}
            >
              <Button
                onClick={() => changeStatus(record.active, record.id)}
                icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
              />
            </Tooltip>
          </Space>
        )
      }
    }
  ]

  const handleSearch = () => {
    if (form.getFieldError('walletNumber')?.length > 0) {
      return
    }

    const active = form.getFieldValue('active')
    const payload: InternalWalletPayload = {
      ...search,
      ...form.getFieldsValue(),
      active: active !== null ? active : undefined
    }

    setSearch(pretty(payload))
    form.setFieldsValue(pretty(payload))
  }

  const changeStatus = (status: number, id: number) => {
    Modal.confirm({
      title: status
        ? t`internal-wallet.modal.change-status-lock-account-title`
        : t`internal-wallet.modal.change-status-unlock-account-title`,
      content: t`internal-wallet.modal.change-status-lock-group-title`,
      okText: t`buttons.yes`,
      cancelText: t`buttons.no`,
      onOk: async () => {
        try {
          const response = (await updateInternalWallet({
            id,
            body: { active: status ? 0 : 1 }
          })) as { data: { statusCode: number } }
          if (
            response.data.statusCode === 201 ||
            response.data.statusCode === 200
          ) {
            openNotification(
              status
                ? t`internal-wallet.messages.lock-account-success`
                : t`internal-wallet.messages.unlock-account-success`,
              'success'
            )
          } else {
            openNotification(
              status
                ? t`internal-wallet.messages.lock-account-failed`
                : t`internal-wallet.messages.unlock-account-failed`
            )
          }
        } catch (error) {
          openNotification(
            status
              ? t`internal-wallet.messages.lock-account-failed`
              : t`internal-wallet.messages.unlock-account-failed`
          )
        }
      }
    })
  }

  const cancelModal = () => {
    setRecordSelected(null)
    addFormToggle()
    refetch()
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              layout='vertical'
              initialValues={{ active: null }}
              onFinish={handleSearch}
            >
              <Row gutter={GUTTER}>
                <Col span={6}>
                  <Form.Item
                    name='walletGroup'
                    label={"Nhóm ví"}
                    rules={[
                      ...numberValidation,
                    ]}
                  >
                    <Input
                      placeholder={"Nhập nhóm ví"}
                    />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    name='walletNumber'
                    label={t('internalBalanceWallet.walletNumber')}
                    rules={[
                      ...numberAndDotValidation,
                      {
                        min: 5,
                        message:
                          t`internal-wallet.messages.wallet-number-min-length` as string
                      },
                      {
                        max: 20,
                        message:
                          t`internal-wallet.validation.wallet-number-max-length` as string
                      }
                    ]}
                  >
                    <Input
                      placeholder={t`internal-wallet.placeholders.wallet_id`.toString()}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name='name'
                    label={t('internalBalanceWallet.walletName')}
                  >
                    <Input
                      placeholder={t`internal-wallet.placeholders.wallet_name`.toString()}
                      onKeyDown={blockArrowValue}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name='active'
                    label={t('internalBalanceWallet.status')}
                  >
                    <Select
                      placeholder={t`internal-wallet.placeholders.status`.toString()}
                      options={[
                        { label: t`internal-wallet.status.all`, value: null },
                        { label: t`internal-wallet.status.active`, value: 1 },
                        { label: t`internal-wallet.status.de-active`, value: 0 }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonAdd
                    module='internal-wallet'
                    onClick={() => {
                      setMode(viewMode.create)
                      addFormToggle()
                    }}
                  />
                </Col>
                <Col>
                  <ButtonSearch onClick={handleSearch} />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={interWallet?.data ?? []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        locale={{
          emptyText: <Empty description={t`noresult`} />
        }}
        pagination={{
          current: interWallet?.meta.page,
          pageSize: interWallet?.meta.take,
          total: interWallet?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <InternalWalletModal
        selectedInternalWallet={recordSelected}
        isShow={addForm}
        onCancel={cancelModal}
        title={
          mode === viewMode.create
            ? t('internal-wallet.add-wallet-title')
            : t('internal-wallet.edit-wallet-title')
        }
        mode={mode}
      />
      <PolicyManagementModal
        onCloseConfirmModal={onCloseConfirmModal}
        visibleConfirmModal={visibleConfirmModal}
        refetch={refetch}
        page={pageEnum.customerCancel}
        onCancel={onCancelHistory}
        open={open}
        setOpen={setOpen}
        mode={modeHistory}
        recordId={selectedId}
        entityType='INTERNAL_WALLET'
      />
    </Card>
  )
}

export default InternalWalletAccount
