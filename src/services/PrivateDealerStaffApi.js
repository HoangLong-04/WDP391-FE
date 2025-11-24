import { apiConfig } from "./ApiConfig";

const PrivateDealerStaff = {
  getBookingList: (agencyId, params) =>
    apiConfig.privateApi.get(`drive-trial/list/${agencyId}`, { params }),
  getBookingDetail: (bookingId) =>
    apiConfig.privateApi.get(`drive-trial/detail/${bookingId}`),
  updateBooking: (id, data) =>
    apiConfig.privateApi.patch(`drive-trial/${id}`, data),
  getStockList: (agencyId, params) =>
    apiConfig.privateApi.get(`agency-stock/list/${agencyId}`, { params }),
  getStockListInfo: (agencyId, params) =>
    apiConfig.privateApi.get(`agency-stock/list/info/${agencyId}`, { params }),
  getOutOfStockListInfo: (agencyId, params) =>
    apiConfig.privateApi.get(
      `agency-stock/list/info/out-of-stock/${agencyId}`,
      { params }
    ),
  getNotAvailableStockList: (agencyId, params) =>
    apiConfig.privateApi.get(`agency-stock/not-available/${agencyId}`, {
      params,
    }),
  getStockById: (id) => apiConfig.privateApi.get(`agency-stock/detail/${id}`),
  createQuotation: (data) => apiConfig.privateApi.post("quotation", data),
  getQuotationList: (agencyId, params) =>
    apiConfig.privateApi.get(`quotation/list/${agencyId}`, { params }),
  getQuotationDetail: (quotationId) =>
    apiConfig.privateApi.get(`quotation/detail/${quotationId}`),
  updateQuotation: (quotationId, data) =>
    apiConfig.privateApi.patch(`quotation/${quotationId}`, data),
  deleteQuotation: (quotationId) =>
    apiConfig.privateApi.delete(`quotation/${quotationId}`),
  getStockPromotionListStaff: (agencyId) =>
    apiConfig.privateApi.get(`stock-promotion/list/staff/${agencyId}`),
  getStockPromotionDetail: (stockPromotionId) =>
    apiConfig.privateApi.get(`stock-promotion/detail/${stockPromotionId}`),
  getCustomerContractList: (agencyId, params) =>
    apiConfig.privateApi.get(`customer-contract/list/${agencyId}`, { params }),
  getCustomerContractDetail: (contractId) =>
    apiConfig.privateApi.get(`customer-contract/detail/${contractId}`),
  createCustomerContract: (data) =>
    apiConfig.privateApi.post("customer-contract", data),
  createDeposit: (data) =>
    apiConfig.privateApi.post("deposit", data),
  updateDepositStatus: (depositId, data) =>
    apiConfig.privateApi.patch(`deposit/${depositId}`, data),
  getDepositById: (depositId) =>
    apiConfig.privateApi.get(`deposit/${depositId}`),
  getCustomerList: (agencyId, params) =>
    apiConfig.privateApi.get(`customer/list/${agencyId}`, { params }),
  getInstallmentPlan: (agencyId, params) =>
    apiConfig.privateApi.get(`installment-plan/list/${agencyId}`, { params }),
  // Email APIs
  sendCustomerContractEmail: (customerContractId) =>
    apiConfig.privateApi.post(`email/customer-contract/${customerContractId}`),
  sendInstallmentScheduleEmail: (installmentContractId) =>
    apiConfig.privateApi.post(`email/customer/installment-schedule/${installmentContractId}`),
  // Document Images APIs
  uploadContractDocumentImages: (contractId, formData) =>
    apiConfig.privateApi.post(`images/customer-contract-document/${contractId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteContractDocumentImage: (imageId, data) =>
    apiConfig.privateApi.delete(`images/document-contract/${imageId}`, { data }),
};
export default PrivateDealerStaff;
