import { apiConfig } from "./ApiConfig";

const PrivateDealerStaff = {
  getBookingList: (agencyId, params) =>
    apiConfig.privateApi.get(`drive-trial/list/${agencyId}`, { params }),
  updateBooking: (id, data) =>
    apiConfig.privateApi.patch(`drive-trial/${id}`, data),
};
export default PrivateDealerStaff;
