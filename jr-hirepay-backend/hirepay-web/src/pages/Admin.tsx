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
      <div className="zforms">
        <div className="zforms__section">
          <div className="zforms__empty">
            <svg className="zforms__empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="zforms__empty-title">Access Denied</h2>
            <p className="zforms__empty-text">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zforms">
      <div className="zforms__section">
        <div className="zforms__header">
          <div className="zforms__icon">
            <svg className="zforms__icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="zforms__title">Create User</h1>
            <p className="zforms__subtitle">
              Welcome, {currentUser?.fullName} ({currentUser?.designation})
            </p>
          </div>
        </div>

        {error && (
          <div className="zforms__error">
            {error}
          </div>
        )}

        {success && (
          <div className="zforms__success">
            <p>{success}</p>
          </div>
        )}

        <div className="zforms__content">
          <div className="zforms__form-grid">
            {/* Create User Section */}
            <div className="zforms__section">
              <h2 className="zforms__title">Create New User</h2>
              <form onSubmit={handleSubmit} className="zforms__form">
                <div className="zforms__form-field">
                  <label className="zforms__form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="zforms__form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                              <div className="zforms__form-field">
                  <label className="zforms__form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="zforms__form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="zforms__form-input"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="zforms__form-input"
                    placeholder="Enter designation (e.g., Consultant, Manager)"
                    required
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="zforms__form-input"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="FRONT_OFFICE">Front Office</option>
                    <option value="BACK_OFFICE">Back Office</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="zforms__form-actions">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="zforms__button zforms__button--primary"
                  >
                    {loading ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="zforms__section">
              <h2 className="zforms__title">All Users ({userPage?.totalElements || 0})</h2>
              {users.length === 0 ? (
                <div className="zforms__empty">
                  <p className="zforms__empty-text">No users found.</p>
                </div>
              ) : (
                <div className="zforms__table-container">
                  <table className="zforms__table">
                    <thead className="zforms__table-header">
                      <tr>
                        <th className="zforms__table-header-cell">Name</th>
                        <th className="zforms__table-header-cell">Email</th>
                        <th className="zforms__table-header-cell">Designation</th>
                        <th className="zforms__table-header-cell">Roles</th>
                      </tr>
                    </thead>
                    <tbody className="zforms__table-body">
                      {users.map((user) => (
                        <tr key={user.id} className="zforms__table-row">
                          <td className="zforms__table-cell">
                            <span className="zforms__table-cell-text">{user.fullName}</span>
                          </td>
                          <td className="zforms__table-cell">
                            <span className="zforms__table-cell-text zforms__table-cell-text--muted">{user.email}</span>
                          </td>
                          <td className="zforms__table-cell">
                            <span className="zforms__table-cell-text zforms__table-cell-text--muted">{user.designation}</span>
                          </td>
                          <td className="zforms__table-cell">
                            <div className="zforms__badge-group">
                              {user.roles.map((role) => (
                                <span key={role} className="zforms__badge zforms__badge--primary">
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
                <div className="zforms__pagination">
                  <div className="zforms__pagination-info">
                    Showing {userPage.number * userPage.size + 1} to {Math.min((userPage.number + 1) * userPage.size, userPage.totalElements)} of {userPage.totalElements} results
                  </div>
                  <div className="zforms__pagination-controls">
                    <button
                      onClick={() => loadUsers(currentPage - 1)}
                      disabled={userPage.first}
                      className="zforms__button zforms__button--secondary"
                    >
                      Previous
                    </button>
                    <span className="zforms__pagination-page">
                      Page {userPage.number + 1} of {userPage.totalPages}
                    </span>
                    <button
                      onClick={() => loadUsers(currentPage + 1)}
                      disabled={userPage.last}
                      className="zforms__button zforms__button--secondary"
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
    </div>
  );
};

export default Admin;
