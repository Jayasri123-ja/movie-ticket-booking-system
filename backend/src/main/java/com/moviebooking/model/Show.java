package com.moviebooking.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Show {
    private String id;
    private LocalDateTime showTime;
    private String theaterName;
    private int totalSeats;
    private int availableSeats;
    private double price;
    private List<Seat> seats;
}