package com.Sriram.Part_Time_jobProtal.DTOs;

import com.Sriram.Part_Time_jobProtal.Model.JobApplication;
import com.Sriram.Part_Time_jobProtal.Model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {

    private Long applicationId;
    private String status;
    private String message;
    private LocalDateTime appliedAt;

    private String jobTitle;
    private Long jobId;

    private Long providerId;
    private String providerName;
    private String providerEmail;

    // ⭐ NEW FIELD — required for chat feature
    private Long chatId;

    public static ApplicationResponse fromEntity(JobApplication app, User provider) {

        ApplicationResponse dto = new ApplicationResponse();

        dto.setApplicationId(app.getId());
        dto.setStatus(app.getStatus());
        dto.setMessage(app.getSeekerMessage());
        dto.setAppliedAt(app.getAppliedAt());

        dto.setJobId(app.getJob().getId());
        dto.setJobTitle(app.getJob().getTitle());

        if (provider != null) {
            dto.setProviderId(provider.getId());
            dto.setProviderName(provider.getFullName());
            dto.setProviderEmail(provider.getEmail());
        }

        // ⭐ ADD CHAT ID HERE
        if (app.getChatRoom() != null) {
            dto.setChatId(app.getChatRoom().getId());
        } else {
            dto.setChatId(null);
        }

        return dto;
    }
}
