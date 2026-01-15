package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.User;
import com.anteteno.yoprep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public User createUser(User user) {
        String username = user.getUsername();
        String email = user.getEmail();

        if(userRepository.findUserByUsername(username) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        } else if (userRepository.findUserByEmail(email) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);


        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                         "Cannot find user with id: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    private boolean verifyPassword(String rawpassword, String hashedpassword) {
        return passwordEncoder.matches(rawpassword, hashedpassword);
    }


    public User login(String username, String password) {

        if(userRepository.findUserByUsername(username) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incorrect username");
        }

        User user = userRepository.findUserByUsername(username);

        if(!verifyPassword(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect password");
        }

        return user;
    }
}

