package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.DTOs.JobResponse;
import com.Sriram.Part_Time_jobProtal.Service.JobService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//seeker

//This class handles fetching jobs — either all jobs with filters or a single job by ID.
//It uses JobService to get job data and returns it as JobResponse to the frontend.
//Models used
//Job, JobRepository, JobService,

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // GET ALL JOBS WITH FILTERS
    @GetMapping
    public List<JobResponse> getAllJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String salary
    ) {
        return jobService.getAllJobs(search, city, type, salary);
    }

    // GET JOB DETAILS
    @GetMapping("/{id}")
    public JobResponse getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }
}
