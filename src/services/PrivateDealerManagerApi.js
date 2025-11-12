import { apiConfig } from "./ApiConfig";

const PrivateDealerManagerApi = {
  getStaffListByAgencyId: (agencyId, params) =>
    apiConfig.privateApi.get(`manager/staff/list/${agencyId}`, { params }),
  createDealerStaff: (formData) =>
    apiConfig.privateApi.post("manager/staff", formData),
  updateStaff: (id, data) =>
    apiConfig.privateApi.patch(`manager/staff/${id}`, data),
  deleteStaff: (id) => apiConfig.privateApi.delete(`manager/staff/${id}`),

  getCustomerList: (agencyId, params) =>
    apiConfig.privateApi.get(`customer/list/${agencyId}`, { params }),
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
  getCustomerContractDetail: (contractId) =>
    apiConfig.privateApi.get(`customer-contract/detail/${contractId}`),
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
  getRestockOrderItemDetail: (orderItemId) =>
    apiConfig.privateApi.get(`order-restock/detail/order-item/${orderItemId}`),
  createRestock: (data) => apiConfig.privateApi.post("order-restock", data),
  deleteRestock: (orderId) =>
    apiConfig.privateApi.delete(`order-restock/${orderId}`),
  sendApproveToAdmin: (id) =>
    apiConfig.privateApi.patch(`order-restock/accept/${id}`),

  getDiscountList: (agencyId, params) =>
    apiConfig.privateApi.get(`discount/agency/list/${agencyId}`, { params }),

  getWarehouseList: () => apiConfig.privateApi.get("warehouses/list"),

  getPromotionList: () => apiConfig.privateApi.get("promotion/agency/list"),

  createInstallmentContract: (data) =>
    apiConfig.privateApi.post("installment-contract", data),
  getInstallmentContractDetail: (installmentContractId) =>
    apiConfig.privateApi.get(
      `installment-contract/installment-contract/detail/${installmentContractId}`
    ),
  getInstallmentContractByCustomerContractId: (customerContractId) =>
    apiConfig.privateApi.get(
      `installment-contract/installment-contract/customer-contract/${customerContractId}`
    ),
  updateInstallmentContract: (installmentContractId, data) =>
    apiConfig.privateApi.patch(
      `installment-contract/installment-contract/update/${installmentContractId}`,
      data
    ),
  generateInstallmentPayments: (installmentContractId) =>
    apiConfig.privateApi.post(
      `installment-contract/generate-payment/${installmentContractId}`
    ),
  getInstallmentPaymentDetail: (installmentPaymentId) =>
    apiConfig.privateApi.get(
      `installment-contract/installlment-payment/detail/${installmentPaymentId}`
    ),
  updateInstallmentPayment: (installmentPaymentId, data) =>
    apiConfig.privateApi.patch(
      `installment-contract/installment-payment/update/${installmentPaymentId}`,
      data
    ),

  // Dashboard APIs
  getTotalCustomer: (agencyId) =>
    apiConfig.privateApi.get(`dashboard/total/customer/${agencyId}`),
  getTotalRevenue: (agencyId) =>
    apiConfig.privateApi.get(`dashboard/total/revenue/${agencyId}`),
  getCustomerContractChart: (agencyId, params) =>
    apiConfig.privateApi.get(`dashboard/chart/customer-contract/${agencyId}`, { params }),
  getStaffRevenueList: (agencyId, params) =>
    apiConfig.privateApi.get(`dashboard/list/staff/revenue/${agencyId}`, { params }),
};

export default PrivateDealerManagerApi;
