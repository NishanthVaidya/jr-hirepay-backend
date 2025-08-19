import api from "./api";

export interface User {
  id: number;
  email: string;
  fullName: string;
  designation: string;
  roles: string[];
}

export interface UserPage {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const userManagementService = {
  // Get all users with pagination
  getAllUsers: async (page: number = 0, size: number = 20): Promise<UserPage> => {
    const response = await api.get(`/api/users?page=${page}&size=${size}&sortBy=fullName`);
    return response.data;
  },

  // Get front office users (for document management)
  getFrontOfficeUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/users/front-office');
    return response.data;
  }
};
