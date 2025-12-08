package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
import com.Sriram.Part_Time_jobProtal.Model.User;
import com.Sriram.Part_Time_jobProtal.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updated) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Common fields (all roles)
        if (updated.getFullName() != null)
            user.setFullName(updated.getFullName());

        if (updated.getPhone() != null)
            user.setPhone(updated.getPhone());

        // Extra fields → only for SEEKER
        if (user.getRole().name().equals("SEEKER")) {

            if (updated.getAge() != null)
                user.setAge(updated.getAge());

            if (updated.getGender() != null)
                user.setGender(updated.getGender());
        }

        userRepository.save(user);
        return ResponseEntity.ok("User updated successfully");
    }
}
