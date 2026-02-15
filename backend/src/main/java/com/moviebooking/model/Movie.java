package com.moviebooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "movies")
public class Movie {
    @Id
    private String id;
    private String title;
    private String genre;
    private String language;
    private int duration;
    private String posterUrl;
    private String description;
    private double rating;
    private List<Show> shows;
}