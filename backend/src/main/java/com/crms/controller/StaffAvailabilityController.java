package com.crms.controller;

import com.crms.model.StaffAvailability;
import com.crms.service.StaffAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/staff-availability")
public class StaffAvailabilityController {

    @Autowired
    private StaffAvailabilityService availabilityService;

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('HOD')")
    public ResponseEntity<?> updateAvailability(@PathVariable String userId, @RequestBody StaffAvailability request) {
        return ResponseEntity.ok(
                availabilityService.updateAvailability(userId, request.isAvailable(), request.getUnavailableReason()));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('HOD', 'STUDENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<?> getAvailability(@PathVariable String userId) {
        return ResponseEntity.ok(availabilityService.getAvailability(userId));
    }
}
