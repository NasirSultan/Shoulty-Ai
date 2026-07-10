// api/configApi.tsx
export const API_BASE_URL = "https://backend.shoutlyai.com";

export const API_ENDPOINTS = {
    posts: `${API_BASE_URL}/api/posts`,
    displayImages: `/api/display-images`,
    industries: `${API_BASE_URL}/api/industries/with-subindustries`,
    postGeneratorGenerate: `/api/post-generator/generate`,
    postGeneratorGenerateAndSave: `/api/post-generator/generate-and-save`,
    postGeneratorGenerateDirect: `${API_BASE_URL}/api/generator/posts`,
    postGeneratorGenerateAndSaveDirect: `${API_BASE_URL}/api/generator/posts`,
    textGeneratorGenerate: `/api/generator/texts`,
    textGeneratorGenerateDirect: `${API_BASE_URL}/api/generator/texts`,
    ragChat: `${API_BASE_URL}/api/rag/chat`,
    register: `${API_BASE_URL}/api/auth/register`,
    verifyOtp: `${API_BASE_URL}/api/auth/verify-otp`,
    setPassword: `${API_BASE_URL}/api/auth/set-password`,
    setProfile: `${API_BASE_URL}/api/auth/set-profile`,
    sendOtp: `${API_BASE_URL}/api/auth/send-otp`,
    verifyOtpReset: `${API_BASE_URL}/api/auth/verify-otp-reset`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    googleLogin: `${API_BASE_URL}/api/auth/google/login`,
    emailLogin: `${API_BASE_URL}/api/auth/login`,
    userProfile: `${API_BASE_URL}/api/users/profile`,
    profileUpdate: `${API_BASE_URL}/api/users/profile-update`,
    passwordUpdate: `${API_BASE_URL}/api/users/password`,
    dashboard: `${API_BASE_URL}/api/dashboard`,
    notes: `${API_BASE_URL}/api/notes`,
};
