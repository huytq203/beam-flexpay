import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, useWatch } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { PolicyType } from '../../schemas/FeeManagement.schema'
import { statusType } from '../../constants/FeeManagement.constant'
import { FeePolicyFields } from '../FeePolicyFields'

interface HarnessProps {
  lockedFeeDomain?: string
}

const DomainProbe = ({
  control
}: {
  control: ReturnType<typeof useForm<PolicyType>>['control']
}) => {
  const feeDomain = useWatch({ control, name: 'feeDomain' })
  return <span data-testid='feeDomain'>{feeDomain}</span>
}

const StatusProbe = ({
  control
}: {
  control: ReturnType<typeof useForm<PolicyType>>['control']
}) => {
  const status = useWatch({ control, name: 'status' })
  return <span data-testid='status'>{status}</span>
}

const PriorityProbe = ({
  control
}: {
  control: ReturnType<typeof useForm<PolicyType>>['control']
}) => {
  const priority = useWatch({ control, name: 'priority' })
  return <span data-testid='priority'>{priority}</span>
}

const Harness = ({ lockedFeeDomain }: HarnessProps) => {
  const { control, setValue } = useForm<PolicyType>({
    defaultValues: { feeDomain: '', status: statusType.INIT } as PolicyType
  })
  return (
    <>
      <DomainProbe control={control} />
      <StatusProbe control={control} />
      <PriorityProbe control={control} />
      <FeePolicyFields
        control={control}
        setValue={setValue}
        isCreate
        isEdit={false}
        lockedFeeDomain={lockedFeeDomain}
      />
    </>
  )
}

const renderFields = (props: HarnessProps = {}) =>
  render(
    <MemoryRouter>
      <Harness {...props} />
    </MemoryRouter>
  )

describe('FeePolicyFields — miền phí theo màn', () => {
  it('cho chọn miền phí ở màn không khoá', () => {
    renderFields()
    expect(screen.getByText('Phí domain')).toBeInTheDocument()
    expect(screen.queryByText('Ngân hàng')).not.toBeInTheDocument()
  })

  it('màn phí ngân hàng hiển thị miền phí bằng input bị vô hiệu hóa', () => {
    renderFields({ lockedFeeDomain: 'BANK' })

    expect(screen.getByLabelText('Phí domain')).toBeDisabled()
    // Hiện nhãn người đọc được, không phải mã enum — khớp cột "Phí domain" ở bảng.
    expect(screen.getByLabelText('Phí domain')).toHaveValue('Bank')
  })

  it('tự gán feeDomain của màn vào form để không lưu nhầm miền', () => {
    renderFields({ lockedFeeDomain: 'BANK' })
    expect(screen.getByTestId('feeDomain')).toHaveTextContent('BANK')
  })

  it('không tự gán miền phí khi màn không khoá', () => {
    renderFields()
    expect(screen.getByTestId('feeDomain')).toHaveTextContent('')
  })

  it('vẫn giữ bước chọn chiều tiền ở màn khoá miền', () => {
    renderFields({ lockedFeeDomain: 'BANK' })
    expect(screen.getByText('Chiều tiền')).toBeInTheDocument()
    expect(screen.getByText('Đầu ra')).toBeInTheDocument()
  })

  it('mặc định trạng thái khởi tạo và khóa trường khi tạo mới', () => {
    renderFields()

    expect(screen.getByTestId('status')).toHaveTextContent('INIT')
    expect(screen.getByLabelText(/Trạng thái hoạt động/)).toBeDisabled()
  })

  it('chọn mức ưu tiên bằng nhãn và lưu giá trị số tương ứng', async () => {
    const user = userEvent.setup()
    renderFields()

    await user.click(screen.getByLabelText(/Mức độ ưu tiên/))

    expect(await screen.findByTitle('Rất cao')).toBeInTheDocument()
    expect(screen.getByTitle('Cao')).toBeInTheDocument()
    expect(screen.getByTitle('Trung bình')).toBeInTheDocument()
    expect(screen.getByTitle('Thấp')).toBeInTheDocument()

    await user.click(screen.getByTitle('Trung bình'))
    expect(screen.getByTestId('priority')).toHaveTextContent('3')
  })
})
