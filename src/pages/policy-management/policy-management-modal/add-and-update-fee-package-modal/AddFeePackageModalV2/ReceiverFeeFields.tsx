import { Col, Form, InputNumber, Row } from 'antd'
import { moneyInputFormatter, blockArrowValue, blockLetterDecimal } from '@utils/helperFunctions'
import { t } from 'i18next'
import { POLICY_MANAGEMENT_TYPE } from '@type/policyManagement'

interface ReceiverFeeFieldsProps {
	type: 'FLEXIBLE' | 'FIXED'
	form: any
	module?: POLICY_MANAGEMENT_TYPE
}

export const ReceiverFeeFields = ({ type, form, module }: ReceiverFeeFieldsProps) => {
	// Hide receiver fields for certain modules
	if (
		module === POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY ||
		module === POLICY_MANAGEMENT_TYPE.WITHDRAW
	) {
		return null
	}

	if (type === 'FLEXIBLE') {
		return (
			<>
				<div style={{ fontWeight: '600', marginBottom: '10px' }}>
					{t`policy-management.depositManagement.modalContent.tabelModal.onReceiver`}
				</div>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name='receiverFlexibleFee'
							label={t`policy-management.depositManagement.modalContent.tabelModal.variableFee`}
							rules={[
								{
									required: true,
									message: t`policy-management.depositManagement.validateRequired`.toString()
								}
							]}
						>
							<InputNumber
								type='text'
								inputMode='numeric'
								style={{ width: '100%' }}
								formatter={(value) => {
									if (value) {
										if ((value as number) > 100) {
											form.setFieldsValue({
												receiverFlexibleFee: 100
											})
											return '100%'
										}
									}
									return `${value}%` ? `${value}%`.toString() : ''
								}}
								onKeyDown={blockArrowValue}
								onKeyPress={blockLetterDecimal}
								placeholder={t`policy-management.depositManagement.modalContent.feePackage.variableFeePlaceholder`.toString()}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='receiverFeeMin'
							label={t`policy-management.depositManagement.modalContent.tabelModal.minFee`}
							rules={[
								({ getFieldValue }) => ({
									validator(_, value) {
										if (value > getFieldValue('receiverFeeMax') && value) {
											form.setFields([{ name: 'receiverFeeMax', errors: [] }])
											return Promise.reject(
												t`policy-management.depositManagement.minFeeValidate`
											)
										} else {
											form.setFields([{ name: 'receiverFeeMax', errors: [] }])
											return Promise.resolve()
										}
									}
								})
							]}
						>
							<InputNumber
								type='text'
								inputMode='numeric'
								style={{ width: '100%' }}
								formatter={moneyInputFormatter}
								onKeyDown={blockArrowValue}
								onKeyPress={blockLetterDecimal}
								placeholder={t`policy-management.depositManagement.modalContent.feePackage.minFeePlaceholder`.toString()}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='receiverFeeMax'
							label={t`policy-management.depositManagement.modalContent.tabelModal.maxFee`}
							rules={[
								({ getFieldValue }) => ({
									validator(_, value) {
										if (value < getFieldValue('receiverFeeMin') && value) {
											form.setFields([{ name: 'receiverFeeMin', errors: [] }])
											return Promise.reject(
												t`policy-management.depositManagement.minFeeValidate`
											)
										} else {
											form.setFields([{ name: 'receiverFeeMin', errors: [] }])
											return Promise.resolve()
										}
									}
								})
							]}
						>
							<InputNumber
								type='text'
								inputMode='numeric'
								style={{ width: '100%' }}
								formatter={moneyInputFormatter}
								onKeyDown={blockArrowValue}
								onKeyPress={blockLetterDecimal}
								placeholder={t`policy-management.depositManagement.modalContent.feePackage.maxFeePlaceholder`.toString()}
							/>
						</Form.Item>
					</Col>
				</Row>
			</>
		)
	}

	// FIXED
	return (
		<>
			<div style={{ fontWeight: '600', marginBottom: '10px' }}>
				{t`policy-management.depositManagement.modalContent.tabelModal.onReceiver`}
			</div>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item
						name='receiverFixedFee'
						label={t`policy-management.depositManagement.modalContent.tabelModal.fixedFee`}
						rules={[
							{
								required: true,
								message: t`policy-management.depositManagement.validateRequired`.toString()
							},
							() => ({
								validator(_, value) {
									if (value < 0 && value !== null) {
										return Promise.reject(
											t('policy-management.common.biggerThanZeroValidate').toString()
										)
									} else {
										return Promise.resolve()
									}
								}
							})
						]}
					>
						<InputNumber
							type='text'
							inputMode='numeric'
							style={{ width: '100%' }}
							formatter={moneyInputFormatter}
							onKeyDown={blockArrowValue}
							onKeyPress={blockLetterDecimal}
							placeholder={t`policy-management.depositManagement.modalContent.feePackage.fixedFeePlaceholder`.toString()}
						/>
					</Form.Item>
				</Col>
			</Row>
		</>
	)
}