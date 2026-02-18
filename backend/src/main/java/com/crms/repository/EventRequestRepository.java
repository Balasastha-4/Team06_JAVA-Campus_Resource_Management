package com.crms.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.crms.model.EventRequest;

public interface EventRequestRepository extends MongoRepository<EventRequest, String> {
    List<EventRequest> findByUserId(String userId);

    List<EventRequest> findByStatus(com.crms.model.EventStatus status);
}
