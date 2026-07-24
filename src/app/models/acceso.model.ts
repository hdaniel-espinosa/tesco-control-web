export interface AccesoRequest {
  idTarjeta: string;
  idLaboratorio: number;
  /** Opcional: solo la usa el simulador para probar horarios sin depender de la hora real. */
  fechaHoraSimulada?: string;
}

export interface AccesoResponse {
  acceso: boolean;
  mensaje: string;
  usuario: string | null;
  fechaHora: string;
}
