// src/utils/axiosInstance.ts
import axios from 'axios';
import { refreshAccessToken } from './authUtils';
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});
let failedRequestsQueue: any[] = [];
let isRefreshing = false;
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 403 && !isRefreshing) {
            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                console.error('Failed to refresh token:', err);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
                failedRequestsQueue.forEach((request) => request());
                failedRequestsQueue = [];
            }
        }
        if (error.response.status !== 403) {
            return Promise.reject(error);
        }
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push(() => {
                    resolve(axiosInstance(originalRequest));
                });
            });
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;