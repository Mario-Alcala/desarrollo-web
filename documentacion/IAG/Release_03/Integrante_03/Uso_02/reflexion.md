# Reflexión — Uso 02: Pantalla de Catálogo

Pedí que las pantallas se hicieran una por una, en VS Code, y no todas de golpe, porque quería pegar, ver y entender cada ventana antes de pasar a la siguiente. Catálogo me quedó bien visualmente.
- Los kilos disponibles no se guardan en el catálogo: se calculan sumando los kilos de los lotes
  de cosecha de ese producto (kilosDisponibles). La maduración sale de esos mismos lotes,
  ignorando los de 0 kg y sin repetir (maduracionesDisponibles).
- Los filtros: la lista se vuelve a dibujar usando la categoría activa y el textode búsqueda; un producto aparece solo si cumple las dos cosas
- El formulario: al enviar, lee los campos, rechaza el precio si no es mayor que cero
