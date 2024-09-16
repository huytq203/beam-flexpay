import { AuditLogManagementModal } from '@components/audit-log/AuditLogManagementModal';
import ButtonAdd from '@components/button-add/ButtonAdd';
import ButtonSearch from '@components/button-search/ButtonSearch';
import CellContent from '@components/cell-content/CellContent';
import SearchBar from '@components/search-bar/SearchBar';
import { GUTTER } from '@constants/appConstant';
import { TimeFormat } from '@constants/datetime';
import { notificationStatus, serviceTypes } from '@constants/options';
import {
  useLazyDeleteNotificationQuery,
  useLazyPublishNotificationQuery
} from '@services/apiNotification';
import { useNotificationContextSettingFindAllQuery } from '@services/cmsService';
import { STATUS_CODE } from '@type/api';
import { NotificationContextSettingFindAllApiArg } from '@type/application';
import { INotification } from '@type/notification';
import {
  getApplicableObject,
  getNotificationService,
  showSuccessMessage
} from '@utils/helperFunctions';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input, message, Modal,
  Row,
  Select,
  Switch,
  Table,
  Tooltip
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillDelete, AiFillEye, AiFillSound, AiOutlineHistory } from 'react-icons/ai';
import { FaPen } from 'react-icons/fa';
import { pageEnum, viewMode } from '../../../app/types/policyManagement';

function NotificationManagement() {
  const { t } = useTranslation()
  const [form] = Form.useForm<NotificationContextSettingFindAllApiArg>()

  const [search, setSearch] = useState<NotificationContextSettingFindAllApiArg>(
    {
      page: 1,
      take: 10,
      orderBy: 'createdAt',
      from: dayjs().startOf('month').toISOString()
    }
  )
  const [selectedId, setSelectedId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)

  const { data, refetch } = useNotificationContextSettingFindAllQuery(search)
  const [deleteNotification] = useLazyDeleteNotificationQuery()
  const [publishNotification] = useLazyPublishNotificationQuery()

  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false);

  const toggleMode = (state: boolean) => setOpen(state)

  const handleModal = (action: viewMode, id?: string) => {
    setOpen(true)
    if (id) setSelectedId(id)
    setMode(action)
  }

  const onCloseConfirmModal = () => {
    setVisibleConfirmModal(false);
  }
  const onCancel = () => {
    if (mode !== viewMode.history) {
      setVisibleConfirmModal(true);
    }
    setOpen(false);
  };


  /**
   * function handle when click delete button
   * @param id
   */
  const onHandleDelete = (id: any) => {
    Modal.confirm({
      title: t('product.confirm.cancel.title'),
      content: t('notification-management.delete-title'),
      onOk: () => handleDelete(id),
      okText: t('buttons.ok'),
      cancelText: t('buttons.cancel'),
      type: 'warning'
    })
  }

  /**
   * function confirm delete notification
   * @param id
   */
  const handleDelete = async (id: any) => {
    const result: any = await deleteNotification(id as string)
    if (
      result?.isSuccess &&
      !result?.isLoading &&
      (result?.data?.statusCode === STATUS_CODE.SUCCESS ||
        result?.data?.statusCode === STATUS_CODE.CREATED)
    ) {
      showSuccessMessage(t('notification-management.message.delete-success'))
      refetch()
    } else {
      message.destroy()
      message.error(t('notification-management.message.delete-failed'))
    }
  }

  /**
   * function handle click publish button
   * @param id
   */
  const onHandlePublish = (id: any, status: number) => {
    Modal.confirm({
      title: t('product.confirm.cancel.title'),
      content: t('notification-management.publish-title'),
      onOk: () => handlePublish(id, status),
      okText: t('buttons.yes'),
      cancelText: t('buttons.no'),
      type: 'warning'
    })
  }

  /**
   * function confirm publish button
   * @param id
   */
  const handlePublish = async (id: any, status: number) => {
    const result: any = await publishNotification({ id, status: status === 1 })
    if (
      result?.isSuccess &&
      !result?.isLoading &&
      (result?.data?.statusCode === STATUS_CODE.SUCCESS ||
        result?.data?.statusCode === STATUS_CODE.CREATED)
    ) {
      showSuccessMessage(t('notification-management.message.publish'))
      refetch()
    }
  }

  /**
   * add property no in data
   */
  const notifications = useMemo(() => {
    if (data?.data && data.data.length > 0) {
      return data?.data?.map((item: INotification, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...item
      }))
    } else return []
  }, [data?.data])

  function checkKeywords(text: string) {
    const keywords = [
      'amount',
      'cardName',
      'phoneNumber',
      'networkName',
      'dataAmount',
      'parValue',
      'phoneCode',
      'dataCode',
      'seriCode',
      'transferAccount',
      'recipientPhoneNumber',
      'cardCode',
      'fullName',
      'bankName',
      'billCode',
      'supplierName',
      'deviceName',
      'timeLogin',
      'location'
    ]
    const pattern = new RegExp('\\[' + keywords.join('|') + '\\]', 'g')
    return !pattern.test(text)
  }

  /**
   * define column in table
   */
  const columns: ColumnsType<INotification> = [
    {
      title: t`notification-management.no`,
      dataIndex: 'no',
      align: 'center',
      key: 'no',
      width: 80,
      fixed: 'left'
    },
    {
      title: t`notification-management.service`,
      dataIndex: 'serviceType',
      align: 'center',
      key: 'serviceType',
      width: 250,
      render: (record) => <CellContent data={getNotificationService(record)} />,
      fixed: 'left'
    },
    {
      title: t`notification-management.text-title`,
      dataIndex: 'title',
      align: 'center',
      key: 'title',
      width: 250,
      render: (record) => <CellContent data={record} />,
      fixed: 'left'
    },
    {
      title: t`notification-management.status`,
      dataIndex: 'status',
      align: 'center',
      key: 'status',
      width: 100,
      render: (record) =>
        record !== undefined || record !== null ? (
          <Switch checked={record === 1} />
        ) : (
          t`labels.nodata`
        )
    },
    {
      title: t`notification-management.object`,
      dataIndex: 'applicableObject',
      align: 'center',
      key: 'applicableObject',
      width: 200,
      render: (record) => <CellContent data={getApplicableObject(record)} />
    },
    {
      title: t`notification-management.apply-date`,
      dataIndex: 'startDate',
      align: 'center',
      key: 'startDate',
      width: 200,
      render: (record) =>
        record ? dayjs(record).format(TimeFormat) : t`labels.nodata`
    },
    {
      title: t`notification-management.createdAt`,
      dataIndex: 'createdAt',
      align: 'center',
      key: 'createdAt',
      width: 200,
      render: (record) =>
        record ? dayjs(record).format(TimeFormat) : t`labels.nodata`
    },
    {
      title: t`notification-management.action`,
      dataIndex: '',
      align: 'center',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (record) => (
        console.log(record),
        console.log(checkKeywords(record.title), checkKeywords(record.body)),
        <Row
          gutter={GUTTER}
          justify='center'
        >
          <Col>
            <Tooltip title={t`buttons.history`}>
              <Button
                icon={<AiOutlineHistory />}
                onClick={() => {
                  setMode(viewMode.history);
                  setSelectedId(record.id);
                  setOpen(true);
                }} />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.view')}
            >
              <Button
                icon={<AiFillEye />}
                onClick={() => handleModal(viewMode.view, record?.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.edit')}
            >
              <Button
                // disabled={
                //   checkKeywords(record.title) && checkKeywords(record.body)
                // }
                icon={<FaPen />}
                onClick={() => handleModal(viewMode.update, record?.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.delete')}
            >
              <Button
                disabled={record.status === 1}
                danger
                icon={<AiFillDelete />}
                onClick={async () => onHandleDelete(record?.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('notification-management.publish')}
            >
              <Button
                icon={<AiFillSound />}
                onClick={async () =>
                  onHandlePublish(record?.id, record?.status)
                }
              />
            </Tooltip>
          </Col>
        </Row>
      )
    }
  ]

  const onSubmit = (values: NotificationContextSettingFindAllApiArg) => {
    const data = {
      ...values,
      title: values?.title?.trim(),
      serviceType: values?.serviceType ?? undefined,
      from: values?.from
        ? dayjs(values?.from).startOf('day').toISOString()
        : undefined,
      to: values?.to ? dayjs(values?.to).endOf('day').toISOString() : undefined,
      status: values?.status ?? undefined
    }
    setSearch(data)
  }

  const reload = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
  }

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              layout='vertical'
              initialValues={{
                serviceType: null,
                status: null,
                from: dayjs().startOf('month')
              }}
              onFinish={onSubmit}
              form={form}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    name='title'
                    label={t`notification-management.search-input`}
                  >
                    <Input
                      allowClear={true}
                      placeholder={t`notification-management.placeholders.search-input`.toString()}
                      className='w-100'
                      onChange={(e) => {
                        if (
                          e.target.value === '' ||
                          e.target.value === undefined
                        ) {
                          reload('title')
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='225px'>
                  <Form.Item
                    name='serviceType'
                    label={t`notification-management.service`}
                  >
                    <Select
                      options={[
                        {
                          value: null,
                          label: t`notification-management.service-type.all`
                        },
                        ...serviceTypes
                      ]}
                      placeholder={t`notification-management.placeholders.service`}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    name='from'
                    label={t`notification-management.created-at`}
                    style={{ position: 'relative' }}
                  >
                    <DatePicker
                      allowClear={false}
                      disabledDate={(value) => value > dayjs()}
                      placeholder={t`notification-management.placeholders.date`.toString()}
                      className='w-100'
                      format={TimeFormat}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    name='to'
                    label={t`notification-management.to-date`}
                    style={{ position: 'relative' }}
                  >
                    <DatePicker
                      allowClear={true}
                      placeholder={t`notification-management.placeholders.date`.toString()}
                      className='w-100'
                      disabledDate={(value) =>
                        value < form.getFieldValue('from') || value > dayjs()
                      }
                      format={TimeFormat}
                      onChange={(date) => {
                        if (!date) reload('to')
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='150px'>
                  <Form.Item
                    name='status'
                    label={t`notification-management.status`}
                  >
                    <Select
                      allowClear={false}
                      placeholder={t`notification-management.placeholders.status`.toString()}
                      className='w-100'
                      options={notificationStatus}
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
                    module=''
                    onClick={() => {
                      setMode(viewMode.create)
                      toggleMode(true)
                    }}
                  />
                </Col>
                <Col>
                  <ButtonSearch htmlType='submit' />
                </Col>
              </Row>
            </Form>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={notifications || []}
        scroll={{ x: '100%' }}
        rowKey={'id'}
        size='small'
        pagination={{
          current: search.page,
          pageSize: 10,
          total: data?.meta.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {open && (
        <AuditLogManagementModal
          onCloseConfirmModal={onCloseConfirmModal}
          visibleConfirmModal={visibleConfirmModal}
          page={pageEnum.notificationManagement}
          open={open}
          mode={mode}
          onCancel={onCancel} 
          setOpen={setOpen}
          recordId={Number(selectedId)}
          refetch={refetch}
          entityType='NOTIFICATION_CONTEXT_SETTING'
        />
      )}
    </Card>
  )
}

export default NotificationManagement
