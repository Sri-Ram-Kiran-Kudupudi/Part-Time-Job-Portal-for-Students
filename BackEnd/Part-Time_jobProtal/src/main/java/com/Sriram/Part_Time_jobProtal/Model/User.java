package com.Sriram.Part_Time_jobProtal.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    private Integer age;
    private String gender;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String phone;   // ✅ ADDED FIELD

    @Enumerated(EnumType.STRING)
    private Role role;
}
