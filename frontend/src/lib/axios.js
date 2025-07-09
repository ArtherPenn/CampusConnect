import axiox from 'axios';

export const axiosInstance = axiox.create({
    baseURL: 'http://localhost:2500/api',
    withCredentials: true,
});