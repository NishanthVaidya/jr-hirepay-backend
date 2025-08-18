package com.justresults.hirepay.dto;

import com.justresults.hirepay.enumeration.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class UserManagementDTOs {

    public static class CreateUserRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String designation;
        @NotNull
        private Set<Role> roles;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public Set<Role> getRoles() { return roles; }
        public void setRoles(Set<Role> roles) { this.roles = roles; }
    }

    public static class FrontOfficeUserResponse {
        private String id;
        private String email;
        private String designation;
        private String createdAt;

        public FrontOfficeUserResponse(String id, String email, String designation, String createdAt) {
            this.id = id;
            this.email = email;
            this.designation = designation;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getDesignation() { return designation; }
        public String getCreatedAt() { return createdAt; }
    }

    public static class UserResponse {
        private String id;
        private String email;
        private String designation;
        private java.util.List<String> roles;
        private String createdAt;

        public UserResponse(String id, String email, String designation, java.util.List<String> roles, String createdAt) {
            this.id = id;
            this.email = email;
            this.designation = designation;
            this.roles = roles;
            this.createdAt = createdAt;
        }

        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getDesignation() { return designation; }
        public java.util.List<String> getRoles() { return roles; }
        public String getCreatedAt() { return createdAt; }
    }
}
