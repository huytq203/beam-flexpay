import { Col, Form, InputNumber, Row } from 'antd'
import { moneyInputFormatter, blockArrowValue, blockLetterDecimal } from '@utils/helperFunctions'
import { t } from 'i18next'

interface TransactionRangeFieldsProps {
	form: any
}

export const TransactionRangeFields = ({ form }: TransactionRangeFieldsProps) => (
	<Row gutter={16}>
		<Col span={12}>
			<Form.Item
				name='transactionFrom'
				label={t`policy-management.depositManagement.modalContent.tabelModal.transactionFrom`}
				dependencies={['transactionTo']}
				rules={[
					({ getFieldValue }) => ({
						validator(_, value) {
							const transactionTo = getFieldValue('transactionTo') || 0
							value = value || 0
							if (value > transactionTo) {
								return Promise.reject(
									t`policy-management.common.validation.transactionFromBiggerValidate`
								)
							} else if (value === transactionTo) {
								return Promise.reject(
									t`policy-management.common.validation.transactionToSmallerValidate`
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
					onKeyPress={blockLetterDecimal}
					onKeyDown={blockArrowValue}
					placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionFromPlaceholder`.toString()}
				/>
			</Form.Item>
		</Col>
		<Col span={12}>
			<Form.Item
				name='transactionTo'
				label={t`policy-management.depositManagement.modalContent.tabelModal.transactionTo`}
				rules={[
					({ getFieldValue }) => ({
						validator(_, value) {
							const transactionFrom = getFieldValue('transactionFrom') || 0
							value = value || 0
							if (value < transactionFrom) {
								return Promise.reject(
									t`policy-management.depositManagement.transactionToValidate`
								)
							} else if (value === transactionFrom) {
								return Promise.reject(
									t`policy-management.common.validation.transactionFromBiggerValidate`
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
					onKeyPress={blockLetterDecimal}
					placeholder={t`policy-management.depositManagement.modalContent.feePackage.transactionToPlaceholder`.toString()}
				/>
			</Form.Item>
		</Col>
	</Row>
)