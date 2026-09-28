import React, { ReactNode } from 'react'
import { Modal, Grid } from 'antd'
import { ModalProps } from 'antd'

const { useBreakpoint } = Grid

export type ModeAction = 'DELETE' | 'CONFIRM' | 'WARNING'
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

interface ModalComponentProps extends Omit<ModalProps, 'width'> {
  mode?: ModeAction
  open: boolean
  onOk?: () => void
  onCancel: () => void
  confirmLoading?: boolean
  modalText?: ReactNode
  width?: string | number | Partial<Record<Breakpoint, string | number>>
}
const ModalComponent = ({
  title,
  open,
  onOk,
  onCancel,
  confirmLoading,
  modalText,
  width,
  children,
  ...props
}: ModalComponentProps) => {
  const screens = useBreakpoint()

  const getResponsiveWidth = () => {
    if (!width) return '90%'
    if (typeof width === 'string' || typeof width === 'number') return width

    const breakpointOrder: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
    for (const bp of breakpointOrder) {
      if (screens[bp] && width[bp] !== undefined) {
        return width[bp]
      }
    }

    return (
      width.xs ||
      width.sm ||
      width.md ||
      width.lg ||
      width.xl ||
      width.xxl ||
      '90%'
    )
  }

  return (
    <Modal
      {...props} // Spread tất cả props trước (bao gồm centered)
      title={title || 'title'}
      open={open}
      onOk={onOk}
      centered
      destroyOnHidden
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      width={getResponsiveWidth()}
      styles={{
        ...props.styles, // Merge styles từ props trước
        header: {
          ...props.styles?.header,
          background: 'none'
        },
        content: {
          ...props.styles?.content,
          background: '#fafafa'
        },
        body: {
          ...props.styles?.body,
          maxHeight: props.styles?.body?.maxHeight ?? '70vh',
          overflowY: props.styles?.body?.overflowY ?? 'auto'
        }
      }}
    >
      <div>{children || modalText}</div>
    </Modal>
  )
}

export default ModalComponent
