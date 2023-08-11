import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { useSystemSettingFindAllFeePrinciplesQuery } from '@services/cmsSetting'
import {
  SystemSetting,
  SystemSettingFindOneByKeyApiArg
} from '@type/application'
import { useBoolean } from 'ahooks'
import { Card, Col, Form, Row, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import FeeSettingsForm from './FeeSettingsForm'

const FeeSettings = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm<SystemSettingFindOneByKeyApiArg>()
  const [formModal, { toggle }] = useBoolean(false)
  const [mode, setMode] = useState<'add' | 'update'>('add')
  const [record, setRecord] = useState<SystemSetting | undefined>()

  const { data: settings } = useSystemSettingFindAllFeePrinciplesQuery()

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
        return t(`labels.${value}`)
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
        )
      }
    },
    {
      title: t('labels.action'),
      width: 100,
      fixed: 'right',
      align: 'center',
      render(value, record, index) {
        return (
          <ButtonUpdate
            module='direct_deposit'
            onClick={() => onUpdate(record)}
          />
        )
      }
    }
  ]

  const onSearch = (values: SystemSettingFindOneByKeyApiArg) => {}

  const onAdd = () => {
    setRecord(undefined)
    setMode('add')
    toggle()
  }

  const onUpdate = (record: SystemSetting) => {
    setRecord(record)
    setMode('update')
    toggle()
  }

  const data = useCallback(() => {
    if (settings) return settings
    else return []
  }, [settings])

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
    </Card>
  )
}
export default FeeSettings
