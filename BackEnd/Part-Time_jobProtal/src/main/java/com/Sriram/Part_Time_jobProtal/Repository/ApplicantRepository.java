package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import com.Sriram.Part_Time_jobProtal.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {

    Optional<Applicant> findByUser(User user);

    // ⭐ Find applicant using USER ID
    Optional<Applicant> findByUser_Id(Long userId);

    // DELETE APPLICANT BY USER ID (correct!)
    @Modifying
    @Transactional
    void deleteByUser_Id(Long userId);
}
