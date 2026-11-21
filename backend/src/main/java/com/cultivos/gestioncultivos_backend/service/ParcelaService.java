package com.cultivos.gestioncultivos_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cultivos.gestioncultivos_backend.model.Parcela;
import com.cultivos.gestioncultivos_backend.repository.ParcelaRepository;

@Service
public class ParcelaService {
    private final ParcelaRepository repositorio;

    public ParcelaService(ParcelaRepository repositorio) { this.repositorio = repositorio; }

    public List<Parcela> listarPorTerreno(Long idTerreno) { return repositorio.buscarPorTerreno(idTerreno); }
}
