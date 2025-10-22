import { apiConfig } from "./ApiConfig";

const PrivateApi = {
    logout: () => apiConfig.privateApi.post('auth/logout'),
    
}

export default PrivateApi