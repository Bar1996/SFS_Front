import axios from 'axios';
import { SERVER_URL } from '../core/config';
import { getToken, setToken, getRefreshToken } from '../common/tokenStorage';

const api = axios.create({
  baseURL: SERVER_URL,
});

api.interceptors.request.use(async (config) => {
  const accessToken = await getToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => response, async (error) => {
  const originalRequest = error.config;

  if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = await getRefreshToken();
      const res = await axios.get(`${SERVER_URL}/auth/refresh`, {
        headers: { 'Authorization': `Bearer ${refreshToken}` }
      });

      if (res.status === 200) {
        const { accessToken } = res.data;
        await setToken(accessToken, res.data.refreshToken);  
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return api(originalRequest);  
      }
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
});

export default api;
