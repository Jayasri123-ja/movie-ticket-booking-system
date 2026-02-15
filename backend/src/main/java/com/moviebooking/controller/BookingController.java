package com.moviebooking.controller;

import com.moviebooking.model.Booking;
import com.moviebooking.model.Movie;
import com.moviebooking.model.Show;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class BookingController {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    @GetMapping("/user/{email}")
    public List<Booking> getUserBookings(@PathVariable String email) {
        return bookingRepository.findByUserEmail(email);
    }
    
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            // Generate booking ID
            booking.setId(UUID.randomUUID().toString());
            booking.setBookingTime(LocalDateTime.now());
            booking.setBookingStatus("CONFIRMED");
            booking.setPaymentStatus("PAID");
            
            // Update available seats in movie
            Optional<Movie> movieOpt = movieRepository.findById(booking.getMovieId());
            if (movieOpt.isPresent()) {
                Movie movie = movieOpt.get();
                for (Show show : movie.getShows()) {
                    if (show.getId().equals(booking.getShowId())) {
                        show.setAvailableSeats(show.getAvailableSeats() - booking.getSeatNumbers().size());
                        // Mark seats as booked
                        show.getSeats().forEach(seat -> {
                            if (booking.getSeatNumbers().contains(seat.getSeatNumber())) {
                                seat.setBooked(true);
                                seat.setBookedBy(booking.getUserEmail());
                            }
                        });
                        break;
                    }
                }
                movieRepository.save(movie);
            }
            
            Booking savedBooking = bookingRepository.save(booking);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        }
    }
}