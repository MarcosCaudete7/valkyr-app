package org.valkyrapp.api.auth.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.valkyrapp.api.config.JwtProvider;
import org.valkyrapp.api.usuario.UserDTO;
import org.valkyrapp.api.usuario.UserService;
import org.valkyrapp.api.usuario.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;
    @Autowired
    private JwtProvider jwtProvider;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO userDTO){
        return new ResponseEntity<>(userService.saveUser(userDTO), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO loginDTO) {
        String token = jwtProvider.generateToken(loginDTO.getUsername());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", loginDTO.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam("username") String username) {
        return ResponseEntity.ok(!userRepository.existsByUsername(username));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(!exists);
    }
}
