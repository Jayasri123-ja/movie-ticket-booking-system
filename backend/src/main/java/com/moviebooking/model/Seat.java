package com.moviebooking.model;

import lombok.Data;

@Data
public class Seat {
    private String seatNumber;
    private boolean isBooked;
    private String bookedBy;
}