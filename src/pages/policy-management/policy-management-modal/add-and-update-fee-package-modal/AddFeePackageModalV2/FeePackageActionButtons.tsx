import { Button, Col, Row } from 'antd'
import { t } from 'i18next'

interface FeePackageActionButtonsProps {
	onCancel: () => void
	isLoading: boolean
}

export const FeePackageActionButtons = ({ onCancel, isLoading }: FeePackageActionButtonsProps) => (
	<Row justify='end' gutter={16}>
		<Col>
			<Button
				className='mr-10'
				onClick={onCancel}
			>
				{t`buttons.cancel`}
			</Button>
		</Col>
		<Col>
			<Button
				loading={isLoading}
				type='primary'
				htmlType='submit'
			>
				{t`buttons.create`}
			</Button>
		</Col>
	</Row>
)