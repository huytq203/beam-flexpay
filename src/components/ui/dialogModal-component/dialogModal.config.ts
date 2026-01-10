import { ButtonProps } from 'antd';

export type ModeAction = 'DELETE' | 'CONFIRM' | 'WARNING';

export const MODE_CONFIG: Record<ModeAction, {
  okText: string;
  cancelText: string;
  okButtonProps: ButtonProps;
}> = {
  CONFIRM: {
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    okButtonProps: { type: 'primary' }
  },
  DELETE: {
    okText: 'Xóa',
    cancelText: 'Hủy',
    okButtonProps: { danger: true, type: 'primary' }
  },
  WARNING: {
    okText: 'Đồng ý',
    cancelText: 'Quay lại',
    okButtonProps: { 
         className: 'bg-yellow-500 border-yellow-500 text-white hover:!bg-yellow-600'
     }
  }
};
