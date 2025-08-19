package com.rentex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class RentexApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentexApplication.class, args);
    }
}
