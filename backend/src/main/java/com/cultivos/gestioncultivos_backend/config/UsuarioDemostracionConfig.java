package com.cultivos.gestioncultivos_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;

/** Crea la cuenta de prueba solo en el perfil local y solo si todavía no existe. */
@Configuration
@Profile("local")
public class UsuarioDemostracionConfig {

    @Bean
    CommandLineRunner crearUsuarioDemostracion(JdbcClient jdbc) {
        return args -> {
            Integer existentes = jdbc.sql("""
                    SELECT COUNT(*) FROM usuarios
                    WHERE correo_electronico = :correo
                    """)
                    .param("correo", "empleado.prueba@local.test")
                    .query(Integer.class)
                    .single();

            if (existentes == 0) {
                jdbc.sql("""
                        INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, rol)
                        VALUES (:nombre, :correo, :contrasena, 'trabajador')
                        """)
                        .param("nombre", "Empleado de prueba")
                        .param("correo", "empleado.prueba@local.test")
                        .param("contrasena", "$2a$10$4i9hrc8RWkUDLWB27.EH7OqkRTKUOXLQZy7L7dIXvOI30K0EGNs7q")
                        .update();
            }
        };
    }
}
