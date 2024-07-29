import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;
export const login = async (name: string, username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};