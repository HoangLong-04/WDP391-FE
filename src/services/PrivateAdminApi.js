import { apiConfig } from "./ApiConfig";

const PrivateAdminApi = {
  getRole: () => apiConfig.privateApi.get("role/all-role"),

  getAgency: (params) => apiConfig.privateApi.get("agency/list", { params }),
  getAgencyById: (id) => apiConfig.privateApi.get(`agency/detail/${id}`),
  createAgency: (data) => apiConfig.privateApi.post("agency", data),
  updateAgency: (id, data) => apiConfig.privateApi.patch(`agency/${id}`, data),
  deleteAgency: (id) => apiConfig.privateApi.delete(`agency/${id}`),

  getAllStaff: (params) =>
    apiConfig.privateApi.get("admin/staff/list", { params }),
  createStaff: (staffInfo) =>
    apiConfig.privateApi.post("admin/staff", staffInfo),
  updateStaff: (id, staffInfo) =>
    apiConfig.privateApi.patch(`admin/staff/${id}`, staffInfo),
  getStaffById: (id) => apiConfig.privateApi.get(`admin/staff/detail/${id}`),
  assignStaffToAgency: (staffId, agencyId) =>
    apiConfig.privateApi.post(`admin/staff/${staffId}/assign/${agencyId}`),
  deleteStaff: (id) => apiConfig.privateApi.delete(`admin/staff/${id}`),

  getDiscountList: (params) =>
    apiConfig.privateApi.get("discount/list", { params }),
  createDiscount: (data) => apiConfig.privateApi.post("discount", data),
  updateDiscount: (id, data) =>
    apiConfig.privateApi.patch(`discount/${id}`, data),
  deleteDiscount: (id) => apiConfig.privateApi.delete(`discount/${id}`),

  getPricePolicy: (params) =>
    apiConfig.privateApi.get("price/list", { params }),
  createPricePolicy: (data) => apiConfig.privateApi.post("price", data),
  updatePricePolicy: (id, data) =>
    apiConfig.privateApi.patch(`price/${id}`, data),
  deletePricePolicy: (id) => apiConfig.privateApi.delete(`price/${id}`),

  getPromotionList: (params) =>
    apiConfig.privateApi.get("promotion/list", { params }),
  createPromotion: (data) => apiConfig.privateApi.post("promotion", data),
  updatePromotion: (id, data) =>
    apiConfig.privateApi.patch(`promotion/${id}`, data),
  deletePromotion: (id) => apiConfig.privateApi.delete(`promotion/${id}`),

  getInventory: (params) =>
    apiConfig.privateApi.get("inventory/list", { params }),
  getInventoryDetail: (motorId, warehouseId) =>
    apiConfig.privateApi.get(`inventory/detail/${motorId}/${warehouseId}`),
  createInventory: (motorId, warehouseId, data) =>
    apiConfig.privateApi.post(`inventory/${motorId}/${warehouseId}`, data),
  updateInventory: (motorId, warehouseId, data) =>
    apiConfig.privateApi.patch(`inventory/${motorId}/${warehouseId}`, data),
  deleteInventory: (motorId, warehouseId) =>
    apiConfig.privateApi.delete(`inventory/${motorId}/${warehouseId}`),

  getMotorbikeById: (id) => apiConfig.privateApi.get(`motorbike/${id}`),
  getMotorList: (params) =>
    apiConfig.privateApi.get("motorbike/admin", { params }),

  getWarehouseById: (id) => apiConfig.privateApi.get(`warehouses/detail/${id}`),
  getWarehouseList: (params) =>
    apiConfig.privateApi.get("warehouses/list", { params }),
  createWarehouse: (data) => apiConfig.privateApi.post("warehouses", data),
  updateWarehouse: (id, data) =>
    apiConfig.privateApi.patch(`warehouses/${id}`, data),
  deleteWarehouse: (id) => apiConfig.privateApi.delete(`warehouses/${id}`),

  getOrderRestock: (params) =>
    apiConfig.privateApi.get("order-restock-management/list", { params }),

  getColorList: () => apiConfig.privateApi.get("color"),
};

export default PrivateAdminApi;
