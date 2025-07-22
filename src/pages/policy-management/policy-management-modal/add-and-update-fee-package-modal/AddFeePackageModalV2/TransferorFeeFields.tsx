import { Col, Form, InputNumber, Row } from 'antd'
import { moneyInputFormatter, blockArrowValue, blockLetterDecimal, blockLetterValue } from '@utils/helperFunctions'
import { t } from 'i18next'

interface TransferorFeeFieldsProps {
	type: 'FLEXIBLE' | 'FIXED'
	form: any
}

export const TransferorFeeFields = ({ type, form }: TransferorFeeFieldsProps) => {
	if (type === 'FIXED') {
		return (
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item
						labelAlign='left'
						name='transferorFixedFee'
						label={t`policy-management.depositManagement.modalContent.tableModal.fixedFee`}
						dependencies={['type']}
						hasFeedback
						rules={[
							{
								required: true,
								message: t`policy-management.common.validation.noTransactionFixedFeeValidate`.toString()
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
		)
	}

	// FLEXIBLE
	return (
		<Row gutter={16}>
			<Col span={12}>
				<Form.Item
					name='transferorFeeMin'
					initialValue={undefined}
					label={t`policy-management.depositManagement.modalContent.tableModal.minFee`}
					rules={[
						({ getFieldValue }) => ({
							validator(_, value) {
								if (value > getFieldValue('transferorFeeMax') && value) {
									form.setFields([{ name: 'transferorFeeMax', errors: [] }])
									return Promise.reject(
										t`policy-management.depositManagement.minFeeValidate`
									)
								} else {
									form.setFields([{ name: 'transferorFeeMax', errors: [] }])
									return Promise.resolve()
								}
							}
						})
					]}
				>
					<InputNumber
						type='text'
						inputMode='numeric'
						defaultValue={undefined}
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
					name='transferorFeeMax'
					label={t`policy-management.depositManagement.modalContent.tableModal.maxFee`}
					rules={[
						({ getFieldValue }) => ({
							validator(_, value) {
								if (value < getFieldValue('transferorFeeMin') && value) {
									form.setFields([{ name: 'transferorFeeMin', errors: [] }])
									return Promise.reject(
										t`policy-management.depositManagement.maxFeeValidate`
									)
								} else {
									form.setFields([{ name: 'transferorFeeMin', errors: [] }])
									return Promise.resolve()
								}
							}
						})
					]}
				>
					<InputNumber
						type='text'
						inputMode='numeric'
						defaultValue={undefined}
						style={{ width: '100%' }}
						formatter={moneyInputFormatter}
						onKeyDown={blockArrowValue}
						onKeyPress={blockLetterDecimal}
						placeholder={t`policy-management.depositManagement.modalContent.feePackage.maxFeePlaceholder`.toString()}
					/>
				</Form.Item>
			</Col>
		</Row>
	)
}