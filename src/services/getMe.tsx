import axiosInstance from 'src/config/axiosConfig';

export const getMe = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data;
};
