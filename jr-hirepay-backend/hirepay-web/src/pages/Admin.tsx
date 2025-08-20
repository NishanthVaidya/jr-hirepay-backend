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

                {/* Create User Section */}
        <div className="zforms__section">
          <div className="zforms__header">
            <div className="zforms__title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New User
            </div>
          </div>
          
          <div className="zforms__content">
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

              <div className="zforms__form-actions" style={{ justifyContent: 'flex-start' }}>
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
        </div>

        {/* Users List Section */}
        <div className="zforms__section">
          <div className="zforms__header">
            <div className="zforms__title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              All Users ({userPage?.totalElements || 0})
            </div>
          </div>
          
          <div className="zforms__content">
              {users.length === 0 ? (
                <div className="zforms__empty">
                  <p className="zforms__empty-text">No users found.</p>
                </div>
              ) : (
                <div className="zforms__table-container">
                  <table className="admin-table" style={{ 
                    width: '100%', 
                    tableLayout: 'fixed',
                    borderCollapse: 'collapse',
                    borderSpacing: 0,
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}>
                    <thead>
                      <tr>
                        <th style={{ 
                          width: '20%', 
                          textAlign: 'left',
                          padding: '12px 16px',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          backgroundColor: '#f9fafb'
                        }}>Name</th>
                        <th style={{ 
                          width: '30%', 
                          textAlign: 'left',
                          padding: '12px 16px',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          backgroundColor: '#f9fafb'
                        }}>Email</th>
                        <th style={{ 
                          width: '25%', 
                          textAlign: 'left',
                          padding: '12px 16px',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          backgroundColor: '#f9fafb'
                        }}>Designation</th>
                        <th style={{ 
                          width: '25%', 
                          textAlign: 'left',
                          padding: '12px 16px',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          backgroundColor: '#f9fafb'
                        }}>Roles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <td style={{ 
                            width: '20%', 
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#1f2937',
                            fontSize: '14px'
                          }}>
                            {user.fullName}
                          </td>
                          <td style={{ 
                            width: '30%', 
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#6b7280',
                            fontSize: '14px'
                          }}>
                            {user.email}
                          </td>
                          <td style={{ 
                            width: '25%', 
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#6b7280',
                            fontSize: '14px'
                          }}>
                            {user.designation}
                          </td>
                          <td style={{ 
                            width: '25%', 
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {user.roles.map((role) => (
                                <span key={role} style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: '#3b82f6',
                                  color: 'white'
                                }}>
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
  );
};

export default Admin;
