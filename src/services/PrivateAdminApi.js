import { apiConfig } from "./ApiConfig";

const PrivateAdminApi = {
  getRole: () => apiConfig.privateApi.get("role/all-role"),

  getAgency: (params) => apiConfig.privateApi.get("agency/list", { params }),
  getAgencyById: (id) => apiConfig.privateApi.get(`agency/detail/${id}`),

  getAllStaff: (params) =>
    apiConfig.privateApi.get("admin/staff/list", { params }),
  createStaff: (staffInfo) =>
    apiConfig.privateApi.post("admin/staff", staffInfo),
  updateStaff: (id, staffInfo) =>
    apiConfig.privateApi.patch(`admin/staff/${id}`, staffInfo),
  getStaffById: (id) => apiConfig.privateApi.get(`admin/staff/detail/${id}`),
  assignStaffToAgency: (staffId, agencyId) =>
    apiConfig.privateApi.post(`admin/staff/${staffId}/assign/${agencyId}`),

  getDiscountList: (params) =>
    apiConfig.privateApi.get("discount/list", { params }),

  getPricePolicy: (params) =>
    apiConfig.privateApi.get("price/list", { params }),

  getPromotionList: (params) =>
    apiConfig.privateApi.get("promotion/list", { params }),

  getInventory: (params) =>
    apiConfig.privateApi.get("inventory/list", { params }),
};

export default PrivateAdminApi;
