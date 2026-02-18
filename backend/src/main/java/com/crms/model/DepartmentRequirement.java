package com.crms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "departmentRequirements")
public class DepartmentRequirement {
    @Id
    private String id;

    @DBRef
    private User hod;

    private String department;
    private RequirementType type;
    private String description;
    private RequirementStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DepartmentRequirement() {
    }

    public DepartmentRequirement(User hod, String department, RequirementType type, String description) {
        this.hod = hod;
        this.department = department;
        this.type = type;
        this.description = description;
        this.status = RequirementStatus.PENDING_ADMIN;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getHod() {
        return hod;
    }

    public void setHod(User hod) {
        this.hod = hod;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public RequirementType getType() {
        return type;
    }

    public void setType(RequirementType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RequirementStatus getStatus() {
        return status;
    }

    public void setStatus(RequirementStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
