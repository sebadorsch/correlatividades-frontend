import axiosInstance from "../config/axiosConfig";

type UserSubjectsBody = {
  regularizedSubjects: number[];
  approvedSubjects: number[];
  electiveHoursLevel3?: number;
  electiveHoursLevel4?: number;
  electiveHoursLevel5?: number;
};

export const postUsersSubjects = async (body: UserSubjectsBody): Promise<any> => {
  const token = localStorage.getItem('authToken');

  const response = await axiosInstance.patch(`/users/subjects`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}
