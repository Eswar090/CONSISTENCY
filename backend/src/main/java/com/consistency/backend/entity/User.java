package com.consistency.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @Column(name = "mobile_verified", nullable = false)
    private Boolean mobileVerified = false;

    @Column(name = "mobile_otp_hash")
    @JsonIgnore
    private String mobileOtpHash;

    @Column(name = "mobile_otp_expires_at")
    private LocalDateTime mobileOtpExpiresAt;

    @Column(name = "otp_attempt_count", nullable = false)
    private Integer otpAttemptCount = 0;

    @Column(name = "last_otp_request_at")
    private LocalDateTime lastOtpRequestAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public Boolean getMobileVerified() { return mobileVerified; }
    public void setMobileVerified(Boolean mobileVerified) { this.mobileVerified = mobileVerified; }

    public String getMobileOtpHash() { return mobileOtpHash; }
    public void setMobileOtpHash(String mobileOtpHash) { this.mobileOtpHash = mobileOtpHash; }

    public LocalDateTime getMobileOtpExpiresAt() { return mobileOtpExpiresAt; }
    public void setMobileOtpExpiresAt(LocalDateTime mobileOtpExpiresAt) { this.mobileOtpExpiresAt = mobileOtpExpiresAt; }

    public Integer getOtpAttemptCount() { return otpAttemptCount; }
    public void setOtpAttemptCount(Integer otpAttemptCount) { this.otpAttemptCount = otpAttemptCount; }

    public LocalDateTime getLastOtpRequestAt() { return lastOtpRequestAt; }
    public void setLastOtpRequestAt(LocalDateTime lastOtpRequestAt) { this.lastOtpRequestAt = lastOtpRequestAt; }
}

