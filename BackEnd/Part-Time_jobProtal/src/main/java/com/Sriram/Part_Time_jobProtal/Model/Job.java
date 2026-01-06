package com.Sriram.Part_Time_jobProtal.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type;
    private String timing;
    private String salary;

    @Column(length = 1000)
    private String description;

    private String address;

    private Double latitude;   // ⭐ NEW
    private Double longitude;  // ⭐ NEW

    private Long providerId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
