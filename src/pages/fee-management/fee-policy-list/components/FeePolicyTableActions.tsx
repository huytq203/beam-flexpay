import { Can } from '@/app/permissions'
import { PlusIcon } from '@components/icons'
import { ButtonComponent, ExportCsvButton } from '@components/index'
import { useNavigate } from 'react-router-dom'

interface FeePolicyTableActionsProps {
  onExport: () => void
  exporting: boolean
  exportDisabled: boolean
  /** Màn tạo chính sách: phí đầu ra và phí đầu vào dùng hai form khác nhau. */
  createPath: string
  /** Màn cấp quyền thao tác: Cấu hình phí hoặc Cấu hình phí đầu vào. */
  screen: 'FEE_CONFIG' | 'FEE_INPUT_COST'
}

/** Nút xuất CSV theo bộ lọc đang áp và nút thêm chính sách phí trên thanh công cụ của bảng. */
export const FeePolicyTableActions = ({
  onExport,
  exporting,
  exportDisabled,
  createPath,
  screen
}: FeePolicyTableActionsProps) => {
  const navigate = useNavigate()
  return (
    <>
      <ExportCsvButton
        onExport={onExport}
        loading={exporting}
        disabled={exportDisabled}
        tooltip='File lấy trọn bộ lọc đang áp, không giới hạn theo trang; gồm chính sách phí, bản gán, thành phần phí và các bậc phí.'
      />
      <Can
        screen={screen}
        action='create'
      >
        <ButtonComponent
          htmlType='button'
          type='primary'
          content='Thêm chính sách phí'
          icon={
            <PlusIcon
              size={16}
              weight='bold'
              aria-hidden
            />
          }
          onClick={() => navigate(createPath)}
        />
      </Can>
    </>
  )
}
