package com.moviebooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MovieBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(MovieBookingApplication.class, args);
        System.out.println("🎬 Movie Ticket Booking System Started!");
        System.out.println("📝 API Documentation: http://localhost:8080/api/movies");
        System.out.println("💻 Frontend: Open frontend/index.html in browser");
    }
}