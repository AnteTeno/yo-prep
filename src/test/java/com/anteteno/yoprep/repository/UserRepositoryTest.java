package com.anteteno.yoprep.repository;

import com.anteteno.yoprep.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("UserRepositoryTests")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void save_persistsUserWithGeneratedId() {
        User saved = userRepository.save(User.builder()
                .username("repotest")
                .email("repo@test.com")
                .password("hashed_password")
                .build());

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("repotest");
    }

    @Test
    void findUserByUsername_returnsUser() {
        userRepository.save(User.builder()
                .username("findbyname")
                .email("findbyname@test.com")
                .password("password")
                .build());

        User found = userRepository.findUserByUsername("findbyname");

        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("findbyname@test.com");
    }

    @Test
    void findUserByUsername_notFound_returnsNull() {
        assertThat(userRepository.findUserByUsername("eioleolemassa")).isNull();
    }

    @Test
    void findUserByEmail_returnsUser() {
        userRepository.save(User.builder()
                .username("emailtest")
                .email("find@email.com")
                .password("password")
                .build());

        User found = userRepository.findUserByEmail("find@email.com");

        assertThat(found).isNotNull();
        assertThat(found.getUsername()).isEqualTo("emailtest");
    }

    @Test
    void findUserByEmail_notFound_returnsNull() {
        assertThat(userRepository.findUserByEmail("ei@olemassa.com")).isNull();
    }

    @Test
    void createdAt_isSetAutomatically() {
        User saved = userRepository.save(User.builder()
                .username("timestamptest")
                .email("timestamp@test.com")
                .password("password")
                .build());

        User found = userRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getCreatedAt()).isNotNull();
    }
}
