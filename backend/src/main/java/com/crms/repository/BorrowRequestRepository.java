package com.crms.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.crms.model.BorrowRequest;
import com.crms.model.BorrowStatus;

public interface BorrowRequestRepository extends MongoRepository<BorrowRequest, String> {
    List<BorrowRequest> findByUserId(String userId);
    List<BorrowRequest> findByStatus(BorrowStatus status);
    
    // Check active borrows count
    long countByUserIdAndStatus(String userId, BorrowStatus status);
}
