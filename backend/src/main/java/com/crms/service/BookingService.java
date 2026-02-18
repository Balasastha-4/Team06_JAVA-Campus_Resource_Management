package com.crms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crms.model.Booking;
import com.crms.model.BookingStatus;
import com.crms.model.Resource;
import com.crms.model.ResourceStatus;
import com.crms.repository.BookingRepository;
import com.crms.repository.ResourceRepository;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private com.crms.repository.UserRepository userRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    private String resolveDepartmentName(String dept) {
        if (dept == null) return "Computer Science";
        String upperDept = dept.toUpperCase().trim();
        switch (upperDept) {
            case "IT": return "Information Technology";
            case "CSE": return "Computer Science";
            case "ECE": return "Electronic & Communication";
            case "MECH": return "Mechanical Engineering";
            case "CIVIL": return "Civil Engineering";
            default: return dept;
        }
    }

    public List<Booking> getPendingBookings(String role, String department) {
        String resolvedDept = resolveDepartmentName(department);
        if ("HOD".equals(role)) {
            // HOD sees pending bookings from their department
            return bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING && resolvedDept.equals(b.getDepartment()))
                    .toList();
        } else if ("STAFF".equals(role)) {
            return bookingRepository.findByStatus(BookingStatus.PENDING);
        } else if ("ADMIN".equals(role)) {
            return bookingRepository.findByStatus(BookingStatus.VERIFIED);
        }
        return List.of();
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        // ... (existing resource check)
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.AVAILABLE) {
            throw new RuntimeException("Resource is not available for booking");
        }

        // ... (existing conflict check)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getTimeSlot());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("You should change the time or choose another available resource.");
        }

        com.crms.model.User user = userRepository.findById(booking.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set department for routing
        if (booking.getDepartment() == null || booking.getDepartment().isEmpty()) {
            booking.setDepartment(user.getDepartment());
        }

        // Set status
        if (booking.getStatus() == null) {
            if (user.getRole() == com.crms.model.Role.ADMIN) {
                booking.setStatus(BookingStatus.APPROVED);
            } else if (user.getRole() == com.crms.model.Role.STAFF) {
                booking.setStatus(BookingStatus.VERIFIED);
            } else {
                booking.setStatus(BookingStatus.PENDING);
            }
        }

        return bookingRepository.save(booking);
    }

    public Booking updateStatus(String id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // If approving, check conflict again to be safe
        if (status == BookingStatus.APPROVED) {
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    booking.getResourceId(),
                    booking.getBookingDate(),
                    booking.getTimeSlot());

            if (!conflicts.isEmpty()) {
                throw new RuntimeException(
                        "Cannot approve: You should change the time or choose another available resource.");
            }
        }

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
