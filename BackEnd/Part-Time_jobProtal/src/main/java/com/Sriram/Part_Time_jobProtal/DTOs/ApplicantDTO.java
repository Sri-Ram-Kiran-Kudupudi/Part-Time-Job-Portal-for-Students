package com.Sriram.Part_Time_jobProtal.DTOs;

import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import lombok.Data;

@Data
public class ApplicantDTO {

    private Long id;
    private String fullName;

    private Integer age;
    private String gender;

    private String skills;
    private String experience;

    private String city;
    private String district;
    private String state;

    private String status;
    private String chatId;

    public ApplicantDTO(Applicant a) {
        this.id = a.getId();
        this.fullName = a.getUser().getFullName();

        this.age = a.getAge();
        this.gender = a.getGender();
        this.skills = a.getSkills();

        this.experience = a.getExperience();

        this.city = a.getCity();
        this.district = a.getDistrict();
        this.state = a.getState();

        this.status = a.getStatus();
        this.chatId = a.getChatId();
    }
}
