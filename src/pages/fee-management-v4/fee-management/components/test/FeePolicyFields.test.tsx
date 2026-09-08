import { render, screen } from '@testing-library/react'
import { useForm, useWatch } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { PolicyType } from '../../schemas/FeeManagement.schema'
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

const Harness = ({ lockedFeeDomain }: HarnessProps) => {
  const { control, setValue } = useForm<PolicyType>({
    defaultValues: { feeDomain: '' } as PolicyType
  })
  return (
    <>
      <DomainProbe control={control} />
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
    expect(screen.getByText('Phí miền')).toBeInTheDocument()
    expect(screen.queryByText('Ngân hàng')).not.toBeInTheDocument()
  })

  it('màn phí ngân hàng hiển thị miền phí bằng input bị vô hiệu hóa', () => {
    renderFields({ lockedFeeDomain: 'BANK' })

    expect(screen.getByLabelText('Phí miền')).toBeDisabled()
    // Hiện nhãn người đọc được, không phải mã enum — khớp cột "Phí miền" ở bảng.
    expect(screen.getByLabelText('Phí miền')).toHaveValue('Bank')
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
})
