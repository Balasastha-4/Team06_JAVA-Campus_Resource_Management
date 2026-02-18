package com.crms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crms.model.EventRequest;
import com.crms.model.EventStatus;
import com.crms.security.services.UserDetailsImpl;
import com.crms.service.EventService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/event-requests")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<EventRequest> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/active")
    public List<EventRequest> getActiveEvents() {
        return eventService.getActiveEvents();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF', 'HOD')")
    public List<EventRequest> getPendingEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();
        return eventService.getPendingEvents(role, userDetails.getId(), userDetails.getDepartment());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'STAFF', 'HOD')")
    public List<EventRequest> getMyEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return eventService.getMyEvents(userDetails.getId());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STUDENT', 'STAFF', 'HOD')") // Staff can also create events now
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            request.setUserId(userDetails.getId());

            return ResponseEntity.ok(eventService.createEventRequest(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF') or hasAuthority('HOD')")
    public ResponseEntity<?> approveEvent(@PathVariable String id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();

            // Status is determined by role in service, using PENDING as placeholder if needed
            EventStatus status = "ADMIN".equals(role) ? EventStatus.APPROVED : EventStatus.VERIFIED;

            return ResponseEntity.ok(eventService.updateStatus(id, status, role, null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF') or hasAuthority('HOD')")
    public ResponseEntity<?> rejectEvent(@PathVariable String id, @RequestParam(required = false) String reason) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority();

            return ResponseEntity.ok(eventService.updateStatus(id, EventStatus.REJECTED, role, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
