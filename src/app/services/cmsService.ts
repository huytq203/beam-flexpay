import {
  CustomerChangePasswordApiArg,
  CustomerChangePasswordApiResponse,
  CustomerCreateApiArg,
  CustomerCreateApiResponse,
  CustomerDeleteApiArg,
  CustomerDeleteApiResponse,
  CustomerFindAllApiArg,
  CustomerFindAllApiResponse,
  CustomerFindOneApiArg,
  CustomerFindOneApiResponse,
  CustomerFindOneByAccountNumberApiArg,
  CustomerFindOneByAccountNumberApiResponse,
  CustomerGetCustomerByAccountNumberApiArg,
  CustomerGetCustomerByAccountNumberApiResponse,
  CustomerGetExportCsvApiArg,
  CustomerGetExportCsvApiResponse,
  CustomerGetExportExcelApiArg,
  CustomerGetExportExcelApiResponse,
  CustomerGetSecurityMethodApiArg,
  CustomerGetSecurityMethodApiResponse,
  CustomerToggleActiveApiArg,
  CustomerToggleActiveApiResponse,
  CustomerUpdateApiArg,
  CustomerUpdateApiResponse,
  CustomerVerificationDeleteVerifyApiArg,
  CustomerVerificationDeleteVerifyApiResponse,
  CustomerVerificationFindAllApiArg,
  CustomerVerificationFindAllApiResponse,
  CustomerVerificationFindOneByIdApiArg,
  CustomerVerificationFindOneByIdApiResponse,
  CustomerVerificationUpdateApiArg,
  CustomerVerificationUpdateApiResponse,
  DashboardOverviewApiArg,
  DashboardOverviewApiResponse,
  DashboardSendSmsApiArg,
  DashboardSendSmsApiResponse,
  DashboardStatisticApiArg,
  DashboardStatisticApiResponse,
  FreezeBalanceHistoryCreateApiArg,
  FreezeBalanceHistoryCreateApiResponse,
  FreezeBalanceHistoryFindAllApiArg,
  FreezeBalanceHistoryFindAllApiResponse,
  FreezeBalanceHistoryOpenFreezeBalanceApiArg,
  FreezeBalanceHistoryOpenFreezeBalanceApiResponse,
  OtpDataDto,
  PaymentOrderFindAllApiArg,
  PaymentOrderFindAllApiResponse,
  PaymentOrderFindOneApiArg,
  PaymentOrderFindOneApiResponse,
  PaymentOrderGetExportExcelApiArg,
  PaymentOrderGetExportExcelApiResponse,
  PaymentOrderUpdateApiArg,
  PaymentOrderUpdateApiResponse,
  PaymentPartnerCreateApiArg,
  PaymentPartnerCreateApiResponse,
  PaymentPartnerDeleteApiArg,
  PaymentPartnerDeleteApiResponse,
  PaymentPartnerFindAllApiArg,
  PaymentPartnerFindAllApiResponse,
  PaymentPartnerFindOneApiArg,
  PaymentPartnerFindOneApiResponse,
  PaymentPartnerGetPartnerOderDetailApiArg,
  PaymentPartnerGetPartnerOderDetailApiResponse,
  PaymentPartnerUpdateApiArg,
  PaymentPartnerUpdateApiResponse,
  PaymentServiceCreateApiArg,
  PaymentServiceCreateApiResponse,
  PaymentServiceDeleteApiArg,
  PaymentServiceDeleteApiResponse,
  PaymentServiceFindAllApiArg,
  PaymentServiceFindAllApiResponse,
  PaymentServiceFindOneApiArg,
  PaymentServiceFindOneApiResponse,
  PaymentServiceUpdateApiArg,
  PaymentServiceUpdateApiResponse,
  RefundFindOneApiArg,
  RefundFindOneApiResponse,
  RefundGetExportCsvApiArg,
  RefundGetExportCsvApiResponse,
  RefundGetRefundMoneyApiArg,
  RefundGetRefundMoneyApiResponse,
  RefundRefundApiArg,
  RefundRefundApiResponse,
  ReportGetMetricAccountRegisterApiArg,
  ReportGetMetricAccountRegisterApiResponse,
  ReportGetMetricDeviceApiArg,
  ReportGetMetricDeviceApiResponse,
  ReportGetMetricOfAccountApiArg,
  ReportGetMetricOfAccountApiResponse,
  ReportGetMetricProvinceApiArg,
  ReportGetMetricProvinceApiResponse,
  SystemFeeManagementCreatePolicyPaymentWithBankCardApiArg,
  SystemFeeManagementCreatePolicyPaymentWithBankCardApiResponse,
  SystemFeeManagementCreatePolicyPaymentWithFlexpayApiArg,
  SystemFeeManagementCreatePolicyPaymentWithFlexpayApiResponse,
  SystemFeeManagementCreatePolicyTransferInternalApiArg,
  SystemFeeManagementCreatePolicyTransferInternalApiResponse,
  SystemFeeManagementCreatePolicyWithDrawApiArg,
  SystemFeeManagementCreatePolicyWithDrawApiResponse,
  SystemFeeManagementDirectDepositApiArg,
  SystemFeeManagementDirectDepositApiResponse,
  SystemFeeManagementFindOneApiArg,
  SystemFeeManagementFindOneApiResponse,
  SystemFeeManagementGetDirectDepositListApiArg,
  SystemFeeManagementGetDirectDepositListApiResponse,
  SystemFeeManagementGetPolicyPaymentWithBankCardListApiArg,
  SystemFeeManagementGetPolicyPaymentWithBankCardListApiResponse,
  SystemFeeManagementGetPolicyPaymentWithFlexpayListApiArg,
  SystemFeeManagementGetPolicyPaymentWithFlexpayListApiResponse,
  SystemFeeManagementGetPolicyPolicyTransferInternalListApiArg,
  SystemFeeManagementGetPolicyPolicyTransferInternalListApiResponse,
  SystemFeeManagementGetPolicyWithDrawListApiArg,
  SystemFeeManagementGetPolicyWithDrawListApiResponse,
  SystemFeeManagementRemoveApiArg,
  SystemFeeManagementRemoveApiResponse,
  SystemFeeManagementUpdateDirectDepositApiArg,
  SystemFeeManagementUpdateDirectDepositApiResponse,
  SystemFeeManagementUpdatePolicyPaymentWithBankCardApiArg,
  SystemFeeManagementUpdatePolicyPaymentWithBankCardApiResponse,
  SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiArg,
  SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiResponse,
  SystemFeeManagementUpdatePolicyTransferInternalApiArg,
  SystemFeeManagementUpdatePolicyTransferInternalApiResponse,
  SystemFeeManagementUpdatePolicyWithDrawApiArg,
  SystemFeeManagementUpdatePolicyWithDrawApiResponse,
  SystemSettingCreateApiArg,
  SystemSettingCreateApiResponse,
  SystemSettingFindAllApiArg,
  SystemSettingFindAllApiResponse,
  SystemSettingFindAllFeePrinciplesApiArg,
  SystemSettingFindAllFeePrinciplesApiResponse,
  SystemSettingFindOneByKeyApiArg,
  SystemSettingFindOneByKeyApiResponse,
  TransactionFindAllApiArg,
  TransactionFindAllApiResponse,
  TransactionFindOneApiArg,
  TransactionFindOneApiResponse,
  TransactionInfoFindOneApiArg,
  TransactionInfoFindOneApiResponse,
  TransactionMainFindAllApiArg,
  TransactionMainFindAllApiResponse,
  TransactionUpdateStatusApiArg,
  TransactionUpdateStatusApiResponse,
  UserChangePasswordApiArg,
  UserChangePasswordApiResponse,
  UserCreateApiArg,
  UserCreateApiResponse,
  UserFindAllApiArg,
  UserFindAllApiResponse,
  UserFindOneApiArg,
  UserFindOneApiResponse,
  UserForgotPasswordApiArg,
  UserForgotPasswordApiResponse,
  UserGetMyInfoApiArg,
  UserGetMyInfoApiResponse,
  UserGetResendOtpApiArg,
  UserGetResendOtpApiResponse,
  UserGetUserOtpApiArg,
  UserGetUserOtpApiResponse,
  UserLockAdminApiArg,
  UserLockAdminApiResponse,
  UserLoginApiArg,
  UserLoginApiResponse,
  UserNewPasswordApiArg,
  UserNewPasswordApiResponse,
  UserRemoveApiArg,
  UserRemoveApiResponse,
  UserSetPermissionForUserApiArg,
  UserSetPermissionForUserApiResponse,
  UserUnlockAdminApiArg,
  UserUnlockAdminApiResponse,
  UserUpdateApiArg,
  UserUpdateApiResponse,
  UserUpdatePermissionUserApiArg,
  UserUpdatePermissionUserApiResponse,
  UserUploadAvatarApiArg,
  UserUploadAvatarApiResponse,
  UserVerifyTokenApiArg,
  UserVerifyTokenApiResponse,
  VerifyLoginOtpApiArg
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = [
  '[Admin] Admin User',
  '[Admin] Admin Customer',
  '[Admin] Admin Group',
  '[Admin] Admin Account Group',
  '[Admin] Admin Customer Verification',
  '[Admin] Admin Product Type',
  'Transaction',
  '[Admin] Transaction Main',
  '[Admin] Transaction Step',
  '[Admin] Admin Group Product ',
  '[Admin] Admin Product ',
  '[Admin] Admin Token Management',
  '[Admin] Admin Bank',
  '[Admin] Admin Freeze Money History',
  '[Admin] Admin Sale Fee',
  '[Admin] Admin System fee management',
  '[Admin] Admin History fee management',
  '[Admin] Admin Notification Setting',
  '[Admin] Admin Transaction Limit',
  '[Admin] Admin Service',
  '[Admin] Admin Payment Order',
  '[Admin] Admin Payment Partner',
  '[Admin] Admin Payment Service',
  '[Admin] Admin Bill',
  '[Admin] Admin Dashboard',
  'Refund',
  '[Admin] Admin Report',
  '[Admin] System setting'
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      userFindAll: build.query<UserFindAllApiResponse, UserFindAllApiArg>({
        query: (queryArg) => ({
          url: `/user`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            fullName: queryArg.fullName,
            email: queryArg.email,
            phoneNumber: queryArg.phoneNumber,
            active: queryArg.active,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin User']
      }),
      userCreate: build.mutation<UserCreateApiResponse, UserCreateApiArg>({
        query: (queryArg) => ({
          url: `/user`,
          method: 'POST',
          body: queryArg.createUserDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userGetUserOtp: build.mutation<
        UserGetUserOtpApiResponse,
        UserGetUserOtpApiArg
      >({
        query: (queryArg) => ({
          url: `/user/get-otp`,
          method: 'POST',
          body: queryArg.adminGetOtp
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userGetResendOtp: build.mutation<
        UserGetResendOtpApiResponse,
        UserGetResendOtpApiArg
      >({
        query: (queryArg) => ({
          url: `/user/resend-login-otp`,
          method: 'POST',
          body: queryArg.adminGetOtp
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      verifyLoginOtp: build.mutation<
        UserLoginApiResponse,
        VerifyLoginOtpApiArg
      >({
        query: (queryArg) => ({
          url: `/user/verify-login-otp`,
          method: 'POST',
          body: queryArg.verifyLoginOtp
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      // UserLoginApiResponse
      userLogin: build.mutation<OtpDataDto, UserLoginApiArg>({
        query: (queryArg) => ({
          url: `/user/login`,
          method: 'POST',
          body: queryArg.userLoginDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userGetMyInfo: build.query<UserGetMyInfoApiResponse, UserGetMyInfoApiArg>(
        {
          query: () => ({ url: `/user/me` }),
          transformResponse: fnTransformResponse,
          providesTags: ['[Admin] Admin User']
        }
      ),
      userFindOne: build.query<UserFindOneApiResponse, UserFindOneApiArg>({
        query: (queryArg) => ({ url: `/user/${queryArg.id}` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin User']
      }),
      userUpdate: build.mutation<UserUpdateApiResponse, UserUpdateApiArg>({
        query: (queryArg) => ({
          url: `/user/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateUserDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userRemove: build.mutation<UserRemoveApiResponse, UserRemoveApiArg>({
        query: (queryArg) => ({
          url: `/user/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userChangePassword: build.mutation<
        UserChangePasswordApiResponse,
        UserChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/user/change-password`,
          method: 'PUT',
          body: queryArg.changeUserPasswordDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userSetPermissionForUser: build.mutation<
        UserSetPermissionForUserApiResponse,
        UserSetPermissionForUserApiArg
      >({
        query: (queryArg) => ({
          url: `/user/permission`,
          method: 'POST',
          body: queryArg.setPermissionForUserDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userUploadAvatar: build.mutation<
        UserUploadAvatarApiResponse,
        UserUploadAvatarApiArg
      >({
        query: (queryArg) => ({
          url: `/user/avatar`,
          method: 'POST',
          body: queryArg.body
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userVerifyToken: build.mutation<
        UserVerifyTokenApiResponse,
        UserVerifyTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/user/verify-token`,
          method: 'POST',
          params: { token: queryArg.token }
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userForgotPassword: build.mutation<
        UserForgotPasswordApiResponse,
        UserForgotPasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/user/forgot-password`,
          method: 'POST',
          body: queryArg.userForgotPassword
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userNewPassword: build.mutation<
        UserNewPasswordApiResponse,
        UserNewPasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/user/new-password`,
          method: 'POST',
          body: queryArg.userNewPassword,
          params: { token: queryArg.token }
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userLockAdmin: build.mutation<
        UserLockAdminApiResponse,
        UserLockAdminApiArg
      >({
        query: (queryArg) => ({
          url: `/user/lock-admin/${queryArg.id}`,
          method: 'PATCH'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userUnlockAdmin: build.mutation<
        UserUnlockAdminApiResponse,
        UserUnlockAdminApiArg
      >({
        query: (queryArg) => ({
          url: `/user/unlock-admin/${queryArg.id}`,
          method: 'PATCH'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userUpdatePermissionUser: build.mutation<
        UserUpdatePermissionUserApiResponse,
        UserUpdatePermissionUserApiArg
      >({
        query: (queryArg) => ({
          url: `/user/update-permission-user/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updatePermissionForUserDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      customerFindAll: build.query<
        CustomerFindAllApiResponse,
        CustomerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/customer`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            email: queryArg.email,
            active: queryArg.active,
            name: queryArg.name,
            status: queryArg.status,
            accountNumber: queryArg.accountNumber,
            hasTransactions: queryArg.hasTransactions,
            from: queryArg['from'],
            to: queryArg.to,
            type: queryArg['type'],
            confirmType: queryArg.confirmType,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetSecurityMethod: build.query<
        CustomerGetSecurityMethodApiResponse,
        CustomerGetSecurityMethodApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/get-security-setting`,
          params: { accountNumber: queryArg.accountNumber }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerFindOne: build.query<
        CustomerFindOneApiResponse,
        CustomerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/customer/${queryArg.id}` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerUpdate: build.mutation<
        CustomerUpdateApiResponse,
        CustomerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateCustomerDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerDelete: build.mutation<
        CustomerDeleteApiResponse,
        CustomerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerFindOneByAccountNumber: build.query<
        CustomerFindOneByAccountNumberApiResponse,
        CustomerFindOneByAccountNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/by-account-number/${queryArg.accountNumber}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetCustomerByAccountNumber: build.query<
        CustomerGetCustomerByAccountNumberApiResponse,
        CustomerGetCustomerByAccountNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/customer-balance/${queryArg.accountNumber}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetExportExcel: build.query<
        CustomerGetExportExcelApiResponse,
        CustomerGetExportExcelApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/export/excel`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            email: queryArg.email,
            active: queryArg.active,
            name: queryArg.name,
            status: queryArg.status,
            accountNumber: queryArg.accountNumber,
            hasTransactions: queryArg.hasTransactions,
            from: queryArg['from'],
            to: queryArg.to,
            type: queryArg['type'],
            confirmType: queryArg.confirmType,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetExportCsv: build.query<
        CustomerGetExportCsvApiResponse,
        CustomerGetExportCsvApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/export/csv`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            email: queryArg.email,
            active: queryArg.active,
            name: queryArg.name,
            status: queryArg.status,
            accountNumber: queryArg.accountNumber,
            hasTransactions: queryArg.hasTransactions,
            from: queryArg['from'],
            to: queryArg.to,
            type: queryArg['type'],
            confirmType: queryArg.confirmType,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer']
      }),
      customerCreate: build.mutation<
        CustomerCreateApiResponse,
        CustomerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/create/personal`,
          method: 'POST',
          body: queryArg.createCustomerPersonalDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerToggleActive: build.mutation<
        CustomerToggleActiveApiResponse,
        CustomerToggleActiveApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/${queryArg.id}/toggle-active`,
          method: 'PATCH',
          body: queryArg.toggleActiveDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerChangePassword: build.mutation<
        CustomerChangePasswordApiResponse,
        CustomerChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/change-password`,
          method: 'PATCH',
          body: queryArg.changePasswordDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerVerificationFindAll: build.query<
        CustomerVerificationFindAllApiResponse,
        CustomerVerificationFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer Verification']
      }),
      customerVerificationFindOneById: build.query<
        CustomerVerificationFindOneByIdApiResponse,
        CustomerVerificationFindOneByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Customer Verification']
      }),
      customerVerificationUpdate: build.mutation<
        CustomerVerificationUpdateApiResponse,
        CustomerVerificationUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateCustomerVerificationDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer Verification']
      }),
      customerVerificationDeleteVerify: build.mutation<
        CustomerVerificationDeleteVerifyApiResponse,
        CustomerVerificationDeleteVerifyApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification/${queryArg.phone}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Customer Verification']
      }),
      transactionInfoFindOne: build.query<
        TransactionInfoFindOneApiResponse,
        TransactionInfoFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/transaction-main/info/${queryArg.id}` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Transaction Main']
      }),
      transactionMainFindAll: build.query<
        TransactionMainFindAllApiResponse,
        TransactionMainFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction-main`,
          params: {
            order: queryArg.order,
            referenceId: queryArg.referenceId,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            type: queryArg['type'],
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            accountNumber: queryArg.accountNumber,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Transaction Main']
      }),
      transactionFindAll: build.query<
        TransactionFindAllApiResponse,
        TransactionFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction`,
          params: {
            order: queryArg.order,
            referenceId: queryArg.referenceId,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            type: queryArg['type'],
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            accountNumber: queryArg.accountNumber,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['Transaction']
      }),
      transactionFindOne: build.query<
        TransactionFindOneApiResponse,
        TransactionFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/transaction/${queryArg.id}` }),
        transformResponse: fnTransformResponse,
        providesTags: ['Transaction']
      }),
      transactionUpdateStatus: build.mutation<
        TransactionUpdateStatusApiResponse,
        TransactionUpdateStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction/status/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateTransactionStatusDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['Transaction']
      }),
      freezeBalanceHistoryCreate: build.mutation<
        FreezeBalanceHistoryCreateApiResponse,
        FreezeBalanceHistoryCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/freeze-balance-history`,
          method: 'POST',
          body: queryArg.createFreezeBalanceHistoryDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Freeze Money History']
      }),
      freezeBalanceHistoryFindAll: build.query<
        FreezeBalanceHistoryFindAllApiResponse,
        FreezeBalanceHistoryFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/freeze-balance-history`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            customerAccountNumber: queryArg.customerAccountNumber,
            status: queryArg.status,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Freeze Money History']
      }),
      freezeBalanceHistoryOpenFreezeBalance: build.mutation<
        FreezeBalanceHistoryOpenFreezeBalanceApiResponse,
        FreezeBalanceHistoryOpenFreezeBalanceApiArg
      >({
        query: (queryArg) => ({
          url: `/freeze-balance-history/open-freeze-balance`,
          method: 'POST',
          body: queryArg.openFreezeBalanceHistoryDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Freeze Money History']
      }),
      systemFeeManagementDirectDeposit: build.mutation<
        SystemFeeManagementDirectDepositApiResponse,
        SystemFeeManagementDirectDepositApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/direct-deposit`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyPaymentWithBankCard: build.mutation<
        SystemFeeManagementCreatePolicyPaymentWithBankCardApiResponse,
        SystemFeeManagementCreatePolicyPaymentWithBankCardApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-transfer-with-bank-card`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyTransferInternal: build.mutation<
        SystemFeeManagementCreatePolicyTransferInternalApiResponse,
        SystemFeeManagementCreatePolicyTransferInternalApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-transfer-internal`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyPaymentWithFlexpay: build.mutation<
        SystemFeeManagementCreatePolicyPaymentWithFlexpayApiResponse,
        SystemFeeManagementCreatePolicyPaymentWithFlexpayApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-transfer-with-FLEXPAY`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyWithDraw: build.mutation<
        SystemFeeManagementCreatePolicyWithDrawApiResponse,
        SystemFeeManagementCreatePolicyWithDrawApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-withdraw`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetDirectDepositList: build.query<
        SystemFeeManagementGetDirectDepositListApiResponse,
        SystemFeeManagementGetDirectDepositListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/direct-deposit-list`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetPolicyPaymentWithBankCardList: build.query<
        SystemFeeManagementGetPolicyPaymentWithBankCardListApiResponse,
        SystemFeeManagementGetPolicyPaymentWithBankCardListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-transfer-with-bank-card`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetPolicyPolicyTransferInternalList: build.query<
        SystemFeeManagementGetPolicyPolicyTransferInternalListApiResponse,
        SystemFeeManagementGetPolicyPolicyTransferInternalListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-transfer-internal`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetPolicyPaymentWithFlexpayList: build.query<
        SystemFeeManagementGetPolicyPaymentWithFlexpayListApiResponse,
        SystemFeeManagementGetPolicyPaymentWithFlexpayListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-transfer-with-FLEXPAY`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetPolicyWithDrawList: build.query<
        SystemFeeManagementGetPolicyWithDrawListApiResponse,
        SystemFeeManagementGetPolicyWithDrawListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-withdraw`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdateDirectDeposit: build.mutation<
        SystemFeeManagementUpdateDirectDepositApiResponse,
        SystemFeeManagementUpdateDirectDepositApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-direct-deposit/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyPaymentWithBankCard: build.mutation<
        SystemFeeManagementUpdatePolicyPaymentWithBankCardApiResponse,
        SystemFeeManagementUpdatePolicyPaymentWithBankCardApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-transfer-with-bank-card/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyTransferInternal: build.mutation<
        SystemFeeManagementUpdatePolicyTransferInternalApiResponse,
        SystemFeeManagementUpdatePolicyTransferInternalApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-transfer-internal/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyPaymentWithFlexpay: build.mutation<
        SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiResponse,
        SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-transfer-with-FLEXPAY/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyWithDraw: build.mutation<
        SystemFeeManagementUpdatePolicyWithDrawApiResponse,
        SystemFeeManagementUpdatePolicyWithDrawApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-withdraw/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementFindOne: build.query<
        SystemFeeManagementFindOneApiResponse,
        SystemFeeManagementFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementRemove: build.mutation<
        SystemFeeManagementRemoveApiResponse,
        SystemFeeManagementRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      paymentOrderFindAll: build.query<
        PaymentOrderFindAllApiResponse,
        PaymentOrderFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/pagination`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            id: queryArg.id,
            partnerOrderStatus: queryArg.partnerOrderStatus,
            customerPhone: queryArg.customerPhone,
            partnerOrderCode: queryArg.partnerOrderCode,
            from: queryArg['from'],
            to: queryArg.to,
            paymentPeriodFrom: queryArg.paymentPeriodFrom,
            paymentPeriodTo: queryArg.paymentPeriodTo,
            amount: queryArg.amount,
            partnerCustomerName: queryArg.partnerCustomerName,
            paymentServiceType: queryArg.paymentServiceType,
            partnerId: queryArg.partnerId,
            customerIdentityNumber: queryArg.customerIdentityNumber,
            transactionStatus: queryArg.transactionStatus,
            processedId: queryArg.processedId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Order']
      }),
      paymentOrderFindOne: build.query<
        PaymentOrderFindOneApiResponse,
        PaymentOrderFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Order']
      }),
      paymentOrderUpdate: build.mutation<
        PaymentOrderUpdateApiResponse,
        PaymentOrderUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updatePaymentOrderDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Order']
      }),
      paymentOrderGetExportExcel: build.query<
        PaymentOrderGetExportExcelApiResponse,
        PaymentOrderGetExportExcelApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/export/excel`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            id: queryArg.id,
            partnerOrderStatus: queryArg.partnerOrderStatus,
            customerPhone: queryArg.customerPhone,
            partnerOrderCode: queryArg.partnerOrderCode,
            from: queryArg['from'],
            to: queryArg.to,
            paymentPeriodFrom: queryArg.paymentPeriodFrom,
            paymentPeriodTo: queryArg.paymentPeriodTo,
            amount: queryArg.amount,
            partnerCustomerName: queryArg.partnerCustomerName,
            paymentServiceType: queryArg.paymentServiceType,
            partnerId: queryArg.partnerId,
            customerIdentityNumber: queryArg.customerIdentityNumber,
            transactionStatus: queryArg.transactionStatus,
            processedId: queryArg.processedId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Order']
      }),
      paymentPartnerFindAll: build.query<
        PaymentPartnerFindAllApiResponse,
        PaymentPartnerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/pagination`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            active: queryArg.active,
            type: queryArg['type'],
            name: queryArg.name,
            paymentServiceId: queryArg.paymentServiceId,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerGetPartnerOderDetail: build.query<
        PaymentPartnerGetPartnerOderDetailApiResponse,
        PaymentPartnerGetPartnerOderDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/get-bill-detail`,
          params: {
            paymentPartnerId: queryArg.paymentPartnerId,
            billCode: queryArg.billCode,
            type: queryArg['type']
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerFindOne: build.query<
        PaymentPartnerFindOneApiResponse,
        PaymentPartnerFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerUpdate: build.mutation<
        PaymentPartnerUpdateApiResponse,
        PaymentPartnerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.body
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerDelete: build.mutation<
        PaymentPartnerDeleteApiResponse,
        PaymentPartnerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerCreate: build.mutation<
        PaymentPartnerCreateApiResponse,
        PaymentPartnerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner`,
          method: 'POST',
          body: queryArg
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentServiceFindAll: build.query<
        PaymentServiceFindAllApiResponse,
        PaymentServiceFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/pagination`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            type: queryArg['type'],
            active: queryArg.active,
            name: queryArg.name,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceFindOne: build.query<
        PaymentServiceFindOneApiResponse,
        PaymentServiceFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceUpdate: build.mutation<
        PaymentServiceUpdateApiResponse,
        PaymentServiceUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.formData
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceDelete: build.mutation<
        PaymentServiceDeleteApiResponse,
        PaymentServiceDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceCreate: build.mutation<
        PaymentServiceCreateApiResponse,
        PaymentServiceCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service`,
          method: 'POST',
          body: queryArg
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Payment Service']
      }),
      dashboardStatistic: build.query<
        DashboardStatisticApiResponse,
        DashboardStatisticApiArg
      >({
        query: (queryArg) => ({
          url: `/dashboard/statistic`,
          params: { time: queryArg.time }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Dashboard']
      }),
      dashboardSendSms: build.query<
        DashboardSendSmsApiResponse,
        DashboardSendSmsApiArg
      >({
        query: (queryArg) => ({
          url: `/dashboard/send-sms-metric`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Dashboard']
      }),
      dashboardOverview: build.query<
        DashboardOverviewApiResponse,
        DashboardOverviewApiArg
      >({
        query: (queryArg) => ({
          url: `/dashboard/chart-overview`,
          params: { year: queryArg.year }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Dashboard']
      }),
      refundGetRefundMoney: build.query<
        RefundGetRefundMoneyApiResponse,
        RefundGetRefundMoneyApiArg
      >({
        query: (queryArg) => ({
          url: `/refund`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            merchantAccount: queryArg.merchantAccount,
            merchant: queryArg.merchant,
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['Refund']
      }),
      refundFindOne: build.query<RefundFindOneApiResponse, RefundFindOneApiArg>(
        {
          query: (queryArg) => ({ url: `/refund/${queryArg.id}` }),
          transformResponse: fnTransformResponse,
          providesTags: ['Refund']
        }
      ),
      refundRefund: build.mutation<RefundRefundApiResponse, RefundRefundApiArg>(
        {
          query: (queryArg) => ({
            url: `/refund/refund/${queryArg.id}`,
            method: 'POST'
          }),
          transformResponse: fnTransformResponse,
          invalidatesTags: ['Refund']
        }
      ),
      refundGetExportCsv: build.query<
        RefundGetExportCsvApiResponse,
        RefundGetExportCsvApiArg
      >({
        query: (queryArg) => ({
          url: `/refund/export/csv`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            code: queryArg.code,
            merchantAccount: queryArg.merchantAccount,
            merchant: queryArg.merchant,
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['Refund']
      }),
      reportGetMetricOfAccount: build.query<
        ReportGetMetricOfAccountApiResponse,
        ReportGetMetricOfAccountApiArg
      >({
        query: (queryArg) => ({
          url: `/report/account`,
          params: { reportType: queryArg.reportType }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetMetricAccountRegister: build.query<
        ReportGetMetricAccountRegisterApiResponse,
        ReportGetMetricAccountRegisterApiArg
      >({
        query: (queryArg) => ({
          url: `/report`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetMetricDevice: build.query<
        ReportGetMetricDeviceApiResponse,
        ReportGetMetricDeviceApiArg
      >({
        query: () => ({ url: `/report/device` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Report']
      }),
      reportGetMetricProvince: build.query<
        ReportGetMetricProvinceApiResponse,
        ReportGetMetricProvinceApiArg
      >({
        query: (queryArg) => ({
          url: `/report/provinces`,
          params: { order: queryArg.order, take: queryArg.take }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Report']
      }),
      systemSettingFindAll: build.query<
        SystemSettingFindAllApiResponse,
        SystemSettingFindAllApiArg
      >({
        query: () => ({ url: `/system-setting` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] System setting']
      }),
      systemSettingCreate: build.mutation<
        SystemSettingCreateApiResponse,
        SystemSettingCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/system-setting`,
          method: 'POST',
          body: queryArg.createSystemSettingDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] System setting']
      }),
      systemSettingFindAllFeePrinciples: build.query<
        SystemSettingFindAllFeePrinciplesApiResponse,
        SystemSettingFindAllFeePrinciplesApiArg
      >({
        query: () => ({ url: `/system-setting/fee-principle` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] System setting']
      }),
      systemSettingFindOneByKey: build.query<
        SystemSettingFindOneByKeyApiResponse,
        SystemSettingFindOneByKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/system-setting/${queryArg.key}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] System setting']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }

export const {
  useUserFindAllQuery,
  useUserCreateMutation,
  useUserGetUserOtpMutation,
  useUserGetResendOtpMutation,
  useVerifyLoginOtpMutation,
  useUserLoginMutation,
  useUserGetMyInfoQuery,
  useUserFindOneQuery,
  useUserUpdateMutation,
  useUserRemoveMutation,
  useUserChangePasswordMutation,
  useUserSetPermissionForUserMutation,
  useUserUploadAvatarMutation,
  useUserVerifyTokenMutation,
  useUserForgotPasswordMutation,
  useUserNewPasswordMutation,
  useUserLockAdminMutation,
  useUserUnlockAdminMutation,
  useUserUpdatePermissionUserMutation,
  useCustomerFindAllQuery,
  useCustomerGetSecurityMethodQuery,
  useCustomerFindOneQuery,
  useCustomerUpdateMutation,
  useCustomerDeleteMutation,
  useCustomerFindOneByAccountNumberQuery,
  useCustomerGetCustomerByAccountNumberQuery,
  useCustomerGetExportExcelQuery,
  useCustomerGetExportCsvQuery,
  useCustomerCreateMutation,
  useCustomerToggleActiveMutation,
  useCustomerChangePasswordMutation,
  useCustomerVerificationFindAllQuery,
  useCustomerVerificationFindOneByIdQuery,
  useCustomerVerificationUpdateMutation,
  useCustomerVerificationDeleteVerifyMutation,
  useTransactionFindAllQuery,
  useTransactionFindOneQuery,
  useTransactionMainFindAllQuery,
  useTransactionInfoFindOneQuery,
  useTransactionUpdateStatusMutation,
  useFreezeBalanceHistoryCreateMutation,
  useFreezeBalanceHistoryFindAllQuery,
  useFreezeBalanceHistoryOpenFreezeBalanceMutation,
  useSystemFeeManagementDirectDepositMutation,
  useSystemFeeManagementCreatePolicyPaymentWithBankCardMutation,
  useSystemFeeManagementCreatePolicyTransferInternalMutation,
  useSystemFeeManagementCreatePolicyPaymentWithFlexpayMutation,
  useSystemFeeManagementCreatePolicyWithDrawMutation,
  useSystemFeeManagementGetDirectDepositListQuery,
  useSystemFeeManagementGetPolicyPaymentWithBankCardListQuery,
  useSystemFeeManagementGetPolicyPolicyTransferInternalListQuery,
  useSystemFeeManagementGetPolicyPaymentWithFlexpayListQuery,
  useSystemFeeManagementGetPolicyWithDrawListQuery,
  useSystemFeeManagementUpdateDirectDepositMutation,
  useSystemFeeManagementUpdatePolicyPaymentWithBankCardMutation,
  useSystemFeeManagementUpdatePolicyTransferInternalMutation,
  useSystemFeeManagementUpdatePolicyPaymentWithFlexpayMutation,
  useSystemFeeManagementUpdatePolicyWithDrawMutation,
  useSystemFeeManagementFindOneQuery,
  useSystemFeeManagementRemoveMutation,
  usePaymentOrderFindAllQuery,
  usePaymentOrderFindOneQuery,
  usePaymentOrderUpdateMutation,
  usePaymentOrderGetExportExcelQuery,
  usePaymentPartnerFindAllQuery,
  usePaymentPartnerGetPartnerOderDetailQuery,
  usePaymentPartnerFindOneQuery,
  usePaymentPartnerUpdateMutation,
  usePaymentPartnerDeleteMutation,
  usePaymentPartnerCreateMutation,
  usePaymentServiceFindAllQuery,
  usePaymentServiceFindOneQuery,
  usePaymentServiceUpdateMutation,
  usePaymentServiceDeleteMutation,
  usePaymentServiceCreateMutation,
  useDashboardStatisticQuery,
  useDashboardSendSmsQuery,
  useDashboardOverviewQuery,
  useRefundGetRefundMoneyQuery,
  useRefundFindOneQuery,
  useRefundRefundMutation,
  useRefundGetExportCsvQuery,
  useReportGetMetricOfAccountQuery,
  useReportGetMetricAccountRegisterQuery,
  useReportGetMetricDeviceQuery,
  useReportGetMetricProvinceQuery,
  useSystemSettingFindAllQuery,
  useSystemSettingCreateMutation,
  useSystemSettingFindAllFeePrinciplesQuery,
  useSystemSettingFindOneByKeyQuery
} = injectedRtkApi
