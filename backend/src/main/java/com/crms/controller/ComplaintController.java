package com.crms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crms.model.Complaint;
import com.crms.model.ComplaintStatus;
import com.crms.security.services.UserDetailsImpl;
import com.crms.service.ComplaintService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'HOD')")
    public List<Complaint> getComplaints() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();

        return complaintService.getRoutedComplaints(role, userDetails.getDepartment());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'STAFF')")
    public List<Complaint> getMyComplaints() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return complaintService.getMyComplaints(userDetails.getId());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<?> createComplaint(@Valid @RequestBody Complaint complaint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.createComplaint(userDetails.getId(), complaint));
    }

    @PatchMapping("/{id}/update-status")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HOD')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam ComplaintStatus status) {
        try {
            return ResponseEntity.ok(complaintService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
