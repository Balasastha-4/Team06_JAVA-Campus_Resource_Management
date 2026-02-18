package com.crms.service;

import com.crms.model.DepartmentRequirement;
import com.crms.model.RequirementStatus;
import com.crms.model.RequirementType;
import com.crms.model.User;
import com.crms.repository.DepartmentRequirementRepository;
import com.crms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DepartmentRequirementService {

    @Autowired
    private DepartmentRequirementRepository requirementRepository;

    @Autowired
    private UserRepository userRepository;

    public DepartmentRequirement createRequirement(String hodId, RequirementType type, String description) {
        User hod = userRepository.findById(hodId)
                .orElseThrow(() -> new RuntimeException("HOD not found"));

        DepartmentRequirement req = new DepartmentRequirement(hod, hod.getDepartment(), type, description);
        return requirementRepository.save(req);
    }

    public List<DepartmentRequirement> getRequirementsByDepartment(String department) {
        return requirementRepository.findByDepartment(department);
    }

    public List<DepartmentRequirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    public DepartmentRequirement updateStatus(String id, RequirementStatus status) {
        DepartmentRequirement req = requirementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));
        req.setStatus(status);
        req.setUpdatedAt(LocalDateTime.now());
        return requirementRepository.save(req);
    }
}
