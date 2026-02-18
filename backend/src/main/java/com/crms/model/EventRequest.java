package com.crms.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "eventRequests")
public class EventRequest {
    @Id
    private String id;

    private String userId;

    @NotBlank
    private String eventName;

    private EventType eventType;

    private String department;
    private String staffInChargeId;

    @NotNull
    private String resourceId;

    @NotNull
    @NotNull
    @Future
    private LocalDate eventDate;

    @NotNull
    private LocalTime timeSlot;

    @Min(1)
    private int participants;

    @NotBlank
    private String description;

    private EventStatus status = EventStatus.PENDING;

    private String rejectionReason;

    @CreatedDate
    private LocalDateTime createdAt;
}
