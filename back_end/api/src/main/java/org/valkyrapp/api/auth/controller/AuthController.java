package org.valkyrapp.api.auth.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.valkyrapp.api.config.JwtProvider;
import org.valkyrapp.api.usuario.UserDTO;
import org.valkyrapp.api.usuario.UserService;
import org.valkyrapp.api.usuario.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.valkyrapp.api.email.EmailService;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.saveUser(userDTO), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO loginDTO) {
        org.valkyrapp.api.usuario.User userCheck = userRepository.findByUsername(loginDTO.getUsername()).orElse(null);

        if (userCheck != null && userCheck.getIsVerified() != null && !userCheck.getIsVerified()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "ACCOUNT_NOT_VERIFIED", "email", userCheck.getEmail()));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()));

        String username = authentication.getName();
        String token = jwtProvider.generateToken(username);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", username);

        userRepository.findByUsername(username).ifPresent(user -> {
            response.put("id", user.getId());
        });

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam("username") String username) {
        return ResponseEntity.ok(!userRepository.existsByUsername(username));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(!userRepository.existsByEmail(email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, Object> request) {
        String email = String.valueOf(request.get("email"));
        String otpCode = String.valueOf(request.get("otpCode"));

        org.valkyrapp.api.usuario.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese email"));

        if (user.getIsVerified()) {
            return ResponseEntity.badRequest().body(Map.of("message", "La cuenta ya está verificada"));
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "El código OTP ha expirado"));
        }

        if (otpCode != null && user.getOtpCode() != null && otpCode.trim().equals(user.getOtpCode().trim())) {
            user.setIsVerified(true);
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            userRepository.save(user);

            String token = jwtProvider.generateToken(user.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("id", user.getId());

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().body(Map.of("message", "El código OTP es inválido"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        org.valkyrapp.api.usuario.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Retornamos OK de todos modos por seguridad (evitar user enumeration)
            return ResponseEntity
                    .ok(Map.of("message", "Si el correo existe, se ha enviado un código de recuperación."));
        }

        // Generar OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Error enviando email de recuperación: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Si el correo existe, se ha enviado un código de recuperación."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, Object> request) {
        String email = String.valueOf(request.get("email"));
        String otpCode = String.valueOf(request.get("otpCode"));
        String newPassword = String.valueOf(request.get("newPassword"));

        org.valkyrapp.api.usuario.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese email"));

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "El código OTP ha expirado"));
        }

        if (otpCode != null && user.getOtpCode() != null && otpCode.trim().equals(user.getOtpCode().trim())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Contraseña restablecida con éxito"));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "El código OTP es inválido"));
    }

    @GetMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String to) {
        try {
            emailService.sendVerificationEmail(to, "999999");
            return ResponseEntity.ok(Map.of("message", "Email sent successfully to " + to));
        } catch (Exception e) {
            String rootCause = e.getCause() != null ? e.getCause().toString() : "";
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Null message",
                    "cause", rootCause,
                    "stack", e.getStackTrace().length > 0 ? e.getStackTrace()[0].toString() : "No stack"));
        }
    }
}