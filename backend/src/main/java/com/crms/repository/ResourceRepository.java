package com.crms.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.crms.model.Resource;
import com.crms.model.ResourceStatus;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByStatus(ResourceStatus status);
}
