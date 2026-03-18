// api/configApi.tsx
export const API_BASE_URL = "https://ai-shoutly-backend.onrender.com";
export const SHOUTLY_API_BASE_URL = "https://backend.shoutlyai.com";

export const API_ENDPOINTS = {
    displayImages: `${API_BASE_URL}/api/display-images`,
    industries: `${API_BASE_URL}/api/industries/with-subindustries`,
    googleLogin: `${SHOUTLY_API_BASE_URL}/api/auth/google/login`,
    emailLogin: `${SHOUTLY_API_BASE_URL}/api/auth/login`,
    userProfile: `${SHOUTLY_API_BASE_URL}/api/user/profile`,
};