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

    List<JobApplication> findByApplicantAndHiddenFromSeekerFalse(Applicant applicant);
    //Meaning:
    //Fetch all job applications
    //Where applicant = given applicant
    //AND hiddenFromSeeker = false
    //So seekers don't see removed/hidden applications.


    List<JobApplication> findByJobAndHiddenFromProviderFalse(Job job);
    //Meaning:
    //Fetch applications by job
    //Only where hiddenFromProvider = false
    //So provider does not see deleted/hidden applications.

    boolean existsByApplicantAndJob(Applicant applicant, Job job);
     //Meaning:
     //Checks if same seeker already applied for the same job
     //Returns true / false
     //Used to prevent duplicate apply actions.



    //  Correct delete
    @Modifying
    @Transactional
    void deleteByApplicant_Id(Long applicantId);

    @Modifying
    @Transactional
    void deleteByJob_Id(Long jobId); //Deletes all applications related to a job

    //  Admin safety checks
    boolean existsByApplicant_User_IdAndStatusAndHiddenFromSeekerFalse(Long userId, String status);
    //Meaning:
    //Check if a seeker user has applications where:
    //applicant.user.id = userId
    //status = given status
    //hiddenFromSeeker = false
    //Returns boolean
    //Used before deleting seeker
    //Example use:
    //Prevent deletion if user has "both_accepted" job.


    //Check Active Provider Applications
    boolean existsByJob_ProviderIdAndStatusAndHiddenFromProviderFalse(
            Long providerId,
            String status
    ); //Used before deleting provider.

    // hese queries help delete chat rooms + messages when deleting accounts.

    @Query("""
        SELECT a.chatRoom.id
        FROM JobApplication a
        WHERE a.applicant.user.id = :userId
          AND a.chatRoom IS NOT NULL
    """)
    List<Long> findChatRoomIdsByApplicantUserId(@Param("userId") Long userId);
    //Meaning:
    // We Select chatRoom.id
    //From JobApplication table
    //Where applicant user matches
    //Only if chat room exists
    //Used when deleting seeker.

    @Query("""
        SELECT a.chatRoom.id
        FROM JobApplication a
        WHERE a.job.id = :jobId
          AND a.chatRoom IS NOT NULL
    """)
    List<Long> findChatRoomIdsByJobId(@Param("jobId") Long jobId);



    //CHAT SUPPORT QUERIES:Used when chat page needs details quickly.

    // Seeker USER ID by room
    @Query("""
    SELECT a.applicant.user.id
    FROM JobApplication a
    WHERE a.chatRoom.id = :roomId
""")
    Long findSeekerIdByRoomId(@Param("roomId") Long roomId);

    // Provider USER ID by room
    @Query("""
    SELECT a.job.providerId
    FROM JobApplication a
    WHERE a.chatRoom.id = :roomId
""")
    Long findProviderIdByRoomId(@Param("roomId") Long roomId);

    // Seeker NAME by room
    @Query("""
    SELECT a.applicant.user.fullName
    FROM JobApplication a
    WHERE a.chatRoom.id = :roomId
""")
    String findSeekerNameByRoomId(@Param("roomId") Long roomId);

    // Provider NAME by room
    @Query("""
    SELECT u.fullName
    FROM JobApplication a
    JOIN User u ON u.id = a.job.providerId
    WHERE a.chatRoom.id = :roomId
""")
    String findProviderNameByRoomId(@Param("roomId") Long roomId);

}