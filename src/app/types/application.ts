import { accountStatus } from "./customer";
import { ReportType } from "./report";

export type PaginationParams = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  orderBy?: string;
};
export type UserFindAllApiResponse = /** status 200  */ UserPageDto;
export type UserFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  active?: boolean;
  orderBy?: string;
};
export type UserCreateApiResponse = /** status 201  */ User;
export type UserCreateApiArg = {
  /** Create user */
  createUserDto: CreateUserDto;
};
export type UserGetUserOtpApiResponse = /** status 201  */ OtpDataDto;
export type UserGetUserOtpApiArg = {
  adminGetOtp: AdminGetOtp;
};
export type UserLoginApiResponse = /** status 201  */ UserLoginResponse;
export type UserLoginApiArg = {
  /** Username and password */
  userLoginDto: UserLoginDto;
};
export type UserGetMyInfoApiResponse = /** status 200  */ UserDetailDto;
export type UserGetMyInfoApiArg = void;
export type UserFindOneApiResponse = /** status 200  */ UserDetailDto;
export type UserFindOneApiArg = {
  id: number;
};
export type UserUpdateApiResponse = unknown;
export type UserUpdateApiArg = {
  id: string;
  /** Update user */
  updateUserDto: UpdateUserDto;
};
export type UserRemoveApiResponse = unknown;
export type UserRemoveApiArg = {
  id: string;
};
export type UserChangePasswordApiResponse = unknown;
export type UserChangePasswordApiArg = {
  /** Change password 123123213 */
  changeUserPasswordDto: ChangeUserPasswordDto;
};
export type UserSetPermissionForUserApiResponse = /** status 201  */ boolean;
export type UserSetPermissionForUserApiArg = {
  setPermissionForUserDto: SetPermissionForUserDto;
};
export type UserUploadAvatarApiResponse = /** status 201  */ User;
export type UserUploadAvatarApiArg = {
  body: {
    file?: Blob;
  };
};
export type UserVerifyTokenApiResponse = /** status 201  */ boolean;
export type UserVerifyTokenApiArg = {
  token: string;
};
export type UserForgotPasswordApiResponse = unknown;
export type UserForgotPasswordApiArg = {
  userForgotPassword: UserForgotPassword;
};
export type UserNewPasswordApiResponse = /** status 201  */ UserDetailDto;
export type UserNewPasswordApiArg = {
  token: string;
  userNewPassword: UserNewPassword;
};
export type UserLockAdminApiResponse = unknown;
export type UserLockAdminApiArg = {
  id: string;
};
export type UserUnlockAdminApiResponse = unknown;
export type UserUnlockAdminApiArg = {
  id: string;
};
export type UserUpdatePermissionUserApiResponse = unknown;
export type UserUpdatePermissionUserApiArg = {
  id: number;
  updatePermissionForUserDto: UpdatePermissionForUserDto;
};
export type CustomerFindAllApiResponse = /** status 200  */ CustomerPageDto;
export type CustomerFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  phoneNumber?: string;
  email?: string;
  active?: boolean;
  name?: string;
  status?: string[]; // 'LINKED' | 'NOT_VERIFIED' | 'VERIFIED'
  accountNumber?: string;
  hasTransactions?: boolean;
  from?: string;
  to?: string;
  type?: 'PERSONAL' | 'ENTERPRISE';
  confirmType?: 'NOT_VERIFICATION' | 'KYC_VERIFICATION';
  orderBy?: string;
};
export type CustomerGetSecurityMethodApiResponse =
  /** status 200  */ SettingSecurityDataDto;
export type CustomerGetSecurityMethodApiArg = {
  accountNumber: string;
};
export type CustomerFindOneApiResponse =
  /** status 200  */ CustomerBalanceDetailDto;
export type CustomerFindOneApiArg = {
  id: string;
};
export type CustomerUpdateApiResponse = /** status 200  */ CustomerDto;
export type CustomerUpdateApiArg = {
  id: string;
  updateCustomerDto: UpdateCustomerDto;
};
export type CustomerDeleteApiResponse = /** status 200  */ boolean;
export type CustomerDeleteApiArg = {
  id: string;
};
export type CustomerFindOneByAccountNumberApiResponse =
  /** status 200  */ CustomerBalanceDetailDto;
export type CustomerFindOneByAccountNumberApiArg = {
  accountNumber: string;
};
export type CustomerGetCustomerByAccountNumberApiResponse =
  /** status 200  */ CustomerBalanceDetailDto;
export type CustomerGetCustomerByAccountNumberApiArg = {
  accountNumber: string;
};
export type CustomerGetExportExcelApiResponse = unknown;
export type CustomerGetExportExcelApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  phoneNumber?: string;
  email?: string;
  active?: boolean;
  name?: string;
  status?: accountStatus.LINKED | accountStatus.NOT_VERIFIED | accountStatus.VERIFIED;
  accountNumber?: string;
  hasTransactions?: boolean;
  from?: string;
  to?: string;
  type?: 'PERSONAL' | 'ENTERPRISE';
  confirmType?: 'NOT_VERIFICATION' | 'KYC_VERIFICATION';
  orderBy?: string;
};
export type CustomerGetExportCsvApiResponse = unknown;
export type CustomerGetExportCsvApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  phoneNumber?: string;
  email?: string;
  active?: boolean;
  name?: string;
  status?: accountStatus.LINKED | accountStatus.NOT_VERIFIED | accountStatus.VERIFIED;
  accountNumber?: string;
  hasTransactions?: boolean;
  from?: string;
  to?: string;
  type?: 'PERSONAL' | 'ENTERPRISE';
  confirmType?: 'NOT_VERIFICATION' | 'KYC_VERIFICATION';
  orderBy?: string;
};
export type CustomerCreateApiResponse = /** status 201  */ CustomerDto;
export type CustomerCreateApiArg = {
  /** Create personal customer */
  createCustomerPersonalDto: CreateCustomerPersonalDto;
};
export type CustomerToggleActiveApiResponse = /** status 200  */ Customer;
export type CustomerToggleActiveApiArg = {
  id: number;
  /** Reason Lock */
  toggleActiveDto: ToggleActiveDto;
};
export type CustomerChangePasswordApiResponse = unknown;
export type CustomerChangePasswordApiArg = {
  changePasswordDto: ChangePasswordDto;
};
export type GroupFindAllApiResponse = /** status 200  */ GroupPageDto;
export type GroupFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  id?: number;
  name?: string;
  status?: boolean;
  orderBy?: string;
};
export type GroupFindOneApiResponse = /** status 200  */ Group;
export type GroupFindOneApiArg = {
  id: string;
};
export type GroupUpdateApiResponse = /** status 200  */ Group;
export type GroupUpdateApiArg = {
  id: string;
  setPermissionForGroupDto: SetPermissionForGroupDto;
};
export type GroupRemoveApiResponse = /** status 200  */ Group;
export type GroupRemoveApiArg = {
  id: string;
};
export type GroupSetPermissionForGroupApiResponse = /** status 201  */ boolean;
export type GroupSetPermissionForGroupApiArg = {
  setPermissionForGroupDto: SetPermissionForGroupDto;
};
export type AccountGroupCreateApiResponse = unknown;
export type AccountGroupCreateApiArg = {
  createAccountGroupDto: CreateAccountGroupDto;
};
export type AccountGroupFindAllApiResponse =
  /** status 200  */ AccountGroupPageDto;
export type AccountGroupFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  name?: string;
  customerType?: 'PERSONAL' | 'ENTERPRISE';
  customerAccountNumber?: string;
  orderBy?: string;
};
export type AccountGroupUpdateApiResponse = /** status 200  */ AccountGroup;
export type AccountGroupUpdateApiArg = {
  id: string;
  updateAccountGroupDto: UpdateAccountGroupDto;
};
export type AccountGroupRemoveApiResponse = /** status 200  */ AccountGroup;
export type AccountGroupRemoveApiArg = {
  id: string;
};
export type AccountGroupFindOneApiResponse = /** status 200  */ AccountGroupDto;
export type AccountGroupFindOneApiArg = {
  id: string;
};
export type CustomerVerificationFindAllApiResponse =
  /** status 200  */ CustomerVerificationPageDto;
export type CustomerVerificationFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  phoneNumber?: string;
  status?: 'PENDING' | 'VERIFIED' | 'REFUSED';
  from?: string;
  to?: string;
  orderBy?: string;
};
export type CustomerVerificationFindOneByIdApiResponse =
  /** status 200  */ CustomerVerificationDto;
export type CustomerVerificationFindOneByIdApiArg = {
  id: string;
};
export type CustomerVerificationUpdateApiResponse = /** status 200  */ boolean;
export type CustomerVerificationUpdateApiArg = {
  id: string;
  updateCustomerVerificationDto: UpdateCustomerVerificationDto;
};
export type CustomerVerificationDeleteVerifyApiResponse = unknown;
export type CustomerVerificationDeleteVerifyApiArg = {
  phone: string;
};
export type ProductTypeCreateApiResponse =
  /** status 201  */ CreateProductTypeDto;
export type ProductTypeCreateApiArg = {
  createProductTypeDto: CreateProductTypeDto;
};
export type ProductTypeFindAllApiResponse =
  /** status 200  */ ProductTypePageDto;
export type ProductTypeFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  id?: number;
  show?: 'APP' | 'WEB' | 'BOTH';
  orderBy?: string;
};
export type ProductTypeFindOneApiResponse =
  /** status 200  */ ProductTypeDetailDto;
export type ProductTypeFindOneApiArg = {
  id: string;
};
export type ProductTypeUpdateApiResponse = unknown;
export type ProductTypeUpdateApiArg = {
  id: string;
  updateProductTypeDto: UpdateProductTypeDto;
};
export type ProductTypeRemoveApiResponse = unknown;
export type ProductTypeRemoveApiArg = {
  id: string;
};
export type TransactionFindAllApiResponse =
  /** status 200  */ TransactionPageDto;
export type TransactionFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page: number;
  take: number;
  query?: string;
  code?: string;
  referenceId?: string;
  type?:
  | 'DEPOSIT'
  | 'TRANSFER'
  | 'RECEIVAL'
  | 'RECEIVE'
  | 'PAYMENT'
  | 'MERCHANT_PAYMENT_FEE'
  | 'DISBURSE'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_FEE'
  | 'REFUND'
  | 'TOPUP'
  | 'CASHIN_FEE';
  status?:
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS';
  from?: string;
  to?: string;
  accountNumber?: string;
  orderBy?: string;
};
export type TransactionFindOneApiResponse = /** status 200  */ TransactionDto;
export type TransactionFindOneApiArg = {
  id: string;
};
export type TransactionUpdateStatusApiResponse = /** status 200  */ boolean;
export type TransactionUpdateStatusApiArg = {
  id: string;
  updateTransactionStatusDto: UpdateTransactionStatusDto;
};
export type GroupProductCreateApiResponse = /** status 201  */ GroupProduct;
export type GroupProductCreateApiArg = {
  createGroupProductDto: CreateGroupProductDto;
};
export type GroupProductFindAllApiResponse =
  /** status 200  */ GroupProductPageDto;
export type GroupProductFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  serviceId?: number;
  productTypeId?: number;
  featured?: 'NEW_PRODUCT' | 'HOT_PRODUCT' | 'PROMOTION_PRODUCTS';
  groupProduct?: string;
  orderBy?: string;
};
export type GroupProductUpdateApiResponse = /** status 200  */ GroupProduct;
export type GroupProductUpdateApiArg = {
  id: string;
  updateGroupProductDto: UpdateGroupProductDto;
};
export type GroupProductFindByIdApiResponse =
  /** status 200  */ GroupProductDetailDto;
export type GroupProductFindByIdApiArg = {
  id: string;
};
export type GroupProductRemoveApiResponse = unknown;
export type GroupProductRemoveApiArg = {
  id: string;
};
export type ProductFindAllApiResponse = /** status 200  */ ProductPageDto;
export type ProductFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  orderBy?: string;
};
export type ProductCreateApiResponse = /** status 201  */ Product;
export type ProductCreateApiArg = {
  createProductDto: CreateProductDto;
};
export type ProductUpdateApiResponse = unknown;
export type ProductUpdateApiArg = {
  id: string;
  updateProductDto: UpdateProductDto;
};
export type ProductRemoveApiResponse = unknown;
export type ProductRemoveApiArg = {
  id: string;
};
export type ProductFindByIdApiResponse = /** status 200  */ ProductDetailDto;
export type ProductFindByIdApiArg = {
  id: string;
};
export type PaymentLinkFindAllApiResponse =
  /** status 200  */ PaymentLinkPageDto;
export type PaymentLinkFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  status?: boolean;
  from?: string;
  to?: string;
  cardNumber?: string;
  bankName?: 'SML' | 'BIDV' | 'VietCapitalBank' | 'Agribank' | 'Vietcombank';
  orderBy?: string;
};
export type PaymentLinkCancelTokenApiResponse =
  /** status 200  */ PaymentLinkCmsDto;
export type PaymentLinkCancelTokenApiArg = {
  id: number;
};
export type BankCmsFindAllApiResponse = /** status 200  */ BankPageDto;
export type BankCmsFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  active?: number;
  name?: string;
  key?: string;
  type?: -1 | 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY';
  orderBy?: string;
};
export type BankCmsFindAllActiveApiResponse = /** status 200  */ BankDto[];
export type BankCmsFindAllActiveApiArg = void;
export type BankCmsUpdateApiResponse = unknown;
export type BankCmsUpdateApiArg = {
  id: string;
  updateBankDto: UpdateBankDto;
};
export type BankCmsFindOneApiResponse = /** status 200  */ BankDetailDto;
export type BankCmsFindOneApiArg = {
  id: string;
};
export type BankCmsGetExportExcelApiResponse = unknown;
export type BankCmsGetExportExcelApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  active?: number;
  name?: string;
  key?: string;
  type?: 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY';
  orderBy?: string;
};
export type BankCmsGetExportCsvApiResponse = unknown;
export type BankCmsGetExportCsvApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  active?: number;
  name?: string;
  key?: string;
  type?: 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY';
  orderBy?: string;
};
export type FreezeBalanceHistoryCreateApiResponse = unknown;
export type FreezeBalanceHistoryCreateApiArg = {
  createFreezeBalanceHistoryDto: CreateFreezeBalanceHistoryDto;
};
export type FreezeBalanceHistoryFindAllApiResponse =
  /** status 200  */ FreezeBalanceHistoryPageDto;
export type FreezeBalanceHistoryFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  customerAccountNumber?: string;
  status: boolean;
  orderBy?: string;
};
export type FreezeBalanceHistoryOpenFreezeBalanceApiResponse = unknown;
export type FreezeBalanceHistoryOpenFreezeBalanceApiArg = {
  openFreezeBalanceHistoryDto: OpenFreezeBalanceHistoryDto;
};
export type SaleFeeCreateApiResponse = /** status 201  */ CreateSaleFeeDto;
export type SaleFeeCreateApiArg = {
  createSaleFeeDto: CreateSaleFeeDto;
};
export type SaleFeeFindAllApiResponse = /** status 200  */ SaleFeePageDto;
export type SaleFeeFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  serviceId?: number;
  productTypeId?: number;
  groupProductId?: number;
  groupProduct?: string;
  orderBy?: string;
};
export type SaleFeeUpdateApiResponse = unknown;
export type SaleFeeUpdateApiArg = {
  id: string;
  updateSaleFeeDto: UpdateSaleFeeDto;
};
export type SaleFeeFindOneByIdApiResponse = /** status 200  */ SaleFeeDetailDto;
export type SaleFeeFindOneByIdApiArg = {
  id: string;
};
export type SaleFeeRemoveApiResponse = unknown;
export type SaleFeeRemoveApiArg = {
  id: string;
};
export type SaleFeeNotifyApiResponse = unknown;
export type SaleFeeNotifyApiArg = {
  id: string;
};
export type SystemFeeManagementDirectDepositApiResponse = unknown;
export type SystemFeeManagementDirectDepositApiArg = {
  createSystemFeeManagementDto: CreateSystemFeeManagementDto;
};
export type SystemFeeManagementCreatePolicyPaymentWithBankCardApiResponse =
  unknown;
export type SystemFeeManagementCreatePolicyPaymentWithBankCardApiArg = {
  createSystemFeeManagementDto: CreateSystemFeeManagementDto;
};
export type SystemFeeManagementCreatePolicyTransferInternalApiResponse = unknown;
export type SystemFeeManagementCreatePolicyTransferInternalApiArg = {
  createSystemFeeManagementDto: CreateSystemFeeManagementDto;
};
export type SystemFeeManagementCreatePolicyPaymentWithFlexpayApiResponse =
  unknown;
export type SystemFeeManagementCreatePolicyPaymentWithFlexpayApiArg = {
  createSystemFeeManagementDto: CreateSystemFeeManagementDto;
};
export type SystemFeeManagementCreatePolicyWithDrawApiResponse = unknown;
export type SystemFeeManagementCreatePolicyWithDrawApiArg = {
  createSystemFeeManagementDto: CreateSystemFeeManagementDto;
};
export type SystemFeeManagementGetDirectDepositListApiResponse =
  /** status 200  */ SystemFeeManagementPageDto;
export type SystemFeeManagementGetDirectDepositListApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  depositMethod?: number[];
  applicableObject?: string;
  applicableObjectId?: number[];
  orderBy?: string;
};
export type SystemFeeManagementGetPolicyPaymentWithBankCardListApiResponse =
  /** status 200  */ SystemFeeManagementPageDto;
export type SystemFeeManagementGetPolicyPaymentWithBankCardListApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  depositMethod?: number[];
  applicableObject?: string;
  applicableObjectId?: number[];
  orderBy?: string;
};
export type SystemFeeManagementGetPolicyPolicyTransferInternalListApiResponse =
  /** status 200  */ SystemFeeManagementPageDto;
export type SystemFeeManagementGetPolicyPolicyTransferInternalListApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  depositMethod?: number[];
  applicableObject?: string;
  applicableObjectId?: number[];
  orderBy?: string;
};
export type SystemFeeManagementGetPolicyPaymentWithFlexpayListApiResponse =
  /** status 200  */ SystemFeeManagementPageDto;
export type SystemFeeManagementGetPolicyPaymentWithFlexpayListApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  depositMethod?: number[];
  applicableObject?: string;
  applicableObjectId?: number[];
  orderBy?: string;
};
export type SystemFeeManagementGetPolicyWithDrawListApiResponse =
  /** status 200  */ SystemFeeManagementPageDto;
export type SystemFeeManagementGetPolicyWithDrawListApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  depositMethod?: number[];
  applicableObject?: string;
  applicableObjectId?: number[];
  orderBy?: string;
};
export type SystemFeeManagementUpdateDirectDepositApiResponse = unknown;
export type SystemFeeManagementUpdateDirectDepositApiArg = {
  id: string;
  updateSystemFeeManagementDto: UpdateSystemFeeManagementDto;
};
export type SystemFeeManagementUpdatePolicyPaymentWithBankCardApiResponse =
  unknown;
export type SystemFeeManagementUpdatePolicyPaymentWithBankCardApiArg = {
  id: string;
  updateSystemFeeManagementDto: UpdateSystemFeeManagementDto;
};
export type SystemFeeManagementUpdatePolicyTransferInternalApiResponse = unknown;
export type SystemFeeManagementUpdatePolicyTransferInternalApiArg = {
  id: string;
  updateSystemFeeManagementDto: UpdateSystemFeeManagementDto;
};
export type SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiResponse =
  unknown;
export type SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiArg = {
  id: string;
  updateSystemFeeManagementDto: UpdateSystemFeeManagementDto;
};
export type SystemFeeManagementUpdatePolicyWithDrawApiResponse = unknown;
export type SystemFeeManagementUpdatePolicyWithDrawApiArg = {
  id: string;
  updateSystemFeeManagementDto: UpdateSystemFeeManagementDto;
};
export type SystemFeeManagementFindOneApiResponse =
  /** status 200  */ SystemFeeManagementDto;
export type SystemFeeManagementFindOneApiArg = {
  id: string;
};
export type SystemFeeManagementRemoveApiResponse = unknown;
export type SystemFeeManagementRemoveApiArg = {
  id: string;
};
export type HistoryFeeManagementFindAllApiResponse =
  /** status 200  */ HistoryFeeManagementPageDto;
export type HistoryFeeManagementFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  historyType?: 'UPDATE_HISTORY' | 'DELETE_HISTORY';
  updatedAt?: string;
  updaterId?: number;
  entityId?: number;
  entityType?: 'SYSTEM_FEE_MANAGEMENT' | 'TRANSACTION_LIMIT';
  orderBy?: string;
};
export type NotificationContextSettingCreateApiResponse = unknown;
export type NotificationContextSettingCreateApiArg = {
  createNotificationContextSettingDto: CreateNotificationContextSettingDto;
};
export type NotificationContextSettingFindAllApiResponse =
  /** status 200  */ NotificationContextSettingPageDto;
export type NotificationContextSettingFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  applicableObject?: string;
  applicableObjectId?: number[];
  status?: boolean;
  from?: string;
  to?: string;
  title?: string;
  serviceType?:
  | 'DEPOSIT_LINK_BANK'
  | 'DEPOSIT_CARD_PHONE'
  | 'DEPOSIT_FAIL'
  | 'CHARGE_CARD_PHONE_NUMBER'
  | 'CHARGE_DATA_3G_4G'
  | 'PAYMENT_CARD_PHONE'
  | 'PAYMENT_DATA_3G_4G'
  | 'TRANSFER_RECEIVE'
  | 'TRANSFER_MOVER'
  | 'WITHDRAW_LINK_BANK'
  | 'WITHDRAW_NOT_LINK_BANK'
  | 'LINK_BANK'
  | 'UNLINK_BANK'
  | 'PAYMENT_BILL'
  | 'WARNING_LOGIN_NEW_DEVICE'
  | 'WARNING_CHANGE_PASSWORD'
  | 'OTHER';
  orderBy?: string;
};
export type NotificationContextSettingFindOneApiResponse =
  /** status 200  */ NotificationContextSettingDetailDto;
export type NotificationContextSettingFindOneApiArg = {
  id: string;
};
export type NotificationContextSettingUpdateApiResponse = unknown;
export type NotificationContextSettingUpdateApiArg = {
  id: string;
  updateNotificationContextSettingDto: UpdateNotificationContextSettingDto;
};
export type NotificationContextSettingRemoveApiResponse = unknown;
export type NotificationContextSettingRemoveApiArg = {
  id: string;
};
export type NotificationContextSettingPublishApiResponse = unknown;
export type NotificationContextSettingPublishApiArg = {
  id: string;
  notificationContextUpDateStatus: NotificationContextUpDateStatus;
};
export type TransactionLimitCreateApiResponse =
  /** status 201  */ CreateTransactionLimitDto;
export type TransactionLimitCreateApiArg = {
  createTransactionLimitDto: CreateTransactionLimitDto;
};
export type TransactionLimitFindAllApiResponse =
  /** status 200  */ TransactionLimitPageDto;
export type TransactionLimitFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  applicableObject?: 'SYSTEM' | 'ACCOUNT_TYPE' | 'PRIVATE_ACCOUNT';
  account?: string;
  accountGroupId?: number[];
  serviceType?: 'DEPOSIT' | 'WITHDRAW' | 'TRANFER' | 'PAYMENT' | 'TOTAL_LIMIT';
  orderBy?: string;
};
export type TransactionLimitUpdateApiResponse = unknown;
export type TransactionLimitUpdateApiArg = {
  id: string;
  updateTransactionLimitDto: UpdateTransactionLimitDto;
};
export type TransactionLimitFindOneByIdApiResponse =
  /** status 200  */ TransactionLimitDetailDto;
export type TransactionLimitFindOneByIdApiArg = {
  id: string;
};
export type TransactionLimitRemoveApiResponse = unknown;
export type TransactionLimitRemoveApiArg = {
  id: string;
};
export type ServiceCreateApiResponse = /** status 201  */ ServiceDetailDto;
export type ServiceCreateApiArg = {
  createServiceDto: CreateServiceDto;
};
export type ServiceFindAllApiResponse = /** status 200  */ ServicePageDto;
export type ServiceFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  serviceId?: number;
  productTypeId?: number;
  featured?: 'NEW_PRODUCT' | 'HOT_PRODUCT' | 'PROMOTION_PRODUCTS';
  groupProduct?: string;
  orderBy?: string;
};
export type ServiceGetAllServiceApiResponse =
  /** status 200  */ ServiceDetailDto[];
export type ServiceGetAllServiceApiArg = void;
export type ServiceUpdateApiResponse = unknown;
export type ServiceUpdateApiArg = {
  id: string;
  updateServiceDto: UpdateServiceDto;
};
export type ServiceRemoveApiResponse = unknown;
export type ServiceRemoveApiArg = {
  id: string;
};
export type ServiceFindByIdApiResponse = /** status 200  */ ServiceDetailDto;
export type ServiceFindByIdApiArg = {
  id: string;
};
export type PaymentOrderFindAllApiResponse =
  /** status 200  */ PaymentOrderPageDto;
export type PaymentOrderFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page: number;
  take: number;
  query?: string;
  id?: string;
  partnerOrderStatus?: number;
  customerPhone?: string;
  partnerOrderCode?: string;
  from?: string;
  to?: string;
  paymentPeriodFrom?: string;
  paymentPeriodTo?: string;
  amount?: number;
  partnerCustomerName?: string;
  paymentServiceType?: 'DISBURSE' | 'REPAYMENT';
  partnerId?: number;
  customerIdentityNumber?: string;
  transactionStatus?:
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS';
  processedId?: string;
  orderBy?: string;
};
export type PaymentOrderFindOneApiResponse =
  /** status 200  */ PaymentOrderDetailDto;
export type PaymentOrderFindOneApiArg = {
  id: string;
};
export type PaymentOrderUpdateApiResponse = /** status 200  */ boolean;
export type PaymentOrderUpdateApiArg = {
  id: string;
  updatePaymentOrderDto: UpdatePaymentOrderDto;
};
export type PaymentOrderGetExportExcelApiResponse = unknown;
export type PaymentOrderGetExportExcelApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  id?: string;
  partnerOrderStatus?: number;
  customerPhone?: string;
  partnerOrderCode?: string;
  from?: string;
  to?: string;
  paymentPeriodFrom?: string;
  paymentPeriodTo?: string;
  amount?: number;
  partnerCustomerName?: string;
  paymentServiceType?: 'DISBURSE' | 'REPAYMENT';
  partnerId?: number;
  customerIdentityNumber?: string;
  transactionStatus?:
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS';
  processedId?: string;
  orderBy?: string;
};
export type PaymentPartnerFindAllApiResponse =
  /** status 200  */ PaymentPartnerPageDto;
export type PaymentPartnerFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page: number;
  take: number;
  query?: string;
  active?: boolean;
  type: 'DISBURSE' | 'REPAYMENT';
  name?: string;
  paymentServiceId?: number;
  orderBy?: string;
};
export type PaymentPartnerGetPartnerOderDetailApiResponse =
  /** status 200  */ BillDto;
export type PaymentPartnerGetPartnerOderDetailApiArg = {
  paymentPartnerId?: number;
  /** CUSTOMER122341 , CUSTOMER1233131, CUSTOMER1233331, CUSTOMER2233331, PD05000112340, PD15040122340, PD1514131211, PD1524131312 */
  billCode: string;
  type?: 'DISBURSE' | 'REPAYMENT';
};
export type PaymentPartnerFindOneApiResponse =
  /** status 200  */ PaymentPartnerDetailDto;
export type PaymentPartnerFindOneApiArg = {
  id: number;
};
export type PaymentPartnerUpdateApiResponse = /** status 200  */ boolean;
export type PaymentPartnerUpdateApiArg = {
  id: number;
  body: FormData;
};
export type PaymentPartnerDeleteApiResponse = /** status 200  */ boolean;
export type PaymentPartnerDeleteApiArg = {
  id: number;
};
export type PaymentPartnerCreateApiResponse = /** status 201  */ boolean;
export type PaymentPartnerCreateApiArg = FormData;
export type PaymentServiceFindAllApiResponse =
  /** status 200  */ PaymentServicePageDto;
export type PaymentServiceFindAllApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  type?: 'DISBURSE' | 'REPAYMENT';
  active?: boolean;
  name?: string;
  orderBy?: string;
};
export type PaymentServiceFindOneApiResponse =
  /** status 200  */ PaymentServiceDetailDto;
export type PaymentServiceFindOneApiArg = {
  id: number;
};
export type PaymentServiceUpdateApiResponse = /** status 200  */ boolean;
export type PaymentServiceUpdateApiArg = {
  id: number;
  formData: FormData;
};
export type PaymentServiceDeleteApiResponse = /** status 200  */ boolean;
export type PaymentServiceDeleteApiArg = {
  id: number;
};
export type PaymentServiceCreateApiResponse = /** status 201  */ boolean;
export type PaymentServiceCreateApiArg = FormData;
export type BillFindAllApiResponse = /** status 200  */ Bill[];
export type BillFindAllApiArg = void;
export type BillCreateApiResponse = /** status 201  */ boolean;
export type BillCreateApiArg = {
  createBillDto: CreateBillDto;
};
export type BillDeleteApiResponse = /** status 200  */ boolean;
export type BillDeleteApiArg = void;
export type DashboardStatisticApiResponse = /** status 200  */ {
  percentPreDisbursementNeedPayment: number;
  percentReDisbursementPartnerHasTx: number;
  percentRepaymentPartnerHasTx: number;
  percentRepaymentPayed: number;
  preDisbursementAmount: number;
  preDisbursementAmountError: number;
  preDisbursementTx: number;
  preDisbursementTxError: number;
  preDisbursementTxLastMonth: number;
  repaymentAmount: number;
  repaymentAmountError: number;
  repaymentTx: number;
  repaymentTxError: number;
  repaymentTxLastMonth: number;
  totalLiabilities: number;
};
export type DashboardStatisticApiArg = {
  time: string;
};
export type DashboardSendSmsApiResponse = /** status 200  */ SmsPaginationDto;
export type DashboardSendSmsApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  from?: string;
  to?: string;
  orderBy?: string;
};
export type DashboardOverviewApiResponse = Record<string, any>[];
export type DashboardOverviewApiArg = {
  year: string;
};
export type RefundGetRefundMoneyApiResponse = RefundPageDto;
export type RefundGetRefundMoneyApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  code?: string;
  merchantAccount?: string;
  merchant?: string;
  status?: string;
  from?: string;
  to?: string;
  orderBy?: string;
};
export type RefundFindOneApiResponse = /** status 200  */ RefundDto;
export type RefundFindOneApiArg = {
  id: string;
};
export type RefundRefundApiResponse = /** status 201  */ RefundDto;
export type RefundRefundApiArg = {
  id: string;
};
export type RefundGetExportCsvApiResponse = unknown;
export type RefundGetExportCsvApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  code?: string;
  merchantAccount?: string;
  merchant?: string;
  status?: string;
  from?: string;
  to?: string;
  orderBy?: string;
};
export type ReportGetMetricOfAccountApiResponse =
  /** status 200  */ AccountMetricDataDto;
export type ReportGetMetricOfAccountApiArg = {
  reportType?: 'DAY' | 'LAST_DAY' | 'WEEK' | 'MONTH';
};
export type ReportGetMetricAccountRegisterApiResponse =
  /** status 200  */ ReportPageDto;
export type ReportGetMetricAccountRegisterApiArg = {
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number;
  query?: string;
  from?: string;
  to?: string;
  orderBy?: string;
};
export type ReportGetMetricDeviceApiResponse =
  /** status 200  */ MetricDataDeviceDto;
export type ReportGetMetricDeviceApiArg = void;
export type ReportGetMetricProvinceApiResponse = /** status 200  */ AppMetrics[];
export type ReportGetMetricProvinceApiArg = {
  order?: 'ASC' | 'DESC';
  take?: number;
};
export type ReportGetStateBankOverviewApiResponse =
  /** status 200  */ ReportPageDto;
export type ReportGetStateBankOverviewApiArg = PaginationParams & {
  name?: string;
  email?: string;
  phone?: string;
  status?: accountStatus.LINKED | accountStatus.NOT_VERIFIED | accountStatus.VERIFIED;
  type?: ReportType;
  linkBank?: string;
  from?: string;
  to?: string;
}
export type ReportGetAccountGuaranteeApiResponse =
  /** status 200  */ ReportPageDto;
export type ReportGetAccountGuaranteeApiArg = PaginationParams & {
  name?: string;
  walletNumber?: string;
  startDate?: string;
  endDate?: string;
}
export type SystemSettingFindAllApiResponse = /** status 200  */ SystemSetting[];
export type SystemSettingFindAllApiArg = void;
export type SystemSettingCreateApiResponse = /** status 201  */ SystemSetting;
export type SystemSettingCreateApiArg = {
  createSystemSettingDto: CreateSystemSettingDto;
};
export type SystemSettingFindAllFeePrinciplesApiResponse =
  /** status 200  */ SystemSetting[];
export type SystemSettingFindAllFeePrinciplesApiArg = void;
export type SystemSettingFindOneByKeyApiResponse =
  /** status 200  */ SystemSetting;
export type SystemSettingFindOneByKeyApiArg = {
  key: string;
};
export type PageMetaDto = {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
export type PageMetaSearchDto = {
  page: number;
  take: number;
};
export type UserPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type GroupPermission = {
  groupId: number;
  permissionId: number;
  group: Group;
  permission: Permission;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Group = {
  name: string;
  status: number;
  groupPermissions: GroupPermission[];
  permissions: Permission[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Permission = {
  permission: string;
  description: string;
  groups: Group[];
  groupPermissions: Permission[];
  users: User[];
  userPermissions: Permission[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type UserPermission = {
  userId: number;
  permissionId: number;
  user: User;
  permission: Permission;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type CustomerDevice = {
  deviceId: string;
  deviceAgent: string;
  platformName: string;
  platformVersion: string;
  firebaseMessagingToken: string;
  lastUseAt: string;
  customer: Customer;
  customerId?: number;
  biometricPublicKey: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Service = {
  name: string;
  productTypes: ProductType[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type ProductType = {
  name: string;
  serviceId: number;
  service: Service;
  showApp: number;
  showWeb: number;
  groupProducts: GroupProduct[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type GroupProduct = {
  name: string;
  productTypeId: number;
  showApp: number;
  showWeb: number;
  description: string;
  avatar: string;
  featured: string;
  productType: ProductType;
  products: Product[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type SalesFee = {
  applicableObject: string;
  applicableAccountId: number;
  applicableAccount: Customer;
  accountGroupId: number;
  accountGroup: AccountGroup;
  productId: number;
  product: Product;
  variableFee: number;
  fixedFee: number;
  startDate: string;
  endDate: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Product = {
  name: string;
  price: number;
  isShow: number;
  groupProductId: number;
  groupProduct: GroupProduct;
  productDiscount: ProductDiscount;
  salesFee: SalesFee;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type ProductDiscount = {
  applicableObject: string;
  applicableAccountId: number;
  applicableAccount: Customer;
  accountGroupId: number;
  accountGroup: AccountGroup;
  productId: number;
  product: Product;
  discount: number;
  fixedFee: number;
  startDate: string;
  endDate: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type TransactionLimit = {
  name: string;
  userId: number;
  applicableObject: string;
  accountGroupId: number;
  accountGroup: AccountGroup;
  accountId: number;
  account: Customer;
  limitType: string;
  valueTypeLimit: string;
  value: number;
  timeTypeApply: string;
  startDate: string;
  serviceType: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type AccountGroup = {
  name: string;
  customerType: string;
  customers: Customer[];
  productDiscount: ProductDiscount;
  saleFee: SalesFee;
  transactionLimit: TransactionLimit;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type FileManager = {
  id: string;
  createdAt: string;
  updatedAt: string;
  uri: string;
  mimetype: string;
  originalName: string;
  ownerId: string;
  ownerType:
  | 'USER'
  | 'CUSTOMER'
  | 'CUSTOMER_ENTERPRISE'
  | 'CUSTOMER_VERIFICATION';
};
export type CustomerVerification = {
  customer: Customer;
  customerId: number;
  documentType: 'ID' | 'PASSPORT' | 'DRIVER_LICENSE';
  status: 'PENDING' | 'VERIFIED' | 'REFUSED';
  verifier: User;
  verifiedAt: string;
  requestedAt: string;
  documents: FileManager[];
  fullName: string;
  gender: 0 | 1 | 2;
  birthDay: string;
  identityNumber: string;
  dateOfIdentityIssuance: string;
  placeOfIdentityIssuance: string;
  address: string;
  village: string;
  district: string;
  province: string;
  placeOfResidence: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Balance = {
  customer: Customer;
  customerId: number;
  type: 'REPAYMENT' | 'FEE' | 'VAT' | 'DISBURSE' | 'LINKED_BANK' | 'NORMAL';
  availableMoney: number;
  freezedMoney: number;
  reasonFreezed: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type CustomerSecuritySetting = {
  customer: Customer;
  customerId: number;
  key: string;
  value: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Notification = {
  customerId: number;
  title: string;
  body: string;
  status: number;
  typeId: string;
  type:
  | 'DEPOSIT'
  | 'TRANSFER'
  | 'WITHDRAWAL'
  | 'RECEIVAL'
  | 'PAYMENT'
  | 'REFUND'
  | 'WARNING_LOGIN'
  | 'BORROW_MONEY'
  | 'WARNING_CHANGE_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'PAYMENT_LINK'
  | 'ORTHER'
  | 'SALE_FEE'
  | 'PRODUCT_DISCOUNT'
  | 'BILL_PAYMENT';
  subTitle: string;
  notificationIcon: string;
  filterType: 'TRANSACTION' | 'COUPON' | 'REMIND' | 'UPDATE' | 'ORTHER';
  customer: Customer;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Customer = {
  type: string;
  gender: 0 | 1 | 2;
  password: string;
  fullName: string;
  birthDay: string;
  avatar: string;
  phoneNumber: string;
  identityNumber: string;
  dateOfIdentityIssuance: string;
  placeOfIdentityIssuance: string;
  address: string;
  village: string;
  district: string;
  province: string;
  email: string;
  placeOfResidence: string;
  referralCode: string;
  needReLogin: string;
  changePasswordRequired: string;
  changePasswordToken: string;
  active: number;
  devices: CustomerDevice[];
  usageLimit: number;
  emailVerified: number;
  lastChangePassword: string;
  accountGroupId: number;
  accountGroup: AccountGroup;
  reasonLock: string;
  status: accountStatus.LINKED | accountStatus.NOT_VERIFIED | accountStatus.VERIFIED;
  customerVerification: CustomerVerification;
  customerVerificationId: number;
  hasTransactions: number;
  lockedAt: string;
  balances: Balance[];
  paymentLinks: PaymentLinkCustomerDto[];
  securitySetting: CustomerSecuritySetting[];
  freeze_balance_history: FreezeBalanceHistory[];
  notifications: Notification[];
  totalNotification: string;
  saleFee: SalesFee;
  isNotification: number;
  isMyOffer: number;
  isTransaction: number;
  isGeneralSetting: number;
  isRemind: number;
  device: CustomerDevice;
  accountNumber: string;
  accountName: string;
  productDiscount: ProductDiscount;
  isLogout: number;
  transactionLimit: TransactionLimit;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type FreezeBalanceHistory = {
  reason: string;
  freezeMoney: number;
  customerId: number;
  userId: number;
  status: number;
  customer: Customer;
  user: User;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type FeeManagementDeposit = {
  bankId: number;
  systemFeeManagementId: number;
  bank: Bank;
  systemFeeManagement: SystemFeeManagement;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type Bank = {
  name: string;
  tradingName: string;
  bankCode: string;
  active: number;
  image: string;
  shortLogo: string;
  website: string;
  address: string;
  priority: number;
  type: 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY';
  systemFeeManagements: SystemFeeManagement[];
  feeManagementDeposits: FeeManagementDeposit[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type SystemFeeManagement = {
  user: User;
  userId: number;
  applicableObject: string;
  applicableObjectId: number;
  startDate: string;
  endDate: string;
  transactionFrom: number;
  transactionTo: number;
  transferorFlexibleFee: number;
  transferorFixedFee: number;
  transferorFeeMin: number;
  transferorFeeMax: number;
  receiverFlexibleFee: number;
  receiverFixedFee: number;
  receiverFeeMin: number;
  receiverFeeMax: number;
  policyManagementType:
  | 'TRANSFER_INTERNAL'
  | 'DEPOSIT_FLEXPAY'
  | 'PAYMENT_FLEXPAY'
  | 'PAYMENT_BANK_OR_ATM'
  | 'WITHDRAW';
  banks: Bank[];
  type: 'FLEXIBLE' | 'FIXED';
  feeManagementDeposits: FeeManagementDeposit[];
  applicableObjectName: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type HistoryFeeManagement = {
  user: User;
  userId: number;
  userNameCreate: string;
  historyType: 'UPDATE_HISTORY' | 'DELETE_HISTORY';
  valueType: string;
  oldValue: string;
  newValue: string;
  createTime: string;
  entityId: number;
  entityType: 'SYSTEM_FEE_MANAGEMENT' | 'TRANSACTION_LIMIT';
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type User = {
  email: string;
  password: string;
  fullName: string;
  forgotPasswordToken: string;
  active: number;
  phoneNumber: string;
  avatar: string;
  permissions: string[];
  userPermissions: UserPermission[];
  freeze_balance_history: FreezeBalanceHistory[];
  systemFeeManagements: SystemFeeManagement[];
  historyFeeManagements: HistoryFeeManagement[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type CreateUserDto = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
};
export type OtpDataDto = {
  trackingId: string;
};
export type AdminGetOtp = {
  email: string;
  action: 'ADMIN_CHANGE_PASSWORD';
};
export type UserLoginResponse = {
  accessToken: string;
  id: number;
  tokenType: string;
};
export type UserLoginDto = {
  email: string;
  password: string;
};
export type UserDetailDto = {
  id: number;
  email: string;
  fullName: string;
  status: boolean;
  jwtId: string;
  securityMethod: 'SMS' | 'EMAIL' | 'SMART_OTP' | 'OTHER';
  accountStatus: string;
  type: string;
  device: CustomerDevice;
  phoneNumber: string;
  avatar: string;
  active: number;
  permissions: string[];
};
export type UpdateUserDto = {
  fullName: string;
};
export type ChangeUserPasswordDto = {
  password: string;
  newPassword: string;
  otpCode: string;
  trackingId: string;
};
export type SetPermissionForUserDto = {
  permissionIds: number[];
  email: string;
  fullName: string;
  phoneNumber: string;
};
export type UserForgotPassword = {
  email: string;
};
export type UserNewPassword = {
  newPassword: string;
};
export type UpdatePermissionForUserDto = {
  permissionIds: number[];
  permissionDeleteIds: number[];
};
export type CustomerPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type SettingSecurityDataDto = {
  id: number;
  phoneNumber: string;
  accountNumber: string;
  accountName: string;
  usageLimit: number;
  securityMethod: 'SMS' | 'EMAIL' | 'SMART_OTP' | 'OTHER';
};
export type BalanceDto = {
  id: number;
  type: string;
  availableMoney: number;
  freezedMoney: number;
  reasonFreezed: string;
  createdAt: string;
  updatedAt: string;
};
export type CustomerBalanceDetailDto = {
  balances: BalanceDto[];
  id: number;
  type: 'PERSONAL' | 'ENTERPRISE';
  gender: number;
  fullName: string;
  birthDay: string;
  avatar: string;
  phoneNumber: string;
  identityNumber: string;
  dateOfIdentityIssuance: string;
  placeOfIdentityIssuance: string;
  address: string;
  village: string;
  district: string;
  province: string;
  email: string;
  referralCode: string;
  active: boolean;
  activeAndVerified: boolean;
  isLocked: boolean;
  isTempLocked: boolean;
  accountNumber: string;
  status: 'LINKED' | 'NOT_VERIFIED' | 'VERIFIED';
  hasTransactions: boolean;
  isNotification: boolean;
  isMyOffer: boolean;
  isTransaction: boolean;
  isGeneralSetting: boolean;
  isRemind: boolean;
  activeTransaction: boolean;
  activeMyOffer: boolean;
  activeGeneralSetting: boolean;
  activeIsRemind: boolean;
  createdAt: string;
  lockedAt: string | null;
  customerVerification: CustomerVerification;
  paymentLinks: PaymentLinkCustomerDto[];
};
export type CustomerDto = {
  id: number;
  type: 'PERSONAL' | 'ENTERPRISE';
  gender: number;
  fullName: string;
  birthDay: string;
  avatar: string;
  phoneNumber: string;
  identityNumber: string;
  dateOfIdentityIssuance: string;
  placeOfIdentityIssuance: string;
  address: string;
  village: string;
  district: string;
  province: string;
  email: string;
  referralCode: string;
  active: boolean;
  activeAndVerified: boolean;
  isLocked: boolean;
  isTempLocked: boolean;
  accountNumber: string;
  status: accountStatus.LINKED | accountStatus.NOT_VERIFIED | accountStatus.VERIFIED;
  hasTransactions: boolean;
  isNotification: boolean;
  isMyOffer: boolean;
  isTransaction: boolean;
  isGeneralSetting: boolean;
  isRemind: boolean;
  activeTransaction: boolean;
  activeMyOffer: boolean;
  activeGeneralSetting: boolean;
  activeIsRemind: boolean;
  createdAt: string;
};
export type UpdateCustomerDto = {
  email: string;
  address: string;
};
export type CreateCustomerPersonalDto = {
  password: string;
  fullName: string;
  birthDay: string;
  phoneNumber: string;
  identityNumber: string;
  dateOfIdentityIssuance: string;
  placeOfIdentityIssuance: string;
  email: string;
  referralCode: string;
  type: any;
  address: string;
  village: string;
  district: string;
  province: string;
};
export type ToggleActiveDto = {
  reason: string;
};
export type ChangePasswordDto = {
  id: number;
  password: string;
};
export type GroupPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type SetPermissionForGroupDto = {
  groupName: string;
  permissionNames: string[];
  permissionDeleteNames: string[];
};
export type CreateAccountGroupDto = {
  name: string;
  customerType: 'PERSONAL' | 'ENTERPRISE';
  customerIds: number[];
};
export type AccountGroupPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateAccountGroupDto = {
  name?: string;
  customerType?: 'PERSONAL' | 'ENTERPRISE';
  customerIds: number[];
};
export type AccountGroupDto = {
  id: number;
  customerType: 'PERSONAL' | 'ENTERPRISE';
  name: string;
  customers: CustomerDto[];
};
export type CustomerVerificationPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type FileManagerDto = {
  id: number;
  uri: string;
  originalName: string;
  mimetype: string;
  ownerId: string;
  ownerType: string;
};
export type CustomerVerificationDto = {
  id: number;
  frontImage: string;
  backImage: string;
  portraitImage: string;
  documentType: 'ID' | 'PASSPORT' | 'DRIVER_LICENSE';
  status: 'PENDING' | 'VERIFIED' | 'REFUSED';
  verifier: Customer;
  verifiedAt: string;
  requestedAt: Customer;
  customer: CustomerDto;
  documents: FileManagerDto[];
  gender: number;
  fullName: string;
  birthDay: string;
  identityNumber: string;
  dateOfIdentityIssuance: string;
  placeOfIdentityIssuance: string;
  address: string;
  village: string;
  district: string;
  province: string;
  placeOfResidence: string;
};
export type UpdateCustomerVerificationDto = {
  status?: 'PENDING' | 'VERIFIED' | 'REFUSED';
};
export type CreateProductTypeDto = {
  name: string;
  serviceId: number;
  showApp: number;
  showWeb: number;
};
export type ProductTypePageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type ProductDetailDto = {
  id: number;
  name: string;
  isShow: number;
  price: number;
  groupProduct: GroupProductDetailDto;
};
export type GroupProductDetailDto = {
  id: number;
  name: string;
  showApp: number;
  showWeb: number;
  description: string;
  avatar: string;
  featured: string;
  productType: ProductTypeDetailDto;
  products: ProductDetailDto[];
};
export type ServiceDetailDto = {
  id: number;
  name: string;
  productTypes: ProductTypeDetailDto[];
};
export type ProductTypeDetailDto = {
  id: number;
  name: string;
  updatedAt: string;
  showApp: number;
  showWeb: number;
  groupProducts: GroupProductDetailDto[];
  service: ServiceDetailDto;
};
export type UpdateProductTypeDto = {
  name?: string;
  serviceId?: number;
  showApp?: number;
  showWeb?: number;
};
export type TransactionPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type TransactionDto = {
  code: string;
  amount: number;
  fee: number;
  status:
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS';
  from: string;
  to: string;
  note: string;
  createdAt: string;
  type: string;
  id: string;
  transactionDate: string;
  sourceAccountName: string;
  sourceAccountType: string;
  destinationAccountName: string;
  destinationAccountType: string;
  referenceId: string;
  references: TransactionReference[];
  subType: string;
};
export type TransactionReference = {
  amount: number;
  classify: string;
  code: string;
  createdAt: string;
  deletedAt: string;
  destinationAccountName: string;
  destinationAccountType: string;
  errorCode: string;
  errorMessage: string;
  fee: number;
  from: string;
  ftTransactionId: string;
  id: string;
  note: string;
  referenceId: string;
  sourceAccountName: string;
  sourceAccountType: string;
  status: string;
  to: string;
  transactionDate: string;
  transactionInfo: {
    requestId: string;
  };
  type: string;
  updatedAt: string;
  subType: string;
};
export type UpdateTransactionStatusDto = {
  status:
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS';
};
export type CreateGroupProductDto = {
  name: string;
  productTypeId: number;
  showWeb: number;
  showApp: number;
  description: string;
  featured: 'NEW_PRODUCT' | 'HOT_PRODUCT' | 'PROMOTION_PRODUCTS';
  file?: Blob;
};
export type GroupProductPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateGroupProductDto = {
  name?: string;
  productTypeId?: number;
  showWeb?: number;
  showApp?: number;
  description?: string;
  featured?: 'NEW_PRODUCT' | 'HOT_PRODUCT' | 'PROMOTION_PRODUCTS';
  file?: Blob;
  image?: string;
};
export type ProductPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type CreateProductDto = {
  groupProductId: number;
  name: string;
  price: number;
  isShow: number;
};
export type UpdateProductDto = {
  groupProductId?: number;
  name?: string;
  price?: number;
  isShow?: number;
};
export type PaymentLinkPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type BankDto = {
  id: number;
  name: string;
  tradingName: number;
  bankCode: number;
  image: number;
  type: 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY';
};
export type PaymentLinkCmsDto = {
  id: number;
  payerName: string;
  payerDebit: string;
  status: boolean;
  createdAt: string;
  bank: BankDto;
  customer: CustomerDto;
};

export type PaymentLinkCustomerDto = {
  id: number;

  cardBrand: string;

  payerName: string;

  issueDate: string;

  payerDebit: string;

  type: string;

  token: string;

  provider: string;
  createdAt: string;
  deletedAt: string;
};

export type BankPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateBankDto = {
  name: string;
  tradingName: string;
  active?: number;
  image?: Blob;
  shortLogo?: Blob;
  website: string;
  address: string;
  priority?: number;
  type: 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY';
  logo?: string;
  bigImage?: string;
};
export type BankDetailDto = {
  id: number;
  createdAt: string;
  name: string;
  tradingName: string;
  bankCode: string;
  active: number;
  image: string;
  shortLogo: string;
  website: string;
  address: string;
  priority: number;
  type: string;
};
export type CreateFreezeBalanceHistoryDto = {
  reason: string;
  freezeMoney: number;
  customerAccountNumber: string;
};
export type FreezeBalanceHistoryPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type OpenFreezeBalanceHistoryDto = {
  reason: string;
  OpenFreezeMoney: number;
  customerAccountNumber: string;
};
export type CreateSaleFeeDto = {
  applicableObject: 'SYSTEM' | 'ACCOUNT_TYPE' | 'PRIVATE_ACCOUNT';
  accountGroupId?: number;
  account?: string;
  productId: number;
  variableFee: number;
  fixedFee: number;
  startDate: string;
  endDate?: string;
};
export type SaleFeePageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateSaleFeeDto = {
  applicableObject?: 'SYSTEM' | 'ACCOUNT_TYPE' | 'PRIVATE_ACCOUNT';
  accountGroupId?: number;
  account?: string;
  productId?: number;
  variableFee?: number;
  fixedFee?: number;
  startDate?: string;
  endDate?: string;
};
export type SaleFeeDetailDto = {
  id: number;
  applicableObject: string;
  applicableAccount: Customer;
  accountGroup: AccountGroup;
  variableFee: number;
  fixedFee: number;
  startDate: string;
  endDate: string;
  intoMoney: number;
  denominations: number;
  product: ProductDetailDto;
};
export type CreateSystemFeeManagementDto = {
  applicableObject:
  | 'SYSTEM'
  | 'PERSONAL_ACCOUNT'
  | 'CORPORATE_ACCOUNT'
  | 'SPECIFIC_BUSSINESS_ACCOUNT'
  | 'ACCOUNT_GROUP'
  | 'SPECIFIC_INDIVIDUALS';
  applicableObjectId: number;
  transactionFrom: number;
  transactionTo: number;
  transferorFlexibleFee: number;
  transferorFixedFee: number;
  transferorFeeMin: number;
  transferorFeeMax: number;
  receiverFlexibleFee: number;
  receiverFixedFee: number;
  receiverFeeMin: number;
  receiverFeeMax: number;
  depositMethod: number[];
  startDate: string;
  endDate: string;
  type: 'FLEXIBLE' | 'FIXED';
};
export type SystemFeeManagementPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateSystemFeeManagementDto = {
  applicableObject?:
  | 'SYSTEM'
  | 'PERSONAL_ACCOUNT'
  | 'CORPORATE_ACCOUNT'
  | 'SPECIFIC_BUSSINESS_ACCOUNT'
  | 'ACCOUNT_GROUP'
  | 'SPECIFIC_INDIVIDUALS';
  applicableObjectId?: number;
  transactionFrom?: number;
  transactionTo?: number;
  transferorFlexibleFee?: number;
  transferorFixedFee?: number;
  transferorFeeMin?: number;
  transferorFeeMax?: number;
  receiverFlexibleFee?: number;
  receiverFixedFee?: number;
  receiverFeeMin?: number;
  receiverFeeMax?: number;
  depositMethod?: number[];
  startDate?: string;
  endDate?: string;
  type?: 'FLEXIBLE' | 'FIXED';
  valueTypeUpdate: string[];
  valueTypeDelete: string[];
};
export type SystemFeeManagementDto = {
  applicableObjectName: string;
  depositMethodIds: number[];
  id: number;
  applicableObject: string;
  applicableObjectId: number;
  transactionFrom: number;
  transactionTo: number;
  transferorFlexibleFee: number;
  transferorFixedFee: number;
  transferorFeeMin: number;
  transferorFeeMax: number;
  receiverFlexibleFee: number;
  receiverFixedFee: number;
  receiverFeeMin: number;
  receiverFeeMax: number;
  startDate: string;
  endDate: string;
  feeType: string;
  createdAt: string;
  updatedAt: string;
  depositMethods: string;
};
export type HistoryFeeManagementPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type CreateNotificationContextSettingDto = {
  serviceType:
  | 'DEPOSIT_LINK_BANK'
  | 'DEPOSIT_CARD_PHONE'
  | 'DEPOSIT_FAIL'
  | 'CHARGE_CARD_PHONE_NUMBER'
  | 'CHARGE_DATA_3G_4G'
  | 'PAYMENT_CARD_PHONE'
  | 'PAYMENT_DATA_3G_4G'
  | 'TRANSFER_RECEIVE'
  | 'TRANSFER_MOVER'
  | 'WITHDRAW_LINK_BANK'
  | 'WITHDRAW_NOT_LINK_BANK'
  | 'LINK_BANK'
  | 'UNLINK_BANK'
  | 'PAYMENT_BILL'
  | 'WARNING_LOGIN_NEW_DEVICE'
  | 'WARNING_CHANGE_PASSWORD'
  | 'OTHER';
  applicableObject:
  | 'SYSTEM'
  | 'PERSONAL_ACCOUNT'
  | 'CORPORATE_ACCOUNT'
  | 'SPECIFIC_BUSSINESS_ACCOUNT'
  | 'ACCOUNT_GROUP'
  | 'SPECIFIC_INDIVIDUALS';
  applicableObjectId: number;
  title: string;
  body: string;
  status: boolean;
  startDate: string;
};
export type NotificationContextSettingPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type NotificationContextSettingDetailDto = {
  id: number;
  applicableObject: string;
  applicableObjectId: number;
  title: string;
  body: string;
  startDate: string;
  status: boolean;
  serviceType: string;
  createdAt: string;
  updatedAt: string;
};
export type UpdateNotificationContextSettingDto = {
  serviceType?:
  | 'DEPOSIT_LINK_BANK'
  | 'DEPOSIT_CARD_PHONE'
  | 'DEPOSIT_FAIL'
  | 'CHARGE_CARD_PHONE_NUMBER'
  | 'CHARGE_DATA_3G_4G'
  | 'PAYMENT_CARD_PHONE'
  | 'PAYMENT_DATA_3G_4G'
  | 'TRANSFER_RECEIVE'
  | 'TRANSFER_MOVER'
  | 'WITHDRAW_LINK_BANK'
  | 'WITHDRAW_NOT_LINK_BANK'
  | 'LINK_BANK'
  | 'UNLINK_BANK'
  | 'PAYMENT_BILL'
  | 'WARNING_LOGIN_NEW_DEVICE'
  | 'WARNING_CHANGE_PASSWORD'
  | 'OTHER';
  applicableObject?:
  | 'SYSTEM'
  | 'PERSONAL_ACCOUNT'
  | 'CORPORATE_ACCOUNT'
  | 'SPECIFIC_BUSSINESS_ACCOUNT'
  | 'ACCOUNT_GROUP'
  | 'SPECIFIC_INDIVIDUALS';
  applicableObjectId?: number;
  title?: string;
  body?: string;
  status?: boolean;
  startDate?: string;
};
export type NotificationContextUpDateStatus = {
  status: boolean;
};
export type CreateTransactionLimitDto = {
  name: string;
  applicableObject: 'SYSTEM' | 'ACCOUNT_TYPE' | 'PRIVATE_ACCOUNT';
  accountGroupId?: number;
  accountNumber?: string;
  limitType: 'LIMIT_MIN' | 'LIMIT_MAX';
  valueTypeLimit: 'VALUE' | 'TIMES';
  value: number;
  timeTypeApply: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  startDate: string;
  serviceType: 'DEPOSIT' | 'WITHDRAW' | 'TRANFER' | 'PAYMENT' | 'TOTAL_LIMIT';
};
export type TransactionLimitPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateTransactionLimitDto = {
  name?: string;
  applicableObject?: 'SYSTEM' | 'ACCOUNT_TYPE' | 'PRIVATE_ACCOUNT';
  accountGroupId?: number;
  accountNumber?: string;
  limitType?: 'LIMIT_MIN' | 'LIMIT_MAX';
  valueTypeLimit?: 'VALUE' | 'TIMES';
  value?: number;
  timeTypeApply?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  startDate?: string;
  serviceType?: 'DEPOSIT' | 'WITHDRAW' | 'TRANFER' | 'PAYMENT' | 'TOTAL_LIMIT';
  accountId?: number;
  valueTypeUpdate: string[];
  valueTypeDelete: string[];
};
export type TransactionLimitDetailDto = {
  id: number;
  name: string;
  applicableObject: string;
  account: Customer;
  accountGroup: AccountGroup;
  limitType: string;
  valueTypeLimit: string;
  value: number;
  timeTypeApply: string;
  startDate: string;
  serviceType: string;
};
export type CreateServiceDto = {
  name: string;
};
export type ServicePageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type UpdateServiceDto = {
  name?: string;
};
export type PaymentOrderPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type PaymentOrderPartnerDto = {
  id: string;
  name: string;
};
export type PaymentOrderCustomerPartnerDto = {
  partnerCustomerName: string;
  partnerCustomerPhone: string;
  paymentPartner: PaymentOrderPartnerDto;
  customer: CustomerDto;
};
export type PaymentOrderDetailDto = {
  id: string;
  createdAt: string;
  processedId: string;
  partnerOrderCode: string;
  partnerOrderStatus: number;
  amount: number;
  paymentPeriodFrom: string;
  paymentPeriodTo: string;
  partner: number;
  paymentServiceType: number;
  transactionStatus: string;
  balanceSource: number;
  customerPaymentPartner: PaymentOrderCustomerPartnerDto;
};
export type UpdatePaymentOrderDto = {
  partnerOrderStatus?: number;
};
export type PaymentPartnerPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type PaymentServiceDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  logo: string;
  type: string;
  active: boolean;
  createdBy: UserDetailDto;
  updatedBy: UserDetailDto;
};
export type PaymentPartnerDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  logo: string;
  active: boolean;
  paymentService: PaymentServiceDto;
  createdBy: UserDetailDto;
  updatedBy: UserDetailDto;
  description: string;
};
export type BillDetailDto = {
  id: string;
  createdAt: string;
  amount: number;
  period: string;
  code: string;
};
export type BillDto = {
  id: string;
  createdAt: string;
  partner: PaymentPartnerDto;
  partnerId: number;
  partnerCustomerName: string;
  partnerOrderCode: string;
  partnerCustomerAddress: string;
  status: boolean;
  amount: number;
  fee: number;
  billDetails: BillDetailDto[];
};
export type PaymentPartnerDetailDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  logo: string;
  active: boolean;
  paymentService: PaymentServiceDto;
  createdBy: UserDetailDto;
  updatedBy: UserDetailDto;
  description: string;
};
export type PaymentServicePageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type PaymentServiceDetailDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  logo: string;
  type: string;
  active: boolean;
  createdBy: UserDetailDto;
  updatedBy: UserDetailDto;
};
export type PaymentService = {
  name: string;
  logo: string;
  active: number;
  createdBy: User;
  updatedBy: User;
  type: 'DISBURSE' | 'REPAYMENT';
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type BalanceInternal = {
  paymentPartner: PaymentPartner;
  paymentPartnerId: number;
  availableMoney: number;
  key: string;
  type: 'REPAYMENT' | 'FEE' | 'VAT' | 'DISBURSE' | 'LINKED_BANK' | 'NORMAL';
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type PaymentPartner = {
  name: string;
  logo: string;
  active: number;
  createdBy: User;
  updatedBy: User;
  paymentService: PaymentService;
  paymentServiceId: number;
  description: string;
  balance: BalanceInternal;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type BillDetail = {
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  period: string;
  bill: Bill;
  billId: string;
  code: string;
};
export type Bill = {
  id: string;
  createdAt: string;
  updatedAt: string;
  partner: PaymentPartner;
  partnerId: number;
  partnerCustomerName: string;
  partnerOrderCode: string;
  partnerCustomerAddress: string;
  status: number;
  amount: number;
  fee: number;
  billDetails: BillDetail[];
};
export type CreateBillDetailItemDto = {
  code: string;
  amount: number;
  period: string;
};
export type CreateBillDto = {
  partnerId: number;
  partnerCustomerName: string;
  partnerOrderCode: string;
  parnterCustomerAddress: string;
  status: boolean;
  amount: number;
  fee: number;
  billDetails?: CreateBillDetailItemDto[];
};
export type SmsPaginationDto = {
  data: any[];
  meta: PageMetaDto;
};
export type RefundPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type RefundDto = {
  code: string;
  amount: number;
  fee: number;
  status:
  | 'SUCCESS'
  | 'APPROVED'
  | 'PENDING'
  | 'FAILED'
  | 'ERROR'
  | 'REFUND_SUCCESS';
  from: string;
  to: string;
  note: string;
  createdAt: string;
  type: string;
  id: string;
  gateway: string;
  fromCustomer: Customer;
  toCustomer: Customer;
};
export type AccountMetricDataDto = {
  totalAccount: number;
  totalAccountActive: number;
  totalAccountKyc: number;
  totalPersonalAccount: number;
  totalAccountToday: number;
  totalAccountActiveToday: number;
  totalAccountKycToday: number;
  totalPersonalAccountToday: number;
  isTotalAccount: boolean;
  isTotalAccountActive: boolean;
  isTotalAccountKyc: boolean;
  isTotalAccountPersonal: boolean;
};
export type ReportPageDto = {
  data: any[];
  meta: PageMetaDto;
};
export type MetricDataDeviceDto = {
  totalDeviceIos: number;
  totalDeviceAndroid: number;
  totalDeviceOther: number;
};
export type AppMetrics = {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  value: number;
  type: string;
  periodFrom: string;
  periodTo: string;
  sum: number;
};
export type SystemSetting = {
  key: string;
  value: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};
export type CreateSystemSettingDto = {
  key:
  | 'credit-limit-per-day'
  | 'credit-limit-per-month'
  | 'credit-limit-per-transaction'
  | 'deposit-fee-principle'
  | 'withdraw-fee-principle'
  | 'link-principle';
  value: string;
};
