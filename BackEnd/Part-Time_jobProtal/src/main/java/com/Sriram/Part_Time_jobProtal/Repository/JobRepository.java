package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByProviderId(Long providerId);

    @Query("""
    SELECT j FROM Job j
    WHERE (
        :search IS NULL 
        OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%'))
        OR LOWER(j.address) LIKE LOWER(CONCAT('%', :search, '%'))
    )
    AND (:location IS NULL OR LOWER(j.address) LIKE LOWER(CONCAT('%', :location, '%')))
    AND (:type IS NULL OR LOWER(j.type) = LOWER(:type))
    AND (:salary IS NULL OR 
        CAST(REGEXP_REPLACE(j.salary,'[^0-9]','') AS int) 
        <= CAST(:salary AS int))
""")
    List<Job> filterJobs(
            @Param("search") String search,
            @Param("location") String location,
            @Param("type") String type,
            @Param("salary") String salary
    );

    @Modifying
    @Transactional
    void deleteByProviderId(Long providerId);
}
