import { Form, Row, Col, Button, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import CustomPaymentMethod from '@components/custom-payment-method/CustomPaymentMethodV2'
import { applicableObjects } from '@constants/options'
import { APPLICABLE_OBJECTS, pageEnum, POLICY_MANAGEMENT_TYPE } from '@type/policyManagement'
import { CustomAccountGroupSelect } from './components/SelectAccountGroup'
import { CustomPrivateAccountSelect } from './components/SelectPrivateAccount'
import { t } from 'i18next'
import { FC } from 'react'

interface PolicyManagementSearchBarProps {
	form: any
	onSearch: (values: any) => void
	object: APPLICABLE_OBJECTS
	setObject: (obj: APPLICABLE_OBJECTS) => void
	searchValue: any
	setSearchValue: (val: any) => void
	triggerListAccountGroup: any
	listAccountGroup: any
	triggerListAccount: any
	listAccount: any
	onClearSearch: (field: string) => void
	handleSelectMethod: (values: number[] | string, status?: string) => void
	onAdd: () => void
	trans: any
	policyManagementType?: POLICY_MANAGEMENT_TYPE
	setPolicyManagementType?: (type: POLICY_MANAGEMENT_TYPE) => void
}

const PolicyManagementSearchBar: FC<PolicyManagementSearchBarProps> = ({
	form,
	onSearch,
	object,
	setObject,
	searchValue,
	setSearchValue,
	triggerListAccountGroup,
	listAccountGroup,
	triggerListAccount,
	listAccount,
	onClearSearch,
	handleSelectMethod,
	onAdd,
	trans,
	policyManagementType,
	setPolicyManagementType
}) => {
	return (
		<Form
			onFinish={onSearch}
			form={form}
			layout='vertical'
		>
			<Row gutter={16}>
				<Col>
					<Form.Item
						name='depositMethod'
						label={trans`policy-management.payment.withDrawBank`}
					>
						<CustomPaymentMethod
							module={POLICY_MANAGEMENT_TYPE.WITHDRAW}
							defaultMethod='search'
							handleSelectMethod={handleSelectMethod}
						/>
					</Form.Item>
				</Col>
				<Col>
					<Form.Item
						name='applicableObject'
						initialValue={APPLICABLE_OBJECTS.ALL}
						label={trans`policy-management.payment.applicableObject`}
					>
						<Select
							onChange={(value) => {
								setObject(value)
								form.resetFields(['accountNumber', 'accountGroup'])
							}}
							style={{ minWidth: 190 }}
							options={[{
								value: APPLICABLE_OBJECTS.ALL,
								label: t`policy-management.payment.all`
							}, ...applicableObjects]}
						/>
					</Form.Item>
				</Col>
				{[
					APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
					APPLICABLE_OBJECTS.ACCOUNT_GROUP
				].includes(object) && (
					<Col>
						{object === APPLICABLE_OBJECTS.ACCOUNT_GROUP ? (
							<Form.Item
								name='accountGroup'
								label={trans`policy-management.payment.selectAccountGroup`}
							>
								<CustomAccountGroupSelect
									mode='multiple'
									listAccountGroup={listAccountGroup}
									setSearchValue={setSearchValue}
									searchInput={searchValue}
									placeholder={trans`policy-management.eWalletTransferMoneyManagement.placeholders.accountGroup`.toString()}
									triggerFunction={triggerListAccountGroup}
									onClearSearch={onClearSearch}
								/>
							</Form.Item>
						) : (
							<Form.Item
								name='accountNumber'
								label={trans`policy-management.payment.inputAccount`}
							>
								<CustomPrivateAccountSelect
									mode='multiple'
									listAccount={listAccount}
									setSearchValue={setSearchValue}
									searchInput={searchValue}
									placeholder={trans`policy-management.payment.accountNumberPlaceholder`.toString()}
									triggerFunction={triggerListAccount}
									onClearSearch={onClearSearch}
								/>
							</Form.Item>
						)}
					</Col>
				)}
				<Col>
					<Form.Item
						name='policyManagementType'
						label={trans`policy-management.payment.policyManagementType.title`}
						initialValue={policyManagementType}
					>
						<Select
							onChange={(value) => {
								setPolicyManagementType?.(value)
							}}
							options={Object.values(POLICY_MANAGEMENT_TYPE).map((type) => ({
								value: type,
								label: trans(`policy-management.payment.policyManagementType.${type}`)
							}))}
						/>
					</Form.Item>
				</Col>
			</Row>
			<Row
				justify='end'
				style={{ marginBottom: '18px' }}
				gutter={16}
			>
				<Col>
					<Button
						icon={<SearchOutlined />}
						htmlType='submit'
						type='primary'
					>{trans`policy-management.payment.search`}</Button>
				</Col>
				<Col>
					<ButtonAdd
						module='withdraw_money'
						type='primary'
						onClick={onAdd}
						label={trans`policy-management.payment.establish`.toString()}
					>{trans`policy-management.payment.establish`}</ButtonAdd>
				</Col>
			</Row>
		</Form>
	)
}

export default PolicyManagementSearchBar 
