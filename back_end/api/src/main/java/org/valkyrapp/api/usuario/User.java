package org.valkyrapp.api.usuario;

import jakarta.persistence.*;
import lombok.*;
//import org.valkyrapp.api.rutina.Routine;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

//    @OneToMany(mappedBy = "routine",
//        fetch = FetchType.EAGER,
//        cascade = CascadeType.ALL,
//            orphanRemoval = true)
//
////    private List<Routine> routines=new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}