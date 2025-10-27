import { apiConfig } from "./ApiConfig";

const PrivateDealerManagerApi = {
  getStaffListByAgencyId: (agencyId, params) =>
    apiConfig.privateApi.get(`manager/staff/list/${agencyId}`, { params }),
  createDealerStaff: (formData) =>
    apiConfig.privateApi.post("manager/staff", formData),
  updateStaff: (id, data) =>
    apiConfig.privateApi.patch(`manager/staff/${id}`, data),
  deleteStaff: (id) => apiConfig.privateApi.delete(`manager/staff/${id}`),

  getStockList: (agencyId, params) =>
    apiConfig.privateApi.get(`agency-stock/list/${agencyId}`, { params }),
  getStockById: (id) => apiConfig.privateApi.get(`agency-stock/detail/${id}`),
  createStock: (data) => apiConfig.privateApi.post("agency-stock", data),
  updateStock: (id, data) =>
    apiConfig.privateApi.patch(`agency-stock/${id}`, data),
  deleteStock: (id) => apiConfig.privateApi.delete(`agency-stock/${id}`),

  getInstallmentPlan: (agencyId, params) =>
    apiConfig.privateApi.get(`installment-plan/list/${agencyId}`, { params }),
  createInstallmentPlan: (data) =>
    apiConfig.privateApi.post("installment-plan", data),
  updateInstallmentPlan: (id, data) =>
    apiConfig.privateApi.patch(`installment-plan/${id}`, data),
  deleteInstallmentPlan: (id) =>
    apiConfig.privateApi.delete(`installment-plan/${id}`),
};

export default PrivateDealerManagerApi;
