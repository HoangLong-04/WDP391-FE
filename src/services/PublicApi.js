import { apiConfig } from "./ApiConfig";

const PublicApi = {
  login: (loginInfo) => apiConfig.publicApi.post("auth/signin", loginInfo),
  getNewToken: () => apiConfig.publicApi.get("auth/token"),

  getMotorList: (params) => apiConfig.publicApi.get("motorbike", { params }),
  getMotorDetailForUser: (id) => apiConfig.publicApi.get(`motorbike/${id}`),
  getMotorFilters: () => apiConfig.publicApi.get("motorbike/filters"),

  getAgencyListCustomer: (params) =>
    apiConfig.publicApi.get("agency/list/customer", { params }),

  submitDrivingTest: (data) =>
    apiConfig.publicApi.post("drive-trial/public/booking", data),
};

export default PublicApi;
