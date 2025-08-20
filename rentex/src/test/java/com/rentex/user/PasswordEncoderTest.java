package com.rentex.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
public class PasswordEncoderTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testPasswordMatch() {
        String raw = "1234";
        String encoded = "$2a$10$vC9uvQ7dPHhF5CG1KDCeUuVw6vVlxH0C0ihqE9XghA.gGi2ny7G9O";

        System.out.println("match=" + passwordEncoder.matches(raw, encoded));
    }

    @Test   // ✅ 이거 추가해야 실행됨
    void encodePassword() {
        System.out.println(passwordEncoder.encode("1234"));
    }

    @Test
    void checkPassword() {
        String hash1 = "$2a$10$Dow1dZegFfNyQ2Q8qYMK8u9B9m8cPQgE1zLOKMGdCjHh5QiNvxtlW"; // partner19
        String hash2 = "$2a$10$CMXa8/zMxJkAi7oXiWyJnuVBg1TuuZi/4mVeOhXMXWni1c6/iQa.m"; // admin

        System.out.println(passwordEncoder.matches("1234", hash1)); // false?
        System.out.println(passwordEncoder.matches("1234", hash2)); // true
    }

}
