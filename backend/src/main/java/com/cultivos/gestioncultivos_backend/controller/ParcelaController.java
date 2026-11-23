
package com.cultivos.gestioncultivos_backend.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/parcelas")
public class ParcelaController {

    private final JdbcClient jdbc;

    public ParcelaController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // Datos que recibe el formulario.
    public record DatosParcela(
        Long idTerreno,
        String nombre,
        BigDecimal superficieM2,
        String estado
    ) {}

    // Consultar las parcelas existentes.
    @GetMapping
    public List<Map<String, Object>> listar() {
        return jdbc.sql("""
            SELECT
                p.id_parcela AS idParcela,
                p.id_terreno AS idTerreno,
                t.nombre AS nombreTerreno,
                p.nombre,
                p.superficie_m2 AS superficieM2,
                p.estado
            FROM parcelas p
            JOIN terrenos t ON t.id = p.id_terreno
            ORDER BY p.id_parcela DESC
            """).query().listOfRows();
    }

    // Registrar una parcela.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@RequestBody DatosParcela datos) {
        validar(datos);

        var clave = new GeneratedKeyHolder();

        jdbc.sql("""
            INSERT INTO parcelas
            (id_terreno, nombre, superficie_m2, estado)
            VALUES (:terreno, :nombre, :superficie, :estado)
            """)
            .param("terreno", datos.idTerreno())
            .param("nombre", datos.nombre().trim())
            .param("superficie", datos.superficieM2())
            .param("estado", datos.estado())
            .update(clave, "id_parcela");

        return Map.of("idParcela", clave.getKey().longValue());
    }

    // Actualizar una parcela.
    @PutMapping("/{id}")
    public Map<String, Object> actualizar(
            @PathVariable Long id,
            @RequestBody DatosParcela datos) {

        validar(datos);

        int filas = jdbc.sql("""
            UPDATE parcelas
            SET id_terreno = :terreno,
                nombre = :nombre,
                superficie_m2 = :superficie,
                estado = :estado
            WHERE id_parcela = :id
            """)
            .param("terreno", datos.idTerreno())
            .param("nombre", datos.nombre().trim())
            .param("superficie", datos.superficieM2())
            .param("estado", datos.estado())
            .param("id", id)
            .update();

        if (filas == 0) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Parcela no encontrada");
        }

        return Map.of("actualizado", true);
    }

    // Eliminar solo parcelas sin cultivos asociados.
    @DeleteMapping("/{id}")
    public Map<String, Object> eliminar(@PathVariable Long id) {
        int cultivos = jdbc.sql("""
            SELECT COUNT(*) FROM cultivos
            WHERE id_parcela = :id
            """)
            .param("id", id)
            .query(Integer.class).single();

        if (cultivos > 0) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "La parcela tiene cultivos registrados");
        }

        try {
            int filas = jdbc.sql("""
                DELETE FROM parcelas WHERE id_parcela = :id
                """)
                .param("id", id)
                .update();

            if (filas == 0) {
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Parcela no encontrada");
            }
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "La parcela tiene registros relacionados");
        }

        return Map.of("eliminado", true);
    }

    private void validar(DatosParcela datos) {
        if (datos == null || datos.idTerreno() == null
                || datos.idTerreno() <= 0
                || datos.nombre() == null
                || datos.nombre().isBlank()
                || datos.nombre().trim().length() > 100
                || datos.superficieM2() == null
                || datos.superficieM2().signum() <= 0
                || datos.superficieM2().compareTo(
                    new BigDecimal("99999999.99")) > 0
                || datos.superficieM2().stripTrailingZeros().scale() > 2
                || !("disponible".equals(datos.estado())
                    || "ocupada".equals(datos.estado()))) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Revisa los datos de la parcela");
        }

        int existe = jdbc.sql("""
            SELECT COUNT(*) FROM terrenos WHERE id = :id
            """)
            .param("id", datos.idTerreno())
            .query(Integer.class).single();

        if (existe == 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Selecciona un terreno existente");
        }
    }
}
