// api/configApi.tsx
export const API_BASE_URL = "https://ai-shoutly-backend.onrender.com";
export const SHOUTLY_API_BASE_URL = "https://backend.shoutlyai.com";

export const API_ENDPOINTS = {
    displayImages: `${API_BASE_URL}/api/display-images`,
    industries: `${API_BASE_URL}/api/industries/with-subindustries`,
    register: `${API_BASE_URL}/api/auth/register`,
    verifyOtp: `${API_BASE_URL}/api/auth/verify-otp`,
    setPassword: `${API_BASE_URL}/api/auth/set-password`,
    setProfile: `${API_BASE_URL}/api/auth/set-profile`,
    sendOtp: `${API_BASE_URL}/api/auth/send-otp`,
    verifyOtpReset: `${API_BASE_URL}/api/auth/verify-otp-reset`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    googleLogin: `${SHOUTLY_API_BASE_URL}/api/auth/google/login`,
    emailLogin: `${SHOUTLY_API_BASE_URL}/api/auth/login`,
    userProfile: `${SHOUTLY_API_BASE_URL}/api/user/profile`,
};