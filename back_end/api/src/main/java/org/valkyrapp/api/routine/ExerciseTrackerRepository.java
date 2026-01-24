package org.valkyrapp.api.routine;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseTrackerRepository extends JpaRepository<ExerciseTracker, Long> {
}
