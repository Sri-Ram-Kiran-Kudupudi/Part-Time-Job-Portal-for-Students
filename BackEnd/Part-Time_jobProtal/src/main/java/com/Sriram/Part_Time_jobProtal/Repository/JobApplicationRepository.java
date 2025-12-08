package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.JobApplication;
import com.Sriram.Part_Time_jobProtal.Model.Job;
import com.Sriram.Part_Time_jobProtal.Model.Applicant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByApplicant(Applicant applicant);

    List<JobApplication> findByJob(Job job);

    boolean existsByApplicantAndJob(Applicant applicant, Job job);

    @Modifying
    @Transactional
    void deleteByApplicant_User_Id(Long userId);

    @Modifying
    @Transactional
    void deleteByJob_Id(Long jobId);

    @Query("SELECT a.chatRoom.id FROM JobApplication a WHERE a.applicant.user.id = :userId")
    List<Long> findChatRoomIdsByApplicantUserId(@Param("userId") Long userId);

    @Query("SELECT a.chatRoom.id FROM JobApplication a WHERE a.job.id = :jobId")
    List<Long> findChatRoomIdsByJobId(@Param("jobId") Long jobId);

    // ⭐ BLOCK admin delete if BOTH accepted
    boolean existsByApplicant_User_IdAndStatus(Long userId, String status);

    boolean existsByJob_ProviderIdAndStatus(Long providerId, String status);
}
