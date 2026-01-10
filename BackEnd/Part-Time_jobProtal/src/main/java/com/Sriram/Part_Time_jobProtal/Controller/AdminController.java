package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.DTOs.AdminApplicationRecord;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.SeekerResponse;
import com.Sriram.Part_Time_jobProtal.Service.AdminService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/seekers")
    public ResponseEntity<List<SeekerResponse>> getAllSeekers() {
        return ResponseEntity.ok(adminService.getAllSeekers());
    }
    @DeleteMapping("/seekers/{id}")
    public ResponseEntity<?> deleteSeeker(@PathVariable Long id) {
        adminService.deleteSeeker(id);
        return ResponseEntity.ok("Seeker deleted successfully");
    }

    @GetMapping("/providers")
    public ResponseEntity<List<ProviderResponse>> getAllProviders() {
        return ResponseEntity.ok(adminService.getAllProviders());
    }

    @DeleteMapping("/providers/{id}")
    public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
        adminService.deleteProvider(id);
        return ResponseEntity.ok("Provider deleted successfully");
    }

    @GetMapping("/applications")
    public ResponseEntity<List<AdminApplicationRecord>> getAllApplicationRecords() {
        return ResponseEntity.ok(adminService.getAllApplicationRecords());
    }
}
