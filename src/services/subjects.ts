import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getSubjectsFromApi = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/api/subjects`);
  return response.data;
};
