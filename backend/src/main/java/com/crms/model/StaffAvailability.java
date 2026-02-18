package com.crms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "staffAvailability")
public class StaffAvailability {
    @Id
    private String id;

    @DBRef
    private User user;

    private boolean isAvailable;
    private String unavailableReason;
    private LocalDateTime lastUpdated;

    public StaffAvailability() {
    }

    public StaffAvailability(User user, boolean isAvailable, String unavailableReason) {
        this.user = user;
        this.isAvailable = isAvailable;
        this.unavailableReason = unavailableReason;
        this.lastUpdated = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public String getUnavailableReason() {
        return unavailableReason;
    }

    public void setUnavailableReason(String unavailableReason) {
        this.unavailableReason = unavailableReason;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
