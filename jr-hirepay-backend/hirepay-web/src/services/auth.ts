import api from "./api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type CreateUserRequest = {
  email: string;
  password: string;
  designation?: string;
  fullName: string;
  roles?: string[];
};

export type User = {
  id: number;
  email: string;
  designation: string;
  fullName: string;
  roles: string[];
};

const AuthService = {
  // Bootstrap the first admin user
  bootstrapAdmin: async (payload: LoginRequest) => {
    const { data } = await api.post("/api/auth/bootstrap-admin", payload);
    return data;
  },

  // Login and get JWT token
  login: async (payload: LoginRequest) => {
    const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
    return data;
  },

  // Create a new user (admin only)
  createUser: async (payload: CreateUserRequest, token: string) => {
    const { data } = await api.post("/api/auth/users", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },

  // Set auth token for subsequent requests
  setAuthToken: (token: string) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  // Clear auth token
  clearAuthToken: () => {
    delete api.defaults.headers.common["Authorization"];
  },

  // Get current user info from token (basic parsing)
  getCurrentUser: (token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: parseInt(payload.userId) || 0,
        email: payload.sub,
        designation: payload.designation,
        fullName: payload.fullName || payload.sub, // fallback to email if fullName not present
        roles: payload.roles || [],
      };
    } catch (error) {
      return null;
    }
  },
};

export default AuthService;
