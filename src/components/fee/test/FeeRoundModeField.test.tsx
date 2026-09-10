import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { roundModeLabel } from '@pages/fee-management-v4/fee-management/constants/FeeManagement.constant'
import { FeeRoundModeField } from '../FeeRoundModeField'

interface FormShape {
  roundMode: string
}

const OPTIONS = mapEnumToSelectOptions(roundModeLabel)

const Harness = ({ roundMode }: { roundMode: string }) => {
  const { control } = useForm<FormShape>({ defaultValues: { roundMode } })
  return <FeeRoundModeField control={control} name='roundMode' options={OPTIONS} />
}

const renderField = (roundMode: string) => render(<Harness roundMode={roundMode} />)

describe('FeeRoundModeField', () => {
  it('không dựng ô chọn khi dùng công thức mặc định', () => {
    renderField('UP')

    expect(screen.getByText('Công thức làm tròn')).toBeInTheDocument()
    expect(screen.getByText(/Làm tròn lên/)).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('bản ghi mới chưa có giá trị cũng không dựng ô chọn', () => {
    renderField('')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('trả lại ô chọn khi bản ghi cũ lệch chuẩn, để sửa được', () => {
    renderField('HALF_UP')

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Làm tròn gần nhất, nửa lên')).toBeInTheDocument()
  })

  it('cảnh báo rõ khi bản ghi lệch chuẩn — không âm thầm đổi số tiền', () => {
    renderField('FLOOR')

    expect(
      screen.getByText(/Bản ghi này đang lệch chuẩn/)
    ).toBeInTheDocument()
  })

  it.each(['DOWN', 'HALF_DOWN', 'CEILING', 'FLOOR'])(
    'giữ nguyên công thức cũ %s thay vì ép về mặc định',
    (mode) => {
      renderField(mode)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    }
  )
})
