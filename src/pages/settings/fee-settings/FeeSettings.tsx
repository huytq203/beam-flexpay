import ButtonAdd from '@components/button-add/ButtonAdd';
import ButtonUpdate from '@components/button-update/ButtonUpdate';
import SearchBar from '@components/search-bar/SearchBar';
import { GUTTER } from '@constants/appConstant';
import { useSystemSettingFindAllFeePrinciplesQuery } from '@services/cmsSetting';
import {
  SystemSetting,
  SystemSettingFindOneByKeyApiArg
} from '@type/application';
import { useBoolean } from 'ahooks';
import { Button, Card, Col, Form, Modal, Row, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsEyeFill } from 'react-icons/bs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { pageEnum, viewMode } from '../../../app/types/policyManagement';
import { PolicyManagementModal } from '../../policy-management/policy-management-modal/PolicyManagementModal';
import FeeSettingsForm from './FeeSettingsForm';

const FeeSettings = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<SystemSettingFindOneByKeyApiArg>();
  const [formModal, { toggle }] = useBoolean(false);
  const [mode, setMode] = useState<'add' | 'update'>('add');
  const [record, setRecord] = useState<SystemSetting | undefined>();

  const [open, setOpen] = useState<boolean>(false);
  const [modeHistory, setModeHistory] = useState<viewMode>(viewMode.create);
  const [selectedId, setSelectedId] = useState<number>();
  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false)

  const { data: settings } = useSystemSettingFindAllFeePrinciplesQuery();

  const onCloseConfirmModal = () => {
    setVisibleConfirmModal(false);
  };

  const onCancelHistory = () => {
    if (modeHistory === viewMode.history || modeHistory === viewMode.delete) {
      setOpen(false);
    } else {
      setVisibleConfirmModal(true);
    }
  }

  const columns: ColumnsType<SystemSetting> = [
    {
      title: t('labels.id'),
      dataIndex: 'id',
      width: 100,
      align: 'center',
      fixed: 'left'
    },
    {
      title: t('labels.key'),
      dataIndex: 'key',
      width: 300,
      fixed: 'left',
      render(value) {
        return t(`labels.${value}`);
      }
    },
    {
      title: t('labels.value'),
      dataIndex: 'value',
      width: 400,
      render(value) {
        return (
          <ReactQuill
            readOnly
            theme='bubble'
            value={value}
          />
        );
      }
    },
    {
      title: t('labels.action'),
      width: 100,
      fixed: 'right',
      align: 'center',
      render(value, record, index) {
        return (
          <>
            <Tooltip title={t`buttons.history`}>
              <Button
                icon={<BsEyeFill />}
                onClick={() => {
                  setModeHistory(viewMode.history);
                  setSelectedId(record.id);
                  setOpen(true);
                }} />
            </Tooltip>
            <ButtonUpdate
              module='direct_deposit'
              onClick={() => onUpdate(record)} />
          </>
        );
      }
    }
  ];

  const onSearch = (values: SystemSettingFindOneByKeyApiArg) => {};

  const onAdd = () => {
    setRecord(undefined);
    setMode('add');
    toggle();
  };

  const onUpdate = (record: SystemSetting) => {
    setRecord(record);
    setMode('update');
    toggle();
  };

  const data = useCallback(() => {
    if (settings) return settings;
    else return [];
  }, [settings]);

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Row
              gutter={GUTTER}
              justify='end'
            >
              <Col>
                <ButtonAdd
                  module='direct_deposit'
                  onClick={onAdd}
                />
              </Col>
            </Row>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={data()}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={false}
      />
      <FeeSettingsForm
        isShow={formModal}
        onCancel={toggle}
        mode={mode}
        record={record}
      />
      <PolicyManagementModal
        onCloseConfirmModal={onCloseConfirmModal}
        visibleConfirmModal={visibleConfirmModal}
        recordId={selectedId}
        page={pageEnum.feeSettings}
        onCancel={onCancelHistory}
        open={open}
        setOpen={setOpen}
        mode={modeHistory}
        entityType='SYSTEM_SETTING'
      />
    </Card>
  );
};
export default FeeSettings;
