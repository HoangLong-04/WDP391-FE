import { apiConfig } from "./ApiConfig";

const PrivateApi = {
    logout: () => {
        // Mark this request to skip refresh token interceptor when token expires
        return apiConfig.privateApi.post('auth/logout', {}, {
            _skipRefreshToken: true
        });
    },
    
}

export default PrivateApi