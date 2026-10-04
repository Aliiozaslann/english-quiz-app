package com.example.englishhapp.controller;

import com.example.englishhapp.model.AuthRequest;
import com.example.englishhapp.model.User;
import com.example.englishhapp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kullanıcı adı ve şifre boş bırakılamaz!"));
        }

        String username = request.getUsername().trim();

        // 1. AYNI KULLANICI ADI KONTROLÜ (Büyük/küçük harf fark etmeksizin)
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Bu kullanıcı adı zaten alınmış! Lütfen başka bir kullanıcı adı seçin."));
        }

        // 2. Şifre Güvenlik Kontrolleri
        String pwd = request.getPassword().trim();
        if (pwd.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Şifre en az 6 karakter olmalıdır!"));
        }
        if (!pwd.matches(".*[A-Z].*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Şifre en az bir büyük harf içermelidir!"));
        }
        if (!pwd.matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Şifre en az bir rakam içermelidir!"));
        }

        String gender = (request.getGender() != null && !request.getGender().isEmpty()) ? request.getGender() : "male";
        User newUser = new User(username, pwd, gender);
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "Kayıt başarılı! Şimdi giriş yapabilirsiniz."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kullanıcı adı ve şifre zorunludur!"));
        }

        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(request.getUsername().trim());

        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Kullanıcı adı veya şifre hatalı!"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "message", "Giriş başarılı!",
                "username", user.getUsername(),
                "gender", user.getGender() != null ? user.getGender() : "male",
                "score", user.getScore(),
                "streak", user.getStreak()
        ));
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}