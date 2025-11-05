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
  createMotorbike: (data) => apiConfig.privateApi.post("motorbike", data),
  updateMotorbike: (id, data) =>
    apiConfig.privateApi.patch(`motorbike/${id}`, data),
  deleteMotorbike: (id) => apiConfig.privateApi.delete(`motorbike/${id}`),

  getWarehouseById: (id) => apiConfig.privateApi.get(`warehouses/detail/${id}`),
  getWarehouseList: (params) =>
    apiConfig.privateApi.get("warehouses/list", { params }),
  createWarehouse: (data) => apiConfig.privateApi.post("warehouses", data),
  updateWarehouse: (id, data) =>
    apiConfig.privateApi.patch(`warehouses/${id}`, data),
  deleteWarehouse: (id) => apiConfig.privateApi.delete(`warehouses/${id}`),

  getOrderRestock: (params) =>
    apiConfig.privateApi.get("order-restock-management/list", { params }),
  getOrderRestockDetail: (id) =>
    apiConfig.privateApi.get(`order-restock-management/detail/${id}`),
  getOrderRestockOrderItemDetail: (orderItemId) =>
    apiConfig.privateApi.get(`order-restock-management/detail/order-item/${orderItemId}`),
  updateOrder: (id, data) =>
    apiConfig.privateApi.patch(`order-restock-management/status/${id}`, data),

  getColorList: () => apiConfig.privateApi.get("color"),
  createColor: (data) => apiConfig.privateApi.post("color", data),
  deleteColor: (id) => apiConfig.privateApi.delete(`color/${id}`),

  getCongiurationDetail: (motorId) =>
    apiConfig.privateApi.get(`configuration/${motorId}`),
  updateConfiguration: (motorId, data) =>
    apiConfig.privateApi.patch(`configuration/${motorId}`, data),
  createConfiguration: (motorId, data) =>
    apiConfig.privateApi.post(`configuration/${motorId}`, data),
  deleteConfiguration: (motorId) =>
    apiConfig.privateApi.delete(`configuration/${motorId}`),

  getAppearanceDetail: (motorId) =>
    apiConfig.privateApi.get(`appearance/${motorId}`),
  updateAppearance: (motorId, data) =>
    apiConfig.privateApi.patch(`appearance/${motorId}`, data),
  createAppearance: (motorId, data) =>
    apiConfig.privateApi.post(`appearance/${motorId}`, data),
  deleteAppearance: (motorId) =>
    apiConfig.privateApi.delete(`appearance/${motorId}`),

  getBatteryDetail: (motorId) => apiConfig.privateApi.get(`battery/${motorId}`),
  updateBattery: (motorId, data) =>
    apiConfig.privateApi.patch(`battery/${motorId}`, data),
  createBattery: (motorId, data) =>
    apiConfig.privateApi.post(`battery/${motorId}`, data),
  deleteBattery: (motorId) => apiConfig.privateApi.delete(`battery/${motorId}`),

  getSafeFeature: (motorId) =>
    apiConfig.privateApi.get(`safe-feature/${motorId}`),
  updateSafeFeature: (motorId, data) =>
    apiConfig.privateApi.patch(`safe-feature/${motorId}`, data),
  createSafeFeature: (motorId, data) =>
    apiConfig.privateApi.post(`safe-feature/${motorId}`, data),
  deleteSafeFeature: (motorId) =>
    apiConfig.privateApi.delete(`safe-feature/${motorId}`),

  deleteColorImage: (motorbikeId, colorId, data) =>
    apiConfig.privateApi.delete(`images/color/${motorbikeId}/${colorId}`, {
      data: data,
    }),
  addImageForMotor: (motorId, data) =>
    apiConfig.privateApi.post(`images/motorbike/${motorId}`, data),
};

export default PrivateAdminApi;
