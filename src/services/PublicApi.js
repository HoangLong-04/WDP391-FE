import { apiConfig } from "./ApiConfig";

const PublicApi = {
  login: (loginInfo) => apiConfig.publicApi.post("auth/signin", loginInfo),
  getNewToken: () => apiConfig.publicApi.get("auth/token"),
};

export default PublicApi;
