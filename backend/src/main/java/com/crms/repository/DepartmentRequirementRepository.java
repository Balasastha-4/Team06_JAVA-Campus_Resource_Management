package com.crms.repository;

import com.crms.model.DepartmentRequirement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DepartmentRequirementRepository extends MongoRepository<DepartmentRequirement, String> {
    List<DepartmentRequirement> findByDepartment(String department);

    List<DepartmentRequirement> findByStatus(String status);
}
