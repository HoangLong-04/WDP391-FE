import { apiConfig } from "./ApiConfig";

const PrivateDealerStaff = {
  getBookingList: (agencyId, params) =>
    apiConfig.privateApi.get(`drive-trial/list/${agencyId}`, { params }),
  updateBooking: (id, data) =>
    apiConfig.privateApi.patch(`drive-trial/${id}`, data),
  getStockList: (agencyId, params) =>
    apiConfig.privateApi.get(`agency-stock/list/${agencyId}`, { params }),
  getStockById: (id) => apiConfig.privateApi.get(`agency-stock/detail/${id}`),
};
export default PrivateDealerStaff;
