package com.crms.service;

import com.crms.model.StaffAvailability;
import com.crms.model.User;
import com.crms.repository.StaffAvailabilityRepository;
import com.crms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class StaffAvailabilityService {

    @Autowired
    private StaffAvailabilityRepository staffAvailabilityRepository;

    @Autowired
    private UserRepository userRepository;

    public StaffAvailability updateAvailability(String userId, boolean isAvailable, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StaffAvailability availability = staffAvailabilityRepository.findByUserId(userId)
                .orElse(new StaffAvailability(user, true, ""));

        availability.setAvailable(isAvailable);
        availability.setUnavailableReason(reason);
        availability.setLastUpdated(LocalDateTime.now());

        return staffAvailabilityRepository.save(availability);
    }

    public StaffAvailability getAvailability(String userId) {
        return staffAvailabilityRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Availability not found for user"));
    }
}
