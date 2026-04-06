// api/configApi.tsx
export const API_BASE_URL = "https://ai-shoutly-backend.onrender.com";
export const SHOUTLY_API_BASE_URL = "https://backend.shoutlyai.com";
export const POST_GENERATOR_API_BASE_URL =
    "https://ai-shoutly-backend.onrender.com/api/generator/posts";
export const TEXT_GENERATOR_API_BASE_URL =
    "https://ai-shoutly-backend.onrender.com/api/generator/texts";

export const API_ENDPOINTS = {
    // Route through a local proxy so subIndustryId requests are server→Render (no CORS).
    displayImages: `/api/display-images`,
    industries: `${API_BASE_URL}/api/industries/with-subindustries`,
    // Frontend uses local routes that proxy to documented upstream generator endpoints.
    postGeneratorGenerate: `/api/post-generator/generate`,
    postGeneratorGenerateAndSave: `/api/post-generator/generate-and-save`,
    postGeneratorGenerateDirect: `${POST_GENERATOR_API_BASE_URL}`,
    postGeneratorGenerateAndSaveDirect: `${POST_GENERATOR_API_BASE_URL}`,
    textGeneratorGenerate: `/api/generator/texts`,
    textGeneratorGenerateDirect: `${TEXT_GENERATOR_API_BASE_URL}`,
    register: `${API_BASE_URL}/api/auth/register`,
    verifyOtp: `${API_BASE_URL}/api/auth/verify-otp`,
    setPassword: `${API_BASE_URL}/api/auth/set-password`,
    setProfile: `${API_BASE_URL}/api/auth/set-profile`,
    sendOtp: `${API_BASE_URL}/api/auth/send-otp`,
    verifyOtpReset: `${API_BASE_URL}/api/auth/verify-otp-reset`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    googleLogin: `/api/auth/verify-token`,
    emailLogin: `${SHOUTLY_API_BASE_URL}/api/auth/login`,
    userProfile: `${SHOUTLY_API_BASE_URL}/api/user/profile`,
    profileUpdate: `${SHOUTLY_API_BASE_URL}/api/users/profile-update`,
    passwordUpdate: `${SHOUTLY_API_BASE_URL}/api/users/password`,
};