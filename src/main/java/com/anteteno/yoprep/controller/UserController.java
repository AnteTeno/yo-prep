package com.anteteno.yoprep.controller;

import com.anteteno.yoprep.entity.User;
import com.anteteno.yoprep.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;


    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> credentials) {
        return userService.login(credentials.get("username"), credentials.get("password"));
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping()
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/{id}")
    public String deleteUserById(@PathVariable Long id) {
        return "User with ID " + id + " deleted successfully!";
    }
}
