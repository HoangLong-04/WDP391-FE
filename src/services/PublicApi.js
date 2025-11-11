import { apiConfig } from "./ApiConfig";

const PublicApi = {
  login: (loginInfo) => apiConfig.publicApi.post("auth/signin", loginInfo),
  getNewToken: () => apiConfig.publicApi.get("auth/token"),

  getMotorList: (params) => apiConfig.publicApi.get("motorbike", { params }),
  getMotorDetailForUser: (id) => apiConfig.publicApi.get(`motorbike/${id}`),
  getMotorFilters: () => apiConfig.publicApi.get("motorbike/filters"),

  getAgencyListCustomer: (params) =>
    apiConfig.publicApi.get("agency/list/customer", { params }),

  submitDrivingTest: (data) =>
    apiConfig.publicApi.post("drive-trial/public/booking", data),

  getCustomerContract: (credentialId, agencyId, params) =>
    apiConfig.publicApi.get(
      `customer/customer-contracts/${credentialId}/${agencyId}`,
      { params }
    ),
  getCustomerContractDetail: (id) =>
    apiConfig.publicApi.get(`customer/installment-detail/${id}`),
  getQuotationList: (credentialId, params) =>
    apiConfig.publicApi.get(`customer/list/quotation/${credentialId}`, {
      params,
    }),
  getDeposit: (quotationId) =>
    apiConfig.publicApi.get(`customer/deposit/${quotationId}`),

  payCustomerInstallment: (platform, data) =>
    apiConfig.publicApi.post(
      `vnpay/customer-installment-payment?platform=${platform}`,
      data
    ),
  payFullContract: (platform, data) =>
    apiConfig.publicApi.post(
      `vnpay/customer-contract/full/payment?platform=${platform}`,
      data
    ),
  paymentDeposit: (platform, data) =>
    apiConfig.publicApi.post(
      `vnpay/customer/deposit/payment?platform=${platform}`,
      data
    ),
};

export default PublicApi;
