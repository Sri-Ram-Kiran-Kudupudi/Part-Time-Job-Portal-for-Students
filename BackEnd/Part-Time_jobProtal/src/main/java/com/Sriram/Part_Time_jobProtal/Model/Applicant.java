package com.Sriram.Part_Time_jobProtal.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "applicant_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to User
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private Integer age;
    private String gender;

    private String skills;

    private String experience;

    private String city;
    private String district;
    private String state;

    private String status;  // e.g., pending / seeker_accepted / both_accepted

    private String chatId;
}
