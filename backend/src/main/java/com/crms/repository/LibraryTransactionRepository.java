package com.crms.repository;

import com.crms.model.LibraryTransaction;
import com.crms.model.TransactionStatus;
import com.crms.model.TransactionType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LibraryTransactionRepository extends MongoRepository<LibraryTransaction, String> {
    List<LibraryTransaction> findByUserId(String userId);

    List<LibraryTransaction> findByStatus(TransactionStatus status);

    List<LibraryTransaction> findByStatusAndType(TransactionStatus status, TransactionType type);

    // Sort by Priority (Ascending -> 1 is highest) and then Request Date (Ascending
    // -> First come first serve)
    List<LibraryTransaction> findByStatusAndTypeOrderByPriorityAscRequestDateAsc(TransactionStatus status,
            TransactionType type);
}
