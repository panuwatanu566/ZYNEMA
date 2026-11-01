import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://react-api.dev2life.workers.dev/api/v1';

export const tokenStore = {
  get access(): string | null {
    return localStorage.getItem('accessToken');
  },
  get refresh(): string | null {
    return localStorage.getItem('refreshToken');
  },
  save({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export const api = axios.create({ baseURL });

// Request Interceptor: Attach Bearer accessToken if present
api.interceptors.request.use((config) => {
  if (tokenStore.access) {
    config.headers.Authorization = `Bearer ${tokenStore.access}`;
  }
  return config;
});

// Single in-flight refresh promise to prevent multiple refresh calls simultaneously
let refreshing: Promise<string> | null = null;

// Response Interceptor: Handle automatic token refresh and unauthorized status
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.error?.code;

    // Tokens invalid, missing, or account banned -> clear tokens and trigger logout
    if (['TOKEN_INVALID', 'TOKEN_MISSING', 'ACCOUNT_BANNED', 'REFRESH_TOKEN_INVALID'].includes(code)) {
      tokenStore.clear();
      window.dispatchEvent(
        new CustomEvent('auth:logout', {
          detail: {
            code,
            message: error.response?.data?.error?.message || 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
          }
        })
      );
      return Promise.reject(error);
    }

    // Only refresh on 401 TOKEN_EXPIRED
    if (code !== 'TOKEN_EXPIRED' || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    // Refresh token rotation: single-use, share in-flight promise
    refreshing ??= axios
      .post(`${baseURL}/auth/refresh`, { refreshToken: tokenStore.refresh })
      .then(({ data }) => {
        tokenStore.save(data.data);
        return data.data.accessToken as string;
      })
      .finally(() => {
        refreshing = null;
      });

    try {
      const accessToken = await refreshing;
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError: any) {
      tokenStore.clear();
      window.dispatchEvent(
        new CustomEvent('auth:logout', {
          detail: {
            code: 'REFRESH_FAILED',
            message: refreshError.response?.data?.error?.message || 'ไม่สามารถต่ออายุเซสชันได้ กรุณาเข้าสู่ระบบใหม่'
          }
        })
      );
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Transforms API error.details into a key-value object { [field]: message }
 * to display under corresponding form inputs.
 */
export const fieldErrors = (error: any): Record<string, string> => {
  const details = error?.response?.data?.error?.details;
  if (!Array.isArray(details)) return {};
  return Object.fromEntries(details.map((d: { field: string; message: string }) => [d.field, d.message]));
};

/**
 * Extracts error message from API response envelope
 */
export const getErrorMessage = (error: any, fallback = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'): string => {
  return error?.response?.data?.error?.message || error?.message || fallback;
};
