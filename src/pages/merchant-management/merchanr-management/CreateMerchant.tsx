import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormInput, FormSelect, FormDatePicker, FormTextArea, FormUploadCombined } from '@components/form'
import { ButtonComponent, CardComponent } from '@components/index'
import { ArrowLeftOutlined, EditOutlined, UserOutlined, ApartmentOutlined, InfoCircleOutlined, FileDoneOutlined } from '@components/icons'

interface MerchantFormData {
  // Section 1: Account Login Info
  username: string
  phoneNumber: string

  // Section 2: Business Information
  merchantLogo: any
  merchantName: string
  merchantType: string
  taxCode: string
  businessType: string
  businessEmail: string
  adminEmail: string
  address: string

  // Section 3: Representative Information
  fullName: string
  position: string
  idNumber: string
  issueDate: string
  issuePlace: string

  // Section 4: Legal Documents
  businessLicense: any
  idCardCCCD: any
  registrationCertificate: any
}

const CreateMerchant = () => {
  const { control, handleSubmit } = useForm<MerchantFormData>()

  const merchantTypeOptions = [
    { label: 'Doanh nghiệp', value: 'business' },
    { label: 'Hộ kinh doanh', value: 'household' },
  ]

  const businessTypeOptions = [
    { label: 'F&B (Ăn uống)', value: 'fnb' },
    { label: 'Thời trang', value: 'fashion' },
    { label: 'Điện tử', value: 'electronics' },
  ]

  const positionOptions = [
    { label: 'Giám đốc', value: 'director' },
    { label: 'Chủ hộ', value: 'owner' },
  ]

  const onSubmit = (data: MerchantFormData) => {
    console.log('Form data:', data)
  }

  const handleSaveAndCreateMerchant = () => {
    handleSubmit(onSubmit)()
  }

  const handleSaveDraft = () => {
    console.log('Save draft')
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
         <ButtonComponent icon={<ArrowLeftOutlined />} content="Quay lại" type='default'/>
        </div>
        <div className="flex gap-3">
          <ButtonComponent
            type="default"
            content="Lưu nháp"
            onClick={handleSaveDraft}
          />
          <ButtonComponent
            type="primary"
            content="Xác nhận & Tạo tài khoản"
            onClick={handleSaveAndCreateMerchant}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Account Login Information */}
        <CardComponent className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <EditOutlined className="text-blue text-lg" />
            <h2 className="text-lg font-semibold text-blue">
              I. Thông tin tài khoản đăng nhập
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                control={control}
                name="username"
                label={
                  <span>
                    Email đăng ký (Username) <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Email nhân đăng ký mã khẩu"
              />
              <div className="mt-2 flex justify-start items-center gap-2">
                <InfoCircleOutlined className="text-gray-400 text-[14px]" />
                <span className="text-[12px] text-gray-500">
                  Mật khẩu sẽ được hệ thống tự động tạo và gửi về Email sau khi hoàn tất
                </span>
              </div>
            </div>
            <div>
              <FormInput
                control={control}
                name="phoneNumber"
                 label={
                  <span>
                    Email đăng ký (Username) <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Số điện thoại chính"
              />
            </div>
          </div>
        </CardComponent>

        {/* Section 2: Business Identification */}
        <CardComponent className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <ApartmentOutlined className="text-blue text-lg" />
            <h2 className="text-lg font-semibold text-blue">
              II. Định danh doanh nghiệp / Hộ kinh doanh
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2">
                <span className="font-medium">Logo Merchant</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="cursor-pointer text-center">
                    <div className="text-2xl text-gray-400">📷</div>
                  </div>
                </div>
                <ButtonComponent
                  type="default"
                  content="Tải Logo lên"
                  size="small"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  control={control}
                  name="merchantName"
                  label={
                    <span>
                      Tên Merchant <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="Tên thương hiệu/Hộ Bà"
                />
              </div>

              <div>
                <FormSelect
                  control={control}
                  name="merchantType"
                  label={
                    <span>
                      Loại Merchant <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="Doanh nghiệp"
                  options={merchantTypeOptions}
                />
              </div>

              <div>
                <FormInput
                  control={control}
                  name="taxCode"
                  label={
                    <span>
                      Mã số thuế <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="Mã số thuế hoặc Mã số DN"
                />
              </div>

              <div>
                <FormSelect
                  control={control}
                  name="businessType"
                  label={
                    <span>
                      Loại hình kinh doanh <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="F&B (Ăn uống)"
                  options={businessTypeOptions}
                />
              </div>

              <div>
                <FormInput
                  control={control}
                  name="businessEmail"
                  label={
                    <span>
                      Email nhận đối soát <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="Email nhận đối soát doanh thu"
                />
              </div>

              <div>
                <FormInput
                  control={control}
                  name="adminEmail"
                  label={
                    <span>
                      Email nhận hóa đơn <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="Email nhận hóa đơn điện tử"
                />
              </div>
            </div>

            <div>
              <FormTextArea
                control={control}
                name="address"
                label={
                  <span>
                    Địa chỉ trụ sở <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Địa chỉ chính xác theo GPKD"
                rows={3}
              />
            </div>
          </div>
        </CardComponent>

        {/* Section 3: Representative Information */}
        <CardComponent className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <UserOutlined className="text-blue text-lg" />
            <h2 className="text-lg font-semibold text-blue">
              III. Thông tin người đại diện
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                control={control}
                name="fullName"
                label={
                  <span>
                    Họ và tên <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Tên người đại diện pháp luật"
              />
            </div>

            <div>
              <FormSelect
                control={control}
                name="position"
                label={
                  <span>
                    Chức vụ <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Vị dụ: Giám đốc, Chủ hộ"
                options={positionOptions}
              />
            </div>

            <div>
              <FormInput
                control={control}
                name="idNumber"
                label={
                  <span>
                    Số CCCD <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Nhập 12 số CCCD"
              />
            </div>

            <div>
              <FormDatePicker
                control={control}
                name="issueDate"
                label={
                  <span>
                    Ngày hết hạn CCCD <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="dd / mm / yyyy"
              />
            </div>

            <div>
              <FormInput
                control={control}
                name="issuePlace"
                label={
                  <span>
                    SĐT nhân viên OTP <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Số tuyệt hiện giúp dịch"
              />
            </div>
          </div>
        </CardComponent>

        {/* Section 4: Legal Documents */}
        <CardComponent className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <FileDoneOutlined className="text-blue text-lg" />
            <h2 className="text-lg font-semibold text-blue">
              IV. Hồ sơ pháp lý đính kèm
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="mb-2">
                <span className="font-medium">
                  Đăng ký kinh doanh <span className="text-red-500">*</span>
                </span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm text-blue">Tải file lên</div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2">
                <span className="font-medium">
                  Ảnh CCCD (2 mặt) <span className="text-red-500">*</span>
                </span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm text-blue">Tải file lên</div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2">
                <span className="font-medium">
                  Hợp đồng Merchant <span className="text-red-500">*</span>
                </span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-sm text-blue">Tải file lên</div>
              </div>
            </div>
          </div>
        </CardComponent>
      </form>
    </div>
  )
}

export default CreateMerchant