package com.justresults.hirepay.domain;

import com.justresults.hirepay.enumeration.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Set;

@Entity 
@Table(name = "users")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class User {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=160)
    private String email;

    @Column(nullable=false)
    private String passwordHash;

    @Column(nullable=false, length=100)
    private String designation;

    @Column(nullable=false, length=200)
    private String fullName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name="user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name="role")
    private Set<Role> roles;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @PrePersist 
    void onCreate() { 
        createdAt = OffsetDateTime.now(); 
        updatedAt = createdAt; 
    }
    
    @PreUpdate 
    void onUpdate() { 
        updatedAt = OffsetDateTime.now(); 
    }
}
