
import { useLazyGetListGroupQuery } from '@services/apiAccountGroup';
import { useGetListPolicyQuery } from '@services/apiPolicyManagement';
import { useLazyGetCustomersQuery } from '@services/customerService';
import {
  APPLICABLE_OBJECTS,
  POLICY_MANAGEMENT_TYPE,
  SearchType,
  SearchValueType,
  viewMode
} from '@type/policyManagement';
import {
  Card,
  Form,
  Modal
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeletePolicyModal } from './policy-management-modal/delete-modal/DeletePolicyModal';
import PolicyManagementModal from './PolicyManagementModal';
import PolicyManagementSearchBar from './PolicyManagementSearchBar';
import PolicyManagementTable from './PolicyManagementTable';

const PolicyManagement = () => {
  const { t: trans } = useTranslation()
  const [form] = Form.useForm()

  const [search, setSearch] = useState<SearchType>({
    page: 1,
    take: 10,
    applicableObject: APPLICABLE_OBJECTS.ALL,
    policyType: POLICY_MANAGEMENT_TYPE.WITHDRAW
  })
  const [searchValue, setSearchValue] = useState<SearchValueType>({
    accountGroupSearch: '',
    privateAccountSearch: ''
  })
  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.ALL
  )

  const [policyManagementType, setPolicyManagementType] = useState<POLICY_MANAGEMENT_TYPE>(
    POLICY_MANAGEMENT_TYPE.WITHDRAW
  )
  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<viewMode>(viewMode.create)
  const [selectedRecord, setSelectedRecord] = useState<number | undefined>(
    undefined
  )

  const { data, refetch } = useGetListPolicyQuery(search)
  const [triggerListAccountGroup, { data: listAccountGroup }] =
    useLazyGetListGroupQuery()
  const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()

  const onClearSearch = (field: string) => {
    const newSearch = {
      ...search,
      page: 1,
      [field]: undefined
    }
    setSearch(newSearch)
  }

  const handleSelectMethod = (values: number[] | string, status?: string) => {
    if (typeof status === 'string' && status === 'all') {
      form.setFieldsValue({
        depositMethod: undefined
      })
      return
    }

    form.setFieldsValue({
      depositMethod: values
    })
  }

  const onSearch = (values: any) => {
    const {
      applicableObject,
      accountGroup,
      accountNumber,
      depositMethod,
      policyManagementType
    } = values

    if (depositMethod?.length === 0) return

    let objectIds: any
    if (applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP) {
      objectIds = accountGroup?.map((item: any) => item.value)
    } else if (applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT) {
      objectIds = accountNumber?.map((item: any) => item.value)
    }

    const params = (objectIds || depositMethod) ? new URLSearchParams() : undefined
    if (objectIds && params) {
      objectIds.forEach((value: any) => params.append('applicableObjectId', value))
    }
    if (params && depositMethod) {
      depositMethod.forEach((method: string) => params.append('depositMethod', method))
    }

    setSearch({
      applicableObject,
      applicableObjectId: params?.toString(),
      page: 1,
      take: search.take,
      policyType: policyManagementType // always include policyType
    })
  }

  const onCancel = () => {
    setOpen(false)
  }

  useEffect(() => {
    setSearch(prev => ({
      ...prev,
      policyType: policyManagementType
    }))
  }, [policyManagementType])
  return (
    <Card
      title={
        <PolicyManagementSearchBar
          form={form}
          onSearch={onSearch}
          object={object}
          setObject={setObject}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          triggerListAccountGroup={triggerListAccountGroup}
          listAccountGroup={listAccountGroup}
          triggerListAccount={triggerListAccount}
          listAccount={listAccount}
          onClearSearch={onClearSearch}
          handleSelectMethod={handleSelectMethod}
          onAdd={() => {
            setMode(viewMode.create)
            setOpen(true)
          }}
          trans={trans}
          policyManagementType={policyManagementType}
          setPolicyManagementType={setPolicyManagementType}
        />
      }
    >
      <PolicyManagementTable
        data={data}
        setMode={setMode}
        setSelectedRecord={setSelectedRecord}
        setOpen={setOpen}
        search={search}
        setSearch={setSearch}
        trans={trans}
      />
      {open && mode !== viewMode.delete && (
        <PolicyManagementModal
          policyManagementType={policyManagementType}
          onCancel={onCancel}
          open={open}
          mode={mode}
          refetch={refetch}
          recordId={selectedRecord || -1}
          entityType={'SYSTEM_FEE_MANAGEMENT'}
        />
      )}

      {open && mode === viewMode.delete && selectedRecord && (
        <Modal
          title={trans`policy-management.payment.modal.withdraw-delete-title`}
          open={open}
          onCancel={onCancel}
          footer={false}
          centered
        >
          <DeletePolicyModal
            onCancel={onCancel}
            refetch={refetch}
            policyId={selectedRecord}
          />
        </Modal>
      )}
    </Card>
  )
}

export default PolicyManagement
