import { apiConfig } from "./ApiConfig";

const PrivateApi = {
    logout: () => {
        // Đánh dấu request này để skip refresh token interceptor khi token hết hạn
        return apiConfig.privateApi.post('auth/logout', {}, {
            _skipRefreshToken: true
        });
    },
    
}

export default PrivateApi