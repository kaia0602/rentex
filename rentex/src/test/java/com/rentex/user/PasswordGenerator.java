package com.rentex.user;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        String rawPassword = "1234";
        String encodedPassword = new BCryptPasswordEncoder().encode(rawPassword);
        System.out.println("인코딩된 1234: " + encodedPassword);
    }
}
