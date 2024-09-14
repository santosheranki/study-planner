import axios from 'axios';

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        // Handle token refresh failure, e.g., redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = ''; // Redirect to login page
    }
};
