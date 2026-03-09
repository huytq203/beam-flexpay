import ButtonAdd from "@components/button-add/ButtonAdd"
import ButtonDelete from "@components/button-delete/ButtonDelete"
import ButtonUpdate from "@components/button-update/ButtonUpdate"
import CustomPaymentMethod from "@components/custom-payment-method/CustomPaymentMethodV2"
import { GUTTER } from "@constants/appConstant"
import { applicableObjects } from "@constants/options"
import { useLazyGetListGroupQuery } from "@services/apiAccountGroup"
import { useLazyGetDetailPolicyQuery, useSystemFeeManagementCreatePolicyMutation, useSystemFeeManagementUpdatePolicyMutation } from "@services/apiDirectDeposit"
import { useLazyGetCustomersQuery } from "@services/customerService"
import { APPLICABLE_OBJECTS, IPolicyTable, pageEnum, POLICY_MANAGEMENT_TYPE, SearchValueType, viewMode } from "@type/policyManagement"
import { convertNumber, showSuccessMessage } from "@utils/helperFunctions"
import { Button, Col, DatePicker, Empty, Form, Row, Select, Spin, Table } from "antd"
import { RangePickerProps } from "antd/es/date-picker"
import { useForm } from "antd/es/form/Form"
import { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CustomAccountGroupSelect } from "./components/SelectAccountGroup"
import { CustomPrivateAccountSelect } from "./components/SelectPrivateAccount"
import { AddAndUpdateFeePackageModal } from "./policy-management-modal/add-and-update-fee-package-modal/AddAndUpdateFeePackageModalV2"

type SetupDirectPolicyContentProps = {
    onCancel: () => void
    module: POLICY_MANAGEMENT_TYPE
    mode: viewMode
    refetch: () => void
    recordId?: number
}

const formItemStyle = {
    labelCol: { span: 5 },
    wrapperCol: { span: 14 }
}
const SetupDirectPolicyContent = ({ onCancel, module, mode, refetch, recordId }: SetupDirectPolicyContentProps) => {
    const { t } = useTranslation()
    const [form] = useForm()
    //* state 
    const [isLoading, setIsLoading] = useState(false)
    const [object, setObject] = useState<APPLICABLE_OBJECTS>(
        APPLICABLE_OBJECTS.SYSTEM
    )
    const [searchValue, setSearchValue] = useState<SearchValueType>({
        accountGroupSearch: '',
        privateAccountSearch: ''
    })
    const [record, setRecord] = useState<IPolicyTable | undefined>()
    const [fee, setFee] = useState<any>()
    const [openAddAndUpdateFeePackage, setOpenAddAndUpdateFeePackage] = useState<boolean>(false)
    const [feeMode, setFeeMode] = useState<viewMode>(viewMode.create)
    const [isError, setIsError] = useState(false)
    const [selectedFeePackageId, setSelectedFeePackageId] = useState<string | number>('')
    const [endDateDisable, setEndDateDisable] = useState<any>({})

    //* query hook
    const [triggerListAccountGroup, { data: listAccountGroup }] = useLazyGetListGroupQuery()
    const [triggerListAccount, { data: listAccount }] = useLazyGetCustomersQuery()
    const [getDetailPolicy] = useLazyGetDetailPolicyQuery()
        //* create and update policy mutation hook for system fee management
    const [ createPolicy ] = useSystemFeeManagementCreatePolicyMutation()
    const [ updatePolicy ] = useSystemFeeManagementUpdatePolicyMutation()

    //* function handle
    const onSubmit = async (values: any) => {
        if (!fee) {
            setIsError(true)
            return
        }
        setIsLoading(true)
        try {
            // Prepare form data
            const { endDate, startDate, depositMethod, applicableObject } = values;
            const timeEnd = endDate ? dayjs(endDate).toISOString() : undefined;
            const timeStart = dayjs(startDate).toISOString();

            const objectIds = applicableObject === APPLICABLE_OBJECTS.ACCOUNT_GROUP
            ? values.accountGroup?.value
            : applicableObject === APPLICABLE_OBJECTS.PERSONAL_ACCOUNT
                ? values.accountNumber?.value
                : undefined;
            
            const data = {
                ...values,
                depositMethod: values?.depositMethod || [],
                startDate: timeStart,
                endDate: timeEnd,
                applicableObjectId: objectIds,
                valueTypeDelete: [],
                policyType: module,
                ...fee
            }
            // Handle change tracking for updates
            if (viewMode.update && record) {
                if (data.endDate === undefined) data.endDate = null;
                
                const monitoredFields = [
                'endDate', 'startDate', 'transactionFrom', 'transactionTo',
                'transferorFlexibleFee', 'transferorFixedFee', 'transferorFeeMin', 'transferorFeeMax'
                ];
                
                data.valueTypeUpdate = monitoredFields.filter(field => 
                data[field] !== record[field as keyof IPolicyTable]
                );
            }

            // Execute operation with type safety
            const isCreate = mode === viewMode.create;

            if (isCreate) {
                await createPolicy(data).unwrap();
            } else {
                await updatePolicy({ id: record?.id as number, updateSystemFeeManagementDto: data }).unwrap();
            }
            

            // Handle success
            const messageKey = isCreate 
                ? 'policy-management.payment.messages.create-success'
                : 'policy-management.payment.messages.edit-success';

            showSuccessMessage(t`${messageKey}`);
            onCancel();
            form.resetFields();
            refetch?.();
        } catch (error) {
            console.error('Operation failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getTitle = useCallback(() => {
        switch (module) {
            case POLICY_MANAGEMENT_TYPE.WITHDRAW:
                return t`policy-management.payment.withDrawBank`
            case POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM:
                return t`policy-management.payment.paymentMethod` 
            case POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY:
                return t`policy-management.payment.depositMethod`
        }
    }, [module])
    
    const getError = useCallback(() => {
        switch (module) {
            case POLICY_MANAGEMENT_TYPE.WITHDRAW:
                return t`policy-management.depositManagement.validateWBankRequired`.toString()
            case POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM:
                return t`policy-management.depositManagement.validateMethodRequired`.toString()
            case POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY:
                return t`policy-management.depositManagement.validateDBankRequired`.toString()
        }
    }, [module])
    
    const handleSelectMethod = (values: number[] | string, status?: string) => {
        form.setFieldsValue({
            depositMethod: values
        })
    }
    // Check if account selection should be displayed
    const shouldShowAccountSelection = [
        APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
        APPLICABLE_OBJECTS.ACCOUNT_GROUP
    ].includes(object)
    
    // Common props for account selection components
    const isUpdateMode = mode === viewMode.update

    //* disabled date
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        //* disabled date before today
        return current && current < dayjs().startOf('day')
    }

    //* handle change start date
    const onChangeStartDate = (date: any, dateString: string) => {
        setEndDateDisable(date)
    }

    //* disabled end date
    const disabledEndDate: RangePickerProps['disabledDate'] = useCallback(
        (current: any) => {
            //* get start date
            const startDate = form.getFieldValue('startDate')
            //* disabled date before start date
            const endDate = dayjs.isDayjs(endDateDisable) ? endDateDisable : null
            return (
                (endDate && current < endDate) ||
                (startDate && current < dayjs(startDate))
            )
        },
        [endDateDisable]
    )
    
    const onCancelFeePackageModal = () => {
        setOpenAddAndUpdateFeePackage(false)
    }
    
    const toggleFee = (value: any[], type: viewMode) => {
        if ((type === viewMode.create || type === viewMode.update) && value) {
            setFee(value)
        } else {
            setFee(undefined)
        }
        setIsError(false)
    }
    
    const fetchData = async () => {
        // Early return if not in update mode or no record ID
        if (mode !== viewMode.update || !recordId) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const { data } = await getDetailPolicy(recordId);
        
            // Validate response data
            if (!data?.id) {
            console.warn('Invalid policy data received:', data);
            return;
            }
        
            // Destructure and separate fee data from form data
            const {
            applicableObject,
            createdAt,
            startDate,
            depositMethod,
            endDate,
            id,
            updatedAt,
            applicableObjectId,
            applicableObjectName,
            depositMethods,
            ...feeData
            } = data;
        
            // Set state
            setRecord(data);
            setFee(feeData);
            setObject(applicableObject as APPLICABLE_OBJECTS);
        
            // Prepare form values
            const formValues = {
            ...data,
            depositMethod: data.depositMethodIds,
            startDate: startDate ? dayjs(startDate) : null,
            endDate: endDate ? dayjs(endDate) : null
            };
        
            // Set applicable object field based on type
            const applicableObjectFields: Record<string, () => any> = {
            [APPLICABLE_OBJECTS.ACCOUNT_GROUP]: () => ({
                accountGroup: {
                id: applicableObjectId,
                name: applicableObjectName
                }
            }),
            [APPLICABLE_OBJECTS.PERSONAL_ACCOUNT]: () => ({
                accountNumber: {
                value: applicableObjectId,
                label: applicableObjectName
                }
            })
            };
        
            // Add applicable object field if exists and has name
            if (applicableObjectName && applicableObjectFields[applicableObject]) {
            Object.assign(formValues, applicableObjectFields[applicableObject]());
            }
        
            // Set all form values at once
            form.setFieldsValue(formValues);
        
        } catch (error) {
            console.error('Failed to fetch policy data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Helper function to handle action button clicks
    const handleFeeAction = (action: 'update' | 'delete', recordId?: string) => {
        console.log('action', action)
        const modeMap = {
        update: viewMode.update,
        delete: viewMode.delete
        };
        
        setFeeMode(modeMap[action]);
        setOpenAddAndUpdateFeePackage(true);
        
        if (action === 'update' && recordId) {
        setSelectedFeePackageId(recordId);
        }
    };
    //* use effect
    useEffect(() => {
        fetchData()
        setEndDateDisable(dayjs(dayjs().startOf('day').toISOString()))
    }, [])
    // Render account selection based on object type
    const renderAccountSelection = () => {
        if (!shouldShowAccountSelection) return null
        
        if (object === APPLICABLE_OBJECTS.ACCOUNT_GROUP) {
            return (
                <Form.Item
                    name='accountGroup'
                    {...formItemStyle}
                    labelAlign='left'
                    label={t`policy-management.payment.selectAccountGroup`}
                    rules={[{
                        required: true,
                        message: t`policy-management.depositManagement.validateAccountGroupRequired`.toString()
                    }]}
                >
                    <CustomAccountGroupSelect
                        disabled={isUpdateMode}
                        listAccountGroup={listAccountGroup}
                        setSearchValue={setSearchValue}
                        searchInput={searchValue}
                        placeholder={t`policy-management.eWalletTransferMoneyManagement.placeholders.accountGroup`.toString()}
                        triggerFunction={triggerListAccountGroup}
                    />
                </Form.Item>
            )
        }
        
        return (
            <Form.Item
                {...formItemStyle}
                labelAlign='left'
                name='accountNumber'
                label={t`policy-management.payment.inputAccount`}
                rules={[{
                    required: true,
                    message: t`policy-management.depositManagement.validateAccountRequired`.toString()
                }]}
            >
                <CustomPrivateAccountSelect
                    disabled={isUpdateMode}
                    listAccount={listAccount}
                    setSearchValue={setSearchValue}
                    searchInput={searchValue}
                    placeholder={t`policy-management.payment.accountNumberPlaceholder`.toString()}
                    triggerFunction={triggerListAccount}
                />
            </Form.Item>
        )
    }
    const columns: ColumnsType<any> = [
        {
            align: 'center',
            title: t`labels.no`,
            render: (record) => 1
        },
        {
            align: 'center',
            title: t`policy-management.depositManagement.modalContent.tableModal.transactionFrom`,
            render: (record) => <div>{convertNumber(record.transactionFrom)}</div>
        },
        {
            align: 'center',
            title: t`policy-management.depositManagement.modalContent.tableModal.transactionTo`,
            render: (record) => <div>{convertNumber(record.transactionTo)}</div>
        },
        {
            title: t`policy-management.depositManagement.modalContent.tableModal.transactionFee`,
            children: [
            {
                align: 'center',
                title: t`policy-management.depositManagement.modalContent.tableModal.onTransferor`,
                children: [
                {
                    dataIndex: 'transferorFlexibleFee',
                    title: t`policy-management.depositManagement.modalContent.tableModal.variableFee`,
                    align: 'center',
                    render: (value, record) => (
                    <div>{convertNumber(record.type === "FLEXIBLE" ? value : null, '%')}</div>
                    )
                },
                {
                    dataIndex: 'transferorFixedFee',
                    title: t`policy-management.depositManagement.modalContent.tableModal.fixedFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FIXED" ? value : null)}</div>
                },
                {
                    dataIndex: 'transferorFeeMin',
                    title: t`policy-management.depositManagement.modalContent.tableModal.minFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
                },
                {
                    dataIndex: 'transferorFeeMax',
                    title: t`policy-management.depositManagement.modalContent.tableModal.maxFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
                }
                ]
            },
            {
                align: 'center',
                title: t`policy-management.depositManagement.modalContent.tableModal.onReceiver`,
                children: [
                {
                    dataIndex: 'receiverFlexibleFee',
                    title: t`policy-management.depositManagement.modalContent.tableModal.variableFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null, '%')}</div>
                },
                {
                    dataIndex: 'receiverFixedFee',
                    title: t`policy-management.depositManagement.modalContent.tableModal.fixedFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FIXED" ? value : null)}</div>
                },
                {
                    dataIndex: 'receiverFeeMin',
                    title: t`policy-management.depositManagement.modalContent.tableModal.minFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
                },
                {
                    dataIndex: 'receiverFeeMax',
                    title: t`policy-management.depositManagement.modalContent.tableModal.maxFee`,
                    align: 'center',
                    render: (value, record) => <div>{convertNumber(record.type === "FLEXIBLE" ? value : null)}</div>
                }
                ]
            }
            ]
        },
        {
            align: 'center',
            width: 120,
            title: t`policy-management.depositManagement.action`,
            render: (record) => (
            <Row
                gutter={5}
                justify='center'
            >
                <Col>
                    <ButtonUpdate
                        module='direct_deposit'
                        onClick={() => handleFeeAction('update', record.id)}
                    />
                </Col>
                <Col>
                    <ButtonDelete
                        hidden={mode === viewMode.update}
                        module='direct_deposit'
                        onClick={() => handleFeeAction('delete')}
                    />
                </Col>
            </Row>
            )
        }
    ]
    return (
        <Spin spinning={isLoading}>
            <Form
                onFinish={onSubmit}
                form={form}
            >
                <Row gutter={GUTTER}>
                    <Col span={24}>
                        {/* Applicable Object */}
                        <Form.Item
                            name='applicableObject'
                            label={t`policy-management.payment.applicableObject`}
                            {...formItemStyle}
                            labelAlign='left'
                            initialValue={APPLICABLE_OBJECTS.SYSTEM}
                            rules={[
                                {
                                required: true,
                                message:
                                    t`policy-management.depositManagement.validateSystemRequired`.toString()
                                }
                            ]}
                        >
                            <Select
                                onChange={(value) => setObject(value)}
                                style={{ minWidth: 220 }}
                                disabled={mode === viewMode.update}
                                options={applicableObjects}
                            />
                        </Form.Item>
                        {/* Account Selection */}
                        {renderAccountSelection()}
                        {/* Deposit Method */}
                        {(module !== POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL && module !== POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY) && (
                        <Form.Item
                            rules={[
                                {
                                required: true,
                                message: getError()
                                }
                            ]}
                            name='depositMethod'
                            label={getTitle()}
                            {...formItemStyle}
                            labelAlign='left'
                        >
                            <CustomPaymentMethod
                                module={module}
                                defaultMethod='configure'
                                mode={mode}
                                handleSelectMethod={handleSelectMethod}
                                defaultSelected={record?.depositMethodIds}
                            />
                        </Form.Item>
                        )}
                    </Col>
                </Row>
                <Row gutter={GUTTER} style={{ marginBottom: '20px' }}>
                    <div
                        style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                        marginBottom: '18px'
                        }}
                    >
                        <div>{t`policy-management.depositManagement.modalContent.packagePackage`}</div>
                        {!fee && (
                        <ButtonAdd
                            module='direct_deposit'
                            label={t`policy-management.depositManagement.modalContent.createNewFeePackage`.toString()}
                            onClick={() => {
                                setOpenAddAndUpdateFeePackage(true)
                                setFeeMode(viewMode.create)
                            }}
                        />
                        )}
                    </div>
                    <Table
                        bordered
                        rowKey='id'
                        dataSource={fee ? [fee] : []}
                        columns={columns}
                        scroll={{ x: '100%' }}
                        pagination={false}
                        locale={{
                        emptyText: <Empty description={t`labels.table-nodata`} />
                        }}
                    />
                    {isError && (
                        <span
                        style={{ color: '#ff4d4f' }}
                        >{t`policy-management.payment.messages.fee-required`}</span>
                    )}
                </Row>
                <Row gutter={GUTTER}>
                    <Col span={24}>
                        <Form.Item
                        name='startDate'
                        label={t`policy-management.depositManagement.applicableTimeStart`}
                        {...formItemStyle}
                        labelAlign='left'
                        rules={[
                            {
                            required: true,
                            message:
                                t`policy-management.depositManagement.validateRequired`.toString()
                            }
                        ]}
                        initialValue={dayjs().startOf('day')}
                        >
                        <DatePicker
                            showTime
                            use12Hours={false}
                            disabledDate={disabledDate}
                            className='w-100'
                            format='DD/MM/YYYY HH:mm:ss'
                            onChange={onChangeStartDate as any}
                            showNow={false}
                        />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                        name='endDate'
                        label={t`policy-management.depositManagement.applicableTimeEnd`}
                        {...formItemStyle}
                        labelAlign='left'
                        >
                        <DatePicker
                            showTime={{ defaultValue: dayjs('23:59:59', 'HH:mm:ss') }}
                            showNow={false}
                            disabledDate={disabledEndDate}
                            className='w-100'
                            format='DD/MM/YYYY HH:mm:ss'
                            placeholder={t`policy-management.depositManagement.modalContent.endDatePlaceholder`.toString()}
                        />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={GUTTER} className='justify-end'>
                    <Col>
                        <Button
                            onClick={() => {
                                onCancel()
                            }}
                        >{t`buttons.back`}</Button>
                    </Col>
                    <Col>
                        <Button
                            loading={isLoading}
                            type='primary'
                            htmlType='submit'
                        >
                        {mode === viewMode.create
                            ? t`policy-management.payment.establish`
                            : t`buttons.update`}
                        </Button>
                    </Col>
                </Row>
                {openAddAndUpdateFeePackage && (
                <AddAndUpdateFeePackageModal
                    id={selectedFeePackageId}
                    open={openAddAndUpdateFeePackage}
                    mode={feeMode}
                    onCancel={onCancelFeePackageModal}
                    toggleFee={toggleFee}
                    module={module}
                    fee={fee}
                />
                )}
            </Form>
        </Spin>
    )
}

export default SetupDirectPolicyContent
