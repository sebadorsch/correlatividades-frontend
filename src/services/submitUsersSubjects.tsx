import axiosInstance from "../config/axiosConfig";
import type { Elective } from "./planStatus";

type UserSubjectsBody = {
  regularizedSubjects: number[];
  approvedSubjects: number[];
  electives?: Elective[];
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
