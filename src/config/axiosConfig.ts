import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const decodeToken = (token: string) => {
  // console.log('[Auth] Attempting to decode token');
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    // console.log('[Auth] Token decoded successfully');
    return decoded;
  } catch (error) {
    console.error('[Auth] Token decode failed:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  // console.log('[Auth] Checking token expiration');
  const decoded = decodeToken(token);
  if (!decoded?.exp) {
    console.warn('[Auth] Token has no expiration or is invalid');
    return true;
  }
  const isExpired = decoded.exp * 1000 < Date.now();
  // console.log('[Auth] Token expired:', isExpired, 'Expires:', new Date(decoded.exp * 1000));
  return isExpired;
};

let refreshTokenPromise: Promise<any> | null = null;
const refreshAccessToken = async () => {
  // console.log('[Auth] Starting token refresh');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.error('[Auth] No refresh token found in localStorage');
    throw new Error('No refresh token available');
  }

  try {
    // console.log('[Auth] Making refresh token request');
    const response = await refreshAxiosInstance.post('/auth/refresh-token', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    // console.log('[Auth] Token refresh successful');

    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return accessToken;
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);
    localStorage.clear();
    window.location.href = '/login';
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    // console.log('[Auth] Request interceptor - URL:', config.url);
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // console.log('[Auth] No auth token found');
      return config;
    }

    if (isTokenExpired(token)) {
      // console.log('[Auth] Token expired, attempting refresh');
      try {
        refreshTokenPromise = refreshTokenPromise || refreshAccessToken();
        const newToken = await refreshTokenPromise;
        console.log('[Auth] Using new token for request');
        // config.headers.Authorization = `Bearer ${newToken}`;
      } finally {
        refreshTokenPromise = null;
      }
    } else {
      // console.log('[Auth] Using existing valid token');
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[Auth] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // console.log('[Auth] Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    // console.error('[Auth] Response error:', error.response?.status, error.config?.url);
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // console.log('[Auth] Handling 401 error, attempting token refresh');
      originalRequest._retry = true;
      try {
        refreshTokenPromise = refreshTokenPromise || refreshAccessToken();
        const newToken = await refreshTokenPromise;
        // console.log('[Auth] Retrying original request with new token');
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } finally {
        refreshTokenPromise = null;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
