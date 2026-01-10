package com.Sriram.Part_Time_jobProtal.Repository;


import com.Sriram.Part_Time_jobProtal.Model.Role;
import com.Sriram.Part_Time_jobProtal.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    //  REQUIRED FOR ADMIN (get all providers)
    List<User> findByRole(Role role);
}