package com.crms.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    @NotBlank
    @Indexed(unique = true)
    private String name;

    private ResourceType type;

    @Min(1)
    private int capacity;

    private ResourceStatus status; // AVAILABLE, MAINTENANCE, UNAVAILABLE

    @CreatedDate
    private LocalDateTime createdAt;
}
