package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.User;
import com.anteteno.yoprep.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceTests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_hashesPasswordBeforeSaving() {
        User input = User.builder()
                .username("newuser")
                .email("new@example.com")
                .password("PlainText123")
                .build();

        when(userRepository.findUserByUsername("newuser")).thenReturn(null);
        when(userRepository.findUserByEmail("new@example.com")).thenReturn(null);
        when(passwordEncoder.encode("PlainText123")).thenReturn("$2a$10$hashedvalue");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        User result = userService.createUser(input);

        assertThat(result.getPassword()).isEqualTo("$2a$10$hashedvalue");
        verify(passwordEncoder, times(1)).encode("PlainText123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void createUser_duplicateUsername_throwsException() {
        User existing = User.builder().username("taken").build();
        when(userRepository.findUserByUsername("taken")).thenReturn(existing);

        User input = User.builder()
                .username("taken")
                .email("new@example.com")
                .password("Password123")
                .build();

        assertThatThrownBy(() -> userService.createUser(input))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Username already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_duplicateEmail_throwsException() {
        User existing = User.builder().email("taken@example.com").build();
        when(userRepository.findUserByUsername(anyString())).thenReturn(null);
        when(userRepository.findUserByEmail("taken@example.com")).thenReturn(existing);

        User input = User.builder()
                .username("newuser")
                .email("taken@example.com")
                .password("Password123")
                .build();

        assertThatThrownBy(() -> userService.createUser(input))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_found_returnsUser() {
        User user = User.builder().id(1L).username("testuser").email("test@example.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getUserById(1L);

        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot find user");
    }

    @Test
    void getAllUsers_returnsAllUsers() {
        List<User> users = List.of(
                User.builder().id(1L).username("user1").build(),
                User.builder().id(2L).username("user2").build()
        );
        when(userRepository.findAll()).thenReturn(users);

        List<User> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllUsers_emptyDatabase_returnsEmptyList() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        assertThat(userService.getAllUsers()).isEmpty();
    }

    @Test
    void login_validCredentials_returnsUser() {
        User user = User.builder().id(1L).username("loginuser").password("$2a$10$hashedpassword").build();
        when(userRepository.findUserByUsername("loginuser")).thenReturn(user);
        when(passwordEncoder.matches("correct_password", "$2a$10$hashedpassword")).thenReturn(true);

        User result = userService.login("loginuser", "correct_password");

        assertThat(result.getUsername()).isEqualTo("loginuser");
    }

    @Test
    void login_unknownUsername_throwsNotFound() {
        when(userRepository.findUserByUsername("unknown")).thenReturn(null);

        assertThatThrownBy(() -> userService.login("unknown", "password"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Incorrect username");
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        User user = User.builder().username("loginuser").password("$2a$10$hashedpassword").build();
        when(userRepository.findUserByUsername("loginuser")).thenReturn(user);
        when(passwordEncoder.matches("wrong_password", "$2a$10$hashedpassword")).thenReturn(false);

        assertThatThrownBy(() -> userService.login("loginuser", "wrong_password"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Incorrect password");
    }
}
