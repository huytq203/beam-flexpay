import { AuditLogManagementModal } from '@components/audit-log/AuditLogManagementModal';
import ButtonExcel from '@components/button-excel/ButtonExcel';
import ButtonSearch from '@components/button-search/ButtonSearch';
import ButtonUpdate from '@components/button-update/ButtonUpdate';
import CellContent from '@components/cell-content/CellContent';
import NoDataText from '@components/no-data-text/NoDataText';
import SearchBar from '@components/search-bar/SearchBar';
import { GUTTER } from '@constants/appConstant';
import { TimeFormat } from '@constants/datetime';
import { bankSearchStatus, bankTypeSearchStatus } from '@constants/options';
import { useAppSelector } from '@hooks/hook';
import { useBankCmsFindAllQuery } from '@services/cmsService';
import { BankCmsFindAllApiArg } from '@type/application';
import { BankInformation } from '@type/bank';
import { getBankStatus, getTagColor } from '@utils/helperFunctions';
import {
  Button,
  Card,
  Col,
  Form,
  Input, notification, Row,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillEye, AiOutlineHistory } from 'react-icons/ai';
import { pageEnum, viewMode } from '../../../app/types/policyManagement';
import { BankSelection } from './bank-selection/BankSelection';

function BankManagement() {
  const { t } = useTranslation();
  const [selectedBank, setSelectedBank] = useState();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<viewMode>(viewMode.view);
  const [form] = Form.useForm<BankCmsFindAllApiArg>();
  const { accessToken } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState<BankCmsFindAllApiArg>({
    page: 1,
    take: 10
  });

  //const [openHistory, setOpenHistory] = useState<boolean>(false);
  // const [modeHistory, setModeHistory] = useState<viewModeHistory>(viewModeHistory.create);
  const [selectedId, setSelectedId] = useState<number>();
  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false);

  const { data: banks, refetch } = useBankCmsFindAllQuery(search);

  const toggleModal = (value: boolean) => setOpen(value);

  const onCancel = () => {
    if (mode !== viewMode.history) {
      setVisibleConfirmModal(true);
    }
    setOpen(false);
  };

  const onCloseConfirmModal = () => {
    setVisibleConfirmModal(false);
  };

  const columns: ColumnsType<BankInformation> = [
    {
      title: t('system-management.bank.no'),
      dataIndex: 'no',
      align: 'center',
      fixed: 'left',
      width: 70
    },
    {
      title: t('system-management.bank.bank-name'),
      dataIndex: 'name',
      align: 'center',
      fixed: 'left',
      ellipsis: true,
      width: 200,
      render: (record) => {
        return <CellContent data={record} />;
      }
    },
    {
      title: t('system-management.bank.trading-name'),
      dataIndex: 'tradingName',
      align: 'center',
      fixed: 'left',
      width: 150,
      render: (record) => {
        return <CellContent data={record} />;
      }
    },
    {
      title: t('system-management.bank.bank-code'),
      dataIndex: 'bankCode',
      align: 'center',
      width: 200,
      render: (record) => {
        return <CellContent data={record} />;
      }
    },
    {
      title: t('system-management.bank.type'),
      dataIndex: ['type'],
      align: 'center',
      width: 250,
      render(value) {
        return (
          <CellContent
            d
            data={value ? t(`system-management.bank.options.${value}`) : null}
          />
        );
      }
    },
    {
      title: t('system-management.bank.address'),
      dataIndex: ['address'],
      ellipsis: true,
      align: 'center',
      width: 400,
      render: (value) => {
        return (
          <CellContent
            d
            data={value}
          />
        );
      }
    },
    {
      title: t('system-management.bank.website'),
      dataIndex: 'website',
      ellipsis: true,
      width: 150,
      align: 'center',
      render: (link: any) =>
        link ? (
          <a
            href={`${link}`}
            target='_blank'
          >
            {link}
          </a>
        ) : (
          <NoDataText />
        )
    },
    {
      title: t('system-management.bank.tiny-logo'),
      dataIndex: 'shortLogo',
      width: 150,
      align: 'center',
      render: (logo: string) =>
        logo ? (
          <img
            height={30}
            src={logo}
            alt='logo'
          />
        ) : (
          <NoDataText />
        )
    },
    {
      title: t('system-management.bank.logo'),
      dataIndex: 'image',
      width: 150,
      align: 'center',
      render: (logo: string) =>
        logo ? (
          <img
            height={30}
            src={logo}
            alt='logo'
          />
        ) : (
          <NoDataText />
        )
    },
    {
      title: t('system-management.bank.created-time'),
      dataIndex: 'createdAt',
      align: 'center',
      width: 130,
      render: (record) => {
        return <Typography> {dayjs(record).format(TimeFormat)}</Typography>;
      }
    },
    {
      title: t('system-management.bank.status'),
      dataIndex: 'active',
      width: 130,
      align: 'center',
      render: (status: boolean) => (
        <CellContent
          data={<Tag color={getTagColor(status)}>{getBankStatus(status)}</Tag>}
        />
      )
    },
    {
      title: t('system-management.bank.order-view'),
      dataIndex: 'priority',
      align: 'center',
      width: 150,
      ellipsis: true,
      render: (record) => {
        return (
          <CellContent
            d
            data={record}
          />
        );
      }
    },
    {
      title: t('system-management.bank.action'),
      dataIndex: '',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (record) => (
        <Row justify='center'>
          <Col>
            <Tooltip title={t`buttons.history`}>
              <Button
                className='mr-10'
                icon={<AiOutlineHistory />}
                onClick={() => {
                  setMode(viewMode.history);
                  setSelectedId(record.id);
                  toggleModal(true);
                }} />
            </Tooltip>
            <ButtonUpdate
              className='mr-10'
              onClick={() => {
                setMode(viewMode.update);
                setSelectedBank(record);
                toggleModal(true);
              }}
              module='bank_payment'
            />
          </Col>
          <Col>
            <Tooltip title={t`buttons.detail`}>
              <Button
                icon={<AiFillEye />}
                className='mr-10'
                onClick={() => {
                  setMode(viewMode.view);
                  setSelectedBank(record);
                  toggleModal(true);
                }}
              />
            </Tooltip>
          </Col>
        </Row>
      )
    }
  ];

  const onSearch = (value: BankCmsFindAllApiArg) => {
    if (value.active === -1)
      value = {
        ...value,
        active: undefined
      };
    if (value.type === -1) value = { ...value, type: undefined };
    setSearch(value);
  };

  const bankList = useMemo(() => {
    if (banks && banks.data && banks.data.length > 0) {
      return banks.data.map((bank: BankInformation, index: number) => ({
        no: ((search?.page ?? 1) - 1) * 10 + index + 1,
        ...bank
      }));
    } else return [];
  }, [banks?.data]);

  const handleExport = async () => {
    const _headers = new Headers();
    _headers.append('Authorization', `Bearer ${accessToken}`);
    var requestOptions: any = {
      method: 'GET',
      headers: _headers,
      redirect: 'follow'
    };
    let args = '';
    for (const key in search) {
      if ((search as any)[key]) {
        args += key + '=' + (search as any)[key] + '&';
      }
    }
    fetch(
      import.meta.env.VITE_API_URL + '/bank/export/excel?' + args,
      requestOptions
    )
      .then((response) => response.blob())
      .then((result) => {
        const downloadItem = document.createElement('a');
        const url = window.URL || window.webkitURL;
        downloadItem.href = url.createObjectURL(result);
        downloadItem.target = '_blank';
        downloadItem.download = `banks.xlsx`;
        downloadItem.click();
      })
      .then(() => {
        notification.info({
          message: t`system-management.message.export-process`
        });
      });
  };

  useEffect(() => {
    if (bankList && bankList.length === 0 && banks !== undefined) {
      notification.destroy();
      notification.info({
        message: t`system-management.message.no-data`.toString()
      });
    }
  }, [bankList]);

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              form={form}
              onFinish={onSearch}
              layout='vertical'
              initialValues={{
                active: -1,
                type: -1
              }}
            >
              <Row gutter={GUTTER}>
                <Col flex='auto'>
                  <Form.Item
                    label={t`system-management.bank.faster`}
                    name='key'
                  >
                    <Input
                      allowClear
                      placeholder={t`system-management.bank.placeholders.faster`.toString()}
                      onChange={(e) => {
                        if (
                          e.target.value === '' ||
                          e.target.value === undefined
                        ) {
                          setSearch({
                            ...search,
                            page: 1,
                            key: undefined
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    label={t`system-management.bank.bank-name`}
                    name='name'
                  >
                    <BankSelection
                      placeholder={t`system-management.bank.placeholders.bank`.toString()}
                      onClear={() => {
                        setSearch({
                          ...search,
                          page: 1,
                          name: undefined
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    name='type'
                    label={t`system-management.bank.type`}
                  >
                    <Select
                      allowClear
                      placeholder={t`system-management.bank.type`}
                      options={bankTypeSearchStatus}
                      onClear={() => {
                        setSearch({
                          ...search,
                          type: undefined
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col flex='300px'>
                  <Form.Item
                    label={t`system-management.bank.status`}
                    name='active'
                  >
                    <Select
                      allowClear
                      options={bankSearchStatus}
                      placeholder={t`system-management.bank.placeholders.status`}
                      onClear={() => {
                        setSearch({
                          ...search,
                          page: 1,
                          active: undefined
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                justify='end'
                gutter={GUTTER}
              >
                <Col>
                  <ButtonExcel
                    module='bank_management'
                    onClick={handleExport}
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
        dataSource={bankList || []}
        locale={{
          emptyText: t`labels.nodata`
        }}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: banks?.meta?.page,
          pageSize: banks?.meta?.take,
          total: banks?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            });
          }
        }}
      />
      {open && (
        <AuditLogManagementModal
          onCloseConfirmModal={onCloseConfirmModal}
          visibleConfirmModal={visibleConfirmModal}
          record={selectedBank}
          open={open}
          mode={mode}
          onCancel={onCancel}
          refetch={refetch}
          page={pageEnum.bankManagement}
          recordId={selectedId}
          setOpen={setOpen}
          entityType='BANK_MANAGEMENT'
        />
      )}
    </Card>
  );
}
export default BankManagement;
