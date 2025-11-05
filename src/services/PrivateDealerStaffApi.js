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
  getStockPromotionListStaff: (agencyId) =>
    apiConfig.privateApi.get(`stock-promotion/list/staff/${agencyId}`),
};
export default PrivateDealerStaff;
