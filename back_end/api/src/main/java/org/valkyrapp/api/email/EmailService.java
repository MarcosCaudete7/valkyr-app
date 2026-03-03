package org.valkyrapp.api.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Verificación de correo - Valkyr App");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; text-align: center; color: #333;\">"
                    + "<h2>¡Bienvenido a Valkyr App!</h2>"
                    + "<p>Gracias por registrarte. Para completar la creación de tu cuenta, ingresa el siguiente código de seguridad en la aplicación:</p>"
                    + "<div style=\"margin: 20px auto; padding: 10px; font-size: 24px; font-weight: bold; background-color: #f4f4f4; border-radius: 5px; letter-spacing: 5px; width: 150px;\">"
                    + otp
                    + "</div>"
                    + "<p>Este código expira en 15 minutos.</p>"
                    + "<p style=\"font-size: 12px; color: #777;\">Si no creaste esta cuenta, simplemente ignora este correo.</p>"
                    + "</div>";

            helper.setText(htmlContent, true); // true indica que es HTML

            log.info("Enviando email de OTP a {}", to);
            mailSender.send(message);

        } catch (MessagingException e) {
            log.error("Fallo al enviar el correo de verificación a {}", to, e);
            throw new RuntimeException("Error al enviar el correo con el código OTP.");
        }
    }

    public void sendPasswordResetEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Restablecer Contraseña - Valkyr App");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; text-align: center; color: #333;\">"
                    + "<h2>Recuperación de Contraseña</h2>"
                    + "<p>Has solicitado restablecer tu contraseña. Ingresa el siguiente código de seguridad en la aplicación para proceder:</p>"
                    + "<div style=\"margin: 20px auto; padding: 10px; font-size: 24px; font-weight: bold; background-color: #f4f4f4; border-radius: 5px; letter-spacing: 5px; width: 150px;\">"
                    + otp
                    + "</div>"
                    + "<p>Este código expira en 15 minutos.</p>"
                    + "<p style=\"font-size: 12px; color: #777;\">Si no solicitaste este cambio, simplemente ignora y elimina este correo. Tu cuenta está segura.</p>"
                    + "</div>";

            helper.setText(htmlContent, true); // true indica que es HTML

            log.info("Enviando email de Recuperación de Contraseña a {}", to);
            mailSender.send(message);

        } catch (MessagingException e) {
            log.error("Fallo al enviar el correo de recuperación a {}", to, e);
            throw new RuntimeException("Error al enviar el correo con el código de recuperación.");
        }
    }
}
