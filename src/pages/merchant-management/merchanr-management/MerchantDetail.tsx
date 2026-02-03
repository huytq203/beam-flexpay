import React from 'react'
import {
  ArrowLeftOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@components/icons'
import { ButtonComponent, CardComponent, DialogModal, ModalComponent } from '@components/index'
import { Alert } from 'antd'
import { FormInput, FormSelect, FormTextArea } from '@components/form'
import { useForm } from 'react-hook-form'

const MerchantDetail = () => {
  const {control}=useForm()
  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm'>
        <div className='flex items-center gap-4'>
          <ButtonComponent
            type='text'
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
          />
          <div>
            <div className='text-sm text-gray-500'>Tài khoản:</div>
            <div className='text-lg font-semibold'>098****456</div>
          </div>
        </div>

        <div className='flex gap-3'>
          <ButtonComponent
            type='default'
            icon={<MailOutlined />}
            content='Gửi thông báo (SMS/Email)'
          />
          <ButtonComponent
            type='primary'
            variant='outlined'
            content='Hỗ trợ nhập '
          />
          <ButtonComponent
            type='primary'
            icon={<CheckCircleOutlined />}
            content='Phê duyệt hồ sơ'
          />
          <ButtonComponent
            danger

            type='default'
            icon={<CloseCircleOutlined />}
            content='Từ chối'
          />
        </div>
      </div>

      <Alert
        type='error'
        showIcon
        className='mb-6'
        message={
          <div>
            <strong>Hồ sơ chưa hoàn thiện (Thiếu những tài liệu)</strong>
          </div>
        }
        description={
          <ul className='list-disc list-inside space-y-1 mt-2'>
            <li>
              Lorem ipsum dolor sit amet consectetur adipisicing elit (ưa daanh)
            </li>
            <li>Chưa cung cấp thông tin người đại diện và tài kế biz</li>
            <li>
              Hệ thống tìm thấy nội dung không hợp lệ (CCCD và ảnh chân dung)
            </li>
          </ul>
        }
      />

      <CardComponent
        title='Thông tin định danh'
        className='mb-6'
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          <div

          >
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                MÃ ĐỊNH DANH (ID)
              </div>
              <div className='font-medium'>MC-REG-2020-88</div>
            </div>
          </div>
          <div

          >
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                SỐ ĐIỆN THOẠI ĐĂNG KÝ
              </div>
              <div className='font-medium'>098****456</div>
            </div>
          </div>
          <div

          >
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                TÊN MERCHANT / TRỤ SỞ HIỆU
              </div>
              <div className='font-medium text-gray-400'>Chưa cập nhật</div>
            </div>
          </div>
          <div

          >
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                LOẠI HÌNH KINH DOANH
              </div>
              <div className='font-medium text-gray-400'>Chưa cập nhật</div>
            </div>
          </div>
          <div

          >
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                LĨNH VỰC KINH DOANH
              </div>
              <div className='font-medium text-gray-400'>Chưa cập nhật</div>
            </div>
          </div>
          <div

          >
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                NHẬT TẠO TÀI KHOẢN
              </div>
              <div className='font-medium'>18/01/2026 10:20</div>
            </div>
          </div>
        </div>
      </CardComponent>

      <CardComponent title='Hồ sơ hình ảnh & Pháp lý'>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          <div>
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                CCCD/Mã số thuế
              </div>
              <div className='font-medium'>MC-REG-2020-88</div>
            </div>
          </div>
          <div>
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                Ngày cấp
              </div>
              <div className='font-medium'>098****456</div>
            </div>
          </div>
          <div>
            <div className='mb-4'>
              <div className='text-gray-500 text-sm mb-1'>
                Người đại diện
              </div>
              <div className='font-medium text-gray-400'>Chưa cập nhật</div>
            </div>
          </div>
          <div className='col-span-3'>
            <div className='mb-4 '>
              <div className='text-gray-500 text-sm mb-1'>
                Nơi cấp
              </div>
              <div className='font-medium '>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Porro dolorum assumenda, dolore delectus accusantium quidem corporis ullam itaque molestias libero consectetur esse quibusdam fugiat facere animi saepe ut. Corporis, ut.</div>
            </div>
          </div>


        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
          <div>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50'>
              <div className='text-gray-400 mb-2'>
                <svg
                  className='mx-auto h-12 w-12'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                  />
                </svg>
              </div>
              <div className='text-sm text-gray-500'>Giấy phép kinh doanh</div>
            </div>
          </div>
          <div
          >
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50'>
              <div className='text-gray-400 mb-2'>
                <svg
                  className='mx-auto h-12 w-12'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2'
                  />
                </svg>
              </div>
              <div className='text-sm text-gray-500'>CCCD đại diện</div>
            </div>
          </div>
          <div

          >
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50'>
              <div className='text-gray-400 mb-2'>
                <svg
                  className='mx-auto h-12 w-12'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div className='text-sm text-gray-500'>
                Ảnh chân dung đại diện
              </div>
            </div>
          </div>
        </div>
      </CardComponent>
      <DialogModal title={'Xác nhận phê duyệt'}
        content={
        <>
          <span>Bạn đang thực hiện phê duyệt cho Merchant <strong>Hộ kinh doanh Trần Quang Huy</strong>.</span>
          <div className="">
            <span>Sau khi phê duyệt:</span>
            <ul className='my-3 pl-3 list-disc list-inside'>
              <li>Hệ thống sẽ tự động kích hoạt tài khoản Merchant</li>
              <li>Khởi tạo ví tài khoản và các cấu hình phí mặc định</li>
              <li>Gửi email thông báo "Chào mừng" tới Merchant</li>
            </ul>
          </div>
        </>
        }
        onCancel={() => { }}
        onOk={() => { }}
        open={false} />


        <DialogModal title={'Từ chối phê duyệt'}
        content={
        <>
          <span>Vui lòng nhập lý do từ chối. Thông báo này sẽ gửi trực tiếp đến Merchant để họ cập nhật lại hồ sơ.</span>
          <div className="my-3">
            <FormSelect control={control} name='' options={[]} label={<span className='text-gray-400 font-medium'>Lý do từ chối (Bắt buộc):</span>}/>
            <FormTextArea control={control} name='' options={[]} label={<span className='text-gray-400 font-medium'>Ghi chú:</span>} placeholder='Nhập ghi chú...'/>
          </div>
        </>
        }
        onCancel={() => { }}
        onOk={() => { }}
        open={false} />
    </div>
  )
}

export default MerchantDetail
