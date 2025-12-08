package com.Sriram.Part_Time_jobProtal.Service;

import com.Sriram.Part_Time_jobProtal.DTOs.AdminApplicationRecord;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.SeekerResponse;
import java.util.List;

public interface AdminService {

    List<SeekerResponse> getAllSeekers();

    void deleteSeeker(Long userId);
    List<ProviderResponse> getAllProviders();

    void deleteProvider(Long providerId);
    List<AdminApplicationRecord> getAllApplicationRecords();

}
