package com.crms.repository;

import com.crms.model.StaffAvailability;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface StaffAvailabilityRepository extends MongoRepository<StaffAvailability, String> {
    Optional<StaffAvailability> findByUserId(String userId);
}
