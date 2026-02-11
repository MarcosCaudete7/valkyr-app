package org.valkyrapp.api.routine;

import jakarta.persistence.*;
import lombok.*;
import org.valkyrapp.api.usuario.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "routine")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Routine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @ElementCollection(targetClass = Muscles.class)
    @CollectionTable(name = "routine_muscles", joinColumns = @JoinColumn(name = "routine_id"))
    @Enumerated(EnumType.STRING)
    private Set<Muscles> muscles;

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseTracker> exercises;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public void addExercise(ExerciseTracker exercise) {
        exercises.add(exercise);
        exercise.setRoutine(this);
    }
}
