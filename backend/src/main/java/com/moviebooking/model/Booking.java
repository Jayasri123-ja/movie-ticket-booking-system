package com.moviebooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String movieId;
    private String showId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private List<String> seatNumbers;
    private double totalAmount;
    private LocalDateTime bookingTime;
    private String bookingStatus; // CONFIRMED, CANCELLED
    private String paymentStatus; // PAID, PENDING
}