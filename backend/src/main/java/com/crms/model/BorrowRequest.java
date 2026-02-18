package com.crms.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "borrowRequests")
public class BorrowRequest {
    @Id
    private String id;

    @NotNull
    private String userId;

    @NotNull
    private String bookId;

    @CreatedDate
    private LocalDateTime requestedDate;

    private BorrowStatus status = BorrowStatus.PENDING;
}
