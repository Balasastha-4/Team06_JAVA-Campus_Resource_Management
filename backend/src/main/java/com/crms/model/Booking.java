package com.crms.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
@CompoundIndex(name = "resource_booking_idx", def = "{'resourceId': 1, 'bookingDate': 1, 'timeSlot': 1}")
public class Booking {
    @Id
    private String id;

    private String userId;

    @NotNull
    private String resourceId;

    @NotNull
    private LocalDate bookingDate;

    @NotNull
    private LocalTime timeSlot; // Assuming hourly slots for simplicity, or start time

    private String department;
    private BookingStatus status;

    @CreatedDate
    private LocalDateTime createdAt;
}
