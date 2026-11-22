package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Parcela;
import com.cultivos.gestioncultivos_backend.repository.ParcelaRepository;
import com.cultivos.gestioncultivos_backend.repository.TerrenoRepository;

@Service
public class ParcelaService {
    private final ParcelaRepository repositorio;
    private final TerrenoRepository terrenos;

    public ParcelaService(ParcelaRepository repositorio, TerrenoRepository terrenos) {
        this.repositorio = repositorio;
        this.terrenos = terrenos;
    }

    public List<Parcela> listarPorTerreno(Long idTerreno) { return repositorio.buscarPorTerreno(idTerreno); }

    public Parcela crear(Parcela parcela) {
        if (parcela == null || parcela.getIdTerreno() == null) {
            throw new IllegalArgumentException("Debes indicar el terreno de la parcela");
        }
        var terreno = terrenos.buscarPorId(parcela.getIdTerreno())
                .orElseThrow(() -> new NoSuchElementException(
                        "No existe el terreno con id " + parcela.getIdTerreno()));
        if (parcela.getNombre() == null || parcela.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la parcela es obligatorio");
        }
        parcela.setNombre(parcela.getNombre().trim());
        if (parcela.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre de la parcela no puede pasar de 100 caracteres");
        }
        if (parcela.getSuperficieM2() == null || parcela.getSuperficieM2() <= 0) {
            throw new IllegalArgumentException("La superficie debe ser mayor que cero");
        }
        double superficieTerreno = terreno.getSuperficieHa() == null ? 0 : terreno.getSuperficieHa() * 10000;
        double superficieDisponible = superficieTerreno - repositorio.superficieRegistrada(parcela.getIdTerreno());
        if (parcela.getSuperficieM2() > superficieDisponible + 0.01) {
            throw new IllegalArgumentException("La superficie de la parcela supera el espacio disponible del terreno");
        }
        parcela.setEstado("disponible");
        parcela.setIdParcela(repositorio.insertar(parcela));
        return parcela;
    }
}
