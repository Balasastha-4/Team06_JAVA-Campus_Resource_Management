package com.crms.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.crms.model.Complaint;
import com.crms.model.ComplaintStatus;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByUserId(String userId);

    List<Complaint> findByStatus(ComplaintStatus status);
}
