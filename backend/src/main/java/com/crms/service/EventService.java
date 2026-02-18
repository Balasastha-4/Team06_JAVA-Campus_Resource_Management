package com.crms.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crms.model.Booking;
import com.crms.model.BookingStatus;
import com.crms.model.EventRequest;
import com.crms.model.EventStatus;
import com.crms.model.Resource;
import com.crms.model.StaffAvailability;
import com.crms.repository.EventRequestRepository;
import com.crms.repository.ResourceRepository;

@Service
public class EventService {
    @Autowired
    private EventRequestRepository eventRequestRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private com.crms.repository.UserRepository userRepository;

    @Autowired
    private StaffAvailabilityService staffAvailabilityService;

    public List<EventRequest> getAllEvents() {
        return eventRequestRepository.findAll();
    }

    public List<EventRequest> getMyEvents(String userId) {
        return eventRequestRepository.findByUserId(userId);
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

    public List<EventRequest> getPendingEvents(String role, String userId, String department) {
        String resolvedDept = resolveDepartmentName(department);
        System.out.println("Fetching pending events for role: " + role + ", resolved dept: " + resolvedDept);
        
        if ("STAFF".equals(role)) {
            // Staff sees events assigned to them to confirm availability
            return eventRequestRepository.findAll().stream()
                    .filter(e -> e.getStatus() == EventStatus.PENDING_STAFF && userId.equals(e.getStaffInChargeId()))
                    .toList();
        } else if ("HOD".equals(role)) {
            // HOD sees events from their department awaiting their approval
            return eventRequestRepository.findAll().stream()
                    .filter(e -> e.getStatus() == EventStatus.PENDING_HOD && resolvedDept.equals(e.getDepartment()))
                    .toList();
        } else if ("ADMIN".equals(role)) {
            return eventRequestRepository.findByStatus(EventStatus.VERIFIED);
        }
        return List.of();
    }

    public List<EventRequest> getActiveEvents() {
        // Returns all approved events. Frontend can filter for "Happening Now"
        return eventRequestRepository.findByStatus(EventStatus.APPROVED);
    }

    public EventRequest createEventRequest(EventRequest request) {
        request.setCreatedAt(LocalDateTime.now());

        // Match status to role
        com.crms.model.User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check Staff Availability if assigned
        if (request.getStaffInChargeId() != null && !request.getStaffInChargeId().isEmpty()) {
            try {
                StaffAvailability availability = staffAvailabilityService.getAvailability(request.getStaffInChargeId());
                if (!availability.isAvailable()) {
                    throw new RuntimeException("Selected faculty unavailable. Please assign another faculty.");
                }
            } catch (RuntimeException e) {
                // If availability record not found, assume available or ignore?
                // Strict mode defined in requirements suggests notifying user.
                if (e.getMessage().contains("Availability not found")) {
                    // Proceed if no record, or default to available
                } else {
                    throw e;
                }
            }
        }

        if (user.getRole() == com.crms.model.Role.ADMIN) {
            request.setStatus(EventStatus.APPROVED);
        } else if (user.getRole() == com.crms.model.Role.HOD) {
            request.setStatus(EventStatus.VERIFIED); // HOD Create -> Skip to Admin
        } else if (user.getRole() == com.crms.model.Role.STAFF) {
            request.setStatus(EventStatus.PENDING_HOD); // Staff req goes to HOD
        } else {
            // Student req goes to HOD first
            request.setStatus(EventStatus.PENDING_HOD);
        }

        // Set department from user profile only if not provided (flexible routing)
        if (request.getDepartment() == null || request.getDepartment().isEmpty()) {
            request.setDepartment(user.getDepartment());
        }

        System.out.println("Created event request for department: " + request.getDepartment());

        // Validating capacity
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (request.getParticipants() > resource.getCapacity()) {
            throw new RuntimeException("Participants exceed resource capacity");
        }

        return eventRequestRepository.save(request);
    }

    @Transactional
    public EventRequest updateStatus(String id, EventStatus status, String role, String reason) {
        EventRequest event = eventRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Status Transition Logic
        if (status == EventStatus.APPROVED && event.getStatus() == EventStatus.VERIFIED && "ADMIN".equals(role)) {
            // Admin Approving verified event -> APPROVED
            
            // ... (rest of approved logic)
            // Auto-create booking
            Booking booking = new Booking();
            booking.setUserId(event.getUserId());
            booking.setResourceId(event.getResourceId());
            booking.setBookingDate(event.getEventDate());
            booking.setTimeSlot(event.getTimeSlot());
            booking.setStatus(BookingStatus.APPROVED);

            try {
                bookingService.createBooking(booking);
            } catch (RuntimeException e) {
                if (e.getMessage().equals("Resource not available for this time slot")) {
                    throw new RuntimeException("You should change the time or choose another available resource.");
                }
                throw new RuntimeException("Cannot approve event: " + e.getMessage());
            }
            event.setStatus(EventStatus.APPROVED);

        } else if ("HOD".equals(role) && event.getStatus() == EventStatus.PENDING_HOD) {
            if (status == EventStatus.REJECTED) {
                event.setStatus(EventStatus.REJECTED);
                event.setRejectionReason(reason);
            } else {
                // HOD Approves -> PENDING_STAFF (if staff assigned) OR VERIFIED
                if (event.getStaffInChargeId() != null && !event.getStaffInChargeId().isEmpty()) {
                    event.setStatus(EventStatus.PENDING_STAFF);
                } else {
                    event.setStatus(EventStatus.VERIFIED);
                }
            }

        } else if ("STAFF".equals(role) && event.getStatus() == EventStatus.PENDING_STAFF) {
            if (status == EventStatus.REJECTED) {
                event.setStatus(EventStatus.REJECTED);
                event.setRejectionReason(reason != null ? reason : "Assigned faculty not available");
            } else {
                // Staff Accepts -> VERIFIED
                event.setStatus(EventStatus.VERIFIED);
            }

        } else if (status == EventStatus.REJECTED) {
            event.setStatus(EventStatus.REJECTED);
            event.setRejectionReason(reason);
        } else {
            // Fallback for ADMIN or force status
            if ("ADMIN".equals(role)) {
                event.setStatus(status);
                if (status == EventStatus.REJECTED) event.setRejectionReason(reason);
            } else {
                throw new RuntimeException("Invalid status transition for role " + role);
            }
        }

        return eventRequestRepository.save(event);
    }
}
