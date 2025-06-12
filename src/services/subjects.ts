import axiosInstance from "../config/axiosConfig";

export const getSubjectsFromApi = async (): Promise<any> => {
  const response = await axiosInstance.get(`/subjects`);
  return response.data;
};
