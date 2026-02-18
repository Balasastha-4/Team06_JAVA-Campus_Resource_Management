package com.crms.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.crms.model.BookDemand;

public interface BookDemandRepository extends MongoRepository<BookDemand, String> {
    List<BookDemand> findByUserId(String userId);
}
