package com.Sriram.Part_Time_jobProtal.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

//Stores application of SEEKER to JOB.

@Entity
@Table(name = "job_application")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The job this application belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    // The seeker/applicant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)//If Applicant is deleted → JobApplications are auto-deleted (DB-level cascade)
    private Applicant applicant;


    @Column(name = "seeker_message", length = 2000)
    private String seekerMessage;

    @Column(name = "status", length = 60)
    private String status;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    // Chat room created when both accepted
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")//If JobApplication is deleted → ChatRoom is deleted
    private ChatRoom chatRoom;

    // Flags for per-user hide (soft remove)
    @Column(name = "hidden_from_seeker", nullable = false)
    private boolean hiddenFromSeeker = false;

    @Column(name = "hidden_from_provider", nullable = false)
    private boolean hiddenFromProvider = false;
}



//One Job → Many Applications
//One Application → One Job
//Because multiple candidates can apply to same job.



//One Applicant → Many Applications
//One Application → One Applicant
//Because one seeker can apply to multiple jobs.
