import React, { useState, useEffect } from "react";
import AuthService, { CreateUserRequest, User } from "../services/auth";
import { userManagementService, User as UserManagementUser, UserPage } from "../services/userManagement";

const Admin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserManagementUser[]>([]);
  const [userPage, setUserPage] = useState<UserPage | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const userData = AuthService.getCurrentUser(token);
        setCurrentUser(userData);
      } catch (err) {
        console.error("Failed to parse token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser?.roles.includes("ADMIN")) {
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = async (page: number = 0) => {
    try {
      const response = await userManagementService.getAllUsers(page, 20);
      setUsers(response.content);
      setUserPage(response);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const userData: CreateUserRequest = {
        email,
        password,
        fullName,
        designation,
        roles: [role]
      };

      await AuthService.createUser(userData, token);
      setSuccess("User created successfully!");
      
      // Clear form
      setEmail("");
      setPassword("");
      setFullName("");
      setDesignation("");
      setRole("");
      
      // Refresh the users list
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !currentUser.roles.includes("ADMIN")) {
    return (
      <div className="zform-dashboard">
        <div className="zform-dashboard-container">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zform-dashboard">
      <div className="zform-dashboard-container">
        <div className="zform-dashboard-header mb-8">
          <div className="zform-dashboard-icon">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="zform-dashboard-title">Create User</h1>
            <p className="zform-dashboard-subtitle">
              Welcome, {currentUser?.fullName} ({currentUser?.designation})
            </p>
          </div>
        </div>

        {error && (
          <div className="zform-error-message mb-8">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Create User Section */}
          <div className="zform-dashboard-card">
            <h2 className="zform-card-title mb-6">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="zform-form-group">
                <label className="zform-form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="zform-form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="zform-form-group">
                <label className="zform-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="zform-form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="zform-form-group">
                <label className="zform-form-label">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="zform-form-input"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="zform-form-group">
                <label className="zform-form-label">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="zform-form-input"
                  placeholder="Enter designation (e.g., Consultant, Manager)"
                  required
                />
              </div>

              <div className="zform-form-group">
                <label className="zform-form-label">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="zform-form-input"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="FRONT_OFFICE">Front Office</option>
                  <option value="BACK_OFFICE">Back Office</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="zform-login-button disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>

          {/* Users List */}
          <div className="zform-dashboard-card">
            <h2 className="zform-card-title mb-6">All Users ({userPage?.totalElements || 0})</h2>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {userPage && userPage.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {userPage.number * userPage.size + 1} to {Math.min((userPage.number + 1) * userPage.size, userPage.totalElements)} of {userPage.totalElements} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadUsers(currentPage - 1)}
                    disabled={userPage.first}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {userPage.number + 1} of {userPage.totalPages}
                  </span>
                  <button
                    onClick={() => loadUsers(currentPage + 1)}
                    disabled={userPage.last}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Admin;
