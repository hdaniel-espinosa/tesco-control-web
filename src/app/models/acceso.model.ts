export interface AccesoRequest {
  idTarjeta: string;
  idLaboratorio: number;
}

export interface AccesoResponse {
  acceso: boolean;
  mensaje: string;
  usuario: string | null;
  fechaHora: string;
}
