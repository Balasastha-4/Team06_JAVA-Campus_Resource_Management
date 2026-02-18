package com.crms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.crms.model.Complaint;
import com.crms.model.ComplaintStatus;
import com.crms.model.User;
import com.crms.repository.ComplaintRepository;
import com.crms.repository.UserRepository;

@Service
public class ComplaintService {
    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getRoutedComplaints(String role, String department) {
        System.out.println("Fetching routed complaints for role: " + role + ", dept: " + department);
        if ("ADMIN".equals(role)) {
            List<Complaint> complaints = complaintRepository.findAll().stream()
                    .filter(c -> "ADMIN".equals(c.getRoutedTo()))
                    .collect(Collectors.toList());
            System.out.println("Admin Complaints Count: " + complaints.size());
            return complaints;
        } else if ("HOD".equals(role)) {
            List<Complaint> complaints = complaintRepository.findAll().stream()
                    .filter(c -> "HOD".equals(c.getRoutedTo()) && department.equals(c.getDepartment()))
                    .collect(Collectors.toList());
            System.out.println("HOD Complaints Count: " + complaints.size());
            return complaints;
        }
        return List.of();
    }

    public List<Complaint> getMyComplaints(String userId) {
        return complaintRepository.findByUserId(userId);
    }

    public Complaint createComplaint(String userId, Complaint complaint) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        complaint.setUserId(userId);
        
        // Only auto-set department if not provided (flexible routing)
        if (complaint.getDepartment() == null || complaint.getDepartment().isEmpty()) {
            complaint.setDepartment(user.getDepartment());
        }
        
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setStatus(ComplaintStatus.OPEN);

        // Ensure routedTo is valid, default to ADMIN if missing
        if (complaint.getRoutedTo() == null || 
            (!complaint.getRoutedTo().equals("HOD") && !complaint.getRoutedTo().equals("ADMIN"))) {
            complaint.setRoutedTo("ADMIN");
        }

        return complaintRepository.save(complaint);
    }

    public Complaint updateStatus(String id, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        complaint.setUpdatedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }
}
