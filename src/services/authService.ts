import axiosInstance from 'src/config/axiosConfig';

export const logIn = async (email: string, password: string) => {
  const response = await axiosInstance.post('/auth/sign-in', { email, password });
  return response.data;
};

// export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
//   const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
//   return response.data;
// };
