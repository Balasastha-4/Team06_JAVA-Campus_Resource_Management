package com.crms.controller;

import com.crms.model.DepartmentRequirement;
import com.crms.model.RequirementStatus;
import com.crms.model.RequirementType;
import com.crms.security.services.UserDetailsImpl;
import com.crms.service.DepartmentRequirementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/department-requirements")
public class DepartmentRequirementController {

    @Autowired
    private DepartmentRequirementService requirementService;

    @PostMapping
    @PreAuthorize("hasAuthority('HOD')")
    public ResponseEntity<?> createRequirement(@RequestBody DepartmentRequirement request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(
                requirementService.createRequirement(userDetails.getId(), request.getType(), request.getDescription()));
    }

    @GetMapping("/my-department")
    @PreAuthorize("hasAuthority('HOD')")
    public List<DepartmentRequirement> getMyDepartmentRequirements() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return requirementService.getRequirementsByDepartment(userDetails.getDepartment());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<DepartmentRequirement> getAllRequirements() {
        return requirementService.getAllRequirements();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody RequirementStatus status) {
        return ResponseEntity.ok(requirementService.updateStatus(id, status));
    }
}
