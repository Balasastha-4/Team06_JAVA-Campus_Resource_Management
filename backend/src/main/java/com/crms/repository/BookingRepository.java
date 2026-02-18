package com.crms.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.crms.model.Booking;
import com.crms.model.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    // Check for overlapping bookings (simplified for exact slot match)
    // Check for overlapping bookings (APPROVED or VERIFIED)
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'timeSlot': ?2, 'status': { $in: ['APPROVED', 'VERIFIED'] } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date, LocalTime time);

    List<Booking> findByStatus(BookingStatus status);
}
