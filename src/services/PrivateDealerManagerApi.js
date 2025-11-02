import { apiConfig } from "./ApiConfig";

const PrivateDealerManagerApi = {
  getStaffListByAgencyId: (agencyId, params) =>
    apiConfig.privateApi.get(`manager/staff/list/${agencyId}`, { params }),
  createDealerStaff: (formData) =>
    apiConfig.privateApi.post("manager/staff", formData),
  updateStaff: (id, data) =>
    apiConfig.privateApi.patch(`manager/staff/${id}`, data),
  deleteStaff: (id) => apiConfig.privateApi.delete(`manager/staff/${id}`),

  getCustomerList: (agencyId) =>
    apiConfig.privateApi.get(`customer/list/${agencyId}`),
  createCustomer: (data) => apiConfig.privateApi.post(`customer`, data),
  updateCustomer: (id, data) =>
    apiConfig.privateApi.patch(`customer/${id}`, data),
  deleteCustomer: (id) => apiConfig.privateApi.delete(`customer/${id}`),

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

  getStockPromotionList: (agencyId, params) =>
    apiConfig.privateApi.get(`stock-promotion/list/${agencyId}`, { params }),
  createStockPromotion: (data) =>
    apiConfig.privateApi.post("stock-promotion", data),
  updateStockPromotion: (id, data) =>
    apiConfig.privateApi.patch(`stock-promotion/${id}`, data),
  deleteStockPromotion: (id) =>
    apiConfig.privateApi.delete(`stock-promotion/${id}`),
  assignPromotionToStock: (data) =>
    apiConfig.privateApi.post("stock-promotion/assignment", data),

  getCustomerContractList: (agencyId, params) =>
    apiConfig.privateApi.get(`customer-contract/list/${agencyId}`, { params }),
  createCustomerContract: (data) =>
    apiConfig.privateApi.post("customer-contract", data),
  updateCustomerContract: (id, data) =>
    apiConfig.privateApi.patch(`customer-contract/${id}`, data),
  deleteCustomerContract: (id) =>
    apiConfig.privateApi.delete(`customer-contract/${id}`),

  getRestockList: (agencyId, params) =>
    apiConfig.privateApi.get(`order-restock/list/${agencyId}`, { params }),
  getRestockDetail: (id) =>
    apiConfig.privateApi.get(`order-restock/detail/${id}`),
  createRestock: (data) => apiConfig.privateApi.post("order-restock", data),
  sendApproveToAdmin: (id) => apiConfig.privateApi.patch(`order-restock/accept/${id}`),

  getDiscountList: (agencyId) =>
    apiConfig.privateApi.get(`discount/agency/list/${agencyId}`),

  getWarehouseList: () => apiConfig.privateApi.get("warehouses/list"),

  getPromotionList: () => apiConfig.privateApi.get("promotion/agency/list"),
};

export default PrivateDealerManagerApi;
