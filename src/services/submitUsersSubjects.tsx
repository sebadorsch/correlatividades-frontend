import axiosInstance from "../config/axiosConfig";

export const postUsersSubjects = async ({regularizedSubjects, approvedSubjects}): Promise<any> => {
  const token = localStorage.getItem('authToken');

  const body = {
    regularizedSubjects,
    approvedSubjects
  };

  const response = await axiosInstance.patch(`/users/subjects`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}
