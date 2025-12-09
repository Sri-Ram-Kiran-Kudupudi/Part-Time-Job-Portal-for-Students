package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.DTOs.ApplyJobRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplicationResponse;
import com.Sriram.Part_Time_jobProtal.Service.JobApplicationService;

import lombok.RequiredArgsConstructor;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<ApplicationResponse> apply(
            @PathVariable Long jobId,
            @RequestBody ApplyJobRequest request,
            HttpServletRequest httpRequest
    ) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) throw new RuntimeException("User ID missing");

        return ResponseEntity.ok(
                applicationService.applyForJob(jobId, userId, request)
        );
    }

    @GetMapping("/applied")
    public ResponseEntity<?> getAppliedJobs(HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        if (userId == null) throw new RuntimeException("User ID missing");

        return ResponseEntity.ok(applicationService.getAppliedJobsForSeeker(userId));
    }

    @DeleteMapping("/applications/{applicationId}")
    public ResponseEntity<?> withdrawApplication(
            @PathVariable Long applicationId,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new RuntimeException("User ID missing");

        applicationService.withdrawApplication(applicationId, userId);
        return ResponseEntity.ok("Application withdrawn successfully");
    }

    @PutMapping("/applications/{applicationId}/accept")
    public ResponseEntity<?> providerAccept(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.providerAccept(applicationId));
    }

    @PutMapping("/applications/{applicationId}/reject")
    public ResponseEntity<?> providerReject(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.providerReject(applicationId));
    }

    // ---------- NEW: seeker hides the completed application from their view ----------
    @PutMapping("/applications/{applicationId}/hide/seeker")
    public ResponseEntity<?> hideForSeeker(@PathVariable Long applicationId,
                                           HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new RuntimeException("User ID missing");

        applicationService.hideApplicationForSeeker(applicationId, userId);
        return ResponseEntity.ok("Application hidden for seeker");
    }

    // ---------- NEW: provider hides the completed application from their view ----------
    @PutMapping("/applications/{applicationId}/hide/provider")
    public ResponseEntity<?> hideForProvider(@PathVariable Long applicationId,
                                             HttpServletRequest request) {
        Long providerId = (Long) request.getAttribute("userId"); // provider's userId in token
        if (providerId == null) throw new RuntimeException("Provider ID missing");

        applicationService.hideApplicationForProvider(applicationId, providerId);
        return ResponseEntity.ok("Application hidden for provider");
    }
}
