package com.crms.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookDemands")
public class BookDemand {
    @Id
    private String id;

    @NotNull
    private String userId;

    @NotBlank
    private String bookTitle;

    private String bookId; // Optional, if they want more copies of existing book

    @CreatedDate
    private LocalDateTime requestedAt;

    private String status = "WANTED";
}
