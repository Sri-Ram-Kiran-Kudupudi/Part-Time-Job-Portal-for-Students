package com.Sriram.Part_Time_jobProtal.Controller;



//for provider
import com.Sriram.Part_Time_jobProtal.Config.CustomUserDetails;
import com.Sriram.Part_Time_jobProtal.DTOs.JobRequest;
import com.Sriram.Part_Time_jobProtal.Service.JobService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class JobProviderController {

    private final JobService jobService;

    @PreAuthorize("hasRole('PROVIDER')")
    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@RequestBody JobRequest request,
                                       @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(jobService.createJob(request, user.getId()));
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @GetMapping("/jobs")
    public ResponseEntity<?> getJobs(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(jobService.getJobsByProvider(user.getId()));
    }

    // ⭐ Returns job details + applicants (Provider view)
    @GetMapping("/job/{id}")
    public ResponseEntity<?> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobWithApplicants(id));
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @PutMapping("/job/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id,
                                       @RequestBody JobRequest request,
                                       @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(jobService.updateJob(id, request, user.getId()));
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @DeleteMapping("/job/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id,
                                       @AuthenticationPrincipal CustomUserDetails user) {
        jobService.deleteJob(id, user.getId());
        return ResponseEntity.ok("Job deleted");
    }
}
