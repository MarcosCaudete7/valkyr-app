package org.valkyrapp.api.rutina;

import jakarta.persistence.*;
import lombok.*;
import org.valkyrapp.api.usuario.User;

import java.time.LocalDateTime;
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

    @Column(name = "isPublic", nullable = false)
    private boolean isPublic;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column (name = "routine", nullable = false)
    private Set<Muscles> muscles;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
