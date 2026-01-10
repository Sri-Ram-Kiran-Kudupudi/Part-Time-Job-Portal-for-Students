package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByProviderId(Long providerId); //like SELECT * FROM jobs WHERE provider_id = ?

    //belwo is a JPQL(Java Persistence Query Language)  query
    //It works on Entity names & fields, not table names.
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


/*
JPQL = Java Persistence Query Language
It works on Entity names & fields, not table names.

Here:

Job = Entity
j = alias


So:

SELECT j FROM Job j


Means:
Fetch Job objects from database.

🔍 Now understand each condition
🟢 search filter
:search IS NULL
OR title contains search
OR address contains search


Meaning:

If search = null → ignore filter

Else match title or address

This allows optional searching.

🟢 location filter
:location IS NULL
OR address contains location


If location is given → filter
If not → ignore

🟢 type filter
:type IS NULL
OR j.type = type


Example:
Part-time / Full-time

🟢 salary filter
(:salary IS NULL
OR
CAST(REGEXP_REPLACE(j.salary,'[^0-9]','') AS int)
<= CAST(:salary AS int))


This is cool 😎

Meaning:

Your salary may be stored like
₹10,000 per month OR 10000 Rs

So first REGEXP_REPLACE(j.salary,'[^0-9]','')
removes everything except numbers
Example:

"₹10,000" → "10000"

"20k salary" → "20"
Then converts to integer using CAST
Then checks:
database salary <= salary user provided
⚠️ Note:
REGEXP_REPLACE works mainly in PostgreSQL
If your DB is MySQL, you'll need different function.
 */