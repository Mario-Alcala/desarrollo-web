package com.cultivos.gestioncultivos_backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.EtapaCultivo;

@Repository
public class EtapaCultivoRepository {

    private static final String CONSULTA = """
            SELECT e.*, c.nombre AS nombre_cultivo
            FROM etapas_cultivo e
            JOIN cultivos c ON c.id = e.id_cultivo
            """;

    private final JdbcClient jdbc;

    public EtapaCultivoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<EtapaCultivo> buscarTodas() {
        return jdbc.sql(CONSULTA + " ORDER BY e.fecha_programada, e.id_etapa")
                .query(EtapaCultivo.class)
                .list();
    }

    public List<EtapaCultivo> buscarPorCultivo(long idCultivo) {
        return jdbc.sql(CONSULTA + " WHERE e.id_cultivo = :cultivo ORDER BY e.fecha_programada, e.id_etapa")
                .param("cultivo", idCultivo)
                .query(EtapaCultivo.class)
                .list();
    }

    public EtapaCultivo buscarPorId(int id) {
        List<EtapaCultivo> resultado = jdbc.sql(CONSULTA + " WHERE e.id_etapa = :id")
                .param("id", id)
                .query(EtapaCultivo.class)
                .list();
        return resultado.isEmpty() ? null : resultado.get(0);
    }

    public int insertar(EtapaCultivo etapa) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO etapas_cultivo (id_cultivo, etapa, fecha_programada, estado, notas)
                VALUES (:cultivo, :etapa, :fecha, 'pendiente', :notas)
                """)
                .param("cultivo", etapa.getIdCultivo())
                .param("etapa", etapa.getEtapa())
                .param("fecha", etapa.getFechaProgramada())
                .param("notas", etapa.getNotas())
                .update(llaves);
        return llaves.getKey().intValue();
    }

    public void actualizar(EtapaCultivo etapa) {
        jdbc.sql("""
                UPDATE etapas_cultivo
                SET etapa = :etapa, fecha_programada = :fecha, notas = :notas
                WHERE id_etapa = :id
                """)
                .param("etapa", etapa.getEtapa())
                .param("fecha", etapa.getFechaProgramada())
                .param("notas", etapa.getNotas())
                .param("id", etapa.getIdEtapa())
                .update();
    }

    public void completar(int id, LocalDate fechaReal, Integer idUsuario) {
        jdbc.sql("""
                UPDATE etapas_cultivo
                SET estado = 'completada', fecha_real = :fecha, id_usuario = :usuario
                WHERE id_etapa = :id
                """)
                .param("fecha", fechaReal)
                .param("usuario", idUsuario)
                .param("id", id)
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM etapas_cultivo WHERE id_etapa = :id")
                .param("id", id)
                .update();
    }

    /** Sincroniza la etapa actual del cultivo con la etapa completada en el calendario. */
    public void cambiarEtapaDelCultivo(long idCultivo, String etapa) {
        jdbc.sql("UPDATE cultivos SET etapa_fenologica = :etapa WHERE id = :cultivo")
                .param("etapa", etapa)
                .param("cultivo", idCultivo)
                .update();
    }

    /** Si el cultivo aún no tiene fecha de siembra, toma la fecha real de la etapa Siembra. */
    public void fijarFechaSiembraSiFalta(long idCultivo, LocalDate fecha) {
        jdbc.sql("UPDATE cultivos SET fecha_siembra = :fecha WHERE id = :cultivo AND fecha_siembra IS NULL")
                .param("fecha", fecha)
                .param("cultivo", idCultivo)
                .update();
    }
}
