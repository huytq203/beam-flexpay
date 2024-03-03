import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import { useToggle } from 'ahooks'
import { Button, Card, Col, Empty, Form, Input, Modal, Row, Select, Space } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InternalGroupForm from './components/InternalGroupForm'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import { InternalWalletPayload } from '@type/internalWallet'
import { useGetListWalletGroupsQuery, useUpdateInternalWalletGroupMutation } from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import { openNotification } from '@configs/fetchBaseQueryCustom'
import { internalWalletGroupStatusOptions } from '@constants/options'

function InternalGroupWallet() {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selected, setSelected] = useState<any | undefined>(undefined)
  const [search, setSearch] = useState<InternalWalletPayload>({ order: 'DESC', page: 1, take: 10, query: '', orderBy: 'createdAt' })
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const { data: internalWalletGroup } = useGetListWalletGroupsQuery(search)
  const [updateInternalWalletGroup] = useUpdateInternalWalletGroupMutation()

  const changeStatus = (status: number, name: string, id: string) => {
    Modal.confirm({
      title: status ? t`internal-wallet.modal.change-status-lock-title` : t`internal-wallet.modal.change-status-unlock-title`,
      content: status ? t`internal-wallet.modal.change-status-lock-description` : t`internal-wallet.modal.change-status-unlock-description`,
      okText: status ? t`internal-wallet.modal.change-status-lock-ok-button` : t`internal-wallet.modal.change-status-unlock-ok-button`,
      cancelText: t`internal-wallet.modal.change-status-cancel-button`,
      onOk: async () => {
        try {
          const response = await updateInternalWalletGroup({ name, active: status ? 0 : 1, id }) as { data: { statusCode: number } }
          if (response.data.statusCode === 201 || response.data.statusCode === 200) {
            openNotification(status ? t`internal-wallet.messages.lock-group-success` : t`internal-wallet.messages.unlock-group-success`, 'success')
          } else {
            openNotification(status ? t`internal-wallet.messages.lock-group-failed` : t`internal-wallet.messages.unlock-group-failed`)
          }
        } catch (error) {
          openNotification(status ? t`internal-wallet.messages.lock-group-failed` : t`internal-wallet.messages.unlock-group-failed`)
        }

      }
    })
  }

  const columns: ColumnsType<any> = [
    {
      title: t('groups.group-type'),
      dataIndex: 'walletGroup',
      key: 'walletGroup',
      align: 'center',
      width: 200,
    },
    {
      title: t('groups.wallet-name'),
      dataIndex: 'name',
      key: 'name',
      width: 350
    },
    {
      title: t('groups.wallet-type'),
      dataIndex: '',
      key: 'type',
      render: () => t`internal-wallet.wallet-internal`,
      width: 200
    },
    {
      title: t('partner.createdBy'),
      dataIndex: 'createdBy',
      key: 'createdBy',
      render(value, record, index) {
        return record?.createdBy?.fullName ?? '-'
      },
      align: 'center',
      width: 200
    },
    {
      title: t('partner.updatedBy'),
      dataIndex: 'lastUpdatedBy',
      key: 'lastUpdatedBy',
      render(value, record, index) {
        return record?.updatedBy?.fullName ?? '-'
      },
      align: 'center',
      width: 200
    },
    {
      title: t('partner.updatedDate'),
      dataIndex: 'updatedAt',
      render: (value, record, index) => value ? moment(value).format('DD/MM/YYYY HH:mm:ss') : '-',
      align: 'center',
      width: 150
    },
    {
      title: t('labels.action'),
      render(value, record, index) {
        return (
          <Space>
            <ButtonUpdate module='internal-wallet' onClick={() => {
              setMode(viewMode.update)
              setSelected(record)
              addFormToggle()
            }} />
            <Button
              icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => changeStatus(record.active, record.name, record.id)}
            />
          </Space>
        )
      },
      align: 'center',
      width: 150
    }
  ]

  const handleSearch = () => {
    const active = form.getFieldValue('active')
    setSearch({
      ...search,
      ...form.getFieldsValue(),
      active: active !== null ? active : undefined
    })
  }

  const cancelModal = () => {
    setSelected(undefined)
    addFormToggle()
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form form={form} layout='vertical'>
              <Row gutter={GUTTER}>
                <Col span={6}>
                  <Form.Item name='walletGroup'>
                    <Input placeholder={t`internal-wallet.placeholders.group_id`.toString()} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name='name'>
                    <Input placeholder={t`internal-wallet.placeholders.group_name`.toString()} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name='active'>
                    <Select
                      placeholder={t`internal-wallet.placeholders.status`.toString()}
                      options={internalWalletGroupStatusOptions}
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
        dataSource={internalWalletGroup?.data ?? []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        locale={{
          emptyText: (
            <>
              <Empty description={t`nodata`} />
            </>
          )
        }}
        pagination={{
          current: internalWalletGroup?.meta.page,
          pageSize: internalWalletGroup?.meta.take,
          total: internalWalletGroup?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <InternalGroupForm
        isShow={addForm}
        onCancel={cancelModal}
        title={mode === viewMode.create ? t('internal-wallet.groups-title') : t('internal-wallet.update-groups-title')}
        mode={mode}
        group={selected}
      />
    </Card>
  )
}

export default InternalGroupWallet