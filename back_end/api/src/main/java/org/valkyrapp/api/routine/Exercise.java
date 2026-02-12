package org.valkyrapp.api.routine;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "exercises_catalog")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "muscle_group", nullable = false)
    private String muscleGroup;

    private String equipment;
}