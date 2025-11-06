import { apiConfig } from "./ApiConfig";

const PrivateDealerStaff = {
  getBookingList: (agencyId, params) =>
    apiConfig.privateApi.get(`drive-trial/list/${agencyId}`, { params }),
  updateBooking: (id, data) =>
    apiConfig.privateApi.patch(`drive-trial/${id}`, data),
  getStockList: (agencyId, params) =>
    apiConfig.privateApi.get(`agency-stock/list/${agencyId}`, { params }),
  getStockById: (id) => apiConfig.privateApi.get(`agency-stock/detail/${id}`),
  createQuotation: (data) => apiConfig.privateApi.post("quotation", data),
  getQuotationList: (agencyId, params) =>
    apiConfig.privateApi.get(`quotation/list/${agencyId}`, { params }),
  getQuotationDetail: (quotationId) =>
    apiConfig.privateApi.get(`quotation/detail/${quotationId}`),
  updateQuotation: (quotationId, data) =>
    apiConfig.privateApi.patch(`quotation/${quotationId}`, data),
  getStockPromotionListStaff: (agencyId) =>
    apiConfig.privateApi.get(`stock-promotion/list/staff/${agencyId}`),
  getCustomerContractList: (agencyId, params) =>
    apiConfig.privateApi.get(`customer-contract/list/${agencyId}`, { params }),
  getCustomerContractDetail: (contractId) =>
    apiConfig.privateApi.get(`customer-contract/detail/${contractId}`),
  createCustomerContract: (data) =>
    apiConfig.privateApi.post("customer-contract", data),
};
export default PrivateDealerStaff;
